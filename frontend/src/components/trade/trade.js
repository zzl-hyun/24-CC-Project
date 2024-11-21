import React from 'react';
import Chart from '../../views/trade/trade-chart';
import Order from '../../views/trade/order';
import './trade.css';
const Trade = () => {


    return (
        <div className='trade'>
            <section className='chart-section'><Chart /></section>
            <section className='order-section'><Order /></section>
        </div>
    );
};

export default Trade;