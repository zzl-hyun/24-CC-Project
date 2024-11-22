/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from 'react-modal';
import axios from 'axios';
import './signInModal.css';

Modal.setAppElement('#root');

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

const SignInModal = ({ isOpen, onClose }) => {
  const [id, setId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [isFading, setIsFading] = useState(false);

  const handleModeSwitch = (newMode) => {
    setIsFading(true);
    setTimeout(() => {
      setMode(newMode);
      setIsFading(false);
    }, 500); // 애니메이션 시간과 동일하게 설정
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        id: parseInt(id, 10),
        password,
      });
      alert('로그인이 성공했습니다.');
      onClose();
    } catch (error) {
      setError('Invalid ID or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/register', {
        id: parseInt(id, 10),
        username,
        password,
        bio: bio || '',
      });
      alert('회원가입이 성공했습니다.');
      onClose();
    } catch (error) {
      setError('Username already exists or invalid data.');
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
        <button onClick={onClose} className="modal-close-button">
          <X size={24} />
        </button>
      </div>
      <div css={modalContainerStyle}>
        {mode === 'login' ? (
          <form css={formStyle(isFading)} onSubmit={handleLogin}>
            <div>
              <label htmlFor="id">ID</label>
              <input
                type="number"
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                placeholder="아이디를 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
                className="modal-input-field"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="modal-login-button">로그인</button>
            <div id='modal-switch' >Already have an account? <b onClick={() => setMode('register')}>Sign up</b></div>
          </form>
        ) : (
          <form css={formStyle(isFading)} onSubmit={handleRegister}>
            <div>
              <label htmlFor="id">ID</label>
              <input
                type="number"
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                placeholder="아이디를 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="이름을 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력하세요"
                className="modal-input-field"
              />
            </div>
            <div>
              <label htmlFor="bio">Bio</label>
              <input
                type="text"
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자기소개를 입력하세요"
                className="modal-input-field"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="modal-register-button">Register</button>
            <div id='modal-switch' >Already have an account? <b onClick={() => setMode('login')}>Sign in</b></div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default SignInModal;
