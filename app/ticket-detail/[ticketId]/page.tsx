'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/utils/auth';
import { SERVICE_URLS } from '../../../utils/services';

interface Chat {
  chatId: string;
  ticketId: string;
  userId: string;
  message: string;
  messageTypeId: number;
  fileUrl: string | null;
  isInternal: boolean;
  createdAt: string;
}

interface TicketDetail {
  ticketId: string;
  studentId: string;
  counselorId: string | null;
  title: string;
  description: string;
  priorityId: number;
  category: string;
  statusId: number;
  response: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  statusName: string;
  priorityName: string;
  chats: Chat[];
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const ticketId = params.ticketId as string;

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    if (ticketId) {
      fetchTicketDetail(token);
    }
  }, [router, ticketId]);

  const fetchTicketDetail = async (token: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${SERVICE_URLS.RequestTicketService}/api/request-tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải thông tin ticket');
      }

      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      setErrorMessage('❌ Có lỗi xảy ra khi tải thông tin ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priorityName: string) => {
    switch (priorityName.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải ticket</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  const token = localStorage.getItem('access_token');
                  if (token) fetchTicketDetail(token);
                }}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Thử lại
              </button>
              <Link 
                href="/my-tickets"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy ticket</h3>
            <p className="text-gray-600 mb-6">Ticket không tồn tại hoặc bạn không có quyền xem</p>
            <Link 
              href="/my-tickets"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎫 Chi tiết Ticket</h1>
              <p className="text-gray-600 mt-1">ID: {ticket.ticketId}</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/my-tickets"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                ← Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Tiêu đề:</span>
                  <p className="font-medium text-gray-900">{ticket.title}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Danh mục:</span>
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {ticket.category}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Mức độ ưu tiên:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priorityName)}`}>
                    {ticket.priorityName}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Trạng thái:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.statusName)}`}>
                    {ticket.statusName}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thời gian</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Ngày tạo:</span>
                  <p className="font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <span className="text-sm text-gray-500">Ngày phản hồi:</span>
                    <p className="font-medium text-gray-900">{formatDate(ticket.resolvedAt)}</p>
                  </div>
                )}
                {ticket.closedAt && (
                  <div>
                    <span className="text-sm text-gray-500">Ngày đóng:</span>
                    <p className="font-medium text-gray-900">{formatDate(ticket.closedAt)}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Người tạo:</span>
                  <p className="font-medium text-gray-900">{ticket.createdBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Mô tả chi tiết</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        {/* Response */}
        {ticket.response && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Phản hồi từ tư vấn viên</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.response}</p>
              {ticket.resolvedAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Phản hồi lúc: {formatDate(ticket.resolvedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chats */}
        {ticket.chats && ticket.chats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Cuộc trò chuyện</h3>
            <div className="space-y-4">
              {ticket.chats.map((chat) => (
                <div key={chat.chatId} className="border-l-4 border-orange-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {chat.userId}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(chat.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{chat.message}</p>
                  {chat.fileUrl && (
                    <a 
                      href={chat.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-800 text-sm mt-2 inline-block"
                    >
                      📎 Xem file đính kèm
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Response Message */}
        {!ticket.response && ticket.statusName.toLowerCase() === 'pending' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đang chờ phản hồi
              </h3>
              <p className="text-gray-600">
                Ticket của bạn đang được xử lý. Tư vấn viên sẽ phản hồi trong thời gian sớm nhất.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
