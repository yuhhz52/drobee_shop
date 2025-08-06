import React, { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../store/features/common';
import { verifyAPI } from '../../api/authencation.js';
import { useNavigate } from 'react-router-dom';

const VerifyCode = ({ email }) => {
  const inputRefs = useRef([]);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const focusNext = (index) => {
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const focusPrev = (index) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value) focusNext(index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index]) {
      focusPrev(index);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5].focus();
    }
  };

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');
    const finalCode = code.join('');
    if (finalCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    dispatch(setLoading(true));
    verifyAPI({ userName: email, code: finalCode })
      .then(() => {
        sessionStorage.setItem('verifiedSuccess', 'true'); 
        navigate('/v1/login'); // chuyển đến login
      })
      .catch(() => {
        // Thông báo lỗi và giữ nguyên trang
        setError('Mã xác thực không đúng hoặc đã hết hạn.');
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  }, [dispatch, code, email, navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-cover bg-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-[400px] z-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Cần Được Xác Thực</h2>
        <p className="text-gray-600 mb-2">
          Nhập mã chúng tôi đã gửi đến <span className="font-semibold">{email.replace(/(?<=.).(?=.*@)/g, '*')}</span>
        </p>

        <form onSubmit={onSubmit} className="flex flex-col items-center gap-4 mt-4">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => inputRefs.current[i] = el}
                className="w-12 h-12 border border-gray-400 rounded text-center text-xl"
              />
            ))}
          </div>
          <br />
          <button type="submit" className="bg-black text-white h-12 w-full rounded hover:bg-gray-800 transition">
            Xác thực
          </button>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>

        <div className="mt-6">
          <button className="text-blue-600 hover:underline text-sm">Gửi lại mã</button>
          <p className="text-xs text-gray-500 mt-1">Không thể truy cập địa chỉ email đó?</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
