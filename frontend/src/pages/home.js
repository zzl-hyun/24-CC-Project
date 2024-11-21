import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../layout/header/header';
import './home.css';

const Home = () => {
    return (
        <div id="app">
            <Header />
            <div id="container">
                <Outlet />
            </div>
        </div>
    );
};

export default Home;
