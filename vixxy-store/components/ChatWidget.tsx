"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
}

const quickReplies = [
  "Tư vấn sản phẩm",
  "Hướng dẫn chọn size",
  "Chính sách đổi hàng",
  "Phí & thời gian vận chuyển",
  "Thanh toán",
];

const botResponses = (text: string) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes("size") || lowerText.includes("kích cỡ")) {
    return "Về size: bạn cho mình chiều cao/cân nặng + số đo (ngực/eo/mông) hoặc size thường mặc (XS–L) để mình gợi ý nhanh nhé! Chúng tôi có bảng size chi tiết trên mỗi trang sản phẩm.";
  }
  if (lowerText.includes("đổi") || lowerText.includes("trả") || lowerText.includes("hoàn")) {
    return "Đổi hàng: trong 30 ngày, sản phẩm còn tag và chưa qua sử dụng. Bạn gửi mã đơn + lý do đổi để mình hỗ trợ. Đổi hàng miễn phí 1 lần/đơn!";
  }
  if (lowerText.includes("vận chuyển") || lowerText.includes("ship") || lowerText.includes("giao")) {
    return "Vận chuyển: nội thành TP.HCM/HN 1–2 ngày, tỉnh 2–4 ngày (tuỳ khu vực). Phí ship từ 15k–35k, miễn ship cho đơn từ 500k!";
  }
  if (lowerText.includes("thanh toán") || lowerText.includes("payment") || lowerText.includes("chuyển khoản")) {
    return "Thanh toán: COD, chuyển khoản, Visa/Master/JCB, MoMo, ZaloPay. Bạn muốn dùng phương thức nào để mình hướng dẫn từng bước?";
  }
  if (lowerText.includes("giá") || lowerText.includes("khuyến mãi") || lowerText.includes("sale")) {
    return "Hiện tại chúng tôi đang có chương trình khuyến mãi lên đến 30% cho bộ sưu tập Mùa Đông! Bạn xem thêm tại trang Ưu đãi nhé!";
  }
  if (lowerText.includes("chào") || lowerText.includes("hello") || lowerText.includes("hi")) {
    return "Xin chào! Rất vui được gặp bạn. Tôi là trợ lý AI của VIXXY D'ORANCE. Bạn cần hỗ trợ gì về sản phẩm, đơn hàng hay chính sách của chúng tôi?";
  }

  return "Cảm ơn bạn đã liên hệ! Tôi đã ghi nhận tin nhắn của bạn. Nếu bạn cần hỗ trợ cụ thể hơn, hãy hỏi về sản phẩm, size, vận chuyển hoặc thanh toán nhé!";
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là VIXXY Support — tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1000));

    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponses(text),
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
                  V
                </div>
                <div>
                  <p className="font-semibold">VIXXY Support</p>
                  <p className="text-xs text-white/80">Trực tuyến</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-sm"
                        : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Replies */}
              <div className="flex flex-wrap gap-2 mt-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-50 transition"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(inputText);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}
