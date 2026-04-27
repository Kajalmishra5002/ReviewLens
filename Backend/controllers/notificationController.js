const Notification = require('../models/Notification');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');

// ================= GET USER NOTIFICATIONS =================
exports.getUserNotifications = catchAsyncErrors(async (req, res, next) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    notifications
  });
});

// ================= CREATE NOTIFICATION (INTERNAL HELPER) =================
exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// ================= MARK AS READ =================
exports.markAsRead = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }

  // Ensure notification belongs to user
  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read"
  });
});
