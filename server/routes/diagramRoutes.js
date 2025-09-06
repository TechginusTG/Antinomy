import express from 'express';
import db from '../db.js'; // Your db connection setup
import authenticateToken from '../authenticateToken.js'; // Your JWT auth middleware

const router = express.Router();

// Get diagram data
router.get('/', authenticateToken, async (req, res) => {
  try {
    // FIX: Use db.raw instead of the non-existent db.query, and '?' for bindings
    const { rows } = await db.raw('SELECT diagram_data FROM diagrams WHERE user_id = ?', [req.user.userId]);
    if (rows.length > 0) {
      res.json({ diagram_data: rows[0].diagram_data });
    } else {
      // No diagram found is not an error, just means we need to create one. Send 204 No Content.
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error fetching diagram:', error);
    res.status(500).send('Server error');
  }
});

// Save or update diagram data
router.post('/', authenticateToken, async (req, res) => {
  const { diagram_data } = req.body;
  if (!diagram_data) {
    return res.status(400).send('diagram_data is required');
  }

  try {
    // FIX: Use '?' for bindings, which is the standard Knex placeholder.
    const query = `
      INSERT INTO diagrams (user_id, diagram_data, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET diagram_data = EXCLUDED.diagram_data, updated_at = NOW();
    `;
    await db.raw(query, [req.user.userId, diagram_data]);
    res.status(200).send('Diagram saved successfully');
  } catch (error) {
    console.error('Error saving diagram:', error);
    res.status(500).send('Server error');
  }
});

export default router;
