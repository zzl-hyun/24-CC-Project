import React from 'react';
import Profit from '../../views/home-main/profit';
import History from '../../views/home-main/history';
import Distribution from '../../views/home-main/distribution';
// import './home-main.css';

const HomeMain = () => {


    return (
        <div className='home'>
            <Profit />
            <History />
            <Distribution />
        </div>
    );
};

export default HomeMain;