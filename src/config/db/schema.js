const {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/pg-core");
const { sql } = require("drizzle-orm");

const projectsTable = pgTable("projects", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  techStack: text("techStack")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  imageUrl: varchar("image_url", { length: 500 }),
  projectUrl: varchar("project_url", { length: 500 }),
  repoUrl: varchar("repo_url", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Skills Table
const skillsTable = pgTable("skills", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  proficiency: varchar("proficiency", { length: 10 }),
});

// Work Experience Table
const workExperienceTable = pgTable("work_experience", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  logoUrl: varchar("logo_url", { length: 500 }),
});

// Education Table
const educationTable = pgTable("education", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  institutionName: varchar("institution_name", { length: 255 }).notNull(),
  degree: varchar("degree", { length: 255 }).notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  location: varchar("location", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
});

// Contact Table
const contactTable = pgTable("contact", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  message: text("message"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
});

module.exports = {
  projectsTable,
  educationTable,
  contactTable,
  workExperienceTable,
  skillsTable,
};
