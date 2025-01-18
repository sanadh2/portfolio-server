const express = require("express");
const dotenv = require("dotenv");
const {
  projectRouter,
  educationRoute,
  skillRoute,
  workExperienceRoute,
} = require("./routes");

const morgan = require("morgan");
const cors = require("cors");

const envFile =
  process.env.NODE_ENV === "production" ? "./.env.prod" : "./.env.local";

dotenv.config({
  path: envFile,
});
// const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(cors({}));

app.use(express.json());

app.use(morgan("tiny"));

app.get("/", async (_, res) => {
  res.status(200).json("welcome to my server");
});

app.use("/projects", projectRouter);

app.use("/education", educationRoute);

app.use("/skills", skillRoute);

app.use("/workExperience", workExperienceRoute);

module.exports = (req, res) => {
  app(req, res);
};
