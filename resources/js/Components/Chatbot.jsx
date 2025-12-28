import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../../css/Chatbot.css";

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children, isOpen: propIsOpen, setIsOpen: propSetIsOpen }) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì được cho bạn." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const faqs = [
    "Có những loại phòng nào trong hệ thống?",
    "Giá phòng bao nhiêu?",
    "Có ưu đãi nào đang áp dụng không?",
    "Làm thế nào để đặt phòng?",
  ];

  useEffect(() => {
    setIsOpen(propIsOpen);
  }, [propIsOpen]);

  const toggleChatbot = () => {
    propSetIsOpen((prev) => !prev);
  };

  const handleInputChange = (e) => setUserInput(e.target.value);

  const handleSendMessage = async (e, faqText = null) => {
    e.preventDefault();
    const inputText = faqText || userInput;
    if (!inputText.trim()) return;

    const userMsg = { sender: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/chatbot", { prompt: inputText });
      console.log("Backend response:", response.data);
      const botMsg = { sender: "bot", text: response.data.response || "Xin lỗi, không nhận được phản hồi từ hệ thống." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.response || err.response?.data?.error || "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu.";
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMessage },
      ]);
    } finally {
      setUserInput("");
      setIsLoading(false);
    }
  };

  const handleFaqClick = (faqText) => (e) => {
    handleSendMessage(e, faqText);
  };

  const parseMessageText = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const [fullMatch, linkText, url] = match;
      const startIndex = match.index;

      if (startIndex > lastIndex) {
        parts.push(text.slice(lastIndex, startIndex));
      }

      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);
      if (isImage) {
        // const fullUrl = url.startsWith('/') ? `/storage${url}` : `/storage/${url}`;
        // parts.push(
        //   <div key={startIndex} className="chatbot-image">
        //     <img src={fullUrl} alt={linkText} style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} onError={(e) => console.log("Image load error:", e)} />
        //   </div>
        const fullUrl = url.startsWith('http') ? url : (url.startsWith('/') ? `/storage${url}` : `/storage/${url}`);
        parts.push(
            <div key={startIndex} className="chatbot-image">
                <img src={fullUrl} alt={linkText} style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} onError={(e) => console.log("Image load error:", e)} />
            </div>
        );
      } else {
        parts.push(
          <a
            key={startIndex}
            href={url}
            className="chatbot-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = url;
              propSetIsOpen(false);
            }}
          >
            {linkText}
          </a>
        );
      }

      lastIndex = startIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  useEffect(() => {
    const chatBody = document.querySelector(".chatbot-body");
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [messages]);

  return (
    <ChatbotContext.Provider value={{ toggleChatbot }}>
      {children}
      <div className="chatbot-container">
        <div className={`chatbot ${isOpen ? "open" : ""}`}>
          <div className="chatbot-header" onClick={toggleChatbot}>
            <h5>Trợ lý MoonBay Hotel</h5>
            <span>{isOpen ? "−" : "+"}</span>
          </div>
          {isOpen && (
            <>
              <div className="chatbot-body">
                {messages.length === 1 && (
                  <div className="chatbot-message bot faq-message">
                    <div className="faq-container">
                      <p>Câu hỏi thường gặp:</p>
                      {faqs.map((faq, idx) => (
                        <button
                          key={idx}
                          className="faq-button"
                          onClick={handleFaqClick(faq)}
                          disabled={isLoading}
                        >
                          {faq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chatbot-message ${msg.sender}`}>
                    <p style={{ whiteSpace: "pre-line" }}>
                      {parseMessageText(msg.text)}
                    </p>
                  </div>
                ))}
                {isLoading && (
                  <div className="chatbot-message bot">
                    <p>Đang xử lý câu hỏi của bạn <span className="typing-dots">...</span></p>
                  </div>
                )}
              </div>
              <form className="chatbot-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Hỏi về phòng, giá, sức chứa... hoặc bất kỳ câu hỏi nào!"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                  Gửi
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
};