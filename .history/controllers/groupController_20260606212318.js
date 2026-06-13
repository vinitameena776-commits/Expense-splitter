const Group = require('../models/Group');

// Generate random invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GRP-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// CREATE GROUP
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    // Generate unique invite code
    const inviteCode = generateInviteCode();

    // Create group with creator as first member
    const group = await Group.create({
      name,
      createdBy: req.userId,
      members: [req.userId],
      inviteCode
    });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// JOIN GROUP
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Find group by invite code
    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({
        message: 'Invalid invite code. Group not found.'
      });
    }

    // Check if user is already a member
    if (group.members.includes(req.userId)) {
      return res.status(400).json({
        message: 'You are already a member of this group'
      });
    }

    // Add user to members array
    group.members.push(req.userId);
    await group.save();

    res.status(200).json({
      message: 'Joined group successfully',
      group
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET GROUP DETAILS
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    // Check if requesting user is a member
    const isMember = group.members.some(
      member => member._id.toString() === req.userId
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'You are not a member of this group'
      });
    }

    res.status(200).json({ group });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGroup, joinGroup, getGroup };