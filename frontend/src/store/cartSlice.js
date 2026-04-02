import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find(i => i._id === action.payload._id)
      if (existing) {
        existing.qty += 1
      } else {
        state.items.push({ ...action.payload, qty: 1 })
      }
      state.total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => i._id !== action.payload)
      state.total = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    },
    clearCart(state) {
      state.items = []
      state.total = 0
    },
  },
})

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer