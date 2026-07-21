"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { subscribeChatUpdates, sendMessage, LiveChatMessage } from "@/lib/chat";
import { getBotReply } from "@/lib/chatbot";

const quickReplies = [
  "Tư vấn chọn size",
  "Chính sách đổi trả 30 ngày",
  "Thời gian vận chuyển",
  "Hướng dẫn thanh toán chuyển khoản",
];

export function ChatWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeEmail = user?.email || "user@vixxy.com";
  const activeName = user?.fullName || user?.username || "Khách hàng";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Chỉ hiển thị hội thoại của chính khách hàng đang đăng nhập.
    return subscribeChatUpdates((all) => {
      setMessages(all.filter((m) => m.userEmail === activeEmail));
    });
  }, [mounted, activeEmail]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Hide widget on admin dashboard pages to prevent overlap with Admin CSKH interface
  if (!mounted || pathname?.startsWith("/admin")) return null;

  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    sendMessage({
      userEmail: activeEmail,
      userName: activeName,
      sender: "user",
      text: trimmed,
    });
    setInputText("");

    // Trợ lý ảo trả lời tự động sau ~0.8s. Admin vẫn có thể nhắn tay đè lên sau đó.
    const reply = getBotReply(trimmed);
    setTimeout(() => {
      sendMessage({
        userEmail: activeEmail,
        userName: activeName,
        sender: "bot",
        text: reply,
      });
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[380px] h-[560px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-neutral-200 font-sans"
          >
            {/* Header */}
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                  👑
                </div>
                <div>
                  <p className="font-bold text-sm tracking-wide">VIXXY CSKH Trực tuyến</p>
                  <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                    Admin CSKH đang sẵn sàng hỗ trợ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white transition p-1"
              >
                ✕
              </button>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/70 text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                const isBot = msg.sender === "bot";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    {!isUser && (
                      <span className="text-[10px] font-bold mb-1 flex items-center gap-1 text-neutral-600">
                        {isBot ? "🤖 Trợ lý ảo VIXXY" : "👑 CSKH Vixxy (Admin)"}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                        isUser
                          ? "bg-neutral-950 text-white rounded-tr-none shadow-sm"
                          : isBot
                          ? "bg-white text-neutral-900 rounded-tl-none shadow-xs border border-neutral-200"
                          : "bg-indigo-600 text-white rounded-tl-none shadow-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <p
                        className={`text-[9px] mt-1 text-right font-normal ${
                          isBot ? "text-neutral-400" : "text-white/70"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* End of messages */}

              {/* Quick Replies */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage(reply);
                    }}
                    className="text-[11px] bg-white border border-neutral-300 text-neutral-800 px-3 py-1.5 rounded-full hover:border-black hover:bg-neutral-100 transition shadow-2xs font-medium cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-neutral-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 border border-neutral-300 rounded-full px-4 py-2 text-xs text-neutral-900 outline-none focus:border-black font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  Gửi
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-neutral-800 transition-all border border-neutral-700 relative"
      >
        {isOpen ? (
          <span className="font-bold text-lg">✕</span>
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          </>
        )}
      </motion.button>
    </div>
  );
}
