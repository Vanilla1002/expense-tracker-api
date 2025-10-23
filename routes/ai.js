const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { interpretAICommand } = require('../services/aiInterpreter');


router.post("/query", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    const result = await interpretAICommand(message, userId);

    res.json({ success: true, response: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "AI processing failed" });
  }
});

module.exports = router;