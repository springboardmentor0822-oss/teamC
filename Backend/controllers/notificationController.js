const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = 10;

    const notifications =
        await Notification.find({
            user: req.user._id
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.json(notifications);
};

exports.markAsRead = async (req, res) => {

    await Notification.findByIdAndUpdate(
        { 
            _id: req.params.id, 
            user: req.user._id
        }, 
        { read: true }
    );

    res.json({ message: "Marked as read" });
};

exports.getUnreadCount = async (req, res) => {

    const count = await Notification.countDocuments({
        user: req.user._id,
        read: false
    });

    res.json({ count });
};
