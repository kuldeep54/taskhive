const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const soon = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours from now

    const isAdmin = req.user.role === 'admin';

    // Base query: admins see all tasks, members see their own
    const baseQuery = isAdmin ? {} : { assignedTo: req.user._id };

    // 1. Overdue tasks (not done, past due date)
    const overdueTasks = await Task.find({
      ...baseQuery,
      dueDate: { $lt: now },
      status: { $ne: 'done' },
    })
      .populate('assignedTo', 'name')
      .populate('project', 'title')
      .sort({ dueDate: 1 })
      .limit(5);

    // 2. Due soon tasks (due within 48 hours, not done)
    const dueSoonTasks = await Task.find({
      ...baseQuery,
      dueDate: { $gte: now, $lte: soon },
      status: { $ne: 'done' },
    })
      .populate('assignedTo', 'name')
      .populate('project', 'title')
      .sort({ dueDate: 1 })
      .limit(5);

    // 3. Recently assigned tasks (last 3 days, member only)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const recentlyAssigned = isAdmin
      ? []
      : await Task.find({
          assignedTo: req.user._id,
          createdAt: { $gte: threeDaysAgo },
        })
          .populate('project', 'title')
          .sort({ createdAt: -1 })
          .limit(5);

    // Build notification objects
    const notifications = [];

    overdueTasks.forEach((task) => {
      notifications.push({
        id: `overdue-${task._id}`,
        type: 'overdue',
        title: 'Task Overdue',
        message: `"${task.title}" is overdue${task.project ? ` in ${task.project.title}` : ''}`,
        time: task.dueDate,
        read: false,
      });
    });

    dueSoonTasks.forEach((task) => {
      const hoursLeft = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
      notifications.push({
        id: `soon-${task._id}`,
        type: 'due_soon',
        title: 'Due Soon',
        message: `"${task.title}" is due in ${hoursLeft}h${task.project ? ` · ${task.project.title}` : ''}`,
        time: task.dueDate,
        read: false,
      });
    });

    recentlyAssigned.forEach((task) => {
      notifications.push({
        id: `assigned-${task._id}`,
        type: 'assigned',
        title: 'New Task Assigned',
        message: `You were assigned "${task.title}"${task.project ? ` in ${task.project.title}` : ''}`,
        time: task.createdAt,
        read: false,
      });
    });

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ notifications, count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
