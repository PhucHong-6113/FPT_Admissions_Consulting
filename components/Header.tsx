"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { isAuthenticated, getStoredUserProfile, logout, UserProfile } from "../utils/auth";
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        let profile = getStoredUserProfile();
        if (profile) {
          setUserProfile(profile);
        } else {
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserProfile(null);
    router.push("/");
  };

  const handleAppointmentClick = () => {
    if (isAuthenticated()) {
      router.push('/appointment');
    } else {
      router.push('/login');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <img src="/logo.png" alt="FPT University Logo" className="h-8 w-auto inline-block mr-2" />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#about" className="text-gray-700 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium">
              Giới thiệu
            </a>
            <a href="/#programs" className="text-gray-700 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium">
              Chương trình
            </a>
            <a href="/#why-fpt" className="text-gray-700 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium">
              Tại sao chọn FPT
            </a>
            <a href="/#tuition" className="text-gray-700 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium">
              Học phí
            </a>
            {isLoggedIn && userProfile ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-[#ff6b35] font-medium text-sm hover:underline">
                  Xin chào {userProfile.firstName} {userProfile.lastName}!
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-[#ff6b35] px-3 py-2 text-sm font-medium">
                Đăng nhập
              </Link>
            )}
            <button
              onClick={handleAppointmentClick}
              className="bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-[#ff8c42] transition-colors"
            >
              Tư vấn
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button className="text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

