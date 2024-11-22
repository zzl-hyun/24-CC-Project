/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from 'react-modal';
import axios from 'axios';
import './signInModal.css';
import { toast } from 'react-toastify';
Modal.setAppElement('#root');

const SignInModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerId, setRegisterId] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerBio, setRegisterBio] = useState('');
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [isFading, setIsFading] = useState(false);
  const isLoginFormValid = loginId && loginPassword;
  const isRegisterFormValid = registerId && registerPassword && confirmRegisterPassword;

  const handleModeSwitch = (newMode, state) => {
    setIsFading(true);
    setMode(state);
    setTimeout(() => {
      setMode(newMode);
      setIsFading(false);
    }, 500); // 애니메이션 시간과 동일하게 설정
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoginFormValid) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:4000/login', {
        id: loginId, // `loginId` 사용
        password: loginPassword, // `loginPassword` 사용
      });
      toast.success('로그인이 성공했습니다.');
      localStorage.setItem('currentUser', loginId);
      onLoginSuccess(loginId); // 부모 컴포넌트에 로그인 성공 알림
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid ID or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isRegisterFormValid) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (registerPassword !== confirmRegisterPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:4000/register', {
        id: registerId, // `registerId` 사용
        password: registerPassword, // `registerPassword` 사용
        bio: registerBio || '', // `registerBio` 사용
      });
      toast.success('회원가입이 성공했습니다.');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'ID already exists or invalid data.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2 className="modal-title">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
      </div>
      <div css={modalContainerStyle}>
        {mode === 'login' ? (
          <form css={formStyle(isFading)} onSubmit={handleLogin}>
          <div>
            <label htmlFor="loginId">ID</label>
            <input
              type="text"
              id="loginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              placeholder="아이디를 입력하세요"
              className="modal-input-field"
            />
          </div>
          <div>
            <label htmlFor="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              placeholder="비밀번호를 입력하세요"
              className="modal-input-field"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="modal-login-button">로그인</button>
          <div id="modal-switch">
            Don't have an account?{' '}
            <b onClick={() => handleModeSwitch('register')}>Sign up</b>
          </div>
        </form>
        
        ) : (
          <form css={formStyle(isFading)} onSubmit={handleRegister}>
            <div>
              <label htmlFor="registerId">ID</label>
              <input
                type="text"
                id="registerId"
                value={registerId}
                onChange={(e) => setRegisterId(e.target.value)}
                required
                placeholder="아이디를 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="registerPassword">Password</label>
              <input
                type="password"
                id="registerPassword"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="confirmRegisterPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmRegisterPassword"
                value={confirmRegisterPassword}
                onChange={(e) => setConfirmRegisterPassword(e.target.value)}
                required
                placeholder="비밀번호를 다시 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="registerBio">Bio</label>
              <input
                type="text"
                id="registerBio"
                value={registerBio}
                onChange={(e) => setRegisterBio(e.target.value)}
                placeholder="자기소개를 입력하세요"
                className="modal-input-field"
              />
            </div>

            <button type="submit" className="modal-register-button">Register</button>
            <div id="modal-switch">
              Already have an account?{' '}
              <b onClick={() => handleModeSwitch('login')}>Sign in</b>
            </div>
          </form>

        )}
      </div>
    </Modal>
  );
};

export default SignInModal;


const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
`;

const modalContainerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const formStyle = (isFading) => css`
  animation: ${isFading ? fadeOut : fadeIn} 0.5s ease-in-out;
`;