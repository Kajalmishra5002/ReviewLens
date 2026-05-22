const Product = require('../models/Product');

// ============ INTERNAL UTILITY ============
// Call this whenever a product price is updated
exports.recordPriceSnapshot = async (product) => {
  const lastEntry = product.priceHistory[product.priceHistory.length - 1];
  // Only record if price actually changed (or no history yet)
  if (!lastEntry || lastEntry.price !== product.price) {
    product.priceHistory.push({ price: product.price, date: new Date() });
  }
};

// ============ GET PRICE HISTORY ============
// GET /api/products/:productId/price-history
exports.getPriceHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('name price priceHistory');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Seed history with at least one entry if none exist
    if (!product.priceHistory || product.priceHistory.length === 0) {
      return res.json({
        name: product.name,
        currentPrice: product.price,
        history: [{ price: product.price, date: new Date() }]
      });
    }

    res.json({
      name: product.name,
      currentPrice: product.price,
      history: product.priceHistory
    });
  } catch (err) {
    console.error('Error fetching price history:', err);
    res.status(500).json({ message: 'Server error fetching price history' });
  }
};

// ============ BEST TIME TO BUY ============
// GET /api/products/:productId/best-time-to-buy
exports.getBestTimeToBuy = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select('name price priceHistory');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const history = product.priceHistory || [];
    const currentPrice = product.price;

    // Need at least 2 data points for trend analysis
    if (history.length < 2) {
      return res.json({
        recommendation: 'Insufficient Data',
        trend: 'unknown',
        currentPrice,
        avgPrice: currentPrice,
        lowestPrice: currentPrice,
        explanation: 'Not enough price history yet to predict the best time to buy.'
      });
    }

    // 7-day Simple Moving Average
    const WINDOW = 7;
    const recent = history.slice(-WINDOW).map(h => h.price);
    const avgPrice = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    const lowestPrice = Math.min(...history.map(h => h.price));
    const oldestRecent = recent[0];

    // Trend detection: compare oldest in window vs current
    const priceDelta = currentPrice - oldestRecent;
    const pctChange = ((priceDelta / oldestRecent) * 100).toFixed(1);

    let trend, recommendation, explanation;

    if (priceDelta < 0) {
      trend = 'falling';
      recommendation = 'Buy Now';
      explanation = `Price has dropped ${Math.abs(pctChange)}% over the recent window. This is a great time to buy!`;
    } else if (priceDelta > 0) {
      trend = 'rising';
      recommendation = 'Wait';
      explanation = `Price is up ${pctChange}% recently. Consider waiting for a potential dip.`;
    } else {
      trend = 'stable';
      recommendation = 'Good Time';
      explanation = `Price has been stable. No significant changes expected soon — a reasonable time to buy.`;
    }

    // If current price is the all-time low, always recommend Buy Now
    if (currentPrice <= lowestPrice) {
      recommendation = 'Buy Now';
      trend = 'falling';
      explanation = `This is the lowest price ever recorded for this product! Don't miss it.`;
    }

    res.json({
      recommendation,
      trend,
      currentPrice,
      avgPrice,
      lowestPrice,
      pctChange: Number(pctChange),
      explanation
    });
  } catch (err) {
    console.error('Error computing best time to buy:', err);
    res.status(500).json({ message: 'Server error computing recommendation' });
  }
};