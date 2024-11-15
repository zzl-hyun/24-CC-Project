import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Profit from '../../views/home-main/profit';
import History from '../../views/home-main/history';
import Distribution from '../../views/home-main/distribution';
// import './home-main.css';

const HomeMain = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 데이터 Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://44.214.32.61:5000/decisions');
                setData(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='home'>
            <h1>Market Decisions</h1>
            {/* 데이터를 리스트로 출력 */}
            <div className="decision-list">
                {/* {data.map((item) => (
                    <div key={item.id} className="decision-item">
                        <h2>Decision: {item.decision.toUpperCase()}</h2>
                        <p><strong>Timestamp:</strong> {item.timestamp}</p>
                        <p><strong>BTC Price:</strong> {item.btc_krw_price.toLocaleString()} KRW</p>
                        <p><strong>Reason:</strong> {item.reason}</p>
                        <p><strong>Percentage:</strong> {item.percentage}%</p>
                        <p><strong>KRW Balance:</strong> {item.krw_balance.toLocaleString()} KRW</p>
                        <hr />
                    </div>
                ))} */}
            </div>

            {/* 다른 컴포넌트에 데이터 전달 (예: Profit, History, Distribution) */}
            <Profit data={data} />
            <History data={data} />
            <Distribution data={data} />
        </div>
    );
};

export default HomeMain;
