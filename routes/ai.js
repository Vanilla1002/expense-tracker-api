const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { interpretAICommand } = require('../services/aiInterpreter');

/**
 * @swagger
 * /api/ai/query:
 *   post:
 *     summary: Interact with the AI financial assistant
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Add 45 for dinner at McDonald's yesterday"
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Successful AI interpretation and action
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   oneOf:
 *                     - type: string
 *                       example: "Expense of 45 added under category food."
 *                     - type: object
 *                       example:
 *                         totalBalance: 4500
 *                     - type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 15
 *                           description:
 *                             type: string
 *                             example: "phone"
 *                           amount:
 *                             type: number
 *                             example: 700
 *                           category:
 *                             type: string
 *                             example: "electronics"
 *                           date:
 *                             type: string
 *                             example: "2024-07-25"
 *                           user_id:
 *                             type: integer
 *                             example: 2
 *       400:
 *         description: Missing message in request
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: AI processing failed or internal server error
 */

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