const Activity = require('../models/Activity');

const logActivity = async (userId, type, details = {}) => {
  try {
    await Activity.create({
      user: userId,
      type,
      details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };