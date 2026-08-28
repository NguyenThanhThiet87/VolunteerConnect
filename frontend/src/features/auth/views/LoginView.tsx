import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { authApi } from '../api/authApi';
import { USE_REAL_BACKEND } from '../../../config/backend';

interface LoginViewProps {
  onNavigateToRegister?: () => void;
  onNavigateToOTP?: (email: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigateToRegister = () => {
    window.location.hash = '#/register';
  },
  onNavigateToOTP = (email: string) => {
    window.location.hash = `#/verify-otp?email=${encodeURIComponent(email)}`;
  }
}) => {
  const { users, loginAs, setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showVerifyLink, setShowVerifyLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setErrorMsg('');
    setShowVerifyLink(false);
    setLoading(true);

    if (USE_REAL_BACKEND) {
      try {
        const { token, user } = await authApi.login(email.trim(), password);
        localStorage.setItem('token', token);
        setCurrentUser(user);
        if (user.role === 'Admin') {
          window.location.hash = '#/admin/dashboard';
        } else {
          window.location.hash = '#/feed';
        }
      } catch (err: any) {
        let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = detail.map((d: any) => d.msg).join('\n');
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        }
        setErrorMsg(msg);

        // Detect 403 activation required
        if (
          err.response?.status === 403 ||
          msg.toLowerCase().includes('xác thực') ||
          msg.toLowerCase().includes('otp')
        ) {
          setShowVerifyLink(true);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock local login simulation
    const user = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      setCurrentUser(user);
      if (user.role === 'Admin') {
        window.location.hash = '#/admin/dashboard';
      } else {
        window.location.hash = '#/feed';
      }
    } else {
      setErrorMsg('Tài khoản không tồn tại trong hệ thống mô phỏng.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl w-full max-w-md space-y-6 animate-scaleUp text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#e8f5e9] text-[#006d37] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-3xl font-bold">lock_open</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-headline-md tracking-tight">
            Đăng nhập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Chào mừng bạn quay trở lại với Volunteer Connect
          </p>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
            <div className="flex-1 space-y-1">
              <div>{errorMsg}</div>
              {showVerifyLink && (
                <button
                  type="button"
                  onClick={() => onNavigateToOTP(email.trim())}
                  className="text-[#006d37] hover:underline font-bold block pt-1 cursor-pointer border-none bg-transparent p-0"
                >
                  Nhấp vào đây để xác thực mã OTP ngay &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <a
                href="#/forgot-password"
                className="text-xs text-[#006d37] hover:underline font-bold"
              >
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent p-0"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#006d37] hover:bg-[#005027] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Chuyển nhanh tài khoản mẫu
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => loginAs('Volunteer')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Tình nguyện viên
            </button>
            <button
              type="button"
              onClick={() => loginAs('Organizer')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Ban tổ chức
            </button>
            <button
              type="button"
              onClick={() => loginAs('Admin')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Quản trị viên
            </button>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center text-xs font-semibold text-slate-500 pt-2">
          Chưa có tài khoản?{' '}
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="text-[#006d37] hover:underline font-bold cursor-pointer border-none bg-transparent p-0"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
