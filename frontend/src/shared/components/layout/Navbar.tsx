import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import logoImg from '../../../assets/logo.png';
import { Avatar } from '../ui/Avatar';

export const Navbar: React.FC = () => {
  const { currentUser, logout, organizerRequests } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const currentHash = window.location.hash || '#/feed';

  const userRequest = currentUser
    ? organizerRequests.find((r) => r.volunteer_id === currentUser._id)
    : undefined;
  const isPending = userRequest?.status === 'Pending';
  const isRejected = userRequest?.status === 'Rejected';

  let inCooldown = false;
  if (isRejected && userRequest) {
    const diffHours =
      (new Date().getTime() - new Date(userRequest.created_at).getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      inCooldown = true;
    }
  }

  const isActive = (hash: string) => currentHash.startsWith(hash);

  const navLinkClass = (hash: string) =>
    `font-semibold py-1.5 px-3 rounded-full transition-all duration-200 ${
      isActive(hash)
        ? 'text-[#006d37] bg-[#e8f5e9]'
        : 'text-on-surface-variant hover:text-[#006d37] hover:bg-surface-container-low'
    }`;

  return (
    <header className="bg-surface sticky top-0 z-50 w-full border-b border-surface-variant shadow-sm transition-all duration-200">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full max-w-[1280px] mx-auto h-[72px]">
        {/* Left: Brand/Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#/feed"
            className="font-headline-md text-xl text-[#006d37] font-bold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <img src={logoImg} alt="Volunteer Connect Logo" className="h-9 w-auto object-contain shrink-0" />
            <span className="tracking-tight select-none">Volunteer Connect</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex flex-row items-center gap-3 shrink-0">
          <a className={navLinkClass('#/feed')} href="#/feed">Trang chủ</a>
          <a className={navLinkClass('#/activities')} href="#/activities">Hoạt động</a>
          <a className={navLinkClass('#/posts')} href="#/posts">Bài đăng</a>
          <a className={navLinkClass('#/about')} href="#/about">Về chúng tôi</a>
          {currentUser && currentUser.role === 'Volunteer' && (
            <a className={navLinkClass('#/my-registrations')} href="#/my-registrations">Đăng ký của tôi</a>
          )}
        </nav>

        {/* Right side: Actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {currentUser ? (
            <>
              {/* Action button based on role */}
              {currentUser.role === 'Volunteer' && !isPending && !inCooldown && (
                <a
                  href="#/request-organizer"
                  className="border border-[#006d37] text-[#006d37] hover:bg-[#e8f5e9] px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-sm"
                >
                  Xin quyền Tổ chức
                </a>
              )}
              {currentUser.role === 'Organizer' && (
                <a
                  href="#/organizer/dashboard"
                  className="border border-[#006d37] text-[#006d37] hover:bg-[#e8f5e9] px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-sm"
                >
                  Khu vực Tổ chức
                </a>
              )}

              {/* User profile & Avatar Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/50 focus:outline-none cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden bg-surface-container-high shrink-0 hover:scale-105 active:scale-95 transition-all">
                    <Avatar
                      name={currentUser.profile.full_name}
                      src={currentUser.profile.avatar_url}
                      size={40}
                    />
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-on-surface line-clamp-1 max-w-[120px]">
                      {currentUser.profile.full_name}
                    </div>
                    <div className="text-[10px] text-on-surface-variant capitalize">
                      {currentUser.role === 'Volunteer'
                        ? 'Tình nguyện viên'
                        : currentUser.role === 'Organizer'
                        ? 'Nhà tổ chức'
                        : 'Quản trị viên'}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-lg">
                    {profileDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-xl border border-surface-variant/40 py-2 z-20 animate-scaleUp">
                      <div className="px-4 py-3 border-b border-surface-variant/40">
                        <p className="text-xs text-on-surface-variant font-medium">Đăng nhập với</p>
                        <p className="text-xs font-bold text-on-surface truncate mt-0.5">
                          {currentUser.email || currentUser.phone}
                        </p>
                      </div>

                      <div className="py-1">
                        <a
                          href="#/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors font-medium"
                        >
                          <span className="material-symbols-outlined text-primary text-base">person</span>
                          Hồ sơ cá nhân
                        </a>

                        {currentUser.role === 'Volunteer' && (
                          <a
                            href="#/my-registrations"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors font-medium"
                          >
                            <span className="material-symbols-outlined text-primary text-base">fact_check</span>
                            Đăng ký của tôi
                          </a>
                        )}

                        {currentUser.role === 'Volunteer' && !isPending && !inCooldown && (
                          <a
                            href="#/request-organizer"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors font-medium"
                          >
                            <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                            Xin quyền Tổ chức
                          </a>
                        )}

                        {currentUser.role === 'Organizer' && (
                          <a
                            href="#/organizer/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors font-medium"
                          >
                            <span className="material-symbols-outlined text-primary text-base">dashboard</span>
                            Khu vực Tổ chức
                          </a>
                        )}

                        {currentUser.role === 'Admin' && (
                          <a
                            href="#/admin/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-low transition-colors font-medium"
                          >
                            <span className="material-symbols-outlined text-primary text-base">admin_panel_settings</span>
                            Trang quản trị
                          </a>
                        )}
                      </div>

                      <div className="border-t border-surface-variant/40 pt-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-error hover:bg-error-container/20 transition-colors font-medium text-left cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">logout</span>
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="#/login"
                className="font-semibold text-xs text-[#006d37] hover:bg-[#e8f5e9] px-4 py-2 rounded-full transition-all border border-[#006d37]"
              >
                Đăng nhập
              </a>
              <a
                href="#/register"
                className="font-semibold text-xs bg-[#006d37] text-white hover:bg-[#005a2d] px-4 py-2 rounded-full transition-all shadow-sm active:scale-95"
              >
                Đăng ký
              </a>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-variant/40 bg-surface px-4 pt-2 pb-6 space-y-3 shadow-lg animate-fadeIn">
          {currentUser && (
            <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl mb-2">
              <Avatar
                name={currentUser.profile.full_name}
                src={currentUser.profile.avatar_url}
                size={48}
              />
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-on-surface truncate">
                  {currentUser.profile.full_name}
                </div>
                <div className="text-xs text-on-surface-variant truncate">
                  {currentUser.email || currentUser.phone}
                </div>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            <a
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass('#/feed')}
              href="#/feed"
            >
              Trang chủ
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass('#/activities')}
              href="#/activities"
            >
              Hoạt động
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass('#/posts')}
              href="#/posts"
            >
              Bài đăng
            </a>
            <a
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass('#/about')}
              href="#/about"
            >
              Về chúng tôi
            </a>

            {currentUser && (
              <>
                <div className="border-t border-surface-variant/40 my-2 pt-2">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant px-3 mb-1 block tracking-wider">
                    Tài khoản
                  </span>
                  <a
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass('#/profile')}
                    href="#/profile"
                  >
                    Hồ sơ cá nhân
                  </a>

                  {currentUser.role === 'Volunteer' && (
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass('#/my-registrations')}
                      href="#/my-registrations"
                    >
                      Đăng ký của tôi
                    </a>
                  )}

                  {currentUser.role === 'Volunteer' && !isPending && !inCooldown && (
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass('#/request-organizer')}
                      href="#/request-organizer"
                    >
                      Xin quyền Tổ chức
                    </a>
                  )}

                  {currentUser.role === 'Organizer' && (
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass('#/organizer/dashboard')}
                      href="#/organizer/dashboard"
                    >
                      Khu vực Tổ chức
                    </a>
                  )}

                  {currentUser.role === 'Admin' && (
                    <a
                      onClick={() => setMobileMenuOpen(false)}
                      className={navLinkClass('#/admin/dashboard')}
                      href="#/admin/dashboard"
                    >
                      Trang quản trị
                    </a>
                  )}
                </div>
              </>
            )}
          </nav>

          <div className="pt-2 border-t border-surface-variant/40">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-error font-bold rounded-xl border border-error/20 bg-error/5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Đăng xuất
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <a
                  onClick={() => setMobileMenuOpen(false)}
                  href="#/login"
                  className="py-2.5 text-center font-bold text-xs text-[#006d37] border border-[#006d37] rounded-xl"
                >
                  Đăng nhập
                </a>
                <a
                  onClick={() => setMobileMenuOpen(false)}
                  href="#/register"
                  className="py-2.5 text-center font-bold text-xs bg-[#006d37] text-white rounded-xl shadow-sm"
                >
                  Đăng ký
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
