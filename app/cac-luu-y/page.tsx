import React from 'react';

export default function CacLuuYPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff5f2] to-white p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 max-w-xl w-full">
        <h1 className="text-3xl font-bold text-[#ff6b35] mb-4 text-center">Các lưu ý</h1>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Vui lòng bảo mật thông tin tài khoản và không chia sẻ cho người khác.</li>
          <li>Đổi mật khẩu định kỳ để tăng cường bảo mật.</li>
          <li>Liên hệ bộ phận hỗ trợ nếu gặp sự cố về tài khoản hoặc hệ thống.</li>
          <li>Tuân thủ các quy định và chính sách của hệ thống.</li>
        </ul>
        <div className="mt-8 text-center">
          <a href="/" className="text-[#ff6b35] hover:text-[#ff8c42] font-semibold transition-colors">← Về trang chủ</a>
        </div>
      </div>
    </div>
  );
}

