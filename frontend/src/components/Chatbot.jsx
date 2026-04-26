import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import useSettingsStore from "../store/useSettingsStore";
import { translations } from "../utils/translations";

export default function Chatbot() {
  const { language } = useSettingsStore();
  const t = translations[language] || translations["en"];
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: t.chatGreeting }
  ]);
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Handle Intent Detection
  const handleBotResponse = (userText) => {
    const text = userText.toLowerCase();
    let reply = "I'm still learning! You can ask me about products, tracking your order, or the best deals right now.";

    if (text.includes("phone") || text.includes("mobile")) {
      reply = "We have amazing deals on the latest smartphones! Check out the Electronics category or search for 'iPhone' or 'Samsung'.";
    } else if (text.includes("laptop") || text.includes("computer")) {
      reply = "Looking for a laptop? We have great choices for gaming and productivity right now.";
    } else if (text.includes("order") || text.includes("track")) {
      reply = "To track an order, go to your Profile dashboard. Your latest order #1092 is currently 'Out for Delivery'!";
    } else if (text.includes("cheap") || text.includes("discount")) {
      reply = "You can apply Auto-Discounts automatically in our checkout flow, or check our Homepage for massive drops!";
    } else if (text.includes("hi") || text.includes("hello")) {
      reply = "Hello there! What can I help you find today?";
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 800);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    handleBotResponse(input);
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        } bg-[#FF6B00] hover:bg-[#e65a00] text-white`}
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 sm:w-96 shadow-2xl rounded-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right overflow-hidden border ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        } dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-200`}
        style={{ height: "450px", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#FF6B00] text-white">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <h3 className="font-bold text-lg">AI Assistant</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:scale-110 active:scale-95 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar dark:bg-slate-900 bg-slate-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "user" ? "bg-blue-500 text-white" : "bg-slate-700 text-[#FF6B00]"
                }`}
              >
                {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "dark:bg-slate-800 bg-white dark:text-slate-100 text-slate-800 border dark:border-slate-700 border-slate-200 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t dark:border-slate-700 border-slate-200 dark:bg-slate-900 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 px-4 py-2 rounded-full text-sm outline-none border focus:border-[#FF6B00] dark:bg-slate-800 bg-slate-100 dark:text-white text-black dark:border-slate-700 border-slate-300"
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-[#FF6B00] text-white hover:bg-[#e65a00] transition-colors shrink-0 disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
