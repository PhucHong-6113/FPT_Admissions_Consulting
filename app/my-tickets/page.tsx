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

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [testResult, setTestResult] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('[DEBUG] Component mounted, checking authentication...');
    console.log('[DEBUG] SERVICE_URLS:', SERVICE_URLS);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      console.log('[DEBUG] User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    console.log('[DEBUG] User authenticated, fetching tickets...');
    fetchMyTickets(token);
  }, [router]);

  const fetchMyTickets = async (token: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      console.log('[DEBUG] Fetching tickets from:', `${SERVICE_URLS.RequestTicketService}/api/request-tickets/my-tickets`);
      console.log('[DEBUG] Access token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${SERVICE_URLS.RequestTicketService}/api/request-tickets/my-tickets`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Không thể tải danh sách ticket'}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Response data:', data);
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`❌ Có lỗi xảy ra khi tải danh sách ticket: ${errorMessage}`);
      setTickets([]);
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

  // Test backend connectivity
  const testBackendConnection = async () => {
    setTestResult('Testing connection...');
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const tests = [
      { name: 'Base URL', url: `${SERVICE_URLS.RequestTicketService}`, needsAuth: false },
      { name: 'Health Check', url: `${SERVICE_URLS.RequestTicketService}/health`, needsAuth: false },
      { name: 'My Tickets', url: `${SERVICE_URLS.RequestTicketService}/api/request-tickets/my-tickets`, needsAuth: true },
      { name: 'All Tickets', url: `${SERVICE_URLS.RequestTicketService}/api/request-tickets`, needsAuth: true }
    ];

    let results = [];
    for (const test of tests) {
      try {
        console.log(`Testing ${test.name}: ${test.url}`);
        const headers: any = {
          'accept': 'application/json'
        };
        
        if (test.needsAuth && token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(test.url, {
          method: 'GET',
          headers
        });
        results.push(`${test.name}: ${response.status} ${response.statusText}`);
        console.log(`${test.name} - Status: ${response.status}`);
      } catch (error) {
        results.push(`${test.name}: Connection failed - ${error}`);
        console.error(`${test.name} failed:`, error);
      }
    }
    setTestResult(results.join('\n'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 Ticket của tôi</h1>
              <p className="text-gray-600 mt-1">Quản lý và theo dõi các ticket hỗ trợ của bạn</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={testBackendConnection}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-semibold text-sm"
              >
                🔧 Test API
              </button>
              <Link 
                href="/request-tickets"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                ➕ Tạo ticket mới
              </Link>
              <Link 
                href="/"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                🏠 Về trang chủ
              </Link>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">API Test Results:</h3>
            <pre className="text-sm text-blue-800 whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {errorMessage}
            <button 
              onClick={() => {
                const token = localStorage.getItem('access_token');
                if (token) fetchMyTickets(token);
              }}
              className="ml-4 text-red-800 hover:text-red-900 font-semibold"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách ticket...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">{tickets.length}</div>
                <div className="text-gray-600 text-sm">Tổng ticket</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.statusName.toLowerCase() === 'pending').length}
                </div>
                <div className="text-gray-600 text-sm">Đang chờ</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.statusName.toLowerCase() === 'responded').length}
                </div>
                <div className="text-gray-600 text-sm">Đã phản hồi</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-gray-600">
                  {tickets.filter(t => t.statusName.toLowerCase() === 'closed').length}
                </div>
                <div className="text-gray-600 text-sm">Đã đóng</div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {tickets.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có ticket nào
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Bạn chưa tạo ticket hỗ trợ nào. Hãy tạo ticket đầu tiên của bạn!
                  </p>
                  <Link 
                    href="/request-tickets"
                    className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                  >
                    Tạo ticket đầu tiên
                  </Link>
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
                      {tickets.map((ticket) => (
                        <tr key={ticket.ticketId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description}
                            </div>
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
                            <Link
                              href={`/ticket-detail/${ticket.ticketId}`}
                              className="text-orange-600 hover:text-orange-900 font-medium text-sm"
                            >
                              Xem chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
