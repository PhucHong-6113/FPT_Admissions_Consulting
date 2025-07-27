"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SERVICE_URLS } from "../../utils/services";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean|null>(null);

  useEffect(() => {
    const appointmentId = searchParams.get("appointmentId");
    const code = searchParams.get("code");
    const cancel = searchParams.get("cancel") === "true";
    if (!appointmentId || !code) {
      setSuccess(false);
      setLoading(false);
      return;
    }
    const callPaymentCallback = async () => {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!accessToken) {
        setSuccess(false);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${SERVICE_URLS.AppointmentService}/api/v1/appointment/${appointmentId}/payment-call-back`, {
          method: 'PATCH',
          headers: {
            'accept': 'application/octet-stream',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, cancel }),
        });
        if (res.ok) {
          setSuccess(true);
        } else {
          setSuccess(false);
        }
      } catch {
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    callPaymentCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff5f2] to-white">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      ) : success ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-700 mb-4">Cảm ơn bạn đã đặt lịch tư vấn. Bạn có thể xem chi tiết lịch hẹn trong trang cá nhân.</p>
          <button onClick={() => router.push("/profile")}
            className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg hover:bg-[#ff8c42] font-semibold">
            Xem lịch hẹn của tôi
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Thanh toán thất bại!</h2>
          <p className="text-gray-700 mb-4">Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.</p>
          <button onClick={() => router.push("/")}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold">
            Về trang chủ
          </button>
        </div>
      )}
    </div>
  );
}

