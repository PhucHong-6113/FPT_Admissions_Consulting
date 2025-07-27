'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedSection from '../../components/AnimatedSection';
import { SERVICE_URLS } from '../../utils/services';

// Define AuthTokens type
interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

// Simple storeTokens function
function storeTokens(tokens: AuthTokens) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('token_type', tokens.token_type);
  localStorage.setItem('expires_in', tokens.expires_in.toString());
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('scope', tokens.scope);

  // Optionally, store expiration time
  const expirationTime = new Date().getTime() + (tokens.expires_in * 1000);
  localStorage.setItem('token_expiration', expirationTime.toString());
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State cho popup register
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

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
      const tokenResponse = await fetch(`${SERVICE_URLS.AuthService}/connect/Token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: 'IloveFPT',
          password: formData.password,
          Email: formData.email
        }),
      });

      if (tokenResponse.ok) {
        const data: AuthTokens = await tokenResponse.json();
        storeTokens(data);
        // Fetch user profile after login
        try {
          const profileRes = await fetch(`${SERVICE_URLS.AuthService}/api/v1/User/SelectUserProfile`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${data.access_token}`,
            },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData && profileData.success && profileData.response) {
              localStorage.setItem('user_profile', JSON.stringify(profileData.response));
            }
          }
        } catch (e) {
          // ignore profile fetch error
        }
        window.location.href = '/';
      } else {
        const errorData = await tokenResponse.json().catch(() => ({}));
        setError(errorData.error_description || 'Thông tin đăng nhập không chính xác. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const insertUserResponse = await fetch(`${SERVICE_URLS.AuthService}/api/v1/user/InsertUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          firstName: registerData.firstName,
          lastName: registerData.lastName
        }),
      });

      if (insertUserResponse.ok) {
        setRegisterSuccess('Tài khoản đã được tạo thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setRegisterData({
          email: '',
          password: '',
          firstName: '',
          lastName: ''
        });
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterSuccess('');
        }, 2000);
      } else {
        const errorData = await insertUserResponse.json().catch(() => ({}));
        setRegisterError(errorData.message || 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Register error:', error);
      setRegisterError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsRegistering(false);
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

              {/* Register Link - Updated */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Chưa có tài khoản?{' '}
                  <button
                      onClick={() => setShowRegisterModal(true)}
                      className="text-[#ff6b35] hover:text-[#ff8c42] font-semibold transition-colors cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
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

        {/* Register Modal */}
        {showRegisterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
                    <button
                        onClick={() => {
                          setShowRegisterModal(false);
                          setRegisterError('');
                          setRegisterSuccess('');
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600">Tạo tài khoản mới để truy cập FPT University</p>
                </div>

                {/* Success Message */}
                {registerSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-600 text-sm">{registerSuccess}</p>
                    </div>
                )}

                {/* Error Message */}
                {registerError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{registerError}</p>
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        Họ
                      </label>
                      <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={registerData.firstName}
                          onChange={handleRegisterInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] outline-none transition-colors"
                          placeholder="Họ"
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên
                      </label>
                      <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={registerData.lastName}
                          onChange={handleRegisterInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] outline-none transition-colors"
                          placeholder="Tên"
                          required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                        type="email"
                        id="registerEmail"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] outline-none transition-colors"
                        placeholder="Nhập email"
                        required
                    />
                  </div>

                  <div>
                    <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu
                    </label>
                    <input
                        type="password"
                        id="registerPassword"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] outline-none transition-colors"
                        placeholder="Nhập mật khẩu"
                        required
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => {
                          setShowRegisterModal(false);
                          setRegisterError('');
                          setRegisterSuccess('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isRegistering}
                        className="flex-1 bg-[#ff6b35] text-white py-2 px-4 rounded-lg hover:bg-[#ff8c42] focus:ring-4 focus:ring-[#ff6b35]/20 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRegistering ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang tạo...
                          </div>
                      ) : (
                          'Đăng ký'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
