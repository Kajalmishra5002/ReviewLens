const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
//const { v2: cloudinary } = require('cloudinary');

const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');


// ================= GET ALL USERS =================
exports.getAllUsers = catchAsyncErrors(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  const users = await User.find({ role: 'User' })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments({ role: 'User' });

  res.status(200).json({
    success: true,
    totalUsers,
    currentPage: page,
    users,
  });
});


// ================= DELETE USER =================
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});


// ================= DASHBOARD STATS =================
exports.dashboardStats = catchAsyncErrors(async (req, res) => {

  const orders = await Order.find({ isPaid: true });

  const totalRevenue = orders.reduce(
    (acc, item) => acc + item.totalPrice,
    0
  );

  const totalUsers = await User.countDocuments({ role: 'User' });

  const orderStatusCounts = {
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  orders.forEach(order => {
    if (orderStatusCounts[order.status] !== undefined) {
      orderStatusCounts[order.status]++;
    }
  });

  const monthlySales = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$totalPrice" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const topProducts = await Product.find()
    .sort({ ratings: -1 })
    .limit(5);

  const lowStock = await Product.find({ stock: { $lte: 5 } });

  res.status(200).json({
    success: true,
    totalRevenue,
    totalUsers,
    orderStatusCounts,
    monthlySales,
    topProducts,
    lowStockProducts: lowStock
  });
});


// ================= 📊 ADVANCED DASHBOARD =================
exports.advancedDashboard = catchAsyncErrors(async (req, res) => {

  // 🔥 Monthly Revenue (with readable month)
  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // 🔥 Users Growth
  const userGrowth = await User.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        users: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  // 🔥 Total Orders
  const totalOrders = await Order.countDocuments();

  res.status(200).json({
    success: true,
    monthlyRevenue,
    userGrowth,
    totalOrders
  });
});