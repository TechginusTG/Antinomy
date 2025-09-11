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

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const [updatedChatRoom] = await db('chat_rooms')
      .where({ id, user_id: req.user.userId })
      .update({ title, updated_at: db.fn.now() })
      .returning('*');

    if (updatedChatRoom) {
      res.json(updatedChatRoom);
    } else {
      res.status(404).send('Chat room not found');
    }
  } catch (error) {
    console.error('Error updating chat room:', error);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await db.transaction(async (trx) => {
      await trx('chats').where({ conversation_id: id }).del();
      const deletedCount = await trx('chat_rooms').where({ id, user_id: req.user.userId }).del();
      
      if (deletedCount === 0) {
        throw new Error('Chat room not found or user not authorized');
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting chat room:', error);
    if (error.message.includes('not found')) {
      return res.status(404).send('Chat room not found');
    }
    res.status(500).send('Server error');
  }
});

export default router;
