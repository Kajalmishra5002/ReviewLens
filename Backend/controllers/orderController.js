const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationTemplate } = require('../utils/emailTemplates');

const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');


const { createNotification } = require('./notificationController');

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

  // 🔥 Update stock & notify sellers
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

    // Create notification for seller
    if (product.createdBy) {
       await createNotification({
         userId: product.createdBy,
         message: `New order received for your product: ${product.name} (Qty: ${item.quantity})`,
         type: 'Order'
       });
    }
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

// ================= GET SELLER ORDERS =================
exports.getSellerOrders = catchAsyncErrors(async (req, res, next) => {
  const sellerId = req.params.id;

  if (req.user.role !== 'Seller' && req.user.role !== 'Admin') {
     return next(new ErrorHandler("Unauthorized access", 403));
  }

  // Find all orders that contain products created by this seller
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate({
      path: 'orderItems.product',
      select: 'name price image createdBy stock category'
    });

  const sellerOrders = [];

  orders.forEach(order => {
    // Filter items to only include those belonging to this seller
    const sellerItems = order.orderItems.filter(item => {
      // product might be null if it was deleted, handle safely
      return item.product && item.product.createdBy && item.product.createdBy.toString() === sellerId;
    });

    if (sellerItems.length > 0) {
      // Create a specific seller-oriented view of the order
      const sellerOrderRevenue = sellerItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      
      sellerOrders.push({
        _id: order._id,
        user: order.user,
        orderItems: sellerItems,
        sellerRevenue: sellerOrderRevenue,
        shippingInfo: order.shippingInfo,
        status: order.status,
        paidAt: order.paidAt,
        createdAt: order.createdAt
      });
    }
  });

  res.status(200).json({
    success: true,
    orders: sellerOrders
  });
});