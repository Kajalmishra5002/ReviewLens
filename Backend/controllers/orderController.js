const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationTemplate } = require('../utils/emailTemplates');

const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');


// ================= PLACE ORDER =================
exports.placeNewOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return next(new ErrorHandler("Cart is empty", 400));
  }

  // 🔥 Update stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    if (product.stock < item.quantity) {
      return next(
        new ErrorHandler(`Only ${product.stock} items available`, 400)
      );
    }

    product.stock -= item.quantity;
    await product.save();
  }

  // 🔥 Create order
  const order = await Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now()
  });

  try {
    const user = await User.findById(req.user._id);
    if (user && user.email) {
      await sendEmail({
        email: user.email,
        subject: "Order Confirmation - ReviewLens",
        message: orderConfirmationTemplate(user.name, order._id, totalPrice, orderItems)
      });
    }
  } catch(err) {
    console.error("Order confirmation email failed:", err.message);
  }

  res.status(201).json({
    success: true,
    order
  });
});


// ================= MY ORDERS =================
exports.fetchMyOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders
  });
});


// ================= SINGLE ORDER =================
exports.fetchSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId)
    .populate('user', 'name email');

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  res.status(200).json({
    success: true,
    order
  });
});


// ================= ALL ORDERS (ADMIN) =================
exports.fetchAllOrders = catchAsyncErrors(async (req, res) => {
  const orders = await Order.find();

  const totalRevenue = orders.reduce(
    (acc, item) => acc + item.totalPrice,
    0
  );

  res.status(200).json({
    success: true,
    totalRevenue,
    orders
  });
});


// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  order.status = req.body.status;

  if (req.body.status === "Delivered") {
    order.paidAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated"
  });
});


// ================= DELETE ORDER =================
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted"
  });
});