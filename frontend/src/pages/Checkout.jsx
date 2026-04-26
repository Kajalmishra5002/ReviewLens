import { useState } from 'react';
import useStore from '../store/useStore';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package, MapPin, CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  const [address, setAddress] = useState({
    address: '', city: '', state: '', pincode: '', phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    
    setLoading(true);
    try {
      const orderItems = cart.map(p => ({
        product: p._id, name: p.title || p.name, image: p.images?.[0] || p.image, quantity: p.qty, price: p.price
      }));
      
      await api.post('/orders', {
        orderItems,
        shippingInfo: { ...address, country: 'India' },
        paymentInfo: { id: 'TEST_RAZORPAY_ID', status: 'PAID' },
        itemsPrice: total,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: total
      });
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <Package className="w-24 h-24 text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">No Items to Checkout</h2>
        <p className="text-slate-400 mb-8">Please add items to your cart to proceed.</p>
        <Link to="/" className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-xl font-bold text-white shadow-lg">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <MapPin className="w-5 h-5 text-blue-400" /> Shipping Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-400">Street Address</label>
                <input name="address" placeholder="123 Main St, Apartment 4B" value={address.address} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">City</label>
                <input name="city" placeholder="Mumbai" value={address.city} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">State / Region</label>
                <input name="state" placeholder="Maharashtra" value={address.state} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Pincode</label>
                <input name="pincode" placeholder="400001" value={address.pincode} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">Phone Number</label>
                <input name="phone" placeholder="+91 98765 43210" value={address.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" /> Payment Method
              </h2>
              <p className="text-slate-400 text-sm">Demo mode bypasses real gateways.</p>
            </div>
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg font-medium text-sm flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4"/> Auto-approved
            </div>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div>
          <div className="sticky top-24 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" /> Review Order
            </h2>
            
            <div className="space-y-4 mb-6 relative z-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(p => (
                <div key={p._id} className="flex gap-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-lg p-1 border border-slate-700 flex-shrink-0">
                    <img src={p.image || p.images?.[0] || 'https://via.placeholder.com/60'} alt={p.title || p.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.title || p.name}</p>
                    <p className="text-xs text-slate-400 border border-slate-700 bg-slate-800 inline-block px-2 py-0.5 rounded mt-1">Qty: {p.qty}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-slate-300">₹{(p.price * p.qty).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-y border-slate-800 py-4 mb-6 relative z-10 space-y-3">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Tax</span>
                <span>₹0</span>
              </div>
            </div>

            <div className="mb-8 relative z-10 flex justify-between items-end">
              <p className="text-slate-200 font-medium">Grand Total</p>
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                ₹{total.toLocaleString("en-IN")}
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : "Confirm Purchase"}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">By placing your order, you agree to our Terms of Service & Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
