// SignInModal.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import Modal from 'react-modal';
import './signInModal.css';

Modal.setAppElement('#root'); // Ensure this is set for accessibility

const SignInModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    alert('로그인이 시도되었습니다.');
    onClose(); // 로그인 시도 후 모달 닫기
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2 className="modal-title">Login</h2>
        <button onClick={onClose} className="modal-close-button">
          <X size={24} />
        </button>
      </div>
      <form className="modal-login-form"  onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="email" >이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="이메일을 입력하세요"
            className="modal-input-field"
          />
        </div>
        <div>
        <label htmlFor="password" className="visually-hidden">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="비밀번호를 입력하세요"
            className="modal-input-field"
          />
        </div>
        <button type="submit" className="modal-login-button">Login</button>
      </form>
      <div class="modal-additional-links">
            {/* toggleCard 구현하기 */}
            <a href="javascript:void(0)">비밀번호 찾기</a> |
            <a href="javascript:void(0)">회원가입</a>
        </div>
    </Modal>
  );
};

export default SignInModal;
