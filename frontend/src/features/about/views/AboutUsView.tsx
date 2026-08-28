import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { adminApi } from '../../admin/api/adminApi';
import { AnimatedCounter } from '../../../shared/components/ui/AnimatedCounter';
import { TeamMarquee } from '../components/TeamMarquee';

export const AboutUsView: React.FC = () => {
  const { currentUser, organizerRequests } = useApp();

  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalVolunteers: 0,
    totalOrganizers: 0,
    totalCompleted: 0
  });

  useEffect(() => {
    adminApi
      .getGlobalStats()
      .then((data) => {
        setStats({
          totalCampaigns: data.totalCampaigns || 0,
          totalVolunteers: data.totalVolunteers || 0,
          totalOrganizers: data.totalOrganizers || 0,
          totalCompleted: data.totalCompleted || 0
        });
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err);
      });
  }, []);

  let showOrganizerButton = false;
  if (currentUser && currentUser.role === 'Volunteer') {
    const userRequest = organizerRequests.find(
      (r) => r.volunteer_id === currentUser._id
    );
    const isPending = userRequest?.status === 'Pending';
    const isRejected = userRequest?.status === 'Rejected';

    let inCooldown = false;
    if (isRejected && userRequest) {
      const diffHours =
        (new Date().getTime() - new Date(userRequest.created_at).getTime()) /
        (1000 * 60 * 60);
      if (diffHours < 24) {
        inCooldown = true;
      }
    }

    if (!isPending && !inCooldown) {
      showOrganizerButton = true;
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
          }
          .animate-scroll {
              display: flex;
              width: max-content;
              animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
              animation-play-state: paused;
          }
          .hide-scroll-bar::-webkit-scrollbar {
              display: none;
          }
          .hide-scroll-bar {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}
      </style>

      <div className="w-full bg-[#f8f9fa] min-h-screen pb-16 text-left antialiased font-body-md">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 space-y-10">
          {/* 1. Hero Section */}
          <section className="relative rounded-2xl bg-gradient-to-br from-[#1a56db] via-[#2563eb] to-[#006d37] overflow-hidden p-8 md:p-14 text-center shadow-lg">
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-headline-md tracking-tight leading-tight">
                Kết nối sức trẻ
                <br />
                <span className="text-emerald-300">Kiến tạo tương lai</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                Nơi hội tụ những trái tim nhiệt huyết, cùng chung tay lan tỏa giá trị nhân văn và xây dựng cộng đồng phát triển bền vững.
              </p>
            </div>
          </section>

          {/* 2. Our Story */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/60 hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[#006d37] font-bold uppercase tracking-widest mb-3 block text-xs">
                  Câu chuyện của chúng tôi
                </span>
                <h2 className="text-[1.35rem] sm:text-2xl md:text-[1.65rem] lg:text-3xl font-bold text-[#1a56db] mb-4 font-headline-md tracking-tight">
                  Hành trình kết nối cộng đồng
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed text-justify">
                  Volunteer Connector bắt đầu từ một ý tưởng đơn giản: Làm sao để việc giúp đỡ người khác trở nên dễ dàng và minh bạch hơn? Chúng tôi nhận thấy có hàng ngàn bạn trẻ khao khát cống hiến nhưng không biết bắt đầu từ đâu, trong khi các tổ chức xã hội lại gặp khó khăn trong việc tìm kiếm nguồn lực tin cậy.
                </p>
                <p className="text-gray-600 leading-relaxed text-justify">
                  Đó là lý do chúng tôi xây dựng nền tảng này — một không gian nơi mỗi hành động nhỏ bé đều được trân trọng và ghi nhận, nơi tình nguyện không chỉ là công việc, mà là một hành trình khám phá bản thân và kết nối cộng đồng.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-auto lg:h-full min-h-[300px]">
                <img
                  alt="Co-founder at work"
                  className="w-full h-full object-cover"
                  src="https://toplist.vn/images/800px/ban-se-thay-doi-cuoc-doi-nguoi-khac-va-chinh-ban-85433.jpg"
                />
              </div>
            </div>
          </section>

          {/* 3. Our Mission & Vision */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1a56db] to-[#3b82f6] p-6 md:p-8 rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-xl">flag</span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-headline-md">Sứ mệnh</h3>
              <p className="opacity-95 leading-relaxed text-sm md:text-base">
                Kết nối con người với những mục đích ý nghĩa, hỗ trợ các tổ chức tối ưu hóa nguồn lực và xây dựng một cộng đồng phát triển bền vững dựa trên tinh thần tự nguyện.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#006d37] to-[#10b981] p-6 md:p-8 rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-xl">visibility</span>
              </div>
              <h3 className="text-xl font-bold mb-2 font-headline-md">Tầm nhìn</h3>
              <p className="opacity-95 leading-relaxed text-sm md:text-base">
                Trở thành nền tảng tình nguyện hàng đầu khu vực, nơi ứng dụng công nghệ để nâng tầm các hoạt động xã hội và lan tỏa giá trị nhân văn đến mọi ngóc ngách của đời sống.
              </p>
            </div>
          </section>

          {/* 4. Team Section */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/60 text-center">
            <h2 className="text-2xl font-bold text-[#1a56db] mb-4 font-headline-md">
              Đội ngũ thực hiện dự án
            </h2>
            <p className="text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              Đứng sau Volunteer Connect là những bạn trẻ đam mê công nghệ và khao khát mang lại những giá trị tích cực cho cộng đồng. Chúng tôi luôn nỗ lực không ngừng để tạo ra một nền tảng hữu ích nhất.
            </p>
            <TeamMarquee />
          </section>

          {/* 5. Impact Section */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100/60 text-center">
            <h2 className="text-2xl font-bold text-[#1a56db] mb-8 font-headline-md">
              Cộng đồng đang lớn mạnh
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1a56db] mb-1">
                  <AnimatedCounter target={stats.totalVolunteers || 120} />+
                </div>
                <div className="text-gray-500 font-bold text-sm">Tình nguyện viên</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1a56db] mb-1">
                  <AnimatedCounter target={stats.totalCampaigns || 45} />+
                </div>
                <div className="text-gray-500 font-bold text-sm">Hoạt động đã đăng</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1a56db] mb-1">
                  <AnimatedCounter target={stats.totalOrganizers || 15} />+
                </div>
                <div className="text-gray-500 font-bold text-sm">Tổ chức đối tác</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#1a56db] mb-1">
                  <AnimatedCounter target={stats.totalCompleted || 32} />+
                </div>
                <div className="text-gray-500 font-bold text-sm">Dự án hoàn thành</div>
              </div>
            </div>
          </section>

          {/* 6. Call to Action */}
          {showOrganizerButton && (
            <section className="bg-gradient-to-r from-emerald-600 to-[#006d37] rounded-2xl p-8 text-center text-white space-y-4 shadow-md">
              <h2 className="text-2xl md:text-3xl font-extrabold">Bạn muốn tạo chiến dịch riêng?</h2>
              <p className="max-w-xl mx-auto text-white/90 text-sm md:text-base">
                Trở thành Nhà tổ chức để khởi xướng các hoạt động thiện nguyện và huy động nguồn lực từ cộng đồng.
              </p>
              <a
                href="#/request-organizer"
                className="inline-block bg-white text-[#006d37] hover:bg-slate-100 font-bold px-8 py-3 rounded-full text-sm transition-all shadow-sm"
              >
                Đăng ký trở thành Nhà tổ chức
              </a>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default AboutUsView;
