import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, User, Award, Home, ChartSpline } from 'lucide-react';
import SignInModal from '../../modal/signInModal';
import { toast } from 'react-toastify';
import './header.css';

const Header = () => {
  // 로그인 상태를 useState로 관리
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser') || 'Profile');

  const handleLogOut = () => {
    toast.success('You have logged out!');
    setIsAuthenticated(false); // 상태 변경
    setCurrentUser('Profile'); // 사용자 정보 초기화
    localStorage.removeItem('isAuthenticated'); // localStorage 업데이트
    localStorage.removeItem('currentUser');
  };

  const handleLoginSuccess = (username) => {
    setIsAuthenticated(true); // 로그인 성공 시 상태 변경
    setCurrentUser(username); // 사용자 이름 업데이트
    localStorage.setItem('isAuthenticated', 'true'); // localStorage 업데이트
    localStorage.setItem('currentUser', username); // localStorage 업데이트
  };

  return (
    <header className="header" style={{ justifyContent: 'center' }}>
      <nav className="nav-container">
        <div className="nav-content">
          <div className="logo">
            <Link to="/" className="logo-link">Trading Bot</Link>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-item">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/trade" className="nav-item">
              <ChartSpline size={20} />
              <span>Trade</span>
            </Link>
            <Link to="/rank" className="nav-item">
              <Award size={20} />
              <span>Rank</span>
            </Link>
            <Link to="/profile" className="nav-item">
              <User size={20} />
              <span>{currentUser}</span>
            </Link>
            {/* 로그인 상태에 따라 버튼 표시 */}
            {!isAuthenticated ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="login-button"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogOut}
                className="login-button"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 로그인 모달 */}
      <SignInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={(username) => handleLoginSuccess(username)} // 로그인 성공 콜백
      />
    </header>
  );
};

export default Header;
