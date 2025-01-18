const { Router } = require("express");
const router = Router();
const { workExperienceTable } = require("../config/db/schema");
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

// Zod Schema for Validation
const workExperienceSchema = z.object({
  companyName: z
    .string({
      required_error: "Company name is required",
    })
    .min(1, "Company name cannot be empty"),
  role: z
    .string({
      required_error: "Role is required",
    })
    .min(1, "Role cannot be empty"),
  description: z.string().optional().nullable(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  logoUrl: z.string().url("Logo URL must be a valid URL").optional().nullable(),
});

// Fetch all work experiences
router.get("/all", async (_, res) => {
  try {
    const workExperiences = await db.query.workExperienceTable.findMany({});
    res.status(200).json({
      success: true,
      workExperiences,
    });
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Fetch a work experience by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const [workExperience] = await db.query.workExperienceTable.findMany({
      where: eq(workExperienceTable.id, id),
    });
    if (!workExperience) {
      return res
        .status(404)
        .json({ success: false, message: "Work experience not found" });
    }
    res.status(200).json({
      success: true,
      workExperience,
    });
  } catch (error) {
    console.error("Error fetching work experience:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Create a new work experience
router.post("/new", async (req, res) => {
  try {
    const { success, data, error } = workExperienceSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "Invalid data", error: zodError });
    }
    const [workExperience] = await db
      .insert(workExperienceTable)
      .values(data)
      .returning();
    logger.info("New work experience created with ID:", workExperience.id);
    res.status(201).json({
      success: true,
      workExperience,
    });
  } catch (error) {
    console.error("Error creating work experience:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Update an existing work experience
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const { success, data, error } = workExperienceSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "Invalid data", error: zodError });
    }
    const [updatedWorkExperience] = await db
      .update(workExperienceTable)
      .set(data)
      .where(eq(workExperienceTable.id, id))
      .returning();
    if (!updatedWorkExperience) {
      return res
        .status(404)
        .json({ success: false, message: "Work experience not found" });
    }
    logger.info("Work experience updated with ID:", updatedWorkExperience.id);
    res.status(200).json({
      success: true,
      updatedWorkExperience,
    });
  } catch (error) {
    console.error("Error updating work experience:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Delete a work experience
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const result = await db
      .delete(workExperienceTable)
      .where(eq(workExperienceTable.id, id));
    if (result === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Work experience not found" });
    }
    logger.info("Work experience deleted with ID:", id);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
