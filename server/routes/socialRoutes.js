import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

router.use(authMiddleware);

// ─── Friends ─────────────────────────────────────────────────────────────────

// GET /api/social/users?q=  - search users to add as friends
router.get('/users', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);

  const term = `%${q.trim()}%`;
  const users = db.prepare(`
    SELECT u.id, u.name, u.email,
      COALESCE(fr.status, 'none') AS friendship_status,
      CASE WHEN fr.sender_id = ? THEN 'sent' WHEN fr.receiver_id = ? THEN 'received' ELSE NULL END AS direction
    FROM users u
    LEFT JOIN friend_requests fr ON (
      (fr.sender_id = ? AND fr.receiver_id = u.id) OR
      (fr.receiver_id = ? AND fr.sender_id = u.id)
    )
    WHERE u.id != ? AND (u.name LIKE ? OR u.email LIKE ?)
    LIMIT 20
  `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, term, term);

  res.json(users);
});

// GET /api/social/friends - list accepted friends
router.get('/friends', (req, res) => {
  const friends = db.prepare(`
    SELECT u.id, u.name, u.email, fr.created_at AS friends_since
    FROM friend_requests fr
    JOIN users u ON (
      CASE WHEN fr.sender_id = ? THEN fr.receiver_id ELSE fr.sender_id END = u.id
    )
    WHERE fr.status = 'accepted'
      AND (fr.sender_id = ? OR fr.receiver_id = ?)
    ORDER BY fr.updated_at DESC
  `).all(req.user.id, req.user.id, req.user.id);

  res.json(friends);
});

// GET /api/social/friend-requests - pending requests received
router.get('/friend-requests', (req, res) => {
  const requests = db.prepare(`
    SELECT fr.id, fr.sender_id, u.name AS sender_name, u.email AS sender_email, fr.created_at
    FROM friend_requests fr
    JOIN users u ON fr.sender_id = u.id
    WHERE fr.receiver_id = ? AND fr.status = 'pending'
    ORDER BY fr.created_at DESC
  `).all(req.user.id);

  res.json(requests);
});

