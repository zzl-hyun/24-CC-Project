import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, User, Award, Home, ChartSpline } from 'lucide-react';
import SignInModal from '../../components/modal/signInModal';
import './header.css';

const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-content">
          <div className="logo">
            <Link to="/" className="logo-link">Trading Bot</Link>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-item"><Home size={20} /><span>Home</span></Link>
            <Link to="/trade" className="nav-item"><ChartSpline size={20} /><span>Trade</span></Link>
            <Link to="/rank" className="nav-item"><Award size={20} /><span>Rank</span></Link>
            <Link to="/profile" className="nav-item"><User size={20} /><span>Profile</span></Link>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="login-button"
            >
              Login
            </button>
          </div>
        </div>
      </nav>
      
      <SignInModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;
