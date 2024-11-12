// SignInModal.js
import React from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import './signInModal.css';

Modal.setAppElement('#root'); // Ensure this is set for accessibility

const SignInModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2 className="modal-title">Login</h2>
        <button onClick={onClose} className="close-button">
          <X size={24} />
        </button>
      </div>
      <form className="login-form">
        <div>
          <input 
            type="email" 
            placeholder="Email" 
            className="input-field"
          />
        </div>
        <div>
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field"
          />
        </div>
        <button 
          type="submit" 
          className="login-button"
        >
          Login
        </button>
      </form>
    </Modal>
  );
};

export default SignInModal;
