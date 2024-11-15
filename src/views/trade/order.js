import React from "react";
import './order.css';

const Order = () => {
    return (
        <div className='order'>
            <h1>Order</h1>
            
            <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
                <div>
                    <div>username</div>
                    <div>보유잔고: 20,000krw</div>
                    <div>시세</div>
                </div>
                <input
                    type="text"
                    placeholder="구매: "
                    className="구매창"></input>
            </div>
            <div>
                <button className="buy-button">
                buy
                </button>
                <button className="sell-buton">
                sell
                </button>
            </div>
        </div>
    );
};

export default Order;
