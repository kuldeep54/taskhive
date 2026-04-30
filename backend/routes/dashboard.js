const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'member') {
      query.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(query);
    const inProgress = await Task.countDocuments({ ...query, status: 'inprogress' });
    const completed = await Task.countDocuments({ ...query, status: 'done' });
    const overdue = await Task.countDocuments({ 
      ...query, 
      status: { $ne: 'done' }, 
      dueDate: { $lt: new Date() } 
    });

    const recentTasks = await Task.find(query)
      .populate('project', 'title')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    let tasksPerUser = [];
    if (req.user.role === 'admin') {
      const users = await User.find({}).select('name role');
      tasksPerUser = await Promise.all(users.map(async (u) => {
        const count = await Task.countDocuments({ assignedTo: u._id });
        return { 
          name: u.name, 
          role: u.role, 
          count,
          initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase()
        };
      }));
    }

    res.json({
      totalTasks,
      inProgress,
      completed,
      overdue,
      recentTasks,
      tasksPerUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
