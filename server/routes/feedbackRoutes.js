import express from 'express';
import db from '../db.js';
import authenticateToken from '../authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { chatId, mode } = req.body;
  const userId = req.user.userId;

  if (!chatId || !mode) {
    return res.status(400).json({ success: false, message: 'chatId and mode are required.' });
  }

  const trx = await db.transaction();
  try {
    const existingLike = await trx('liked_chats').where({ user_id: userId, chat_id: chatId }).first();
    if (existingLike) {
      await trx.rollback();
      return res.status(409).json({ success: false, message: 'You have already liked this message.' });
    }

    await trx('liked_chats').insert({
      user_id: userId,
      chat_id: chatId,
      mode: mode,
    });

    const chat = await trx('chats').where({ id: chatId }).first();
    if (chat && chat.message) {
      const keywordMatch = chat.message.match(/KEYWORDS:(.*)/s);
      if (keywordMatch && keywordMatch[1]) {
        const keywords = keywordMatch[1].split(',').map(k => k.trim()).filter(k => k);
        
        if (keywords.length > 0) {
          const user = await trx('users').where({ user_id: userId }).first();
          const currentPrefs = user.keyword_preferences || {};

          const newPrefs = { ...currentPrefs };
          if (!newPrefs[mode]) {
            newPrefs[mode] = {};
          }

          keywords.forEach(keyword => {
            newPrefs[mode][keyword] = (newPrefs[mode][keyword] || 0) + 1;
          });

          await trx('users').where({ user_id: userId }).update({ keyword_preferences: newPrefs });
        }
      }
    }

    await trx.commit();
    res.status(201).json({ success: true, message: 'Feedback saved.' });
  } catch (error) {
    await trx.rollback();
    if (error.code === '23505') { 
      return res.status(409).json({ success: false, message: 'You have already liked this message.' });
    }
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, message: 'Server error while saving feedback.' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const likedChats = await db('liked_chats')
      .join('chats', 'liked_chats.chat_id', 'chats.id')
      .where('liked_chats.user_id', userId)
      .select('chats.*', 'liked_chats.mode', 'liked_chats.created_at as liked_at')
      .orderBy('liked_at', 'desc');

    res.json({ success: true, data: likedChats });
  } catch (error) {
    console.error('Error fetching liked chats:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching liked chats.' });
  }
});

router.delete('/:chatId', authenticateToken, async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.userId;

  if (!chatId) {
    return res.status(400).json({ success: false, message: 'chatId is required.' });
  }

  const trx = await db.transaction();
  try {
    const likedChat = await trx('liked_chats').where({ user_id: userId, chat_id: chatId }).first();
    if (!likedChat) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'You have not liked this message.' });
    }

    const mode = likedChat.mode;

    const chat = await trx('chats').where({ id: chatId }).first();
    if (chat && chat.message) {
      const keywordMatch = chat.message.match(/KEYWORDS:(.*)/s);
      if (keywordMatch && keywordMatch[1]) {
        const keywords = keywordMatch[1].split(',').map(k => k.trim()).filter(k => k);
        
        if (keywords.length > 0) {
          const user = await trx('users').where({ user_id: userId }).first();
          const currentPrefs = user.keyword_preferences || {};

          if (currentPrefs[mode]) {
            keywords.forEach(keyword => {
              if (currentPrefs[mode][keyword]) {
                currentPrefs[mode][keyword] -= 1;
                if (currentPrefs[mode][keyword] <= 0) {
                  delete currentPrefs[mode][keyword];
                }
              }
            });
            if (Object.keys(currentPrefs[mode]).length === 0) {
              delete currentPrefs[mode];
            }
          }
          
          await trx('users').where({ user_id: userId }).update({ keyword_preferences: currentPrefs });
        }
      }
    }

    await trx('liked_chats').where({ user_id: userId, chat_id: chatId }).del();

    await trx.commit();
    res.status(200).json({ success: true, message: 'Like removed.' });
  } catch (error) {
    await trx.rollback();
    console.error('Error removing like:', error);
    res.status(500).json({ success: false, message: 'Server error while removing like.' });
  }
});

export default router;
