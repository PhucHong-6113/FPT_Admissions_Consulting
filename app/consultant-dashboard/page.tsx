'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/utils/auth';
import { SERVICE_URLS } from '../../utils/services';

interface Ticket {
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
  chats: any[];
}

export default function ConsultantDashboardPage() {
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchTickets();
  }, [router]);

  const fetchTickets = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Fetch pending tickets
      const pendingResponse = await fetch(`${SERVICE_URLS.RequestTicketService}/api/request-tickets/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // Fetch all tickets
      const allResponse = await fetch(`${SERVICE_URLS.RequestTicketService}/api/request-tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!pendingResponse.ok || !allResponse.ok) {
        throw new Error('Không thể tải danh sách ticket');
      }

      const pendingData = await pendingResponse.json();
      const allData = await allResponse.json();

      setPendingTickets(Array.isArray(pendingData) ? pendingData : []);
      setAllTickets(Array.isArray(allData) ? allData : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setErrorMessage('❌ Có lỗi xảy ra khi tải danh sách ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (ticketId: string) => {
    if (!response.trim()) {
      alert('Vui lòng nhập phản hồi');
      return;
    }

    setIsSubmitting(true);
    try {
      const responseObj = await fetch(`${SERVICE_URLS.RequestTicketService}/api/request-tickets/${ticketId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ response })
      });

      if (!responseObj.ok) {
        throw new Error('Không thể gửi phản hồi');
      }

      alert('✅ Phản hồi đã được gửi thành công!');
      setSelectedTicket(null);
      setResponse('');
      fetchTickets(); // Refresh the lists
    } catch (error) {
      console.error('Error responding to ticket:', error);
      alert('❌ Có lỗi xảy ra khi gửi phản hồi');
    } finally {
      setIsSubmitting(false);
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

  const currentTickets = activeTab === 'pending' ? pendingTickets : allTickets;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Dashboard Tư vấn viên</h1>
              <p className="text-gray-600 mt-1">Quản lý và phản hồi các ticket hỗ trợ từ sinh viên</p>
            </div>
            <Link 
              href="/"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              🏠 Về trang chủ
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{pendingTickets.length}</div>
            <div className="text-gray-600 text-sm">Ticket chờ xử lý</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {allTickets.filter(t => t.statusName.toLowerCase() === 'responded').length}
            </div>
            <div className="text-gray-600 text-sm">Đã phản hồi</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-600">
              {allTickets.filter(t => t.statusName.toLowerCase() === 'closed').length}
            </div>
            <div className="text-gray-600 text-sm">Đã đóng</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{allTickets.length}</div>
            <div className="text-gray-600 text-sm">Tổng số ticket</div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {errorMessage}
            <button 
              onClick={fetchTickets}
              className="ml-4 text-red-800 hover:text-red-900 font-semibold"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'pending'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🔥 Ticket chờ xử lý ({pendingTickets.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Tất cả ticket ({allTickets.length})
              </button>
            </nav>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách ticket...</p>
            </div>
          ) : (
            <>
              {currentTickets.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">
                    {activeTab === 'pending' ? '🎉' : '📝'}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'pending' ? 'Không có ticket chờ xử lý' : 'Chưa có ticket nào'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'pending' 
                      ? 'Tuyệt vời! Bạn đã xử lý hết tất cả ticket chờ phản hồi.'
                      : 'Chưa có ticket nào trong hệ thống.'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ticket
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sinh viên
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Danh mục
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ưu tiên
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentTickets.map((ticket) => (
                        <tr key={ticket.ticketId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {ticket.createdBy}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {ticket.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priorityName)}`}>
                              {ticket.priorityName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.statusName)}`}>
                              {ticket.statusName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Link
                                href={`/ticket-detail/${ticket.ticketId}`}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                              >
                                Xem
                              </Link>
                              {ticket.statusName.toLowerCase() === 'pending' && (
                                <button
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="text-orange-600 hover:text-orange-900 font-medium text-sm"
                                >
                                  Phản hồi
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">💬 Phản hồi Ticket</h3>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setResponse('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ticket Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedTicket.title}</h4>
                <p className="text-gray-700 text-sm mb-3">{selectedTicket.description}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-gray-500">Sinh viên: {selectedTicket.createdBy}</span>
                  <span className={`px-2 py-1 rounded-full ${getPriorityColor(selectedTicket.priorityName)}`}>
                    {selectedTicket.priorityName}
                  </span>
                  <span className="text-gray-500">Danh mục: {selectedTicket.category}</span>
                </div>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phản hồi của bạn *
                  </label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nhập phản hồi chi tiết cho sinh viên..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedTicket(null);
                      setResponse('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleRespond(selectedTicket.ticketId)}
                    disabled={isSubmitting || !response.trim()}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
