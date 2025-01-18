const { Router } = require("express");
const router = Router();
const { skillsTable } = require("../config/db/schema");
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

const skillSchema = z.object({
  name: z
    .string({
      required_error: "Skill name is required",
    })
    .min(1, "Skill name cannot be empty"),
  category: z.string().optional(),
  proficiency: z.string().optional(),
});

router.get("/all", async (_, res) => {
  try {
    const skills = await db.query.skillsTable.findMany({});
    res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const [skill] = await db.query.skillsTable.findMany({
      where: eq(skillsTable.id, id),
    });
    if (!skill) {
      return res
        .status(404)
        .json({ success: false, message: "Skill not found" });
    }
    res.status(200).json({
      success: true,
      skill,
    });
  } catch (error) {
    console.error("Error fetching skill:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Create a new skill
router.post("/new", async (req, res) => {
  try {
    const { success, data, error } = skillSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "Invalid data", error: zodError });
    }
    const [skill] = await db.insert(skillsTable).values(data).returning();
    logger.info("New skill created with ID:", skill.id);
    res.status(201).json({
      success: true,
      skill,
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Update an existing skill
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const { success, data, error } = skillSchema.safeParse(req.body);
    if (!success) {
      const zodError = messageBuilder(error.issues).toString();
      return res
        .status(400)
        .json({ success: false, message: "Invalid data", error: zodError });
    }
    const [updatedSkill] = await db
      .update(skillsTable)
      .set(data)
      .where(eq(skillsTable.id, id))
      .returning();
    if (!updatedSkill) {
      return res
        .status(404)
        .json({ success: false, message: "Skill not found" });
    }
    logger.info("Skill updated with ID:", updatedSkill.id);
    res.status(200).json({
      success: true,
      updatedSkill,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

// Delete a skill
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }
    const result = await db.delete(skillsTable).where(eq(skillsTable.id, id));
    if (result === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Skill not found" });
    }
    logger.info("Skill deleted with ID:", id);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
