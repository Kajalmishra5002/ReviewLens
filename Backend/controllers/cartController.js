const Cart = require('../models/Cart');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');

// ================= GET CART =================
exports.getCart = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({
    success: true,
    cart
  });
});

// ================= ADD/UPDATE CART =================
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return next(new ErrorHandler("Items must be an array", 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = items;
    await cart.save();
  } else {
    cart = await Cart.create({
      user: req.user._id,
      items
    });
  }

  res.status(200).json({
    success: true,
    cart
  });
});
