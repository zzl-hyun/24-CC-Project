import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import SignInModal from '../../modal/signInModal'; // Adjust the import path as needed
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    setIsModalOpen(!authStatus);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsModalOpen(false);
    window.location.reload(); // Reload the page to update the authentication state
  };

  const handleCloseModal = () => {
    if(!isAuthenticated){
      setIsModalOpen(false);
      setError('Authentication is required to access this page.');
      toast.error('Authentication is required to access this page.');
    }
  };

  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <>
          <SignInModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onLoginSuccess={handleLoginSuccess}
          />
          {error && (<Navigate to="/" replace />)}
        </>
      )}
    </>
  );
};

export default ProtectedRoute;