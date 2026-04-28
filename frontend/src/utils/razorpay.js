import toast from "react-hot-toast";

export const handleRazorpayCheckout = async (
  amount,
  description = "Payment",
  onSuccess = null,
  paymentConfig = null
) => {
  try {
    const loadingToast = toast.loading("Initiating payment...");

    // 🔥 1. Create order
    const res = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    console.log("Create Order Response:", data); // Debugging raw payload
    toast.dismiss(loadingToast);

    if (!res.ok) {
      throw new Error(data.error || "Failed to create order");
    }

    // Determine the prefill method
    let prefillMethod = undefined;
    if (paymentConfig?.method) {
      if (paymentConfig.method === "Credit Card" || paymentConfig.method === "Debit Card") prefillMethod = "card";
      else if (paymentConfig.method === "UPI") prefillMethod = "upi";
      else if (paymentConfig.method === "Net Banking") prefillMethod = "netbanking";
      else if (paymentConfig.method === "Wallet") prefillMethod = "wallet";
    }

    // 🔥 2. Razorpay options
    const options = {
      key: data.key || "rzp_test_xxxxx", // fallback
      amount: data.order?.amount || data.amount,
      currency: "INR",
      name: "ReviewLens",
      description,
      order_id: data.order?.id || data.razorpayOrderId,

      handler: async function (response) {
        toast.loading("Verifying payment...", { id: "verify" });

        try {
          const verifyRes = await fetch(
            "http://localhost:5000/api/payment/verify",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                giftCardId: paymentConfig?.giftCardId || undefined
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            toast.success("Payment successful 🎉", { id: "verify" });

            if (onSuccess) onSuccess();
          } else {
            toast.error(
              verifyData.error || "Payment verification failed",
              { id: "verify" }
            );
          }
        } catch {
          toast.error("Verification error", { id: "verify" });
        }
      },

      prefill: {
        name: "User",
        email: "user@example.com",
        method: prefillMethod,
      },

      theme: {
        color: "#7c3aed",
      },
    };

    // ❗ safety check
    if (!window.Razorpay) {
      toast.error("Razorpay not loaded");
      return;
    }

    const razor = new window.Razorpay(options);

    razor.on("payment.failed", function (response) {
      toast.error(response.error.description || "Payment failed");
    });

    razor.open();
  } catch (error) {
    console.error("Checkout Error:", error);
    toast.error(error.message || "Payment failed");
  }
};