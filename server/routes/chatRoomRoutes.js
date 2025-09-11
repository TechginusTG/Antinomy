import express from 'express';
import db from '../db.js';
import authenticateToken from '../authenticateToken.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const chatRooms = await db('chat_rooms')
      .where({ user_id: req.user.userId })
      .orderBy('updated_at', 'desc');
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).send('Server error');
  }
});

export default router;
