import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHome, faMedal, faArrowTrendUp} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-awesome-modal';
/* src/inc/header.js */
import { Route, Link, Switch } from 'react-router-dom';
import './header.css';

class Header extends Component {

    render() {
  
      return (
        <div id="container">
            <header className='app-header'>
                <div className='header-left'>
                    <div className='logo'>
                        <Link to="/">
                            <span id='logo-text' style={{ fontSize: '24px', fontWeight: 'bold' }}>  Trading Bot  </span>
                            {/* <FontAwesomeIcon icon={faTicket} style={{ height: '100%', color: '#E50914' }} /> */}
                        </Link>
                    </div>
              

                
                </div>
                <div className='header-right'>
                <nav className='nav-links'>
                            <ul>
                                <li><Link to="/"><FontAwesomeIcon icon={faHome} />
                                Home</Link></li>
                                <li><Link to="/trade">
                                <FontAwesomeIcon icon={faArrowTrendUp}/>
                                Trade</Link></li>
                                <li><Link to="/rank">
                                <FontAwesomeIcon icon={faMedal} />
                                Rank</Link></li>
                                <li><Link to="/profile">
                                <FontAwesomeIcon icon={faUser} />
                                Profile</Link></li>
                            </ul>
                        </nav>
                    <button className="login-button" id='login-button'>
                        login
                        {/* <FontAwesomeIcon icon={faRightFromBracket} /> */}
                    </button>
                    
                </div>
            </header>
        </div>


      );
    }
  }
  
export default Header;