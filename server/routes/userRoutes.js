import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." });
    }

    try {
        const user = await db('users').where({ id: userId }).first();

        if (!user) {
            return res.status(400).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db('users').where({ id: userId }).update({ password: hashedPassword });

        return res.json({ success: true, message: "비밀번호가 변경되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
});

export default router;
