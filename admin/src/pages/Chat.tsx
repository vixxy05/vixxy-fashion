
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Users, ArrowRightCircle, Search, Download, Archive, Tag, Trash2, CheckCircle, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { API_BASE, SOCKET_URL } from '../config/env';

interface Conversation {
  id: number;
  userId: number;
  title: string;
  conversationType: string;
  status: string;
  summary?: string;
  lastMessageAt?: string;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
  messages?: any[];
  tags?: any[];
}

interface Message {
  id: number;
  conversationId: number;
  senderType: string;
  senderId?: number;
  messageContent: string;
  messageType: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: any;
}

const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [customerTyping, setCustomerTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, customerTyping]);

  useEffect(() => {
    // Initialize Socket.IO
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(newSocket);

    // Emit staff connect (using user id 2 for demo)
    newSocket.emit('staff-connect', { userId: 2 });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchAllTags();
  }, [activeTab]);

  const fetchConversations = async (search?: string, tag?: string) => {
    try {
      const params = new URLSearchParams();
      if (activeTab === 'history') {
        params.set('status', 'CLOSED');
      } else {
        params.set('status', 'ACTIVE');
      }
      
      const url = `${API_BASE}/chat/history${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let filtered = data.conversations;
        
        if (search) {
          filtered = filtered.filter((c: Conversation) => 
            c.title.toLowerCase().includes(search.toLowerCase()) || 
            (c.summary && c.summary.toLowerCase().includes(search.toLowerCase()))
          );
        }
        
        if (tag) {
          // Filter by tag (dummy logic for now)
        }
        
        setConversations(filtered);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchAllTags = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/tags`);
      const data = await res.json();
      if (data.success) {
        setAllTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const res = await fetch(`${API_BASE}/chat/messages/${conversationId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.rows);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation.id,
      message: inputText,
    };

    // Send via REST API
    try {
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      const data = await res.json();
      if (data.success) {
        setInputText('');
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const closeConversation = async (conversation: Conversation) => {
    try {
      await fetch(`${API_BASE}/chat/conversations/${conversation.id}/close`, { method: 'POST' });
      await fetchConversations();
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  const archiveConversation = async (conversation: Conversation) => {
    try {
      await fetch(`${API_BASE}/chat/conversations/${conversation.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Archived by staff' }),
      });
      await fetchConversations();
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const generateSummary = async (conversation: Conversation) => {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${conversation.id}/summary`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Summary generated successfully!');
        fetchConversations();
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  const exportConversation = async (conversation: Conversation, format: string = 'json') => {
    try {
      const url = `${API_BASE}/chat/conversations/${conversation.id}/export?format=${format}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting conversation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'AI_CHAT':
        return 'AI Chat';
      case 'LIVE_CHAT':
        return 'Live Chat';
      case 'ORDER_SUPPORT':
        return 'Hỗ trợ đơn hàng';
      case 'PRODUCT_SUPPORT':
        return 'Hỗ trợ sản phẩm';
      case 'CUSTOMER_SERVICE':
        return 'CSKH';
      default:
        return type;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Conversation List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5" />
            Lịch sử hội thoại
          </h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'live' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lịch sử
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                fetchConversations(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
              }`}
              onClick={() => selectConversation(conversation)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 text-sm">
                    {conversation.user?.fullName || conversation.title}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(conversation.status)}`}>
                  {conversation.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{getTypeLabel(conversation.conversationType)}</p>
              {conversation.summary && (
                <p className="text-xs text-gray-600 line-clamp-2">{conversation.summary}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {conversation.lastMessageAt
                    ? new Date(conversation.lastMessageAt).toLocaleString('vi-VN')
                    : new Date(conversation.createdAt).toLocaleString('vi-VN')}
                </span>
                {conversation.tags && conversation.tags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {conversation.tags.length}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat/Detail Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {selectedConversation.user?.fullName?.[0] || 'K'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.user?.fullName || selectedConversation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedConversation.status)}`}>
                      {selectedConversation.status}
                    </span>
                    <span className="text-xs text-gray-500">{getTypeLabel(selectedConversation.conversationType)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedConversation.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => generateSummary(selectedConversation)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Tóm tắt hội thoại"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => closeConversation(selectedConversation)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Đóng hội thoại"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => archiveConversation(selectedConversation)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Lưu trữ"
                >
                  <Archive className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Xuất file">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-50">
                    <button onClick={() => exportConversation(selectedConversation, 'json')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">JSON</button>
                    <button onClick={() => exportConversation(selectedConversation, 'csv')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">CSV</button>
                    <button onClick={() => exportConversation(selectedConversation, 'txt')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">TXT</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.senderType === 'STAFF' || msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.senderType === 'STAFF' || msg.senderType === 'ADMIN'
                        ? 'bg-purple-600 text-white rounded-tr-sm'
                        : msg.senderType === 'SYSTEM'
                        ? 'bg-gray-200 text-gray-700 rounded-full text-center w-full max-w-full'
                        : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.messageContent}</p>
                    {msg.senderType !== 'SYSTEM' && (
                      <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {msg.isEdited && <span className="text-[10px]">(đã chỉnh sửa)</span>}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {customerTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input (only if active) */}
            {selectedConversation.status === 'ACTIVE' && (
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-2">
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
                    className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Chọn một hội thoại</p>
              <p className="text-sm mt-2">Chọn từ danh sách bên trái để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
