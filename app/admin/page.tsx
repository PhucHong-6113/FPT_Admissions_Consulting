"use client";
import { useEffect, useState } from "react";
import { SERVICE_URLS } from "../../utils/services";
import Header from "../../components/Header";
import Image from "next/image";
import Link from 'next/link';
import AnimatedSection from '../../components/AnimatedSection';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MonthlyData {
  year: number;
  month: number;
  count: number;
}

interface AppointmentStats {
  monthlyData: MonthlyData[];
  todayCount: number;
  todayDate: string;
}

interface Appointment {
  id: string;
  counselorId: string;
  appointmentDate: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  counselor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  slotId?: number;
  slot?: string;
  dayId?: number;
  weekday?: string;
}

interface CounselorSchedule {
  scheduleId: string;
  counselorId: string;
  counselorEmail: string;
  counselorName: string;
  day: string;
  dayId: number;
  slot: string;
  slotId: number;
  statusId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  counselor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [counselorSchedules, setCounselorSchedules] = useState<CounselorSchedule[]>([]);
  const [totalConsultants, setTotalConsultants] = useState(0);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const profile = typeof window !== 'undefined' ? localStorage.getItem('user_profile') : null;
    
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }

    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        setUserProfile(parsedProfile);
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }

    setLoading(false); // Cho phép UI hiển thị ngay
    setDataLoading(true); // Hiển thị loading cho data
    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token: string) => {
    setDataLoading(true);
    setError("");

    try {
      // Fetch appointment statistics với timeout
      const statsPromise = Promise.race([
        fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment/statistics/6-months`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Stats timeout')), 10000))
      ]);

      // Fetch all appointments với timeout
      const appointmentsPromise = Promise.race([
        fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment?pageNumber=1&pageSize=100`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Appointments timeout')), 10000))
      ]);

      // Fetch các API quan trọng trước
      try {
        const statsResponse = await statsPromise as Response;
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.response) {
            setAppointmentStats(statsData.response);
          }
        }
      } catch (error) {
        console.warn('Error fetching stats:', error);
      }

      try {
        const appointmentsResponse = await appointmentsPromise as Response;
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          if (appointmentsData.success && appointmentsData.response?.items) {
            setAllAppointments(appointmentsData.response.items);
          }
        }
      } catch (error) {
        console.warn('Error fetching appointments:', error);
      }

      // Fetch các API ít quan trọng sau (không block UI)
      setTimeout(async () => {
        try {
          // Fetch counselor schedules
          const schedulesResponse = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/counselor-schedule?pageNumber=1&pageSize=100`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (schedulesResponse.ok) {
            const schedulesData = await schedulesResponse.json();
            if (schedulesData.success && schedulesData.response?.items) {
              setCounselorSchedules(schedulesData.response.items);
            }
          }

          // Fetch total consultants
          const consultantsResponse = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/consultant?pageNumber=1&pageSize=100`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (consultantsResponse.ok) {
            const consultantsData = await consultantsResponse.json();
            if (consultantsData.success && consultantsData.response?.items) {
              setTotalConsultants(consultantsData.response.items.length);
            }
          }
        } catch (error) {
          console.warn('Error fetching additional data:', error);
        }
      }, 100);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu dashboard.');
    } finally {
      setDataLoading(false);
    }
  };

  // Prepare chart data
  const chartData = appointmentStats?.monthlyData.map(item => ({
    month: `${item.month}/${item.year}`,
    appointments: item.count,
    monthName: new Date(item.year, item.month - 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  })) || [];

  // Prepare status distribution data
  const statusData = [
    { name: 'Chờ xác nhận', value: allAppointments.filter(a => a.status === 1).length, color: '#fbbf24' },
    { name: 'Đã thanh toán', value: allAppointments.filter(a => a.status === 2).length, color: '#10b981' },
    { name: 'Đã hoàn thành', value: allAppointments.filter(a => a.status === 4).length, color: '#3b82f6' },
    { name: 'Đã hủy', value: allAppointments.filter(a => a.status === 3).length, color: '#ef4444' },
  ];

  // Get unique counselors
  const uniqueCounselors = new Set(counselorSchedules.map(cs => cs.counselorId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f2] to-white">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image src="/logo.png" alt="FPT University" width={40} height={40} className="mr-3 rounded-full shadow" />
                <span className="text-xl font-bold text-[#ff6b35]">FPT University</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Chào mừng, {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Admin'}
              </span>
              <Link href="/" className="text-gray-600 hover:text-[#ff6b35] transition-colors">
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatedSection animation="fadeIn">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard Admin - Thống kê hệ thống</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tổng quan về hoạt động tư vấn tuyển sinh FPT University
            </p>
          </div>
        </AnimatedSection>

        {error && (
          <AnimatedSection animation="slideUp">
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => {
                  const token = localStorage.getItem('access_token');
                  if (token) fetchDashboardData(token);
                }}
                className="mt-2 text-[#ff6b35] hover:text-[#ff8c42] font-semibold"
              >
                Thử lại
              </button>
            </div>
          </AnimatedSection>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {dataLoading && (
              <div className="text-center py-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff6b35] mr-2"></div>
                  <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
                </div>
              </div>
            )}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedSection animation="slideUp">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Tổng số lịch hẹn</p>
                      <p className="text-2xl font-bold text-gray-900">{allAppointments.length}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideUp" delay={0.1}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Số tư vấn viên</p>
                      <p className="text-2xl font-bold text-gray-900">{uniqueCounselors || totalConsultants}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideUp" delay={0.2}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Lịch hẹn hôm nay</p>
                      <p className="text-2xl font-bold text-gray-900">{appointmentStats?.todayCount || 0}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideUp" delay={0.3}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Slot thời gian</p>
                      <p className="text-2xl font-bold text-gray-900">{counselorSchedules.length}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Line Chart - Appointments over 6 months */}
              <AnimatedSection animation="slideUp" delay={0.4}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Lịch hẹn trong 6 tháng gần đây</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="monthName" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(label) => `Tháng: ${label}`}
                          formatter={(value) => [value, 'Số lịch hẹn']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="appointments" 
                          stroke="#ff6b35" 
                          strokeWidth={3}
                          dot={{ fill: '#ff6b35', strokeWidth: 2, r: 6 }}
                          name="Số lịch hẹn"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </AnimatedSection>

              {/* Pie Chart - Status Distribution */}
              <AnimatedSection animation="slideUp" delay={0.5}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Phân bố trạng thái lịch hẹn</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Số lượng']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Recent Appointments Table */}
            <AnimatedSection animation="slideUp" delay={0.6}>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Lịch hẹn gần đây</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người dùng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tư vấn viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày hẹn
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allAppointments.length > 0 ? (
                        allAppointments.slice(0, 5).map((appointment) => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.user.firstName} {appointment.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.counselor.firstName} {appointment.counselor.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.counselor.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                appointment.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 2 ? 'bg-green-100 text-green-800' :
                                appointment.status === 3 ? 'bg-red-100 text-red-800' :
                                appointment.status === 4 ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status === 1 ? 'Chờ xác nhận' :
                                 appointment.status === 2 ? 'Đã thanh toán' :
                                 appointment.status === 3 ? 'Đã hủy' :
                                 appointment.status === 4 ? 'Đã hoàn thành' : 'Không xác định'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                            {dataLoading ? 'Đang tải dữ liệu...' : 'Chưa có lịch hẹn nào'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedSection>
          </div>
        )}
      </div>
    </div>
  );
}
