import React from "react";
import styled from "styled-components";

const History = ({ data }) => {
    return (
        <StyledHistory>
            <Title>Transaction History</Title>
            <HistoryList>
                {data.map((item) => (
                    <HistoryItem key={item.id}>
                        <p><strong>{item.timestamp}</strong></p>
                        <p>
                            Decision: <span>{item.decision}</span>
                        </p>
                        <p>
                            BTC Price: <span>{item.btc_krw_price.toLocaleString()} KRW</span>
                        </p>
                        <p>
                            Reason: <ScrollableSpan>{item.reason}</ScrollableSpan>
                        </p>
                    </HistoryItem>
                ))}
            </HistoryList>
        </StyledHistory>
    );
};

export default History;

// Styled Components
const StyledHistory = styled.div`
    max-width: 800px; /* profit + distribution의 너비에 맞춤 */
    margin: 10px auto 0;
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: 600px; /* 스크롤을 적용할 최대 높이 */
    overflow-y: scroll; /* 스크롤 활성화 */
    scrollbar-width: none; /* Firefox에서 스크롤바 숨김 */
    -ms-overflow-style: none; /* Internet Explorer에서 스크롤바 숨김 */

    /* Chrome, Edge, Safari에서 스크롤바 숨기기 */
    &::-webkit-scrollbar {
        display: none;
    }
`;

const Title = styled.h1`
    font-size: 1.8rem;
    color: #333;
    text-align: center;
    margin-bottom: 20px;
`;

const HistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const HistoryItem = styled.div`
    background-color: #ffffff;
    overflow-x:hidden;

    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    color: #555;

    p {
        margin: 5px 0;

        &:first-child {
            font-size: 0.9rem;
            color: #999;
        }

        span {
            font-weight: bold;
            color: #333;
        }
    }
`;

const ScrollableSpan = styled.span`
    display: inline-block;
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
`;
