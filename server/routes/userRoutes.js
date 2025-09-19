import express from "express";
import db from "../db.js";
import bcrypt from "bcrypt";
import zlib from "zlib";
import authenticateToken from "../authenticateToken.js";
import { modes } from "../prompt/modes.js";

const router = express.Router();

router.get("/modes", (req, res) => {
  const modeLabels = {
    basic: "기본 모드",
    worry: "고민 모드",
    solution: "문제해결 모드",
    Rotten_brain: "질문에 질문으로 답하는 모드",
  };

  const preferredOrder = ["basic", "worry", "solution"];
  const modeKeys = Object.keys(modes);

  modeKeys.sort((a, b) => {
    const indexA = preferredOrder.indexOf(a);
    const indexB = preferredOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB; // Both in order list
    }
    if (indexA !== -1) {
      return -1; // a is in list, b is not
    }
    if (indexB !== -1) {
      return 1; // b is in list, a is not
    }
    return 0; // Keep original order for keys not in the list
  });

  const availableModes = modeKeys.map((key) => ({
    key,
    label: modeLabels[key] || key,
  }));
  res.json(availableModes);
});

router.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요.",
    });
  }

  try {
    const user = await db("users").where({ user_id: userId }).first();

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "현재 비밀번호가 일치하지 않습니다.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db("users")
      .where({ user_id: userId })
      .update({ password: hashedPassword });

    return res.json({ success: true, message: "비밀번호가 변경되었습니다." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "서버 오류가 발생했습니다." });
  }
});

router.delete("/delete-account", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { passwordConfirm } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "사용자 ID가 필요합니다." });
  }

  try {
    const user = await db("users").where({ user_id: userId }).first();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    const isMatch = await bcrypt.compare(passwordConfirm, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "비밀번호가 일치하지 않습니다." });
    }

    console.log(`Attempting to delete user with user_id: ${userId}`);
    const deletedChatsCount = await db("chats")
      .where({ user_id: userId })
      .del();
    console.log(
      `[DB] User ${userId} chat messages deleted: ${deletedChatsCount} rows`
    );

    const deletedUserCount = await db("users").where({ user_id: userId }).del();
    console.log(
      `[DB] User ${userId} account deleted: ${deletedUserCount} rows`
    );

    res.json({ success: true, message: "회원 탈퇴에 성공했습니다." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "탈퇴 중 오류가 발생했습니다." });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await db("users").where({ user_id: req.user.userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversationId = user.conversation_id;
    const clientConversationId = req.headers["x-conversation-id"];

    // DB에 conversation_id가 없고, 클라이언트가 기존 ID를 보내온 경우 DB에 업데이트 (마이그레이션)
    if (!conversationId && clientConversationId) {
      await db("users")
        .where({ user_id: req.user.userId })
        .update({ conversation_id: clientConversationId });
      conversationId = clientConversationId;
    }

    res.json({
      id: user.user_id,
      name: user.name,
      exp: user.exp,
      lvl: user.lvl,
      conversationId: conversationId,
      // settings는 /settings 엔드포인트에서 별도로 제공
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// 설정 불러오기 엔드포인트
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const user = await db("users").where({ user_id: req.user.userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // DB 컬럼명과 프론트엔드 속성명 매핑
    const settings = {
      theme: user.theme,
      customThemeColors: user.custom_theme_colors,
      mode: user.mode,
      userNote: user.user_note,
    };

    res.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 설정 저장/업데이트 엔드포인트
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { theme, customThemeColors, mode, userNote } = req.body;

    // 프론트엔드 속성명과 DB 컬럼명 매핑
    const settingsToUpdate = {
      theme: theme,
      custom_theme_colors: JSON.stringify(customThemeColors), // 배열을 JSON 문자열로 변환
      mode: mode,
      user_note: userNote,
    };

    // null 또는 undefined 값은 업데이트에서 제외 (부분 업데이트 가능하도록)
    const filteredSettings = Object.entries(settingsToUpdate).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          // undefined만 제외 (null은 저장 가능하도록)
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    await db("users").where({ user_id: userId }).update(filteredSettings);

    res.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 임포트 요청 처리 엔드포인트
router.post("/import-request", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { diagramData, chatHistory, conversationId } = req.body;

  if (!diagramData || !Array.isArray(chatHistory) || !conversationId) {
    return res.status(400).json({
      message:
        "diagramData, chatHistory (array), and conversationId are required.",
    });
  }

  const trx = await db.transaction();
  try {
    // 1. 다이어그램 덮어쓰기
    const jsonString = JSON.stringify(diagramData);
    const compressed = zlib.deflateSync(jsonString);
    const base64 = compressed.toString("base64");
    const safeEncodedData = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const existingDiagram = await trx("diagrams")
      .where({ user_id: userId })
      .first();
    if (existingDiagram) {
      await trx("diagrams")
        .where({ user_id: userId })
        .update({ diagram_data: safeEncodedData, updated_at: db.fn.now() });
    } else {
      await trx("diagrams").insert({
        user_id: userId,
        diagram_data: safeEncodedData,
      });
    }

    // 2. 대화 기록 덮어쓰기
    await trx("chats").where({ conversation_id: conversationId }).del();

    if (chatHistory.length > 0) {
      const newChats = chatHistory.map((message) => ({
        user_id: userId,
        conversation_id: conversationId,
        sender: message.sender,
        message: message.content,
      }));
      await trx("chats").insert(newChats);
    }

    await trx.commit();
    res.status(200).json({ message: "Import successful. Database updated." });
  } catch (error) {
    await trx.rollback();
    console.error("Error during import request:", error);
    res.status(500).json({ message: "Internal server error during import." });
  }
});

export default router;
