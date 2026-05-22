import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import toast from "react-hot-toast";
import { handleRazorpayCheckout } from "../utils/razorpay";
import {
  ShieldCheck,
  ArrowLeft,
  Gift,
  Ticket
} from "lucide-react";
import { API_URL } from "../api/axios";

export default function Payment() {
  const navigate = useNavigate();
  const { selectedItems = [], cartItems = [], removeFromCart, deselectAllItems } = useStore();

  const [voucherCode, setVoucherCode] = useState("");
  const [password, setPassword] = useState("");
  const [giftAmount, setGiftAmount] = useState(0);
  const [giftCardId, setGiftCardId] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // Filter selected items from the cart
  const selectedCartItems = cartItems?.filter(item => selectedItems?.includes(item._id)) || [];

  useEffect(() => {
    if (selectedItems?.length === 0) {
      navigate("/cart");
    }
  }, [selectedItems, navigate]);

  if (selectedItems?.length === 0) return null;

  // 1. Original Total
  const originalTotal = selectedCartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // 2. Auto Discount applied logic
  const discountedTotal = selectedCartItems.reduce((acc, item) => {
    const discountPercent = item.discount || 0;
    const itemDiscountPrice = item.price - (item.price * discountPercent / 100);
    return acc + itemDiscountPrice * item.qty;
  }, 0);

  const totalDiscountApplied = originalTotal - discountedTotal;

  // Coupon Logic
  const handleApplyCoupon = () => {
    if (!couponCode) return;
    if (couponCode.toUpperCase() === "REVIEWLENS10") {
      setCouponDiscount(10);
      setIsCouponApplied(true);
      toast.success("10% Coupon Applied!");
    } else if (couponCode.toUpperCase() === "SAVE20") {
      setCouponDiscount(20);
      setIsCouponApplied(true);
      toast.success("20% Coupon Applied!");
    } else {
      toast.error("Invalid coupon code");
      setCouponDiscount(0);
      setIsCouponApplied(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setIsCouponApplied(false);
  };

  const couponDiscountAmount = (discountedTotal * couponDiscount) / 100;

  // 3. Final Price Calculation
  let finalPrice = discountedTotal - couponDiscountAmount - giftAmount;
  if (finalPrice < 0) finalPrice = 0;

  const handleApplyGiftCard = async () => {
    if (!voucherCode || !password) {
      toast.error("Please enter both Voucher Code and Password");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch(`${API_URL}/giftcard/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherCode, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGiftCardId(data.giftCardId);
        setGiftAmount(data.amount);
        toast.success(data.message || "Gift card applied!");
      } else {
        toast.error(data.error || "Invalid gift card");
        setGiftAmount(0);
        setGiftCardId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying gift card");
      setGiftAmount(0);
      setGiftCardId(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePayment = () => {
    handleRazorpayCheckout(finalPrice, "Cart Checkout", async () => {
      // Success callback - Create Order in DB
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const orderItems = selectedCartItems.map(item => ({
            product: item._id,
            name: item.name || item.title,
            image: item.image || item.images?.[0]?.url,
            quantity: item.qty,
            price: item.price
          }));

          await fetch(`${API_URL}/order/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              orderItems,
              shippingInfo: {
                address: "Default Address", city: "City", state: "State", country: "India", pincode: "000000", phone: "0000000000"
              },
              itemsPrice: originalTotal,
              shippingPrice: 0,
              taxPrice: 0,
              totalPrice: finalPrice,
              paymentInfo: { id: "razorpay", status: "paid" }
            })
          });
        }
      } catch (err) {
        console.error("Order save failed", err);
      }

      selectedItems.forEach(id => removeFromCart(id));
      deselectAllItems();
      navigate("/");
    }, {
      giftCardId: giftCardId
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      <button 
        onClick={() => navigate("/cart")}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: GIFT CARD & ITEMS PREVIEW */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift size={20} className="text-[#FF6B00]" /> 
              Have a Gift Card?
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Voucher Number</label>
                <input
                  type="text"
                  placeholder="e.g. GIFT-1234"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded px-4 py-2 border border-slate-700 outline-none focus:border-[#FF6B00]"
                  disabled={giftCardId != null}
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Password / PIN</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded px-4 py-2 border border-slate-700 outline-none focus:border-[#FF6B00]"
                  disabled={giftCardId != null}
                />
              </div>

              {giftCardId ? (
                <button
                  onClick={() => {
                    setGiftCardId(null);
                    setGiftAmount(0);
                    setVoucherCode("");
                    setPassword("");
                  }}
                  className="w-full py-2 rounded font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Remove Gift Card
                </button>
              ) : (
                <button
                  onClick={handleApplyGiftCard}
                  disabled={isVerifying || !voucherCode || !password}
                  className={`w-full py-2 rounded font-bold transition-colors ${
                    isVerifying || !voucherCode || !password 
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                    : "bg-[#FF6B00] hover:bg-[#e65a00] text-white"
                  }`}
                >
                  {isVerifying ? "Verifying..." : "Apply Gift Card"}
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl mt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Ticket size={20} className="text-indigo-500" /> 
              Apply Coupon
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="REVIEWLENS10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={isCouponApplied}
                className="flex-1 bg-slate-800 text-white rounded px-4 py-2 border border-slate-700 outline-none focus:border-indigo-500 uppercase"
              />
              {isCouponApplied ? (
                <button onClick={removeCoupon} className="px-4 py-2 rounded font-bold bg-red-500 hover:bg-red-600 text-white transition-colors">
                  Remove
                </button>
              ) : (
                <button onClick={handleApplyCoupon} className="px-4 py-2 rounded font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                  Apply
                </button>
              )}
            </div>
          </div>

          {/* ITEM PREVIEW */}
          <div className="bg-slate-900 p-6 rounded-xl">
            <h3 className="text-sm font-semibold mb-3 border-b border-slate-700 pb-2">Items you are buying</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {selectedCartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.image || item.images?.[0]?.url || "https://via.placeholder.com/40"} alt="item" className="w-10 h-10 object-cover rounded bg-slate-800" />
                    <span className="truncate max-w-[150px]">{item.name || item.title} <span className="text-slate-500 ml-1">x{item.qty}</span></span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                    {item.discount > 0 && (
                      <span className="text-xs text-green-400">-{item.discount}% Auto applied</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY & PAY */}
        <div className="bg-slate-900 p-6 rounded-xl self-start sticky top-24">
          <h2 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-4">Order Summary</h2>

          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Original Total</span>
              <span className="font-medium">₹{originalTotal.toLocaleString("en-IN")}</span>
            </div>
            
            {totalDiscountApplied > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Product Discounts</span>
                <span>- ₹{totalDiscountApplied.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {couponDiscountAmount > 0 && (
              <div className="flex justify-between text-indigo-400">
                <span>Coupon Discount ({couponDiscount}%)</span>
                <span>- ₹{couponDiscountAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            {giftAmount > 0 && (
              <div className="flex justify-between text-[#FF6B00]">
                <span>Gift Card Balance</span>
                <span>- ₹{giftAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <hr className="my-4 border-slate-700" />

          <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-lg">
            <span className="text-lg text-slate-300">Final Payable</span>
            <span className="text-2xl font-bold text-green-400">
              ₹{finalPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* ✅ FINAL PAY BUTTON */}
          <button
            onClick={handlePayment}
            className="w-full py-4 rounded font-bold text-lg bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center gap-2"
          >
            <Ticket size={20} /> Pay Now
          </button>

          <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
