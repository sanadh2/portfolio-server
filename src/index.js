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

app.use("*", async (req, res) => {
  try {
    const method = req.method;
    const reqUrl = req.url();
    return res
      .status(404)
      .json(
        "this api: " + reqUrl + " with method " + method + " is not allowed"
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json("something went wrong");
  }
});

// module.exports = (req, res) => {
//   app(req, res);
// };

app.listen(4000);
