'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedSection from '../../components/AnimatedSection';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5050/connect/Token', {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'vi,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'origin': 'http://localhost:3000',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'ILoveFPT',
          password: formData.password,
          Email: formData.email
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Store all token information
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('expires_in', data.expires_in.toString());
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('scope', data.scope);

        // Calculate expiration time
        const expirationTime = new Date().getTime() + (data.expires_in * 1000);
        localStorage.setItem('token_expiration', expirationTime.toString());

        window.location.href = '/';
      } else {
        setError('Thông tin đăng nhập không chính xác. Vui lòng thử lại.');
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f2] to-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ff6b35] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ff8c42] rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <AnimatedSection animation="slideUp">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/logo.png"
                  alt="FPT University Logo"
                  width={120}
                  height={40}
                  className="mx-auto"
                />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
              <p className="text-gray-600">Chào mừng bạn trở lại với FPT University</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] outline-none transition-colors"
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] outline-none transition-colors"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]" />
                  <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#ff6b35] hover:text-[#ff8c42] transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff6b35] text-white py-3 px-4 rounded-lg hover:bg-[#ff8c42] focus:ring-4 focus:ring-[#ff6b35]/20 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="text-[#ff6b35] hover:text-[#ff8c42] font-semibold transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
