import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const Order = () => {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0);
  const [price, setPrice] = useState(null);
  const [amount, setAmount] = useState(""); // 사용자가 입력한 거래 수량
  const [message, setMessage] = useState(""); // 성공/실패 메시지
  const [transactions, setTransactions] = useState([]); // 거래 내역

  const currentUser = localStorage.getItem("currentUser");

  // 사용자 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        console.warn("No currentUser found in localStorage");
        return;
      }

      try {
        const response = await axios.get(
        //   `http://23.23.207.68:4000/user/${currentUser}`
          `http://localhost:4000/user/${currentUser}`

        );
        const data = response.data;

        setName(data.user.id || "Guest");
        setBalance(data.user.krw_balance || 0);
        setBtcBalance(data.user.btc_balance || 0);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // 비트코인 시세 가져오기
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await axios.get("https://api.upbit.com/v1/ticker", {
          params: {
            markets: "KRW-BTC",
          },
        });
        setPrice(response.data[0].trade_price); // 현재 비트코인 시세
      } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
      }
    };

    fetchBitcoinPrice();

    // 10초마다 시세 업데이트
    const interval = setInterval(fetchBitcoinPrice, 10000);

    return () => clearInterval(interval);
  }, []);

    // 거래 내역 가져오기
   useEffect(() => {
    const fetchTransactions = async () => {
        try {
        const response = await axios.get(`http://localhost:4000/transactions/${currentUser}`);
        setTransactions(response.data.transactions || []);
        } catch (error) {
        console.error("Error fetching transaction history:", error);
        }
    };

    fetchTransactions();
   }, [balance]);

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
    //   const response = await axios.post("http://23.23.207.68:4000/trade", {
      const response = await axios.post("http://localhost:4000/trade", {
        userId: currentUser,
        type,
        amount: normalizedAmount, // 쉼표 제거 후 숫자로 변환된 금액 전달
    });

      // 서버 응답에 따라 상태 업데이트
      const { updatedBalances, btcPrice, message } = response.data;
      setBalance(updatedBalances.krwBalance);
      setBtcBalance(updatedBalances.btcBalance);
      setMessage(message || `${type === "buy" ? "구매" : "판매"} 성공! 현재 BTC 가격: ${btcPrice.toLocaleString()} KRW`);
    } catch (error) {
      console.error("Trade error:", error);
      setMessage(
        error.response?.data?.error || "거래 중 문제가 발생했습니다."
      );
    }
  };
  const totalValue = balance + (btcBalance * price);
  return (
    <OrderContainer>
      <Title>Order</Title>
      <ContentContainer>
        <InfoContainer>
          <InfoRow>사용자: {name}</InfoRow>
          <InfoRow>
            총 자산: 
            {totalValue ? `${totalValue.toLocaleString()} KRW` : "Loading..."}
          </InfoRow>
          <InfoRow>보유 KRW: {balance.toLocaleString()} KRW</InfoRow>
          <InfoRow>보유 BTC: {btcBalance.toFixed(8)} BTC</InfoRow>
        </InfoContainer>

        <ButtonContainer>
          <InfoRow style={{ color: "green" }}>시장가로 주문하기</InfoRow>
          <Input
            type="text"
            placeholder="주문 수량(KRW)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button className="buy" onClick={() => handleTrade("buy")}>
            Buy
          </Button>
          <Button className="sell" onClick={() => handleTrade("sell")}>
            Sell
          </Button>
          {message && <InfoRow style={{ color: "gray" }}>{message}</InfoRow>}
        </ButtonContainer>
      </ContentContainer>
      <TransactionContainer>
        <TransactionTitle>거래 내역</TransactionTitle>
        {transactions.length > 0 ? (
          <TransactionList>
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id}>
                <span style={{ color: transaction.type.toUpperCase() === 'SELL' ? 'red' : 'green' }}>
                {transaction.type.toUpperCase()}
                </span>
                <span>{transaction.amount.toFixed(3)} KRW</span>
                {/* <span>{transaction.total_krw.toLocaleString()} KRW</span> */}
                <span>{new Date(transaction.timestamp).toLocaleString()}</span>
              </TransactionItem>
            ))}
          </TransactionList>
        ) : (
          <InfoRow>거래 내역이 없습니다.</InfoRow>
        )}
      </TransactionContainer>
    </OrderContainer>
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

const InfoRow = styled.div`
  font-size: 14px;
  color: #555;
  margin-bottom: 10px;
  text-align: center;
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
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
`;