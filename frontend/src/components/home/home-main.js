import React, { useState, useEffect } from 'react';
import Profit from '../../views/home-main/profit';
import History from '../../views/home-main/history';
import Distribution from '../../views/home-main/distribution';
import axios from 'axios';
import styled from 'styled-components';
import { AutoStories } from '@mui/icons-material';

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

    useEffect(() => {
        const fetchBtcPrice = async () => {
            try {
              let btcPrice = localStorage.getItem('btc');
              if(!btcPrice){
                  const response = await axios.get('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
                  const price = response.data[0].trade_price;
                  btcPrice = price;
                  localStorage.setItem('btc', btcPrice);
              }
            } catch (error) {
              console.error('Error fetching BTC price:', error);
            }
          };
          fetchBtcPrice();
    });


    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    return (
        <StyledHome>
            <Title>Market Decisions</Title>
            <TopSection>
                <ProfitContainer>
                    <Profit data={data} />
                </ProfitContainer>
                <DistributionContainer>
                    <Distribution data={data} />
                </DistributionContainer>
            </TopSection>
            <BottomSection>
                <History data={data} />
            </BottomSection>
        </StyledHome>
    );
};

export default HomeMain;

const StyledHome = styled.div`
    background-color: #f7f7f7;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; /* 화면 전체 높이에 맞추기 */
    box-sizing: border-box;
`;

const TopSection = styled.div`
    display: flex;
    justify-content: center; /* 중앙 정렬 */
    align-items: flex-start;
    gap: 50px; /* 컴포넌트 간 간격 */
    max-width: 850px;
    margin: 0 auto 20px auto;
    @media (max-width: 768px) {
        margin-top: 50%;
        flex-direction: column; /* 작은 화면에서는 세로 정렬 */
        align-items: center;
        gap: 15px;
    }
`;
const Title = styled.h1`
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
`;
const ProfitContainer = styled.div`
    flex: 1;
    max-width: 400px; /* 반응형을 위한 최대 너비 */
    margin-right: 10px;

    @media (max-width: 768px) {
        margin-right: 0;
    }
`;

const DistributionContainer = styled.div`
    flex: 1;
    max-width: 400px; /* 반응형을 위한 최대 너비 */
    margin-left: 10px;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

const BottomSection = styled.div`
    display: flex;
    justify-content: center; /* 중앙 정렬 */
    align-items: flex-start;
    max-width: 850px;
    margin: 0 auto;

    @media (max-width: 768px) {
        width: 100%;
    }
`;
