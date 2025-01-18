const express = require("express");
const dotenv = require("dotenv");
const {
  projectRouter,
  educationRoute,
  skillRoute,
  workExperienceRoute,
} = require("./routes");

const morgan = require("morgan");

const envFile =
  process.env.NODE_ENV === "production" ? "./.env.prod" : "./.env.local";

dotenv.config({
  path: envFile,
});
const PORT = Number(process.env.PORT) || 8000;

const app = express();

app.use(express.json());

app.use(morgan("tiny"));

app.get("/", async (_, res) => {
  res.status(200).json("welcome to my server");
});

app.use("/projects", projectRouter);

app.use("/education", educationRoute);

app.use("/skills", skillRoute);

app.use("/workExperience", workExperienceRoute);

app.listen(PORT, "localhost", () => {
  const environment =
    process.env.NODE_ENV === "PRODUCTION" ? "production env" : "develop env";

  console.log(
    "app is running on localhost:" +
      PORT +
      " in environment \x1b[33m" +
      environment +
      "\x1b[0m"
  );
});
