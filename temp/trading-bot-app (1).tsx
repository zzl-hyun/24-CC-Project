import React, { useState } from 'react';
import { X, Menu, User, Award, Home, DollarSign } from 'lucide-react';

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Login</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = () => {
  return (
    <form className="space-y-4">
      <div>
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded"
        />
      </div>
      <button 
        type="submit" 
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Login
      </button>
    </form>
  );
};

// Header Component
const Header = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Trading Bot</div>
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-1">
              <Home size={20} />
              <span>Home</span>
            </a>
            <a href="/profile" className="flex items-center space-x-1">
              <User size={20} />
              <span>Profile</span>
            </a>
            <a href="/rank" className="flex items-center space-x-1">
              <Award size={20} />
              <span>Rank</span>
            </a>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          </div>
        </div>
      </nav>
      
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
        <LoginForm />
      </Modal>
    </header>
  );
};

// Home Page Component
const HomePage = () => {
  const botPerformance = {
    totalReturn: 25.6,
    trades: [
      { date: '2024-03-01', type: 'BUY', price: 50000, amount: 0.1 },
      { date: '2024-03-02', type: 'SELL', price: 51000, amount: 0.1 },
    ]
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">수익률</h2>
          <div className="text-4xl font-bold text-green-500">
            +{botPerformance.totalReturn}%
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">매매 기록</h2>
          <div className="space-y-2">
            {botPerformance.trades.map((trade, index) => (
              <div key={index} className="flex justify-between items-center border-b py-2">
                <span>{trade.date}</span>
                <span className={trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                  {trade.type}
                </span>
                <span>${trade.price}</span>
                <span>{trade.amount} BTC</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Page Component
const ProfilePage = () => {
  const [balance, setBalance] = useState({
    cash: 1000000,
    crypto: 0.5
  });

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">현재 시세</h2>
          <div className="text-4xl font-bold">$50,000</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">잔고</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>현금:</span>
              <span>${balance.cash.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>암호화폐:</span>
              <span>{balance.crypto} BTC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rank Page Component
const RankPage = () => {
  const rankings = [
    { name: 'User1', return: 45.2 },
    { name: 'User2', return: 38.7 },
    { name: 'User3', return: 32.1 },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold p-6 border-b">수익률 랭킹</h2>
        <div className="p-6">
          {rankings.map((user, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b">
              <div className="flex items-center space-x-4">
                <span className="font-bold">{index + 1}</span>
                <span>{user.name}</span>
              </div>
              <span className="text-green-500">+{user.return}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <HomePage />
      {/* Routes would be implemented here using React Router */}
    </div>
  );
};

export default App;
