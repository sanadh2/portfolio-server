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
    const projects = await db.query.projectsTable.findMany({});
    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      next();
    }
    const projects = await db.query.projectsTable.findMany({});
    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.log(error);
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
    const { success, data, error } = newProjectSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "invalid data", error: zodError });
    }
    const [project] = await db.insert(projectsTable).values(data).returning();

    logger.info("new project created with id\t", project.id);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    logger.info("project deleted with id\t", id);
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { success, data, error } = newProjectSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "invalid data", error: zodError });
    }
    const [project] = await db
      .update(projectsTable)
      .set(data)
      .where(eq(projectsTable.id, id))
      .returning();

    logger.info("project updated with id\t", project.id);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});

module.exports = router;
