import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import authenticateToken from '../authenticateToken.js';

const router = express.Router();

router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." });
    }

    try {
        const user = await db('users').where({ user_id: userId }).first();

        if (!user) {
            return res.status(400).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db('users').where({ user_id: userId }).update({ password: hashedPassword });

        return res.json({ success: true, message: "비밀번호가 변경되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
});

router.delete('/delete-account', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { passwordConfirm } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: "사용자 ID가 필요합니다." });
    }

    try {
        const user = await db('users').where({ user_id: userId }).first();
        if (!user) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }
        const isMatch = await bcrypt.compare(passwordConfirm, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "비밀번호가 일치하지 않습니다." });
        }

        console.log(`Attempting to delete user with user_id: ${userId}`);
        const deletedChatsCount = await db('chats').where({ user_id: userId }).del();
        console.log(`[DB] User ${userId} chat messages deleted: ${deletedChatsCount} rows`);

        const deletedUserCount = await db('users').where({ user_id: userId }).del();
        console.log(`[DB] User ${userId} account deleted: ${deletedUserCount} rows`);

        res.json({ success: true, message: "회원 탈퇴에 성공했습니다." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "탈퇴 중 오류가 발생했습니다." });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await db('users').where({ user_id: req.user.userId }).first();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let conversationId = user.conversation_id;
        const clientConversationId = req.headers['x-conversation-id'];

        // DB에 conversation_id가 없고, 클라이언트가 기존 ID를 보내온 경우 DB에 업데이트 (마이그레이션)
        if (!conversationId && clientConversationId) {
            await db('users').where({ user_id: req.user.userId }).update({ conversation_id: clientConversationId });
            conversationId = clientConversationId;
        }

        res.json({
            id: user.user_id,
            name: user.name,
            exp: user.exp,
            lvl: user.lvl,
            conversationId: conversationId
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;