// POST /api/social/friend-requests - send a request
router.post('/friend-requests', (req, res) => {
  const { receiver_id } = req.body;
  if (!receiver_id) return res.status(400).json({ error: 'receiver_id required' });
  if (receiver_id === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

  const target = db.prepare('SELECT id FROM users WHERE id = ?').get(receiver_id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const existing = db.prepare(`
    SELECT id, status FROM friend_requests
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
  `).get(req.user.id, receiver_id, receiver_id, req.user.id);

  if (existing) {
    return res.status(409).json({ error: 'Friend request already exists', status: existing.status });
  }

  const result = db.prepare(`
    INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)
  `).run(req.user.id, receiver_id);

  res.status(201).json({ id: result.lastInsertRowid, status: 'pending' });
});

// PUT /api/social/friend-requests/:id - accept or reject
router.put('/friend-requests/:id', (req, res) => {
  const { action } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be accept or reject' });
  }

  const fr = db.prepare('SELECT * FROM friend_requests WHERE id = ?').get(req.params.id);
  if (!fr) return res.status(404).json({ error: 'Request not found' });
  if (fr.receiver_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  if (fr.status !== 'pending') return res.status(409).json({ error: 'Request already resolved' });

  const status = action === 'accept' ? 'accepted' : 'rejected';
  db.prepare(`
    UPDATE friend_requests SET status = ?, updated_at = unixepoch() WHERE id = ?
  `).run(status, fr.id);

  res.json({ status });
});

// DELETE /api/social/friends/:friendId - remove friend
router.delete('/friends/:friendId', (req, res) => {
  const friendId = parseInt(req.params.friendId);
  db.prepare(`
    DELETE FROM friend_requests
    WHERE status = 'accepted'
      AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
  `).run(req.user.id, friendId, friendId, req.user.id);

  res.json({ success: true });
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────

// GET /api/social/leaderboard?type=calories&period=week
router.get('/leaderboard', (req, res) => {
  const { type = 'calories', period = 'week' } = req.query;
  const since = period === 'month'
    ? Math.floor(Date.now() / 1000) - 30 * 86400
    : Math.floor(Date.now() / 1000) - 7 * 86400;

  let rows;
  if (type === 'streak') {
    rows = db.prepare(`
      SELECT u.id, u.name,
        COUNT(DISTINCT date(logged_at, 'unixepoch')) AS score
      FROM users u
      JOIN meal_logs ml ON ml.user_id = u.id
      WHERE ml.logged_at >= ?
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT 20
    `).all(since);
  } else {
    rows = db.prepare(`
      SELECT u.id, u.name,
        ROUND(SUM(ml.calories)) AS score
      FROM users u
      JOIN meal_logs ml ON ml.user_id = u.id
      WHERE ml.logged_at >= ?
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT 20
    `).all(since);
  }

  const withRank = rows.map((r, i) => ({ ...r, rank: i + 1 }));
  const myRank = withRank.find(r => r.id === req.user.id) || null;

  res.json({ entries: withRank, myRank, period, type });
});

// ─── Challenges ───────────────────────────────────────────────────────────────

// GET /api/social/challenges - list active challenges
router.get('/challenges', (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const challenges = db.prepare(`
    SELECT c.*, u.name AS creator_name,
      COUNT(cp.id) AS participant_count,
      MAX(CASE WHEN cp.user_id = ? THEN 1 ELSE 0 END) AS is_joined,
      MAX(CASE WHEN cp.user_id = ? THEN cp.progress ELSE NULL END) AS my_progress,
      MAX(CASE WHEN cp.user_id = ? THEN cp.completed ELSE NULL END) AS my_completed
    FROM community_challenges c
    JOIN users u ON c.creator_id = u.id
    LEFT JOIN challenge_participants cp ON cp.challenge_id = c.id
    WHERE c.is_active = 1 AND c.end_date >= ?
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT 50
  `).all(req.user.id, req.user.id, req.user.id, now);

  res.json(challenges);
});

// POST /api/social/challenges - create a challenge
router.post('/challenges', (req, res) => {
  const { title, description, goal_type, goal_value, duration_days = 7 } = req.body;
  if (!title || !goal_type || !goal_value) {
    return res.status(400).json({ error: 'title, goal_type, goal_value required' });
  }

  const validGoalTypes = ['calories', 'meals', 'protein', 'streak'];
  if (!validGoalTypes.includes(goal_type)) {
    return res.status(400).json({ error: `goal_type must be one of: ${validGoalTypes.join(', ')}` });
  }

  const start = Math.floor(Date.now() / 1000);
  const end = start + Math.min(Math.max(1, duration_days), 30) * 86400;

  const result = db.prepare(`
    INSERT INTO community_challenges (creator_id, title, description, goal_type, goal_value, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title.trim(), description?.trim() || null, goal_type, goal_value, start, end);

  // Auto-join the creator
  db.prepare(`
    INSERT OR IGNORE INTO challenge_participants (challenge_id, user_id) VALUES (?, ?)
  `).run(result.lastInsertRowid, req.user.id);

  res.status(201).json({ id: result.lastInsertRowid });
});

// POST /api/social/challenges/:id/join
router.post('/challenges/:id/join', (req, res) => {
  const challengeId = parseInt(req.params.id);
  const challenge = db.prepare('SELECT * FROM community_challenges WHERE id = ? AND is_active = 1').get(challengeId);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found or inactive' });

  const now = Math.floor(Date.now() / 1000);
  if (challenge.end_date < now) return res.status(400).json({ error: 'Challenge has ended' });

  db.prepare(`
    INSERT OR IGNORE INTO challenge_participants (challenge_id, user_id) VALUES (?, ?)
  `).run(challengeId, req.user.id);

  res.json({ joined: true });
});

// GET /api/social/challenges/:id/leaderboard
router.get('/challenges/:id/leaderboard', (req, res) => {
  const challengeId = parseInt(req.params.id);
  const challenge = db.prepare('SELECT * FROM community_challenges WHERE id = ?').get(challengeId);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const entries = db.prepare(`
    SELECT cp.user_id AS id, u.name, cp.progress AS score, cp.completed,
      RANK() OVER (ORDER BY cp.progress DESC) AS rank
    FROM challenge_participants cp
    JOIN users u ON cp.user_id = u.id
    WHERE cp.challenge_id = ?
    ORDER BY cp.progress DESC
  `).all(challengeId);

  res.json({ challenge, entries });
});

// ─── Activity Feed (shares) ───────────────────────────────────────────────────

// GET /api/social/feed - posts from self and friends
router.get('/feed', (req, res) => {
  const posts = db.prepare(`
    SELECT s.id, s.user_id, u.name AS author_name, s.share_type, s.content,
      s.visibility, s.created_at
    FROM activity_shares s
    JOIN users u ON s.user_id = u.id
    WHERE s.visibility = 'public'
      OR s.user_id = ?
      OR (
        s.visibility = 'friends'
        AND s.user_id IN (
          SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
          FROM friend_requests
          WHERE status = 'accepted' AND (sender_id = ? OR receiver_id = ?)
        )
      )
    ORDER BY s.created_at DESC
    LIMIT 30
  `).all(req.user.id, req.user.id, req.user.id, req.user.id);

  res.json(posts.map(p => ({ ...p, content: JSON.parse(p.content) })));
});

// POST /api/social/feed - share a progress update
router.post('/feed', (req, res) => {
  const { share_type, content, visibility = 'friends' } = req.body;
  if (!share_type || !content) return res.status(400).json({ error: 'share_type and content required' });
  if (!['friends', 'public'].includes(visibility)) {
    return res.status(400).json({ error: 'visibility must be friends or public' });
  }

  const validTypes = ['milestone', 'meal', 'workout', 'weight', 'challenge'];
  if (!validTypes.includes(share_type)) {
    return res.status(400).json({ error: `share_type must be one of: ${validTypes.join(', ')}` });
  }

  const result = db.prepare(`
    INSERT INTO activity_shares (user_id, share_type, content, visibility) VALUES (?, ?, ?, ?)
  `).run(req.user.id, share_type, JSON.stringify(content), visibility);

  res.status(201).json({ id: result.lastInsertRowid });
});

export default router;
