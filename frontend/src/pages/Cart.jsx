import useStore from "../store/useStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingCart, Trash2, ExternalLink, CheckSquare, Square, ShieldCheck } from "lucide-react";

export default function Cart() {
  const {
    cartItems = [],
    selectedItems = [],
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
  } = useStore();

  const navigate = useNavigate();

  // ✅ Empty cart UI
  if (cartItems?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <ShoppingCart className="w-24 h-24 text-slate-700 mb-6" />
        <h2 className="text-4xl font-serif font-bold text-white mb-2">
          My Cart
        </h2>
        <p className="text-slate-400 mb-8">
          It looks like you haven't added anything yet.
        </p>

        <button
          onClick={() => navigate("/")}
          className="bg-[#FF6B00] hover:bg-[#E65A00] text-white px-8 py-3 rounded-xl font-bold"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // ✅ Calculations for preview
  const selectedCartItems = cartItems?.filter(item => selectedItems?.includes(item._id)) || [];
  
  const total = selectedCartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const isAllSelected = cartItems?.length > 0 && selectedItems?.length === cartItems?.length;

  const handleSelectAll = () => {
    if (isAllSelected) deselectAllItems();
    else selectAllItems();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🛒 My Cart</h1>

        <button
          onClick={() => {
            clearCart();
            toast.success("Cart cleared");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded transition-colors"
        >
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 bg-slate-900 p-4 rounded-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleSelectAll}>
          {isAllSelected ? (
             <CheckSquare className="text-[#FF6B00]" size={24} />
          ) : (
             <Square className="text-slate-400 hover:text-slate-300" size={24} />
          )}
          <span className="font-semibold text-lg select-none">Select All ({cartItems?.length || 0} items)</span>
        </div>
        <p className="text-slate-400">
          {selectedItems?.length || 0} selected
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: CART ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems?.map((item) => {
            const officialLink = item.officialLink || "#";
            const amazonLink = item.amazonLink || "#";
            const isSelected = selectedItems?.includes(item._id);

            return (
              <div
                key={item._id}
                className={`bg-slate-900 p-4 rounded-xl flex flex-col md:flex-row gap-4 transition-colors ${isSelected ? "ring-2 ring-[#FF6B00] bg-slate-800" : ""}`}
              >
                {/* CHECKBOX */}
                <div 
                  className="flex items-center justify-center cursor-pointer mr-2"
                  onClick={() => toggleSelectItem(item._id)}
                >
                  {isSelected ? (
                    <CheckSquare className="text-[#FF6B00]" size={28} />
                  ) : (
                    <Square className="text-slate-400" size={28} />
                  )}
                </div>

                {/* IMAGE */}
                <img
                  src={
                    item.image ||
                    item.images?.[0]?.url ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="w-24 h-24 object-contain bg-slate-800 rounded cursor-pointer"
                  onClick={() => toggleSelectItem(item._id)}
                />

                {/* INFO */}
                <div className="flex-1">
                  <h2 className="font-bold text-lg cursor-pointer" onClick={() => toggleSelectItem(item._id)}>
                    {item.name || item.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {item.brand || "Brand"}
                  </p>

                  {/* LINKS */}
                  <div className="flex gap-3 mt-2">
                    <a
                      href={officialLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 text-sm hover:underline"
                    >
                      Official <ExternalLink size={14} className="inline" />
                    </a>

                    <a
                      href={amazonLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yellow-400 text-sm hover:underline"
                    >
                      Amazon
                    </a>
                  </div>

                  {/* QUANTITY */}
                  <div className="flex items-center gap-2 mt-3 text-white">
                    <button
                      onClick={() => decreaseQty(item._id)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                    >
                      -
                    </button>

                    <span className="w-8 text-center">{item.qty}</span>

                    <button
                      onClick={() => increaseQty(item._id)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* PRICE + REMOVE */}
                <div className="flex flex-col items-end justify-between">
                  <p className="text-xl font-bold text-green-400">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>

                  <button
                    onClick={() => {
                      removeFromCart(item._id);
                      toast.success("Removed from cart");
                    }}
                    className="text-red-400 text-sm hover:underline mt-4 md:mt-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="bg-slate-900 p-6 rounded-xl self-start sticky top-24">
          <h2 className="text-xl font-bold mb-4">Cart Summary</h2>

          {selectedCartItems?.length === 0 ? (
            <p className="text-sm text-slate-400 mb-4">No items selected.</p>
          ) : (
            <div className="space-y-4 mb-4">
               {/* Quick preview, detailed calculations in payment */}
               <div className="flex justify-between">
                 <span className="text-slate-300">Selected Items ({selectedCartItems?.length || 0})</span>
                 <span className="font-medium">
                   ₹{total.toLocaleString("en-IN")}
                 </span>
               </div>
            </div>
          )}

          <hr className="my-4 border-slate-700" />
          
          <button
            onClick={() => navigate("/payment")}
            disabled={selectedItems?.length === 0}
            className={`w-full py-3 rounded font-bold transition-colors ${
              selectedItems?.length === 0 
              ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
              : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {selectedItems?.length === 0 ? "Select Items to Checkout" : "Proceed to Payment"}
          </button>
          <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Gift Cards and Auto-Discounts apply next
          </p>
        </div>
      </div>
    </div>
  );
}