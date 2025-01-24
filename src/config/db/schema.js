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
  imageUrl: varchar("imageUrl", { length: 500 }),
  projectUrl: varchar("projectUrl", { length: 500 }),
  repoUrl: varchar("repoUrl", { length: 500 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

const skillsTable = pgTable("skills", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 100 }),
  proficiency: varchar("proficiency", { length: 10 }),
});

const workExperienceTable = pgTable("workExperience", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate", { withTimezone: true }),
  endDate: timestamp("endDate", { withTimezone: true }),
  logoUrl: varchar("logoUrl", { length: 500 }),
});

const educationTable = pgTable("education", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  institutionName: varchar("institutionName", { length: 255 }).notNull(),
  degree: varchar("degree", { length: 255 }).notNull(),
  startDate: timestamp("startDate", { withTimezone: true }),
  endDate: timestamp("endDate", { withTimezone: true }),
  location: varchar("location", { length: 255 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
});

const contactTable = pgTable("contact", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  message: text("message"),
  submittedAt: timestamp("submittedAt", { withTimezone: true }).defaultNow(),
});

module.exports = {
  projectsTable,
  educationTable,
  contactTable,
  workExperienceTable,
  skillsTable,
};
