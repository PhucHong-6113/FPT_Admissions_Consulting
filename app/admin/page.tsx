"use client";
import { useEffect, useState } from "react";
import { SERVICE_URLS } from "../../utils/services";
import Image from "next/image";
import Link from 'next/link';
import AnimatedSection from '../../components/AnimatedSection';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [userProfile, setUserProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  
  // Consultants pagination states
  const [consultantsCurrentPage, setConsultantsCurrentPage] = useState(1);
  const [consultantsPageSize] = useState(10);
  const [consultantsTotalRecords, setConsultantsTotalRecords] = useState(0);
  const [consultantsTotalPages, setConsultantsTotalPages] = useState(0);
  const [consultantsLoading, setConsultantsLoading] = useState(false);
  const [consultants, setConsultants] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  
  // Selected consultant details
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [consultantSchedules, setConsultantSchedules] = useState<CounselorSchedule[]>([]);
  const [consultantSchedulesLoading, setConsultantSchedulesLoading] = useState(false);
  
  // Consultant schedules pagination states
  const [schedulesCurrentPage, setSchedulesCurrentPage] = useState(1);
  const [schedulesPageSize] = useState(10);
  const [schedulesTotalRecords, setSchedulesTotalRecords] = useState(0);
  const [schedulesTotalPages, setSchedulesTotalPages] = useState(0);

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

  // Handle pagination changes
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && currentPage > 1) {
      fetchAppointmentsWithPaging(token, currentPage);
    }
  }, [currentPage]);

  // Handle consultants pagination changes
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && consultantsCurrentPage > 1) {
      fetchConsultantsWithPaging(token, consultantsCurrentPage);
    }
  }, [consultantsCurrentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleConsultantsPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= consultantsTotalPages) {
      setConsultantsCurrentPage(newPage);
    }
  };

  const handleConsultantClick = async (consultant: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      setSelectedConsultant(consultant);
      setSchedulesCurrentPage(1); // Reset to first page when selecting new consultant
      // consultant.id chính là counselorId từ API Get All Consultants
      await fetchConsultantSchedules(token, consultant.id, 1);
    }
  };

  const handleCloseConsultantDetails = () => {
    setSelectedConsultant(null);
    setConsultantSchedules([]);
    setSchedulesCurrentPage(1);
    setSchedulesTotalRecords(0);
    setSchedulesTotalPages(0);
  };

  const handleSchedulesPageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= schedulesTotalPages && selectedConsultant) {
      setSchedulesCurrentPage(newPage);
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (token) {
        await fetchConsultantSchedules(token, selectedConsultant.id, newPage);
      }
    }
  };

  const fetchConsultantsWithPaging = async (token: string, page: number = 1) => {
    setConsultantsLoading(true);
    try {
      const response = await fetch(`${SERVICE_URLS.AuthService}/api/v1/user/consultants?pageNumber=${page}&pageSize=${consultantsPageSize}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.response) {
          setConsultants(data.response.items || []);
          setConsultantsTotalRecords(data.response.totalRecords || 0);
          setConsultantsTotalPages(data.response.totalPages || 0);
        }
      } else {
        console.error('Error fetching consultants:', response.status);
      }
    } catch (error) {
      console.error('Error fetching consultants with paging:', error);
    } finally {
      setConsultantsLoading(false);
    }
  };

  const fetchConsultantSchedules = async (token: string, consultantId: string, page: number = 1) => {
    setConsultantSchedulesLoading(true);
    try {
      const response = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/counselor-schedule/counselor/${consultantId}?pageNumber=${page}&pageSize=${schedulesPageSize}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.response?.items) {
          setConsultantSchedules(data.response.items);
          setSchedulesTotalRecords(data.response.totalRecords || 0);
          setSchedulesTotalPages(data.response.totalPages || 0);
        } else {
          setConsultantSchedules([]);
          setSchedulesTotalRecords(0);
          setSchedulesTotalPages(0);
        }
      } else {
        console.error('Error fetching consultant schedules:', response.status);
        setConsultantSchedules([]);
        setSchedulesTotalRecords(0);
        setSchedulesTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching consultant schedules:', error);
      setConsultantSchedules([]);
      setSchedulesTotalRecords(0);
      setSchedulesTotalPages(0);
    } finally {
      setConsultantSchedulesLoading(false);
    }
  };

  const fetchAppointmentsWithPaging = async (token: string, page: number = 1) => {
    setAppointmentsLoading(true);
    try {
      const response = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment?pageNumber=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.response) {
          setAllAppointments(data.response.items || []);
          setTotalRecords(data.response.totalRecords || 0);
          setTotalPages(data.response.totalPages || 0);
        }
      } else {
        console.error('Error fetching appointments:', response.status);
      }
    } catch (error) {
      console.error('Error fetching appointments with paging:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

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

      // Fetch appointments with paging
      await fetchAppointmentsWithPaging(token, currentPage);

      // Fetch consultants with paging
      await fetchConsultantsWithPaging(token, consultantsCurrentPage);

      // Fetch appointment statistics
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

      // Fetch các API ít quan trọng sau (không block UI)
      setTimeout(async () => {
        try {
          // Có thể thêm các API khác nếu cần
          console.log('Additional data loading completed');
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

  // Calculate revenues
  const monthlyRevenue = appointmentStats?.monthlyData && appointmentStats.monthlyData.length > 0 
    ? appointmentStats.monthlyData[appointmentStats.monthlyData.length - 1].count * 2000 
    : 0;
  
  const todayRevenue = (appointmentStats?.todayCount || 0) * 2000;

  // Format revenue function
  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatedSection animation="slideUp">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Doanh thu tháng này</p>
                      <p className="text-2xl font-bold text-gray-900">{formatRevenue(monthlyRevenue)}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideUp" delay={0.1}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Doanh thu hôm nay</p>
                      <p className="text-2xl font-bold text-gray-900">{formatRevenue(todayRevenue)}</p>
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

              {/* Appointments List with Pagination */}
              <AnimatedSection animation="slideUp" delay={0.5}>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Danh sách lịch hẹn</h3>
                    <div className="text-sm text-gray-500">
                      Hiển thị {allAppointments.length} / {totalRecords} lịch hẹn
                    </div>
                  </div>
                  
                  {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
                      <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người dùng
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tư vấn viên
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày hẹn
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {allAppointments.length > 0 ? (
                              allAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.user.firstName} {appointment.user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{appointment.user.email}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.counselor.firstName} {appointment.counselor.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{appointment.counselor.email}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
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
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                  Chưa có lịch hẹn nào
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            Trang {currentPage} / {totalPages} (Tổng: {totalRecords} lịch hẹn)
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`px-3 py-1 rounded text-sm ${
                                currentPage === 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              ‹ Trước
                            </button>
                            
                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-1 rounded text-sm ${
                                    currentPage === pageNum
                                      ? 'bg-[#ff6b35] text-white'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 rounded text-sm ${
                                currentPage === totalPages
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              Sau ›
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </AnimatedSection>
            </div>

            {/* Consultants List Section */}
            <AnimatedSection animation="slideUp" delay={0.7}>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Danh sách tư vấn viên</h3>
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-md">
                    <span className="text-lg font-semibold">Tổng: {consultantsTotalRecords} nhân viên</span>
                  </div>
                </div>
                
                {consultantsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
                    <span className="ml-2 text-gray-600">Đang tải...</span>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Họ và tên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hành động
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {consultants.length > 0 ? (
                            consultants.map((consultant) => (
                              <tr key={consultant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {consultant.firstName} {consultant.lastName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{consultant.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => handleConsultantClick(consultant)}
                                    className="text-[#ff6b35] hover:text-[#ff8c42] font-medium text-sm transition-all duration-200 hover:scale-105 hover:shadow-sm px-2 py-1 rounded"
                                  >
                                    Xem lịch làm việc
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                Chưa có tư vấn viên nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Consultants Pagination */}
                    {consultantsTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                          Trang {consultantsCurrentPage} / {consultantsTotalPages} (Tổng: {consultantsTotalRecords} tư vấn viên)
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleConsultantsPageChange(consultantsCurrentPage - 1)}
                            disabled={consultantsCurrentPage === 1}
                            className={`px-3 py-1 rounded text-sm ${
                              consultantsCurrentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            ‹ Trước
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, consultantsTotalPages) }, (_, i) => {
                            let pageNum;
                            if (consultantsTotalPages <= 5) {
                              pageNum = i + 1;
                            } else if (consultantsCurrentPage <= 3) {
                              pageNum = i + 1;
                            } else if (consultantsCurrentPage >= consultantsTotalPages - 2) {
                              pageNum = consultantsTotalPages - 4 + i;
                            } else {
                              pageNum = consultantsCurrentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handleConsultantsPageChange(pageNum)}
                                className={`px-3 py-1 rounded text-sm ${
                                  consultantsCurrentPage === pageNum
                                    ? 'bg-[#ff6b35] text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => handleConsultantsPageChange(consultantsCurrentPage + 1)}
                            disabled={consultantsCurrentPage === consultantsTotalPages}
                            className={`px-3 py-1 rounded text-sm ${
                              consultantsCurrentPage === consultantsTotalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Sau ›
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Consultant Schedule Details */}
                {selectedConsultant && (
                  <div 
                    className="mt-8 border-t border-gray-200 pt-6"
                    style={{
                      animation: 'slideDown 0.3s ease-out forwards',
                      opacity: 0,
                      transform: 'translateY(-20px)',
                      animationFillMode: 'forwards'
                    }}
                  >
                    <style jsx>{`
                      @keyframes slideDown {
                        from {
                          opacity: 0;
                          transform: translateY(-20px);
                        }
                        to {
                          opacity: 1;
                          transform: translateY(0);
                        }
                      }
                      
                      @keyframes fadeIn {
                        from {
                          opacity: 0;
                          transform: translateY(10px);
                        }
                        to {
                          opacity: 1;
                          transform: translateY(0);
                        }
                      }
                      
                      @keyframes fadeInRow {
                        from {
                          opacity: 0;
                          transform: translateX(-10px);
                        }
                        to {
                          opacity: 1;
                          transform: translateX(0);
                        }
                      }
                    `}</style>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Lịch làm việc của {selectedConsultant.firstName} {selectedConsultant.lastName}
                      </h4>
                      <button
                        onClick={handleCloseConsultantDetails}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110 transform"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {consultantSchedulesLoading ? (
                      <div className="flex items-center justify-center py-8 animate-pulse">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff6b35]"></div>
                        <span className="ml-2 text-gray-600">Đang tải lịch làm việc...</span>
                      </div>
                    ) : (
                      <>
                        <div 
                          className="animate-fadeIn" 
                          style={{ 
                            animation: 'fadeIn 0.4s ease-out',
                            opacity: 0,
                            animationFillMode: 'forwards'
                          }}
                        >
                          <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Thứ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Khung giờ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cập nhật lần cuối
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {consultantSchedules.length > 0 ? (
                                consultantSchedules.map((schedule) => (
                                  <tr key={schedule.scheduleId} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{schedule.day}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{schedule.slot}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        schedule.statusId === 1 ? 'bg-green-100 text-green-800' :
                                        schedule.statusId === 2 ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {schedule.statusId === 1 ? 'Có sẵn' :
                                         schedule.statusId === 2 ? 'Đã đặt' : 'Không xác định'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(schedule.updatedAt).toLocaleDateString('vi-VN')}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    Tư vấn viên này chưa có lịch làm việc
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Schedules Pagination */}
                        {schedulesTotalPages > 1 && (
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                              Trang {schedulesCurrentPage} / {schedulesTotalPages} (Tổng: {schedulesTotalRecords} lịch làm việc)
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSchedulesPageChange(schedulesCurrentPage - 1)}
                                disabled={schedulesCurrentPage === 1}
                                className={`px-3 py-1 rounded text-sm ${
                                  schedulesCurrentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                ‹ Trước
                              </button>
                              
                              {/* Page numbers */}
                              {Array.from({ length: Math.min(5, schedulesTotalPages) }, (_, i) => {
                                let pageNum;
                                if (schedulesTotalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (schedulesCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (schedulesCurrentPage >= schedulesTotalPages - 2) {
                                  pageNum = schedulesTotalPages - 4 + i;
                                } else {
                                  pageNum = schedulesCurrentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handleSchedulesPageChange(pageNum)}
                                    className={`px-3 py-1 rounded text-sm ${
                                      schedulesCurrentPage === pageNum
                                        ? 'bg-[#ff6b35] text-white'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={() => handleSchedulesPageChange(schedulesCurrentPage + 1)}
                                disabled={schedulesCurrentPage === schedulesTotalPages}
                                className={`px-3 py-1 rounded text-sm ${
                                  schedulesCurrentPage === schedulesTotalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Sau ›
                              </button>
                            </div>
                          </div>
                        )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
        )}
      </div>
    </div>
  );
}
