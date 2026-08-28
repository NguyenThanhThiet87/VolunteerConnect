import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { authApi } from '../api/authApi';
import { OTPInput } from '../components/OTPInput';
import { USE_REAL_BACKEND } from '../../../config/backend';

interface ForgotPasswordViewProps {
  onBackToLogin?: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin = () => {
    window.location.hash = '#/login';
  }
}) => {
  const { users, showNotification } = useApp();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const getOtpCode = () => otpDigits.join('');

  // Countdown timer effect for Step 2
  useEffect(() => {
    if (step !== 2) return;

    setTimeLeft(300);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const verifyOtpCode = async (code: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (USE_REAL_BACKEND) {
        await authApi.verifyResetOtp(email.trim(), code);
      } else {
        if (code !== simulatedOtp) {
          throw new Error('Mã OTP không chính xác.');
        }
      }
      setStep(3);
    } catch (err: any) {
      let msg = 'Mã OTP không chính xác hoặc đã hết hạn.';
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail)) msg = detail.map((d: any) => d.msg).join('\n');
      else if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message) msg = err.message;
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (newDigits: string[]) => {
    setOtpDigits(newDigits);
    const code = newDigits.join('');
    if (code.length === 6) {
      setErrorMsg('');
      verifyOtpCode(code);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng điền địa chỉ email.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (USE_REAL_BACKEND) {
      try {
        const res = await authApi.forgotPassword(email.trim());
        setSuccessMsg(res.message || 'Mã OTP đã được gửi về email của bạn.');
        setStep(2);
      } catch (err: any) {
        let msg = 'Không thể yêu cầu mã OTP. Vui lòng kiểm tra lại email.';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') msg = detail;
        else if (Array.isArray(detail)) msg = detail.map((d: any) => d.msg).join('\n');
        else if (err.response?.data?.message) msg = err.response.data.message;
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // SIMULATED OFFLINE MODE
    const userExists = users.some((u) => u.email === email.trim());
    if (!userExists) {
      setErrorMsg('Email này không tồn tại trong hệ thống.');
      setLoading(false);
      return;
    }
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(mockOtp);
    showNotification(`[MÔ PHỎNG EMAIL] Mã OTP: ${mockOtp}`, 'info');
    setSuccessMsg('Mã OTP đã được gửi tới email của bạn.');
    setLoading(false);
    setStep(2);
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    if (USE_REAL_BACKEND) {
      try {
        const res = await authApi.forgotPassword(email.trim());
        setSuccessMsg(res.message || 'Mã OTP đã được gửi lại về email của bạn.');
        setTimeLeft(300);
      } catch (err: any) {
        let msg = 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') msg = detail;
        else if (err.response?.data?.message) msg = err.response.data.message;
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(mockOtp);
    showNotification(`[MÔ PHỎNG EMAIL] Mã OTP gửi lại: ${mockOtp}`, 'info');
    setSuccessMsg('Mã OTP mới đã được gửi tới email của bạn.');
    setTimeLeft(300);
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (USE_REAL_BACKEND) {
      try {
        const res = await authApi.resetPassword(email.trim(), getOtpCode(), newPassword);
        setSuccessMsg(res.message || 'Đặt lại mật khẩu thành công!');
        setTimeout(() => onBackToLogin(), 2000);
      } catch (err: any) {
        let msg = 'Mã OTP không chính xác hoặc đã hết hạn.';
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') msg = detail;
        else if (Array.isArray(detail)) msg = detail.map((d: any) => d.msg).join('\n');
        else if (err.response?.data?.message) msg = err.response.data.message;
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // SIMULATED OFFLINE MODE
    if (getOtpCode() !== simulatedOtp) {
      setErrorMsg('Mã OTP không chính xác.');
      setLoading(false);
      return;
    }
    const matchedUserIndex = users.findIndex((u) => u.email === email.trim());
    if (matchedUserIndex !== -1) {
      users[matchedUserIndex].password_hash = 'simulated_' + newPassword;
      setSuccessMsg('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
      setTimeout(() => onBackToLogin(), 2000);
    } else {
      setErrorMsg('Lỗi không xác định.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-8 text-left font-body-md">
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm w-full max-w-md px-8 py-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006d37] flex items-center justify-center text-white font-bold text-sm select-none">
              vc
            </div>
            <span className="text-[#006d37] font-bold text-lg tracking-tight font-headline-md">
              Volunteer Connect
            </span>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 font-headline-md">
              {step === 1
                ? 'Khôi phục mật khẩu'
                : step === 2
                ? 'Nhập mã xác thực OTP'
                : 'Tạo mật khẩu mới'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {step === 1
                ? 'Nhập email để nhận mã OTP khôi phục'
                : step === 2
                ? `Mã OTP đã gửi tới ${email}`
                : 'Nhập mật khẩu mới cho tài khoản của bạn'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-semibold leading-relaxed">
            {successMsg}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleRequestReset}>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="reset-email">
                Địa chỉ Email
              </label>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  style={{ fontSize: 18 }}
                >
                  mail
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/20 placeholder-gray-400 transition-all font-semibold"
                  id="reset-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvana@gmail.com"
                  required
                  type="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                className="bg-[#006d37] hover:bg-[#005027] text-white font-semibold rounded-full px-8 py-2.5 text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang gửi mã...' : 'Tiếp tục'}
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <div className="space-y-5">
            <OTPInput
              digits={otpDigits}
              onChange={handleOtpChange}
              disabled={loading}
            />

            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-sm">timer</span>
                {formatTime(timeLeft)}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || loading}
                className="text-[#006d37] hover:underline font-bold disabled:text-gray-400 disabled:no-underline cursor-pointer"
              >
                Gửi lại mã OTP
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="new-password">
                Mật khẩu mới
              </label>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  style={{ fontSize: 18 }}
                >
                  lock
                </span>
                <input
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/20 placeholder-gray-400 transition-all font-semibold"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showNewPw ? 'text' : 'password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showNewPw ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="confirm-new-password">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <span
                  className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  style={{ fontSize: 18 }}
                >
                  lock_reset
                </span>
                <input
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#006d37] focus:ring-2 focus:ring-[#006d37]/20 placeholder-gray-400 transition-all font-semibold"
                  id="confirm-new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type={showConfirmPw ? 'text' : 'password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showConfirmPw ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                className="bg-[#006d37] hover:bg-[#005027] text-white font-semibold rounded-full px-8 py-2.5 text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
              </button>
            </div>
          </form>
        )}

        {/* Back Link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-gray-500 hover:text-gray-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
