const { Router } = require("express");
const router = Router();
const { projectsTable } = require("../config/db/schema");
const { db } = require("../config/db/index");
const { z } = require("zod");
const { createMessageBuilder } = require("zod-validation-error");
const logger = require("../config/logger");
const { eq } = require("drizzle-orm");
const isValidUUID = require("../utils/uuid");

const messageBuilder = createMessageBuilder({
  includePath: false,
  issueSeparator: ",  ",
});

router.get("/all", async (_, res) => {
  try {
    logger.info("Fetching all projects...");
    const projects = await db.query.projectsTable.findMany({});
    logger.info(`Fetched ${projects.length} projects`);
    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    logger.error("Error fetching all projects:", error);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching project with id: ${id}`);

    if (!isValidUUID(id)) {
      logger.warn(`Invalid UUID format for id: ${id}`);
      next();
    }

    const projects = await db.query.projectsTable.findMany({});
    logger.info(`Fetched project details for id: ${id}`);
    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    logger.error(`Error fetching project with id: ${req.params.id}`, error);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

const newProjectSchema = z.object({
  title: z
    .string({
      required_error: "title is required",
    })
    .min(3, "title must be atleast 3 characters"),
  imageUrl: z.string().url("imageUrl must be an url").optional().nullable(),
  projectUrl: z.string().url("projectUrl must be an url").optional().nullable(),
  repoUrl: z.string().url("repoUrl must be an url").optional().nullable(),
  techStack: z.array(z.string()).optional().nullable(),
  description: z
    .string({
      required_error: "description is required",
    })
    .min(10, "description must be atleast 10 characters"),
});

router.post("/new", async (req, res) => {
  try {
    logger.info("Creating new project...");
    const { success, data, error } = newProjectSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      logger.warn(`Invalid data for new project: ${zodError}`);
      return res
        .status(400)
        .json({ success: false, message: "invalid data", error: zodError });
    }
    const [project] = await db.insert(projectsTable).values(data).returning();

    logger.info(`New project created with id: ${project.id}`);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    logger.error("Error creating new project:", err);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting project with id: ${id}`);

    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    logger.info(`Project deleted with id: ${id}`);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    logger.error(`Error deleting project with id: ${req.params.id}`, err);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`Updating project with id: ${id}`);

    const { success, data, error } = newProjectSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      logger.warn(
        `Invalid data for update on project id: ${id}, error: ${zodError}`
      );
      return res
        .status(400)
        .json({ success: false, message: "invalid data", error: zodError });
    }

    const [project] = await db
      .update(projectsTable)
      .set(data)
      .where(eq(projectsTable.id, id))
      .returning();

    logger.info(`Project updated with id: ${project.id}`);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    logger.error(`Error updating project with id: ${req.params.id}`, err);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

module.exports = router;
