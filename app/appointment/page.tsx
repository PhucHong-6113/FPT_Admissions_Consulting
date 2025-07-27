'use client';

    import { useState, useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import Link from 'next/link';
    import Image from 'next/image';
    import AnimatedSection from '../../components/AnimatedSection';
    import { SERVICE_URLS, createAppointment } from '../../utils/services';

    interface CounselorSchedule {
      scheduleId: string;
      counselorEmail: string;
      counselorName: string;
      day: string;
      dayId: number;
      slot: string;
      slotId: number;
      statusId: number;
    }

    interface ScheduleResponse {
      response: CounselorSchedule[];
      success: boolean;
      messageId: string;
      message: string;
      detailErrorList: null;
    }

    enum ScheduleStatus {
      Available = 1,
      Booked = 2,
    }

    interface UserProfile {
      firstName: string;
      lastName: string;
      [key: string]: unknown;
    }

    function isAuthenticated(): boolean {
      if (typeof window === 'undefined') return false;
      return !!localStorage.getItem('access_token');
    }

    function getStoredUserProfile(): UserProfile | null {
      if (typeof window === 'undefined') return null;
      const profile = localStorage.getItem('user_profile');
      if (!profile) return null;
      try {
        return JSON.parse(profile);
      } catch {
        return null;
      }
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

    export default function AppointmentPage() {
      const [schedules, setSchedules] = useState<CounselorSchedule[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState('');
      const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
      const [selectedSlot, setSelectedSlot] = useState<CounselorSchedule | null>(null);
      const [showBookingModal, setShowBookingModal] = useState(false);
      const [showCounselorModal, setShowCounselorModal] = useState(false);
      const router = useRouter();

      useEffect(() => {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }
        const profile = getStoredUserProfile();
        if (profile) setUserProfile(profile);
        fetchCounselorSchedules();
      }, [router]);

      const fetchCounselorSchedules = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(
            `${SERVICE_URLS.AppointmentService}/api/v1/counselor-schedule/SelectCounselorSchedules`,
            { method: 'GET', headers: { accept: 'application/json' } }
          );
          if (response.ok) {
            const data: ScheduleResponse = await response.json();
            if (data.success) setSchedules(data.response);
            else setError('Không thể tải lịch tư vấn. Vui lòng thử lại sau.');
          } else setError('Có lỗi xảy ra khi tải dữ liệu.');
        } catch (error) {
          setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
          setIsLoading(false);
        }
      };

      // Unique sorted days and slots
      const days = Array.from(
        new Set(schedules.map(s => s.dayId))
      )
        .sort((a, b) => a - b)
        .map(dayId => ({
          dayId,
          dayName: DAY_NAMES[dayId] || 'Không xác định',
        }));

      const slots = Array.from(
        new Set(schedules.map(s => s.slotId))
      )
        .sort((a, b) => a - b)
        .map(slotId => {
          const slot = schedules.find(s => s.slotId === slotId);
          return { slotId, slot: slot ? slot.slot : '' };
        });

      // Get all counselors for a day and slot
      const getCounselors = (dayId: number, slotId: number) =>
        schedules.filter(s => s.dayId === dayId && s.slotId === slotId);

      // Sửa lại: khi bấm vào slot, chỉ mở modal chi tiết
      const handleSlotClick = (slot: CounselorSchedule) => {
        setSelectedSlot(slot);
        setShowCounselorModal(true);
      };

      const handleBooking = async () => {
        if (!selectedSlot) return;
        setShowBookingModal(false);
        // Gọi API tạo lịch hẹn và redirect đến checkoutUrl nếu thành công
        const checkoutUrl = await createAppointment(selectedSlot.scheduleId, 'Đặt lịch tư vấn');
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          alert('Đặt lịch thất bại. Vui lòng thử lại.');
        }
      };

      const getStatusBadge = (statusId: number) => {
        switch (statusId) {
          case ScheduleStatus.Available:
            return (
              <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
                Có thể đặt
              </span>
            );
          case ScheduleStatus.Booked:
            return (
              <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold border border-red-200">
                Đã đặt
              </span>
            );
          default:
            return (
              <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200">
                Không xác định
              </span>
            );
        }
      };

      if (isLoading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#fff5f2] to-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải lịch tư vấn...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5f2] to-white">
          {/* Header */}
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
                  {userProfile && (
                    <span className="text-gray-700">
                      Xin chào, <span className="font-semibold text-[#ff6b35]">{userProfile.firstName} {userProfile.lastName}</span>
                    </span>
                  )}
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-[#ff6b35] transition-colors"
                  >
                    ← Về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <AnimatedSection animation="fadeIn">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Đặt lịch tư vấn</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Chọn thời gian phù hợp để được tư vấn trực tiếp với các chuyên gia tuyển sinh của chúng tôi
                </p>
              </div>
            </AnimatedSection>

            {error && (
              <AnimatedSection animation="slideUp">
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchCounselorSchedules}
                    className="mt-2 text-[#ff6b35] hover:text-[#ff8c42] font-semibold"
                  >
                    Thử lại
                  </button>
                </div>
              </AnimatedSection>
            )}

            {schedules.length === 0 && !error ? (
              <AnimatedSection animation="slideUp">
                <div className="text-center py-12">
                  <div className="bg-white rounded-xl p-8 shadow-lg">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có lịch tư vấn</h3>
                    <p className="text-gray-600">Hiện tại chưa có lịch tư vấn nào được mở. Vui lòng quay lại sau.</p>
                  </div>
                </div>
              </AnimatedSection>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="p-3 bg-[#fff5f2] text-[#ff6b35] text-lg font-bold rounded-tl-xl">Khung giờ</th>
                      {days.map(day => (
                        <th key={day.dayId} className="p-3 bg-[#fff5f2] text-[#ff6b35] text-lg font-bold">{day.dayName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(slot => (
                      <tr key={slot.slotId}>
                        <td className="p-3 font-semibold text-gray-700 bg-white rounded-l-xl shadow">{slot.slot}</td>
                        {days.map(day => {
                          const counselors = getCounselors(day.dayId, slot.slotId);
                          if (counselors.length === 0) {
                            return (
                              <td key={day.dayId} className="p-3 bg-white rounded shadow align-top">
                                <span className="text-gray-300 text-xs">-</span>
                              </td>
                            );
                          }
                          const c = counselors[0];
                          return (
                            <td key={day.dayId} className="p-3 bg-white rounded shadow align-top">
                              <button
                                key={c.scheduleId}
                                onClick={() => handleSlotClick(c)}
                                disabled={c.statusId === ScheduleStatus.Booked}
                                className={`w-full mb-2 last:mb-0 px-3 py-2 rounded-lg border-2 text-sm font-medium flex flex-col items-start transition-all duration-200
                                  ${c.statusId === ScheduleStatus.Available
                                    ? 'border-[#ff6b35] bg-[#fff5f2] hover:bg-[#ffecd9] hover:scale-[1.03] text-[#ff6b35]'
                                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                }
                              `}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-7 h-7 rounded-full bg-[#ffecd9] flex items-center justify-center text-[#ff6b35] font-bold shadow-sm">
                                    {c.counselorName.charAt(0)}
                                  </div>
                                  <span className="font-semibold">{c.counselorName}</span>
                                </div>
                                {getStatusBadge(c.statusId)}
                              </button>
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

          {/* Booking Modal */}
          {showBookingModal && selectedSlot && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-4 shadow">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận đặt lịch</h3>
                  <p className="text-gray-600">Bạn có chắc chắn muốn đặt lịch tư vấn này?</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tư vấn viên:</span>
                      <span className="font-semibold">{selectedSlot.counselorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">{selectedSlot.counselorEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày:</span>
                      <span className="font-semibold">{DAY_NAMES[selectedSlot.dayId]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-semibold">{selectedSlot.slot}</span>
                    </div>
                    {userProfile && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Học viên:</span>
                        <span className="font-semibold">{userProfile.firstName} {userProfile.lastName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedSlot(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 bg-[#ff6b35] text-white py-3 px-4 rounded-lg hover:bg-[#ff8c42] transition-colors font-semibold"
                  >
                    Xác nhận đặt lịch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal chi tiết counselor */}
          {showCounselorModal && selectedSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 backdrop-blur-sm bg-transparent transition-all duration-300" onClick={() => { setShowCounselorModal(false); setSelectedSlot(null); }} />
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10 relative">
                <h2 className="text-xl font-bold mb-4 text-[#ff6b35] flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#ff8c42]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Thông tin chuyên gia tư vấn
                </h2>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#ffecd9] flex items-center justify-center text-[#ff6b35] font-bold text-2xl shadow">
                    {selectedSlot.counselorName.charAt(0)}
                  </div>
                  <div className="font-bold text-[#ff6b35] text-lg flex items-center gap-1">
                    <svg className="w-5 h-5 text-[#ff8c42]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {selectedSlot.counselorName}
                  </div>
                  <div className="text-gray-500 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 2a2 2 0 012 2v2M8 2a2 2 0 00-2 2v2m0 0H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-1M6 6h12"/></svg>
                    {selectedSlot.counselorEmail}
                  </div>
                  <div className="text-gray-600 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>
                    {selectedSlot.slot}
                  </div>
                  {selectedSlot.statusId === ScheduleStatus.Available ? (
                    <button
                      className="mt-4 bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#ff8c42] transition-colors"
                      onClick={() => { setShowCounselorModal(false); setShowBookingModal(true); }}
                    >
                      Đặt lịch
                    </button>
                  ) : (
                    <span className="mt-4 inline-block px-3 py-1 rounded bg-red-100 text-red-700 text-sm font-semibold border border-red-200">Đã đặt</span>
                  )}
                </div>
                <button className="absolute top-3 right-3 text-gray-400 hover:text-[#ff6b35] text-2xl" onClick={() => { setShowCounselorModal(false); setSelectedSlot(null); }}>×</button>
              </div>
            </div>
          )}
        </div>
      );
    }