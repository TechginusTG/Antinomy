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

router.post('/', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const newChatRoom = {
    user_id: req.user.userId,
    title: title || 'New Chat',
  };

  try {
    const [createdChatRoom] = await db('chat_rooms').insert(newChatRoom).returning('*');
    res.status(201).json(createdChatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).send('Server error');
  }
});

export default router;
