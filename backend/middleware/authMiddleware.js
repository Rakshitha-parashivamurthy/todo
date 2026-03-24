const { getUserByUid } = require('../repos/firestoreUsers'); // Assuming we move or adapt

// Note: Since backend is JS, but repos are TS, might need to adjust. For now, assume we can require.

const authMiddleware = async (req, res, next) => {
  const uid = req.headers['uid']; // Assuming UID is passed in headers for simplicity
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await getUserByUid(uid);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  next();
};

const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== requiredRole && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };