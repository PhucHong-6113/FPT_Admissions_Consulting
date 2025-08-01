"use client";
import { useEffect, useState } from "react";
import { SERVICE_URLS } from "../../utils/services";
import Header from "../../components/Header";
import Image from "next/image";
import Link from 'next/link';
import AnimatedSection from '../../components/AnimatedSection';

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
  slotId: number;
  slot: string;
  dayId: number;
  weekday: string;
}

const DAY_NAMES: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
};

export default function ConsultantDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }
    fetchAppointments(token);
  }, []);

  const fetchAppointments = async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment?pageNumber=1&pageSize=10000`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data && data.success && data.response && Array.isArray(data.response.items)) {
        setAppointments(data.response.items.filter((item: Appointment) => item.status === 2));
      } else {
        setAppointments([]);
        setError("Không có lịch hẹn nào.");
      }
    } catch {
      setError("Có lỗi xảy ra khi tải lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API lấy chi tiết user
  const fetchUserDetail = async (userId: string) => {
    setModalLoading(true);
    setModalError("");
    setUserDetail(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setModalError("Bạn chưa đăng nhập.");
      setModalLoading(false);
      return;
    }
    try {
      const res = await fetch(`${SERVICE_URLS.AuthService}/api/v1/user/${userId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data && data.success && data.response) {
        setUserDetail(data.response);
      } else {
        setModalError("Không tìm thấy thông tin người dùng.");
      }
    } catch {
      setModalError("Có lỗi xảy ra khi tải thông tin người dùng.");
    } finally {
      setModalLoading(false);
    }
  };

  // Lấy danh sách các ngày và slot duy nhất từ lịch đã thanh toán
  const days = Array.from(new Set(appointments.map(a => a.dayId))).sort((a, b) => a - b);
  const slots = Array.from(new Set(appointments.map(a => a.slotId))).sort((a, b) => a - b);

  // Lấy slot label theo slotId
  const getSlotLabel = (slotId: number) => {
    const found = appointments.find(a => a.slotId === slotId);
    return found ? found.slot : '';
  };

  // Lấy appointment theo ngày và slot
  const getAppointment = (dayId: number, slotId: number) =>
    appointments.find(a => a.dayId === dayId && a.slotId === slotId);

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Lịch hẹn đã thanh toán</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Danh sách các lịch hẹn đã thanh toán của bạn.
            </p>
          </div>
        </AnimatedSection>
        {error && (
          <AnimatedSection animation="slideUp">
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchAppointments(localStorage.getItem('access_token') || '')}
                className="mt-2 text-[#ff6b35] hover:text-[#ff8c42] font-semibold"
              >
                Thử lại
              </button>
            </div>
          </AnimatedSection>
        )}
        {appointments.length === 0 && !error ? (
          <AnimatedSection animation="slideUp">
            <div className="text-center py-12">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch đã thanh toán</h3>
                <p className="text-gray-600">Hiện tại chưa có lịch hẹn đã thanh toán nào. Vui lòng quay lại sau.</p>
              </div>
            </div>
          </AnimatedSection>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="p-3 bg-[#fff5f2] text-[#ff6b35] text-lg font-bold rounded-tl-xl">Khung giờ</th>
                  {days.map(dayId => (
                    <th key={dayId} className="p-3 bg-[#fff5f2] text-[#ff6b35] text-lg font-bold">{DAY_NAMES[dayId]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map(slotId => (
                  <tr key={slotId}>
                    <td className="p-3 font-semibold text-gray-700 bg-white rounded-l-xl shadow">{getSlotLabel(slotId)}</td>
                    {days.map(dayId => {
                      const app = getAppointment(dayId, slotId);
                      return (
                        <td key={dayId} className="p-3 bg-white rounded shadow align-top">
                          {app ? (
                            <div>
                              <div className="font-semibold text-[#ff6b35] cursor-pointer" onClick={() => {fetchUserDetail(app.user.id); setShowModal(true);}}>
                                {app.user.firstName} {app.user.lastName}
                              </div>
                              <div className="text-gray-500 text-xs">{app.user.email}</div>
                              <span className="text-green-600 font-semibold flex items-center gap-1 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                Đã thanh toán
                              </span>
                              <button
                                className="mt-2 bg-[#ff6b35] text-white px-3 py-1 rounded hover:bg-[#ff8c42] text-sm"
                                onClick={async () => {
                                  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
                                  if (!token) {
                                    alert('Bạn chưa đăng nhập.');
                                    return;
                                  }
                                  try {
                                    const res = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment/${app.id}/status`, {
                                      method: 'PATCH',
                                      headers: {
                                        'accept': 'application/json',
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({})
                                    });
                                    const data = await res.json();
                                    if (data && data.success) {
                                      alert('Cập nhật trạng thái thành công!');
                                      fetchAppointments(token);
                                    } else {
                                      if (data && data.message && data.message.includes('Cannot update status for future appointments')) {
                                        alert('Không thể cập nhật trạng thái cho lịch hẹn chưa diễn ra.');
                                      } else {
                                        alert('Có lỗi xảy ra: ' + (data.message || 'Không xác định'));
                                      }
                                    }
                                  } catch {
                                    alert('Có lỗi xảy ra khi cập nhật trạng thái.');
                                  }
                                }}
                              >Cập nhật trạng thái</button>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-[#ff6b35] text-xl" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold text-[#ff6b35] mb-4">Chi tiết người dùng</h2>
            {modalLoading ? (
              <div className="text-center text-gray-500">Đang tải...</div>
            ) : modalError ? (
              <div className="text-center text-red-500">{modalError}</div>
            ) : userDetail ? (
              <div className="space-y-2">
                <div><span className="font-semibold">Họ tên:</span> {userDetail.firstName} {userDetail.lastName}</div>
                <div><span className="font-semibold">Email:</span> {userDetail.email}</div>
                <div><span className="font-semibold">Số điện thoại:</span> {userDetail.phoneNumber || "Chưa cập nhật"}</div>
                <div><span className="font-semibold">Ngày sinh:</span> {userDetail.dateOfBirth ? new Date(userDetail.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</div>
                <div><span className="font-semibold">Giới tính:</span> {userDetail.gender === 1 ? "Nam" : userDetail.gender === 2 ? "Nữ" : userDetail.gender === 3 ? "Khác" : "Chưa cập nhật"}</div>
                <div><span className="font-semibold">Địa chỉ:</span> {userDetail.address || "Chưa cập nhật"}</div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
