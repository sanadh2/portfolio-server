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

const app = express();

app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);

app.use(morgan("tiny"));

app.get("/", async (_, res) => {
  res.status(200).json("welcome to my server");
});

app.use("/projects", projectRouter);

app.use("/education", educationRoute);

app.use("/skills", skillRoute);

app.use("/workExperience", workExperienceRoute);

app.all("*", (req, res) => {
  const method = req.method;
  const reqUrl = req.url;
  res.status(404).json({
    error: `API endpoint ${reqUrl} with method ${method} not allowed`,
  });
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// module.exports = (req, res) => {
//   app(req, res);
// };

app.listen(4000);
