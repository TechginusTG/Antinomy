import express from 'express';
import db from '../db.js'; // Your db connection setup
import authenticateToken from '../authenticateToken.js'; // Your JWT auth middleware

const router = express.Router();

router.get('/:chat_room_id', authenticateToken, async (req, res) => {
  const { chat_room_id } = req.params;
  try {
    const diagram = await db('diagrams').where({ user_id: req.user.userId, chat_room_id }).first();
    if (diagram) {
      res.json({ diagram_data: diagram.diagram_data });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error fetching diagram:', error);
    res.status(500).send('Server error');
  }
});

router.post('/:chat_room_id', authenticateToken, async (req, res) => {
  const { chat_room_id } = req.params;
  const { diagram_data } = req.body;
  if (!diagram_data) {
    return res.status(400).send('diagram_data is required');
  }

  try {
    await db('diagrams')
      .insert({
        user_id: req.user.userId,
        chat_room_id,
        diagram_data,
      })
      .onConflict(['user_id', 'chat_room_id'])
      .merge();
    res.status(200).send('Diagram saved successfully');
  } catch (error) {
    console.error('Error saving diagram:', error);
    res.status(500).send('Server error');
  }
});

export default router;
