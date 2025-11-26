import React, { useState, useRef, useEffect, useContext } from "react";
import {
  SendOutlined,
  UserOutlined,
  LoadingOutlined,
  CloseOutlined,
  StarFilled,
  ShoppingCartOutlined, // Icon giỏ hàng
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-toastify";
import PizzaHutLogo from "../assets/PizzaHut.jpg"; // Đảm bảo đường dẫn ảnh này đúng với project của bạn

// --- SỬA ĐƯỜNG DẪN IMPORT CHO ĐÚNG CẤU TRÚC FILE CỦA BẠN ---
import { AuthContext } from "./context/auth.context";
import { apiAddCart, getCart } from "../services/api.service";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // State mới để theo dõi sản phẩm nào đang được thêm vào giỏ (loading riêng lẻ)
  const [addingToCartId, setAddingToCartId] = useState(null);

  const messagesEndRef = useRef(null);

  // --- Lấy user và hàm cập nhật giỏ hàng từ Context ---
  const { user, setCart } = useContext(AuthContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // --- Hàm xử lý thêm vào giỏ hàng ---
  const handleAddToCart = async (product) => {
    // 1. Kiểm tra đăng nhập
    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      return;
    }

    // Bắt đầu loading cho sản phẩm này
    setAddingToCartId(product.id);

    try {
      // 2. Gọi API thêm vào giỏ (product.id trong response chatbot chính là variant id)
      // Số lượng mặc định là 1
      await apiAddCart(product.id, 1);

      // 3. Cập nhật lại giỏ hàng toàn cục (Context)
      const res = await getCart();
      if (res.data) {
        setCart({
          id: res.data.cart.id,
          user_id: res.data.cart.user_id,
          totalItems: res.data.items.length,
          totalPrice: res.data.total,
          items: res.data.items,
        });
      }

      toast.success(`Đã thêm "${product.product_name}" vào giỏ!`);
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    } finally {
      // Kết thúc loading dù thành công hay thất bại
      setAddingToCartId(null);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      const loginMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          "Bạn cần đăng nhập để sử dụng tính năng chat. Vui lòng đăng nhập và thử lại! 🔐",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: false,
      };
      setMessages((prev) => [...prev, loginMessage]);
      setInputValue("");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3636/documents/vector/process-query",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            query: inputValue,
            thread_id: threadId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.thread_id) {
        setThreadId(data.thread_id);
      }

      let botMessage = {
        id: Date.now() + 1,
        type: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        data: data,
      };

      if (data.status === "success" && data.data) {
        const searchType = data.data.search_type;

        if (searchType === "database" && data.data.product_variants) {
          botMessage.content = data.data.natural_response;
          botMessage.products = data.data.product_variants;
          botMessage.searchType = "database";
        } else if (searchType === "rag" && data.data.answer) {
          botMessage.content = data.data.answer;
          botMessage.searchType = "rag";
        } else if (searchType === "direct" && data.data.message) {
          botMessage.content = data.data.message;
          botMessage.searchType = "direct";
        } else {
          botMessage.content = "Xin lỗi, tôi không hiểu được câu trả lời.";
        }
      } else {
        botMessage.content = data.error || "Xin lỗi, đã có lỗi xảy ra.";
        botMessage.isError = true;
      }

      setMessages((prev) => [...prev, botMessage]);

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } },
  };

  const fabVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <style>{`
        .markdown-content {
          line-height: 1.7;
        }
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          color: #1f2937;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .markdown-content h1 { font-size: 1.5em; }
        .markdown-content h2 { font-size: 1.3em; }
        .markdown-content h3 { font-size: 1.1em; }
        .markdown-content p {
          margin: 0.75em 0;
          color: #374151;
        }
        .markdown-content ul,
        .markdown-content ol {
          margin: 0.75em 0;
          padding-left: 1.5em;
          color: #374151;
        }
        .markdown-content li {
          margin: 0.25em 0;
        }
        .markdown-content a {
          color: #c8102e;
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: #a00d25;
        }
        .markdown-content strong {
          color: #111827;
          font-weight: 600;
        }
        .markdown-content code {
          background-color: #fef2f2;
          color: #c8102e;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }
        .markdown-content pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .markdown-content pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        .markdown-content blockquote {
          border-left: 4px solid #c8102e;
          background-color: #fef2f2;
          padding: 0.75em 1em;
          margin: 1em 0;
          color: #374151;
        }
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .markdown-content th,
        .markdown-content td {
          border: 1px solid #e5e7eb;
          padding: 0.5em;
          text-align: left;
        }
        .markdown-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>

      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key="fab"
            variants={fabVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 bg-white rounded-full shadow-2xl hover:shadow-red-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center overflow-hidden border-2 border-red-600"
          >
            <img
              src={PizzaHutLogo}
              alt="Pizza Hut"
              className="w-full h-full object-cover"
            />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900 shadow-lg"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="chat"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-[420px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header with Glassmorphism */}
            <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-6 py-5 overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-10 backdrop-blur-sm" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full transform -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-y-1/2 -translate-x-1/2" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      <img
                        src={PizzaHutLogo}
                        alt="Pizza Hut"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      AI Assistant
                      <StarFilled className="text-sm" />
                    </h3>
                    <p className="text-sm opacity-90">
                      Luôn sẵn sàng hỗ trợ bạn
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:rotate-90"
                >
                  <CloseOutlined className="text-white text-lg" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                    <img
                      src={PizzaHutLogo}
                      alt="Pizza Hut"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    Xin chào! 👋
                  </h4>
                  <p className="text-gray-500 max-w-xs">
                    Tôi là trợ lý AI của bạn. Hãy đặt câu hỏi và tôi sẽ giúp
                    bạn!
                  </p>
                </motion.div>
              )}

              <div className="space-y-6">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                      className={`flex gap-3 ${
                        msg.type === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${
                          msg.type === "user"
                            ? "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-500"
                            : "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-red-500"
                        }`}
                      >
                        {msg.type === "user" ? (
                          <UserOutlined className="text-red-600 text-lg" />
                        ) : (
                          <img
                            src={PizzaHutLogo}
                            alt="Pizza Hut"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div
                        className={`flex flex-col ${
                          msg.type === "user" ? "items-end" : "items-start"
                        } max-w-[85%]`}
                      >
                        <div
                          className={`rounded-2xl px-5 py-3 shadow-md ${
                            msg.type === "user"
                              ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-tr-none"
                              : msg.isError
                              ? "bg-red-50 border-2 border-red-200 text-red-700 rounded-tl-none"
                              : "bg-white border-2 border-gray-100 text-gray-800 rounded-tl-none"
                          }`}
                        >
                          {msg.type === "bot" && !msg.isError ? (
                            <div className="markdown-content text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}

                          {msg.products && msg.products.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {msg.products.map((product) => (
                                <motion.div
                                  key={product.id}
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all"
                                >
                                  <div className="flex gap-3">
                                    {product.product_image_url && (
                                      <img
                                        src={`http://localhost:8000/images/${product.product_image_url}`}
                                        alt={product.product_name}
                                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                                      />
                                    )}
                                    <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                        <h5 className="font-bold text-gray-800 mb-1 text-sm line-clamp-1">
                                          {product.product_name}
                                        </h5>
                                        <p className="text-xs text-gray-600 mb-1">
                                          {product.size_name} •{" "}
                                          {product.crust_name}
                                        </p>
                                      </div>

                                      <div className="flex flex-col gap-2 mt-2">
                                        <span className="font-bold text-red-600 text-sm">
                                          {product.price.toLocaleString(
                                            "vi-VN"
                                          )}
                                          ₫
                                        </span>
                                        
                                        {/* Nút thêm vào giỏ hàng với hiệu ứng loading riêng lẻ */}
                                        <button
                                          onClick={() =>
                                            handleAddToCart(product)
                                          }
                                          disabled={addingToCartId === product.id} // Disable khi đang load
                                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm w-full ${
                                            addingToCartId === product.id 
                                              ? "bg-red-400 cursor-not-allowed text-white" 
                                              : "bg-red-600 hover:bg-red-700 active:scale-95 text-white"
                                          }`}
                                        >
                                          {addingToCartId === product.id ? (
                                            <LoadingOutlined />
                                          ) : (
                                            <ShoppingCartOutlined />
                                          )} 
                                          {addingToCartId === product.id ? " Đang thêm..." : " Thêm vào giỏ"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 px-1">
                          <span className="text-xs text-gray-400">
                            {msg.timestamp}
                          </span>
                          {msg.searchType && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                msg.searchType === "database"
                                  ? "bg-red-100 text-red-700"
                                  : msg.searchType === "rag"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {msg.searchType === "database"
                                ? "🛍️ Sản phẩm"
                                : msg.searchType === "rag"
                                ? "📚 Thông tin"
                                : "💬 Trò chuyện"}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-red-500">
                      <img
                        src={PizzaHutLogo}
                        alt="Pizza Hut"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <LoadingOutlined className="text-red-600 text-xl" />
                        <span className="text-sm text-gray-600 font-medium">
                          Đang suy nghĩ...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-gray-100 bg-white px-5 py-4">
              <div className="flex gap-3 items-end">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn của bạn..."
                  disabled={loading}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                  style={{ maxHeight: "120px" }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingOutlined className="text-white text-xl" />
                  ) : (
                    <SendOutlined className="text-white text-xl" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;