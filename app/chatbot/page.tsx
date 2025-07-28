'use client';

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SERVICE_URLS } from "../../utils/services";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date, serverTime?: string}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default questions for first-time users
  const defaultQuestions = [
    "FPT có bao nhiều kì? và học phí mỗi kì là bao nhiêu?",
    "Những ngành học nào tại FPT University?",
    "Điều kiện tuyển sinh của FPT là gì?",
    "Cơ sở vật chất và môi trường học tập tại FPT như thế nào?",
    "Chính sách học bổng tại FPT University?",
    "Thời gian đào tạo của các ngành học tại FPT là bao lâu?",
    "FPT University có những cơ sở nào?",
    "Cách thức đăng ký tuyển sinh tại FPT như thế nào?",
    "Có những hoạt động ngoại khóa nào tại FPT?",
    "Cơ hội việc làm sau khi tốt nghiệp từ FPT như thế nào?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${SERVICE_URLS.ChatbotService}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        isUser: false,
        timestamp: new Date(),
        serverTime: data.text_time
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, có lỗi kết nối. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleDefaultQuestion = (question: string) => {
    setInputValue(question);
  };

  const refreshChat = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f2] to-[#f8f9fa]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image src="/logo.png" alt="FPT University Logo" width={32} height={32} className="mr-3" />
                <span className="text-xl font-bold text-[#ff6b35]">FPT.AI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={refreshChat}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
              <Link 
                href="/"
                className="flex items-center px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Sidebar - Default Questions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 h-full overflow-y-auto">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Câu hỏi thường gặp</h2>
              </div>
              
              <div className="space-y-2">
                {defaultQuestions.map((question, index) => (
                  <button 
                    key={index}
                    onClick={() => handleDefaultQuestion(question)}
                    className="w-full text-left bg-gradient-to-r from-[#fff5f2] to-white border border-gray-200 rounded-lg p-3 hover:shadow-lg hover:border-[#ff6b35] transition-all duration-300 group"
                  >
                    <div className="flex items-start">
                      <div className="w-5 h-5 bg-[#ff6b35] bg-opacity-10 rounded-full flex items-center justify-center mr-2 group-hover:bg-[#ff6b35] transition-colors flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-[#ff6b35] group-hover:text-white">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed">
                        {question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col overflow-hidden">
              
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white p-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                      <Image src="/logo.png" alt="FPT.AI" width={24} height={24} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">FPT.AI Assistant</h1>
                      <p className="text-orange-100 text-sm">Trợ lý tư vấn tuyển sinh thông minh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-100 text-xs">Trực tuyến 24/7</div>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs">Sẵn sàng hỗ trợ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center mb-4">
                      <Image src="/logo.png" alt="FPT.AI" width={40} height={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Chào mừng bạn đến với FPT.AI!
                    </h3>
                    <p className="text-base text-gray-600 mb-4 max-w-md">
                      Tôi là trợ lý AI chuyên tư vấn tuyển sinh của FPT University. 
                      Hãy chọn một câu hỏi bên trái hoặc gõ câu hỏi của bạn phía dưới.
                    </p>
                    <div className="flex items-center text-[#ff6b35] font-semibold text-sm">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Bắt đầu cuộc trò chuyện ngay!
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Messages */}
                    {messages.map((message) => (
                      <div key={message.id} className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start max-w-2xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`flex-shrink-0 ${message.isUser ? 'ml-3' : 'mr-3'}`}>
                            {message.isUser ? (
                              <div className="w-8 h-8 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-bold">U</span>
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
                                <Image src="/logo.png" alt="FPT.AI" width={20} height={20} className="object-cover" />
                              </div>
                            )}
                          </div>
                          
                          {/* Message Content */}
                          <div className={`rounded-xl p-3 shadow-lg ${
                            message.isUser 
                              ? 'bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] text-white' 
                              : 'bg-white border border-gray-100 text-gray-800'
                          }`}>
                            {/* Time at the top */}
                            <div className={`text-xs mb-1 ${message.isUser ? 'text-orange-100' : 'text-gray-500'}`}>
                              {message.isUser 
                                ? message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : message.serverTime 
                                  ? new Date(message.serverTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                  : message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                              }
                            </div>
                            {/* Message text */}
                            <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="mb-4 flex justify-start">
                        <div className="flex items-start">
                          {/* Bot Avatar */}
                          <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-lg mr-3">
                            <Image src="/logo.png" alt="FPT.AI" width={20} height={20} className="object-cover" />
                          </div>
                          
                          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">FPT.AI đang suy nghĩ...</div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                <form onSubmit={handleInputSubmit} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Nhập câu hỏi của bạn hoặc chọn từ danh sách bên trái..."
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent transition-all duration-300 placeholder-gray-400"
                      disabled={isLoading}
                    />
                    {inputValue && (
                      <button
                        type="button"
                        onClick={() => setInputValue('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white px-6 py-3 rounded-lg hover:from-[#ff8c42] hover:to-[#ff6b35] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="font-semibold">Gửi</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
