const express = require("express");
const router = express.Router();

const { logError } = require("../utils/logger");

router.post("/log", (req, res) => {
  const logEntry = req.body;

  logError(logEntry);

  res.json({ message: "Log saved" });
});

module.exports = router;