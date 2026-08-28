import React, { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { OTPInput } from '../components/OTPInput';
import { USE_REAL_BACKEND } from '../../../config/backend';

interface OTPVerifyViewProps {
  phoneNumber?: string;
  email?: string;
  flow?: 'register' | 'forgot_password';
  onVerifySuccess?: () => void;
  onBackToLogin?: () => void;
}

export const OTPVerifyView: React.FC<OTPVerifyViewProps> = ({
  phoneNumber = '',
  email = '',
  flow = 'register',
  onVerifySuccess = () => {
    window.location.hash = '#/login';
  },
  onBackToLogin = () => {
    window.location.hash = '#/login';
  }
}) => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const getOtpCode = () => otpDigits.join('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = getOtpCode();
    if (code.length < 6 || loading) return;

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (USE_REAL_BACKEND) {
      try {
        if (flow === 'forgot_password') {
          await authApi.verifyResetOtp(email || phoneNumber, code);
        } else {
          await authApi.verifyOtp(email || phoneNumber, code);
        }
        setSuccessMsg('Xác thực tài khoản thành công!');
        setTimeout(() => {
          onVerifySuccess();
        }, 1500);
      } catch (err: any) {
        let msg = 'Mã OTP không chính xác hoặc đã hết hạn.';
        if (err.response?.data?.detail) {
          msg = typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail);
        } else if (err.response?.data?.message) {
          msg = err.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mock fallback verification
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);

    if (code === '123456') {
      setSuccessMsg('Xác thực tài khoản thành công!');
      setTimeout(() => {
        onVerifySuccess();
      }, 1500);
    } else {
      setErrorMsg('Mã OTP không chính xác. Mã hợp lệ thử nghiệm là: 123456');
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (USE_REAL_BACKEND) {
      try {
        setLoading(true);
        await authApi.resendOtp(email || phoneNumber);
        setSuccessMsg('Đã gửi lại mã OTP thành công. Vui lòng kiểm tra hòm thư!');
        setCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.detail || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setSuccessMsg('Mã OTP mới (123456) đã được gửi lại tới email/SĐT của bạn.');
    setCountdown(60);
    setOtpDigits(['', '', '', '', '', '']);
  };

  const displayTarget = email || phoneNumber;

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
            <h1 className="text-2xl font-bold text-gray-900 font-headline-md">Xác thực mã OTP</h1>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Mã xác thực gồm 6 chữ số đã được gửi tới địa chỉ{' '}
              <span className="font-bold text-gray-800">{displayTarget}</span>
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

        {/* OTP Input Form */}
        <form className="space-y-6" onSubmit={handleVerify}>
          <OTPInput
            digits={otpDigits}
            onChange={setOtpDigits}
            disabled={loading}
          />

          <div className="flex justify-center pt-2">
            <button
              className="bg-[#006d37] hover:bg-[#005027] text-white font-semibold rounded-full px-8 py-2.5 text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
              type="submit"
              disabled={getOtpCode().length < 6 || loading}
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
            </button>
          </div>
        </form>

        {/* Resend and Navigation */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-xs text-gray-500 font-medium">
            Chưa nhận được mã?{' '}
            {countdown > 0 ? (
              <span className="text-gray-400 font-semibold">Gửi lại sau {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-[#006d37] hover:underline font-bold transition-colors cursor-pointer"
              >
                Gửi lại mã ngay
              </button>
            )}
          </p>

          <div>
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
    </div>
  );
};

export default OTPVerifyView;
