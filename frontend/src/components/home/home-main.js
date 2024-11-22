import React, { useState, useEffect } from 'react';
import Profit from '../../views/home-main/profit';
import History from '../../views/home-main/history';
import Distribution from '../../views/home-main/distribution';
import response from '../../temp/response';
import axios from 'axios';
import styled from 'styled-components';

// import './home-main.css';

const HomeMain = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 데이터 Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                // const response = await axios.get('http://localhost:4000/balance');
                // setData(response.data);
                setData(response);
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
        <StyledHome>
            <h1 style={{textAlign:'center'}}>Market Decisions</h1>
            {/* 다른 컴포넌트에 데이터 전달 (예: Profit, History, Distribution) */}
            <Profit data={data} />
            <Distribution data={data} />

            <History data={data} />
        </StyledHome>
    );
};

export default HomeMain;

const StyledHome = styled.div`
    background-color: #f7f7f7;
`;