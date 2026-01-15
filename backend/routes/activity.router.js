const express = require("express");
const { getContributions } = require("../controllers/activityController");

const activityRouter = express.Router();

activityRouter.get("/api/contributions/:userId", getContributions);

module.exports = activityRouter;
