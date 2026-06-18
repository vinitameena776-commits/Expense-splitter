const { logActivity } = require('./activityController');
const Group = require('../models/Group');
const sendResponse = require('../utils/apiResponse');

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GRP-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }
  return code;
};

// CREATE GROUP
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return sendResponse(res, 400, 'Group name is required');
    }

    const inviteCode = generateInviteCode();

    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      createdBy: req.userId,
      members: [req.userId],
      inviteCode
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    sendResponse(res, 201, 'Group created successfully', {
      group: populatedGroup
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};



// JOIN GROUP
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return sendResponse(res, 400, 'Invite code is required');
    }

    const group = await Group.findOne({ 
      inviteCode: inviteCode.toUpperCase() 
    });
    if (!group) {
      return sendResponse(res, 404, 
        'Invalid invite code. Group not found.');
    }

    if (group.members.includes(req.userId)) {
      return sendResponse(res, 400, 
        'You are already a member of this group');
    }

    group.members.push(req.userId);
    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    sendResponse(res, 200, 'Joined group successfully', {
      group: populatedGroup
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// GET GROUP DETAILS
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return sendResponse(res, 404, 'Group not found');
    }

    const isMember = group.members.some(
      member => member._id.toString() === req.userId
    );
    if (!isMember) {
      return sendResponse(res, 403, 
        'You are not a member of this group');
    }

    sendResponse(res, 200, 'Group fetched successfully', {
      group
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// GET ALL GROUPS OF LOGGED IN USER
const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 
      members: req.userId 
    })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, 'Groups fetched successfully', {
      groups
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

module.exports = { 
  createGroup, 
  joinGroup, 
  getGroup,
  getUserGroups
};