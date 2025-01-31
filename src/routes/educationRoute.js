const { Router } = require("express");
const router = Router();
const { educationTable } = require("../config/db/schema");
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
const educationSchema = z.object({
  institutionName: z
    .string({
      required_error: "Institution name is required",
    })
    .min(1, "Institution name cannot be empty"),
  degree: z
    .string({
      required_error: "Degree is required",
    })
    .min(1, "Degree cannot be empty"),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Start date must be a valid date.",
    })
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "End date must be a valid date.",
    })
    .transform((val) => new Date(val)),
  location: z.string().optional().nullable(),
  logoUrl: z.string().url("Logo URL must be a valid URL").optional().nullable(),
});

// Fetch all education entries
router.get("/all", async (_, res) => {
  try {
    const education = await db.query.educationTable.findMany({});
    res.status(200).json({
      success: true,
      education,
    });
  } catch (error) {
    console.error("Error fetching education entries:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Fetch an education entry by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const [educationEntry] = await db.query.educationTable.findMany({
      where: eq(educationTable.id, id),
    });
    if (!educationEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Education entry not found" });
    }
    res.status(200).json({
      success: true,
      educationEntry,
    });
  } catch (error) {
    console.error("Error fetching education entry:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Create a new education entry
router.post("/new", async (req, res) => {
  try {
    const { success, data, error } = educationSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "Invalid data", error: zodError });
    }
    const [educationEntry] = await db
      .insert(educationTable)
      .values(data)
      .returning();
    logger.info("New education entry created with ID:", educationEntry.id);
    res.status(201).json({
      success: true,
      educationEntry,
    });
  } catch (error) {
    console.error("Error creating education entry:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Update an education entry
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const { success, data, error } = educationSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "Invalid data", error: zodError });
    }
    const [updatedEducationEntry] = await db
      .update(educationTable)
      .set(data)
      .where(eq(educationTable.id, id))
      .returning();
    if (!updatedEducationEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Education entry not found" });
    }
    logger.info("Education entry updated with ID:", updatedEducationEntry.id);
    res.status(200).json({
      success: true,
      updatedEducationEntry,
    });
  } catch (error) {
    console.error("Error updating education entry:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Delete an education entry
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const result = await db
      .delete(educationTable)
      .where(eq(educationTable.id, id));
    if (result === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Education entry not found" });
    }
    logger.info("Education entry deleted with ID:", id);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting education entry:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
