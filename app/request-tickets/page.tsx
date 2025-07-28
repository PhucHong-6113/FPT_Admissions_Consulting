'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/utils/auth';
import { SERVICE_URLS } from '../../utils/services';

interface TicketData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'General' | 'Technical' | 'Billing' | 'Academic';
}

export default function RequestTicketPage() {
  const [ticketData, setTicketData] = useState<TicketData>({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'General'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ticketList, setTicketList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const router = useRouter();

  useEffect(() => {
  if (typeof window !== 'undefined') {
    let sid = localStorage.getItem('student_id');
    let uid = localStorage.getItem('user_id');

    // fallback từ user_profile nếu thiếu
    if (!sid || !uid) {
      const profileRaw = localStorage.getItem('user_profile');
      if (profileRaw) {
        try {
          const parsed = JSON.parse(profileRaw);
          sid = parsed.userId;
          uid = parsed.email;
          if (sid) localStorage.setItem('student_id', sid);
          if (uid) localStorage.setItem('user_id', uid);
        } catch (err) {
          console.warn('Failed to parse user_profile');
        }
      }
    }

    setStudentId(sid);
    setCreatedBy(uid);
    console.log('[DEBUG] student_id:', sid);
    console.log('[DEBUG] user_id:', uid);
  }
}, []);

  // Fetch ticket list for current user
  useEffect(() => {
    if (studentId) {
      const fetchTickets = async () => {
        setIsLoadingList(true);
        try {
          const res = await fetch(
            `${SERVICE_URLS.RequestTicketService}/request-tickets?studentId=${studentId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            }
          );
          if (!res.ok) throw new Error('Không thể lấy danh sách ticket');
          const data = await res.json();
          setTicketList(Array.isArray(data) ? data : (data.tickets || []));
        } catch (err) {
          setTicketList([]);
        } finally {
          setIsLoadingList(false);
        }
      };
      fetchTickets();
    }
  }, [studentId]);


  const mapPriorityToId = (priority: TicketData['priority']): number => {
    switch (priority) {
      case 'Low': return 1;
      case 'Medium': return 2;
      case 'High': return 3;
      case 'Urgent': return 4;
      default: return 2;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!studentId || !createdBy) {
      setErrorMessage('⚠️ Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    const payload = {
      studentId,
      title: ticketData.title,
      description: ticketData.description,
      priorityId: mapPriorityToId(ticketData.priority),
      category: ticketData.category,
      createdBy
    };

    console.log('[DEBUG] Payload gửi đi:', payload);

    setIsLoading(true);
    try {
      const response = await fetch(`${SERVICE_URLS.RequestTicketService}/request-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lỗi khi gửi:', errorText);
        throw new Error('Failed to submit ticket');
      }

      alert('🎉 Ticket đã được gửi thành công!');
      
      // Option to view tickets or go home
      if (confirm('Bạn có muốn xem danh sách ticket của mình không?')) {
        router.push('/my-tickets');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('❌ Có lỗi xảy ra khi gửi ticket. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header with Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">📩 Gửi Ticket Hỗ Trợ</h2>
              <p className="text-gray-600 mt-1">Tạo ticket hỗ trợ mới để được tư vấn viên giải đáp</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/my-tickets"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm"
              >
                📋 Ticket của tôi
              </Link>
              <Link 
                href="/"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold text-sm"
              >
                🏠 Về trang chủ
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Hiển thị lỗi nếu có */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
              <input
                type="text"
                required
                value={ticketData.title}
                onChange={(e) => setTicketData({...ticketData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập tiêu đề ticket"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết *</label>
              <textarea
                required
                rows={5}
                value={ticketData.description}
                onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Mô tả chi tiết vấn đề của bạn"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
                <select
                  value={ticketData.priority}
                  onChange={(e) => setTicketData({...ticketData, priority: e.target.value as TicketData['priority']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                  <option value="Urgent">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={ticketData.category}
                  onChange={(e) => setTicketData({...ticketData, category: e.target.value as TicketData['category']})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="General">Chung</option>
                  <option value="Technical">Kỹ thuật</option>
                  <option value="Billing">Thanh toán</option>
                  <option value="Academic">Học vụ</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg disabled:opacity-50"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
