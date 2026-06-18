const Activity = require('../models/Activity');
const sendResponse = require('../utils/apiResponse');

// Helper function — call this from other controllers to log activity
const logActivity = async (groupId, userId, action, description) => {
  try {
    await Activity.create({ groupId, userId, action, description });
  } catch (error) {
    console.log('Activity log failed:', error.message);
  }
};

// GET ACTIVITY FEED FOR A GROUP
const getGroupActivity = async (req, res) => {
  try {
    const { groupId } = req.params;

    const activities = await Activity.find({ groupId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    sendResponse(res, 200, 'Activity fetched successfully', {
      activities
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

module.exports = { logActivity, getGroupActivity };