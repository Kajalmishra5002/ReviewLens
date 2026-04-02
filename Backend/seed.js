require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('./models/Product')

const products = [
  { name: 'Wireless Earbuds', description: 'High quality audio, noise cancelling', price: 1299, category: 'electronics', stock: 50, ratings: 4.5, tags: ['audio', 'wireless', 'earbuds'] },
  { name: 'Running Shoes', description: 'Lightweight, breathable mesh', price: 2499, category: 'clothing', stock: 30, ratings: 4.2, tags: ['shoes', 'running', 'sports'] },
  { name: 'Python Crash Course', description: 'Best Python book for beginners', price: 499, category: 'books', stock: 100, ratings: 4.8, tags: ['python', 'programming', 'book'] },
  { name: 'Smart Watch', description: 'Fitness tracker, heart rate monitor', price: 3999, category: 'electronics', stock: 20, ratings: 4.6, tags: ['watch', 'fitness', 'smart'] },
  { name: 'Yoga Mat', description: 'Non-slip, eco-friendly', price: 799, category: 'sports', stock: 45, ratings: 4.4, tags: ['yoga', 'fitness', 'mat'] },
]

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.insertMany(products)
  console.log('Seeded successfully!')
  process.exit(0)
})