'use client';

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "../components/AnimatedSection";
import Carousel from "../components/Carousel";
import { useState, useRef, useEffect } from "react";
import { isAuthenticated, fetchUserProfile, getStoredUserProfile, logout, UserProfile } from "../utils/auth";
import { useRouter } from 'next/navigation';
import {SERVICE_URLS} from '../utils/services';
import Header from "../components/Header";

export default function Home() {
  const [showBubble, setShowBubble] = useState(true);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check authentication status and fetch user profile on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        let profile = getStoredUserProfile();
        if (!profile) {
          // Nếu chưa có profile, fetch từ API backend
          const fetchApi = (await import('../utils/auth')).fetchUserProfileFromApi;
          if (fetchApi) {
            profile = await fetchApi();
          }
        }
        if (profile) {
          setUserProfile(profile);
        } else {
          // Nếu không lấy được profile, coi như chưa đăng nhập
          setIsLoggedIn(false);
          setUserProfile(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    };
    // Lắng nghe sự thay đổi của access_token trong localStorage
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
  };

  const handleAppointmentClick = () => {
    if (isAuthenticated()) {
      router.push('/appointment');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Navigation đã chuyển sang component Header */}

      {/* Hero Section */}
      <AnimatedSection animation="fadeIn" duration={800}>
        <section className="bg-gradient-to-br from-[#fff5f2] to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection animation="slideLeft" delay={300}>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                    Chào mừng đến với kênh tuyển sinh
                    <span className="text-[#ff6b35] block">FPT University</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Trường Đại học FPT - Môi trường giáo dục hiện đại, nơi đào tạo những nhân tài công nghệ 
                    và kinh doanh tương lai. Với phương pháp giảng dạy tiên tiến và kết nối chặt chẽ với doanh nghiệp.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAppointmentClick}
                      className="bg-[#ff6b35] text-white px-8 py-4 rounded-lg hover:bg-[#ff8c42] transition-colors font-semibold text-lg"
                    >
                      Đăng ký tư vấn
                    </button>
                    <button
                    onClick={() => router.push('/request-tickets')}
                    className="border-2 border-[#ff6b35] text-[#ff6b35] px-8 py-4 rounded-lg hover:bg-[#ff6b35] hover:text-white transition-colors font-semibold text-lg"
                  >
                    Gửi ticket
                  </button>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="slideRight" delay={600}>
                <div className="relative">
                  <Carousel
                    images={[
                      '/fpt_about/fpt1.jpg',
                      '/fpt_about/fpt2.jpg',
                      '/fpt_about/fpt3.jpg',
                      '/fpt_about/fpt4.jpg',
                      '/fpt_about/fpt5.jpg'
                    ]}
                    autoSlideInterval={3000}
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection animation="slideUp">
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeIn" delay={200}>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Về FPT University</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Đại học FPT được thành lập với sứ mệnh đào tạo những thế hệ kỹ sư công nghệ và chuyên gia kinh doanh 
                  có tư duy sáng tạo, kỹ năng thực tiễn cao.
                </p>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection animation="slideUp" delay={400}>
                <div className="text-center">
                  <div className="bg-[#fff5f2] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Image src="/icon-innovation.svg" alt="Innovation" width={40} height={40} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Đổi mới sáng tạo</h3>
                  <p className="text-gray-600">
                    Phương pháp giảng dạy tiên tiến, ứng dụng công nghệ hiện đại trong từng bài học.
                  </p>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="slideUp" delay={600}>
                <div className="text-center">
                  <div className="bg-[#fff5f2] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Image src="/icon-practice.svg" alt="Practice" width={40} height={40} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Thực hành cao</h3>
                  <p className="text-gray-600">
                    80% thời gian học tập dành cho thực hành, làm dự án thực tế với doanh nghiệp.
                  </p>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="slideUp" delay={800}>
                <div className="text-center">
                  <div className="bg-[#fff5f2] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Image src="/icon-career.svg" alt="Career" width={40} height={40} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Việc làm đảm bảo</h3>
                  <p className="text-gray-600">
                    Cam kết việc làm sau tốt nghiệp với mức lương cạnh tranh từ các đối tác doanh nghiệp.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Programs Section */}
      <AnimatedSection animation="slideUp">
        <section id="programs" className="py-20 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeIn" delay={200}>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Chương trình đào tạo</h2>
                <p className="text-xl text-gray-600">
                  Các chương trình được thiết kế phù hợp với nhu cầu thị trường lao động hiện tại
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* IT Program */}
              <AnimatedSection animation="scaleIn" delay={300}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                    <Image src="/fpt_major/major1.jpg" alt="IT Program" width={300} height={200} className="rounded-lg w-full h-48 object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Công nghệ Thông tin</h3>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6">
                    <li>• Lập trình phần mềm</li>
                    <li>• An toàn thông tin</li>
                    <li>• Trí tuệ nhân tạo</li>
                    <li>• Khoa học dữ liệu</li>
                  </ul>
                  <button className="text-[#ff6b35] font-semibold hover:text-[#ff8c42]">
                    Tìm hiểu thêm →
                  </button>
                </div>
              </AnimatedSection>

              {/* Business Program */}
              <AnimatedSection animation="scaleIn" delay={500}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                    <Image src="/fpt_major/major2.jpeg" alt="Business Program" width={300} height={200} className="rounded-lg w-full h-48 object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Kinh doanh</h3>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6">
                    <li>• Quản trị kinh doanh</li>
                    <li>• Marketing số</li>
                    <li>• Thương mại điện tử</li>
                    <li>• Khởi nghiệp</li>
                  </ul>
                  <button className="text-[#ff6b35] font-semibold hover:text-[#ff8c42]">
                    Tìm hiểu thêm →
                  </button>
                </div>
              </AnimatedSection>

              {/* Design Program */}
              <AnimatedSection animation="scaleIn" delay={700}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                    <Image src="/fpt_major/major3.jpg" alt="Design Program" width={300} height={200} className="rounded-lg w-full h-48 object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Thiết kế</h3>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6">
                    <li>• Thiết kế đồ họa</li>
                    <li>• UX/UI Design</li>
                    <li>• Animation</li>
                    <li>• Game Design</li>
                  </ul>
                  <button className="text-[#ff6b35] font-semibold hover:text-[#ff8c42]">
                    Tìm hiểu thêm →
                  </button>
                </div>
              </AnimatedSection>

              {/* Language Program */}
              <AnimatedSection animation="scaleIn" delay={900}>
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                    <Image src="/fpt_major/major4.jpeg" alt="Language Program" width={300} height={200} className="rounded-lg w-full h-48 object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Ngôn ngữ</h3>
                  <ul className="text-gray-600 text-sm space-y-2 mb-6">
                    <li>• Tiếng Anh</li>
                    <li>• Tiếng Nhật</li>
                    <li>• Tiếng Hàn</li>
                    <li>• Tiếng Trung</li>
                  </ul>
                  <button className="text-[#ff6b35] font-semibold hover:text-[#ff8c42]">
                    Tìm hiểu thêm →
                  </button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Why Choose FPT Section */}
      <AnimatedSection animation="slideUp">
        <section id="why-fpt" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeIn" delay={200}>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn FPT University?</h2>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection animation="slideLeft" delay={400}>
                <div>
                  <div className="space-y-8">
                    <div className="flex items-start">
                      <div className="bg-[#ff6b35] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                        <span className="text-white font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Giảng viên chất lượng cao</h3>
                        <p className="text-gray-600">100% giảng viên có kinh nghiệm thực tiễn từ các doanh nghiệp hàng đầu</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-[#ff6b35] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                        <span className="text-white font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cơ sở vật chất hiện đại</h3>
                        <p className="text-gray-600">Campus xanh với trang thiết bị học tập tiên tiến nhất</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-[#ff6b35] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                        <span className="text-white font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Kết nối doanh nghiệp</h3>
                        <p className="text-gray-600">Hơn 3000+ doanh nghiệp đối tác, đảm bảo cơ hội thực tập và việc làm</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-[#ff6b35] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                        <span className="text-white font-bold">4</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Môi trường quốc tế</h3>
                        <p className="text-gray-600">Cơ hội học tập và làm việc tại các quốc gia phát triển</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideRight" delay={600}>
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-3xl p-8">
                    <Image
                      src="/fpt_about/fpt6.jpg"
                      alt="Why Choose FPT"
                      width={600}
                      height={500}
                      className="rounded-2xl w-full h-auto"
                    />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Tuition Section */}
      <AnimatedSection animation="slideUp">
        <section id="tuition" className="py-20 bg-[#f8f9fa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection animation="fadeIn" delay={200}>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Học phí & Ưu đãi</h2>
                <p className="text-xl text-gray-600">Chính sách học phí linh hoạt và nhiều ưu đãi hấp dẫn</p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedSection animation="scaleIn" delay={400}>
                <div className="bg-white rounded-xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Học phí chuẩn</h3>
                  <div className="text-3xl font-bold text-[#ff6b35] mb-4">550.000đ/tín chỉ</div>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Chương trình đào tạo chất lượng</li>
                    <li>• Hỗ trợ học bổng theo thành tích</li>
                    <li>• Trả góp 0% lãi suất</li>
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="scaleIn" delay={600}>
                <div className="bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-xl p-8 shadow-xl text-white relative">
                  <div className="absolute top-4 right-4 bg-white text-[#ff6b35] px-3 py-1 rounded-full text-sm font-semibold">
                    Phổ biến
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Ưu đãi sớm</h3>
                  <div className="text-3xl font-bold mb-4">450.000đ/tín chỉ</div>
                  <ul className="space-y-2">
                    <li>• Giảm 100.000đ/tín chỉ</li>
                    <li>• Học bổng đến 100%</li>
                    <li>• Ưu tiên chọn lớp</li>
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="scaleIn" delay={800}>
                <div className="bg-white rounded-xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Học bổng xuất sắc</h3>
                  <div className="text-3xl font-bold text-[#ff6b35] mb-4">Miễn phí</div>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Điểm thi THPT từ 27/30</li>
                    <li>• Học sinh giỏi cấp tỉnh</li>
                    <li>• Tài năng đặc biệt</li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Contact/Registration Section */}
      <AnimatedSection animation="slideUp">
        <section id="contact" className="py-20 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection animation="slideLeft" delay={300}>
                <div className="text-white">
                  <h2 className="text-4xl font-bold mb-6">Đăng ký tư vấn & Tham quan</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Để được tư vấn chi tiết về chương trình học và thủ tục tuyển sinh, 
                    hãy để lại thông tin liên hệ của bạn.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold">Hotline tư vấn</div>
                        <div className="opacity-90">1900 599 919</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-white bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold">Email tư vấn</div>
                        <div className="opacity-90">tuyensinh@fpt.edu.vn</div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection animation="slideRight" delay={600}>
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Đăng ký ngay</h3>
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                        placeholder="Nhập email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chương trình quan tâm
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent">
                        <option>Chọn chương trình</option>
                        <option>Công nghệ Thông tin</option>
                        <option>Kinh doanh</option>
                        <option>Thiết kế</option>
                        <option>Ngôn ngữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                        placeholder="Nhập ghi chú (nếu có)"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#ff6b35] text-white py-4 rounded-lg hover:bg-[#ff8c42] transition-colors font-semibold text-lg"
                    >
                      Đăng ký tư vấn
                    </button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-[#ff6b35] mb-4">FPT University</div>
              <p className="text-gray-400 mb-4">
                Đại học FPT - Nơi khởi nguồn tương lai
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#ff6b35]">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-[#ff6b35]">YouTube</a>
                <a href="#" className="text-gray-400 hover:text-[#ff6b35]">LinkedIn</a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Chương trình</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#ff6b35]">Công nghệ Thông tin</a></li>
                <li><a href="#" className="hover:text-[#ff6b35]">Kinh doanh</a></li>
                <li><a href="#" className="hover:text-[#ff6b35]">Thiết kế</a></li>
                <li><a href="#" className="hover:text-[#ff6b35]">Ngôn ngữ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#ff6b35]">Tuyển sinh</a></li>
                <li><a href="#" className="hover:text-[#ff6b35]">Học phí</a></li>
                <li><a href="#" className="hover:text-[#ff6b35]">Học bổng</a></li>
                <li><a href="#" className="hover:text-[#ff6b35]">Câu hỏi thường gặp</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <div className="space-y-2 text-gray-400">
                <p>Hotline: 1900 599 919</p>
                <p>Email: tuyensinh@fpt.edu.vn</p>
                <p>Địa chỉ: Khu CNC Hòa Lạc, Thạch Thất, Hà Nội</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2025 FPT University. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-[#ff6b35]">Chính sách bảo mật</a>
                <a href="#" className="text-gray-400 hover:text-[#ff6b35]">Điều khoản sử dụng</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Bubble - Info */}
        {showBubble && (
          <div className="absolute bottom-20 right-0 bg-white border border-gray-200 rounded-lg p-4 shadow-lg w-72 animate-bounce">
            <div className="text-base text-gray-700 font-medium">
              Bấm vào đây để trò chuyện cùng FPT.AI
            </div>
            <div className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
            <button 
              onClick={() => setShowBubble(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>
        )}

        {/* Chat Button - Navigate to Chatbot Page */}
        <Link 
          href="/chatbot"
          className="bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group p-2"
        >
          <Image 
            src="/logo.png" 
            alt="FPT Chat" 
            width={64} 
            height={64}
            className="group-hover:scale-110 transition-transform duration-300"
          />
        </Link>
      </div>
    </div>
  );
}
