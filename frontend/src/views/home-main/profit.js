import React from "react";
import styled from "styled-components";

const Profit = ({ data }) => {
    let totalProfit = 0;
    let currentBTCBalance = 0;
    let btcAvgBuyPrice = 0;
    let initialKRWBalance = 1000000; // 초기 원화 잔고
    let currentKRWBalance = initialKRWBalance; // 현재 원화 잔고

    data.forEach((item) => {
        const { decision, btc_krw_price, percentage, krw_balance } = item;

        if (decision === "buy") {
            // 매수 시 BTC 보유량 증가 및 평균 매수가 업데이트
            const newBTC = (krw_balance * (percentage / 100)) / btc_krw_price;
            currentBTCBalance += newBTC;

            if (btcAvgBuyPrice > 0) {
                btcAvgBuyPrice =
                    (btcAvgBuyPrice * (currentBTCBalance - newBTC) + btc_krw_price * newBTC) /
                    currentBTCBalance;
            } else {
                btcAvgBuyPrice = btc_krw_price;
            }
        } else if (decision === "sell") {
            // 매도 시 수익 계산
            const soldBTC = currentBTCBalance * (percentage / 100);
            const profit = (btc_krw_price - btcAvgBuyPrice) * soldBTC;
            totalProfit += profit;
            currentBTCBalance -= soldBTC;
        }

        // 원화 잔고 업데이트
        currentKRWBalance = krw_balance;
    });

    // 남아 있는 BTC의 평가 금액 계산
    if (currentBTCBalance > 0) {
        const finalPrice = data[data.length - 1].btc_krw_price;
        totalProfit += (finalPrice - btcAvgBuyPrice) * currentBTCBalance;
    }

    // 총 수익률 계산
    const totalValue = currentKRWBalance + currentBTCBalance * (data[data.length - 1]?.btc_krw_price || 0);
    const profitPercentage = ((totalValue - initialKRWBalance) / initialKRWBalance) * 100;

    return (
        <StyledProfit>
            <Title>Profit Summary</Title>
            <Percentage profit={profitPercentage}>
                {profitPercentage.toFixed(2)}%
            </Percentage>
            <Details>
                <DetailItem>Total Profit: <span>{totalProfit.toLocaleString()} KRW</span></DetailItem>
                <DetailItem>Current BTC Balance: <span>{currentBTCBalance.toFixed(8)} BTC</span></DetailItem>
                <DetailItem>Total KRW Balance: <span>{currentKRWBalance.toLocaleString()} KRW</span></DetailItem>
                <DetailItem>Average Buy Price: <span>{btcAvgBuyPrice.toLocaleString()} KRW</span></DetailItem>
            </Details>
        </StyledProfit>
    );
};

export default Profit;

// 스타일링 정의
const StyledProfit = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f7f7f7;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 20px;
    text-align: center;
`;

const Percentage = styled.div`
    font-size: 2.5rem;
    font-weight: bold;
    color: ${(props) => (props.profit >= 0 ? "#4caf50" : "#f44336")};
    margin-bottom: 20px;
`;

const Details = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const DetailItem = styled.p`
    font-size: 1rem;
    color: #555;
    display: flex;
    justify-content: space-between;

    span {
        font-weight: bold;
        color: #333;
    }
`;
