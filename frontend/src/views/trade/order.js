import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, {keyframes} from "styled-components";
import { fetchUserData } from "../../api/api";
const Order = () => {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [price, setPrice] = useState(null);
  const [amount, setAmount] = useState(""); // 사용자가 입력한 거래 수량
  const [message, setMessage] = useState(""); // 성공/실패 메시지
  const [transactions, setTransactions] = useState([]); // 거래 내역
  const [highlighted, setHighlighted] = useState(false); // 애니메이션 트리거 상태
  const [averageBuyPrice, setaverageBuyPrice] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentUser = localStorage.getItem("currentUser");
  const totalValue = balance + btcBalance * price;
  // 사용자 데이터 가져오기

  // 로그인했는지 체크
  useEffect(() => {
    const interval = setInterval(() => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(authStatus);
    }, 500); // 0.5초마다 체크
    return () => clearInterval(interval);
  }, []);

  // fetch user정보
  useEffect(() => {
    const fetchUserDataEffect = async () => {
      if (!currentUser) {
        console.warn("No currentUser found in localStorage");
        return;
      }
      try {
        const user = await fetchUserData(currentUser);
  
        setName(user?.id || "Guest");
        setBalance(user?.krw_balance || 0);
        setBtcBalance(user?.btc_balance || 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserDataEffect();
  }, [currentUser]);
  

  // 비트코인 시세 가져오기
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await axios.get("https://api.upbit.com/v1/ticker", {
          params: { markets: "KRW-BTC" },
        });
        let price = response.data[0].trade_price;
        setPrice(price);; // 현재 비트코인 시세
        localStorage.setItem('btc', price)
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
      }
    };

    fetchBitcoinPrice();

    // 10초마다 시세 업데이트
    const interval = setInterval(fetchBitcoinPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  // 거래 요청 함수
  const handleTrade = async (type) => {
    const normalizedAmount = parseFloat(amount.replace(/,/g, ""));

    if (!normalizedAmount || isNaN(normalizedAmount)) {
      setMessage("유효한 금액(KRW)을 입력하세요.");
      return;
    }
    if (normalizedAmount < 5000) {
      setMessage("거래 금액은 최소 5000원 이상이어야 합니다.");
      return;
    }

    try {
      const response = await axios.post("http://113.198.66.75:10232/trade", {
        userId: currentUser,
        type,
        amount: normalizedAmount, // 쉼표 제거 후 숫자로 변환된 금액 전달
      });

      // 서버 응답에 따라 상태 업데이트
      const { updatedBalances, btcPrice, transaction } = response.data;
      setBalance(updatedBalances.krwBalance);
      setBtcBalance(updatedBalances.btcBalance);
      setMessage(`${type === "buy" ? "구매" : "판매"} 성공!`);
      // 거래 내역에 새 항목 추가
      setTransactions((prev) => [transaction, ...prev]);
    } catch (error) {
      console.error("Trade error:", error);
      setMessage(error.response?.data?.error || "거래 중 문제가 발생했습니다.");
    }
  };

  const calculateAverageBuyPrice = (transactions) => {
    const buyTransactions = transactions.filter(tx => tx.type === "buy");
    const totalKrw = buyTransactions.reduce((sum, tx) => sum + tx.krw_amount, 0);
    const totalBtc = buyTransactions.reduce((sum, tx) => sum + tx.btc_amount, 0);
    return totalBtc > 0 ? totalKrw / totalBtc : 0;
  };
  const calculateProfitRate = (currentPrice, averagePrice) => {
    return averagePrice > 0 ? ((totalValue - 1000000) / 1000000) * 100 : 0;
  };
  
  useEffect(() => {
    if (transactions.length > 0) {
      const avgPrice = calculateAverageBuyPrice(transactions);
      setaverageBuyPrice(avgPrice);
    }
  }, [transactions]);
  
  
  // 거래 내역 가져오기
  useEffect(() => {
    const fetchTransactions = async () => {
        try {
        const response = await axios.get(`http://113.198.66.75:10232/transactions/${currentUser}`);
        const txs = response.data.transactions || [];
      setTransactions(txs);

        // 평균 매수 가격 계산
      const avgPrice = calculateAverageBuyPrice(txs);
      setaverageBuyPrice(avgPrice);
        } catch (error) {
        console.error("Error fetching transaction history:", error);
        }
    };

    fetchTransactions();
  }, [balance]);

    // 업데이트 시 애니메이션 트리거
  useEffect(() => {
    setHighlighted(true);
    const timeout = setTimeout(() => setHighlighted(false), 1000); // 500ms 후 효과 제거
    return () => clearTimeout(timeout);
  }, [balance, btcBalance, totalValue]);



  return (
  <>
    <OrderContainer isAuthenticated={isAuthenticated}>
      <Title>Order</Title>
      <ContentContainer>
        <InfoContainer>
          <InfoRow>사용자: {name}</InfoRow>
          <InfoRow>총 자산: <span style={{color: totalValue > 1000000 ? "green" : "red"}}>{totalValue.toLocaleString()} </span>KRW </InfoRow>
          <InfoRow>보유 KRW: {balance.toLocaleString()} KRW</InfoRow>
          <InfoRow>보유 BTC: {btcBalance.toFixed(8)} BTC</InfoRow>
          <InfoRow>
            수익률: 
            <span style={{color: calculateProfitRate(price, averageBuyPrice) > 0 ? "green" : "red"}}>
              {averageBuyPrice && price ? 
                `${calculateProfitRate(price, averageBuyPrice).toFixed(2)}%` 
                : "N/A"}
            </span>
          </InfoRow>
          <InfoRow>
            평단가: {averageBuyPrice > 0 ? `${averageBuyPrice.toLocaleString()} KRW` : "N/A"}
          </InfoRow>
        </InfoContainer>

        <ButtonContainer>
          <InfoRow style={{ color: "green" }}>시장가로 주문하기</InfoRow>
          <InfoRow style={{ color: "gray", fontSize: "20px" }}>수수료 : 0.01%</InfoRow>
      
          <Input
            type="text"
            placeholder="주문 수량(KRW)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button className="buy" onClick={() => handleTrade("buy")}>Buy</Button>
          <Button className="sell" onClick={() => handleTrade("sell")}>Sell</Button>
          {message && <InfoRow style={{ color: "gray" }}>{message}</InfoRow>}
        </ButtonContainer>
      </ContentContainer>

      <TransactionContainer>
      {!isAuthenticated && (
      <LoginOverlay isAuthenticated={isAuthenticated}>
        로그인 후 이용 가능합니다.
      </LoginOverlay>
    )}
        <TransactionTitle>거래 내역</TransactionTitle>
        {transactions.length > 0 ? (
            <TransactionList>
                <TransactionHeader>
                    <HeaderItem>거래 타입</HeaderItem>
                    <HeaderItem>KRW 주문량</HeaderItem>
                    <HeaderItem>BTC 주문량</HeaderItem>
                    <HeaderItem>구매가 (KRW)</HeaderItem>
                    <HeaderItem>거래 시간</HeaderItem>
                </TransactionHeader>
            {transactions.map((transaction, index) => (
                <TransactionItem key={index}>
                <span style={{ color: transaction.type?.toUpperCase() === "SELL" ? "red" : "green" }}>
                    {transaction.type?.toUpperCase() || "N/A"}
                </span>
                <span>{transaction.krw_amount?.toLocaleString() || "0"} KRW</span>
                <span>{transaction.btc_amount?.toFixed(8) || "0.00000000"} BTC</span>
                <span>{transaction.price?.toLocaleString() || "0"} KRW</span>
                <span>{transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : "N/A"}</span>
                </TransactionItem>
            ))}
            </TransactionList>
            ) : (
          <InfoRow>거래 내역이 없습니다.</InfoRow>
        )}
      </TransactionContainer>
    </OrderContainer>
  </>
  );
};

export default Order;


// Styled Components
const OrderContainer = styled.div`
  max-width: 70%;
  margin: 40px auto;
  padding: 20px;
  border-radius: 10px;
  background: #f8f9fa;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: "Arial", sans-serif;

  pointer-events: ${({ isAuthenticated }) => (isAuthenticated ? "auto" : "none")};
  position: relative;
`;

const LoginOverlay = styled.div`
  display: ${({ isAuthenticated }) => (isAuthenticated ? "none" : "flex")};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #333;
  font-weight: bold;
  z-index: 10;
`;


const Title = styled.h1`
  text-align: center;
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
`;

const ContentContainer = styled.div`
  display: flex; /* Flexbox로 Info와 Button을 나란히 배치 */
  justify-content: space-between; /* 양 끝 정렬 */
  gap: 80px; /* Info와 Button 간 간격 */
  margin-bottom: 20px;
`;

const InfoContainer = styled.div`
  flex: 2; /* Info가 Button보다 넓게 차지 */
  width: 90%;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
const blink = keyframes`
  0% { color: #000; }   /* 기본 색상 */
  50% { color: transparent; } /* 깜박이는 상태 */
  100% { color: #000; } /* 기본 색상 복원 */
`;
const InfoRow = styled.div`
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
  text-align: center;
  &.blink {
    animation: ${blink} 0.2s ease-out; /* 무한 깜박임 */
  }
`;

const ButtonContainer = styled.div`
  flex: 1; /* Button은 Info보다 좁게 차지 */
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  color: #fff;

  &.buy {
    background: #28a745;

    &:hover {
      background: #218838;
    }
  }

  &.sell {
    background: #dc3545;

    &:hover {
      background: #c82333;
    }
  }
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;
// 거래 내역 관련 Styled Components
const TransactionContainer = styled.div`
  margin-top: 20px;
  max-height: 300px; /* 고정된 높이 설정 */
  overflow-y: auto; /* 세로 스크롤바 활성화 */
  border: 1px solid #ddd; /* 테두리 추가 */
  border-radius: 8px; /* 모서리 둥글게 */
  background: #ffffff;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
const TransactionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  text-align: center;
  color: #333;
`;

const TransactionList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const TransactionItem = styled.li`
  display: grid; /* 데이터 간격 조절을 위해 grid 사용 */
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* 각 항목 간 폭 균등 분배 */
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-size: 14px;

  &:last-child {
    border-bottom: none; /* 마지막 항목은 테두리 제거 */
  }
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f1f1f1;
  border-bottom: 2px solid #ddd;
  font-weight: bold;
  font-size: 14px;
`;

const HeaderItem = styled.span`
  flex: 1;
  text-align: left;
`;
