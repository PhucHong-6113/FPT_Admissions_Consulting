"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SERVICE_URLS } from "../../utils/services";
import Image from "next/image";
import Header from "../../components/Header";

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
}

interface UserProfileFull {
  userId: string;
  email: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{firstName:string;lastName:string;email:string}|null>(null);
  const [activeTab, setActiveTab] = useState<'profile'|'appointment'|'ticket'>('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfileFull|null>(null);

  useEffect(() => {
    // Check login
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserProfile(token);
    fetchAppointments();
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch(`${SERVICE_URLS.AuthService}/api/v1/user/SelectUserProfile`, {
        method: 'GET',
        headers: {
          'accept': 'application/octet-stream',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.success && data.response) {
        setUserProfile(data.response);
        setEditProfile(data.response);
      }
    } catch {
      // ignore
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment`, {
        method: 'GET',
        headers: {
          'accept': 'application/octet-stream',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Không thể tải lịch hẹn");
      const data = await res.json();
      if (data && data.success && Array.isArray(data.response)) {
        setAppointments(data.response);
      } else {
        setError("Không có lịch hẹn nào.");
      }
    } catch {
      setError("Có lỗi xảy ra khi tải lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  // Đảm bảo userProfile có đầy đủ kiểu UserProfileFull để truy cập các trường avatarUrl, phoneNumber...
  const userProfileFull = userProfile as UserProfileFull | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f2] to-white flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar cố định bên trái */}
        <aside className="w-72 min-h-screen bg-[#fff5f2] border-r flex flex-col py-12 px-6 items-center shadow-lg">
          <div className="w-full flex flex-col gap-3">
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-5 py-4 rounded-lg font-semibold transition-colors text-lg ${activeTab==='profile' ? 'bg-[#ff6b35] text-white shadow' : 'text-[#ff6b35] hover:bg-[#ffe3d1]'}`}>Thông tin cá nhân</button>
            <button onClick={() => setActiveTab('appointment')} className={`w-full text-left px-5 py-4 rounded-lg font-semibold transition-colors text-lg ${activeTab==='appointment' ? 'bg-[#ff6b35] text-white shadow' : 'text-[#ff6b35] hover:bg-[#ffe3d1]'}`}>Lịch hẹn đã đặt</button>
            <button onClick={() => setActiveTab('ticket')} className={`w-full text-left px-5 py-4 rounded-lg font-semibold transition-colors text-lg ${activeTab==='ticket' ? 'bg-[#ff6b35] text-white shadow' : 'text-[#ff6b35] hover:bg-[#ffe3d1]'}`}>Yêu cầu hỗ trợ</button>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-start py-12 px-4 md:px-12">
          <h1 className="text-3xl font-bold text-[#ff6b35] mb-8 self-start">Trang cá nhân</h1>
          {activeTab === 'profile' && userProfileFull && (
            <div className="w-full max-w-2xl bg-gradient-to-br from-[#fff5f2] to-[#ffe3d1] rounded-3xl p-10 shadow-2xl flex flex-col items-center border-2 border-[#ff6b35]/30 relative overflow-hidden">
              {/* Hiệu ứng nền */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ff6b35]/10 rounded-full blur-2xl z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ff8c42]/10 rounded-full blur-2xl z-0"></div>
              {/* Avatar */}
              <div className="mb-6 relative z-10 group">
                <Image src={userProfileFull.avatarUrl || "/logo.png"} alt="avatar" width={120} height={120} className="rounded-full border-4 border-[#ff6b35] bg-white shadow-xl transition-transform group-hover:scale-105 duration-300" />
              </div>
              {/* Tên user nổi bật */}
              <div className="text-2xl font-extrabold text-[#ff6b35] mb-2 flex items-center gap-2 z-10">
                <svg className="w-7 h-7 text-[#ff8c42]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {userProfileFull.firstName} {userProfileFull.lastName}
              </div>
              <div className="text-gray-500 mb-6 z-10">ID: {userProfileFull.userId}</div>
              {/* Thông tin chi tiết */}
              <div className="w-full space-y-4 z-10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm">
                  <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0 4 4 0 018 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7m0 0H9m3 0h3"/></svg>
                  <span className="font-semibold text-gray-700 w-40">Email:</span>
                  <span className="flex-1 text-right">{userProfileFull.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm">
                  <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm12-12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                  <span className="font-semibold text-gray-700 w-40">Số điện thoại:</span>
                  <span className="flex-1 text-right">{userProfileFull.phoneNumber || '-'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm">
                  <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span className="font-semibold text-gray-700 w-40">Ngày sinh:</span>
                  <span className="flex-1 text-right">{userProfileFull.dateOfBirth || '-'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm">
                  <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7"/></svg>
                  <span className="font-semibold text-gray-700 w-40">Giới tính:</span>
                  <span className="flex-1 text-right">{userProfileFull.gender || '-'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm">
                  <svg className="w-6 h-6 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V6a4 4 0 00-8 0v4m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span className="font-semibold text-gray-700 w-40">Địa chỉ:</span>
                  <span className="flex-1 text-right">{userProfileFull.address || '-'}</span>
                </div>
              </div>
              <button onClick={() => setShowEditModal(true)} className="mt-10 bg-[#ff6b35] text-white px-10 py-3 rounded-xl font-bold hover:bg-[#ff8c42] text-lg shadow-lg z-10">Cập nhật thông tin</button>
            </div>
          )}
          {activeTab === 'appointment' && (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-7 h-7 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Lịch hẹn đã đặt
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff6b35] mx-auto mb-2"></div>
                  <div className="text-gray-600">Đang tải lịch hẹn...</div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">{error}</div>
              ) : appointments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Bạn chưa có lịch hẹn nào.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {appointments.map(app => (
                    <div key={app.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-3 border border-[#ffe3d1] relative hover:shadow-2xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-[#fff5f2] flex items-center justify-center border-2 border-[#ff6b35]">
                          <svg className="w-7 h-7 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-[#ff6b35] flex items-center gap-1">
                            <svg className="w-5 h-5 text-[#ff8c42]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/></svg>
                            {app.counselor.firstName} {app.counselor.lastName}
                          </div>
                          <div className="text-gray-500 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 2a2 2 0 012 2v2M8 2a2 2 0 00-2 2v2m0 0H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-1M6 6h12"/></svg>
                            {app.counselor.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span className="font-semibold">Ngày hẹn:</span> {app.appointmentDate}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-[#ff8c42]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/></svg>
                        <span className="font-semibold">Trạng thái:</span>
                        {app.status === 1 && <span className="text-yellow-600 font-semibold flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>Chờ thanh toán</span>}
                        {app.status === 2 && <span className="text-green-600 font-semibold flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Đã thanh toán</span>}
                        {app.status === 4 && <span className="text-gray-600 font-semibold flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg>Đã hoàn thành</span>}
                        {[3,5].includes(app.status) && <span className="text-red-600 font-semibold flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>Đã hủy</span>}
                      </div>
                      <div className="absolute top-4 right-4">
                        <svg className="w-7 h-7 text-[#ff8c42] opacity-30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'ticket' && (
            <div className="w-full max-w-2xl text-center text-gray-500 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu hỗ trợ</h2>
              <p>Chức năng này sẽ sớm được cập nhật.</p>
            </div>
          )}
        </main>
        {/* Modal cập nhật thông tin */}
        {showEditModal && editProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Nền mờ */}
            <div className="absolute inset-0 backdrop-blur-sm bg-transparent transition-all duration-300" />
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg z-10 relative">
              <h2 className="text-xl font-bold mb-4 text-[#ff6b35]">Cập nhật thông tin cá nhân</h2>
              <form className="space-y-4" onSubmit={e => {e.preventDefault(); setShowEditModal(false);}}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" value={editProfile.firstName || ''} onChange={e => setEditProfile({...editProfile, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" value={editProfile.lastName || ''} onChange={e => setEditProfile({...editProfile, lastName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-lg" value={editProfile.email || ''} onChange={e => setEditProfile({...editProfile, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" value={editProfile.phoneNumber || ''} onChange={e => setEditProfile({...editProfile, phoneNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-lg" value={editProfile.dateOfBirth || ''} onChange={e => setEditProfile({...editProfile, dateOfBirth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" value={editProfile.gender || ''} onChange={e => setEditProfile({...editProfile, gender: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" value={editProfile.address || ''} onChange={e => setEditProfile({...editProfile, address: e.target.value})} />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
                  <button type="submit" className="flex-1 bg-[#ff6b35] text-white py-2 px-4 rounded-lg hover:bg-[#ff8c42] font-semibold">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
