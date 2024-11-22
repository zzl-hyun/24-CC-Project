import React, { useState } from 'react';
import { X } from 'lucide-react';
import Modal from 'react-modal';
import axios from 'axios';
import './signInModal.css';

Modal.setAppElement('#root'); // Ensure this is set for accessibility

const SignInModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(''); // 에러 메시지 초기화
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/register', {
        username,
        password,
        bio,
      });
      console.log('Registration successful:', response.data);
      alert('회원가입이 성공했습니다.');
      onClose();
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      setError('Username already exists or invalid data.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/login', {
        username,
        password,
      });
      console.log('Login successful:', response.data);
      alert('로그인이 성공했습니다.');
      onClose();
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setError('Invalid username or password.');
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
        <h2 className="modal-title">{isLogin ? 'Login' : 'Register'}</h2>
        <button onClick={onClose} className="modal-close-button">
          <X size={24} />
        </button>
      </div>
      <form
        className={`modal-form ${isLogin ? 'fadeIn' : 'fadeOut'}`}
        onSubmit={isLogin ? handleLogin : handleRegister}
      >
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="사용자 이름"
            className="modal-input-field"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="비밀번호"
            className="modal-input-field"
          />
        </div>
        {!isLogin && (
          <div>
            <label htmlFor="bio">Bio (선택 사항)</label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="간단한 소개를 입력하세요"
              className="modal-input-field"
            ></textarea>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="modal-login-button">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="modal-additional-links">
        <button onClick={toggleForm} className="toggle-link">
          {isLogin ? '회원가입' : '로그인'} 화면으로 전환
        </button>
      </div>
    </Modal>
  );
};

export default SignInModal;
