import React from "react";
// import './profit.css';

const Profit = ({data}) => {
    return (
        <div className='profit'>
            <h1>Profit</h1>
            <div>
                {data.map((item) => (
                    <div key={item.id} className="decision-item">
                        <p>{item.btc_avg_buy_price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default Profit;