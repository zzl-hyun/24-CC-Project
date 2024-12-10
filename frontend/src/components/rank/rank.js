import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './rank.css';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  TableSortLabel,
  Grow,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  SentimentDissatisfied as FearIcon,
} from '@mui/icons-material';
import CountUp from 'react-countup';
import bannerImg from '../../asset/banner.png';

const API_BASE_URL = 'http://113.198.66.75:10232'; // API 기본 URL
const backgroundImageUrl = '../../public/banner.png'
const Rank = () => {
  const INITIAL_ASSET = 1000000; // 초기 자산 (100만 원)

  const [userData, setUserData] = useState([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [fearGreedIndex, setFearGreedIndex] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('rank');
  const [checked, setChecked] = useState(false);

  // 상단 박스 데이터
  const totalTraders = userData.length; // 전체 트레이더 수
  const currentBtcPrice = btcPrice; // 현재 비트코인 가격

  // 데이터 가져오기
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await axios.get('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
        const price = response.data[0].trade_price;
        setBtcPrice(price);
      } catch (error) {
        console.error('Error fetching BTC price:', error);
      }
    };

    const fetchFearGreedIndex = async () => {
      try {
        const response = await axios.get('https://api.alternative.me/fng/?limit=1');
        const index = response.data.data[0].value;
        setFearGreedIndex(index);
      } catch (error) {
        console.error('Error fetching Fear and Greed Index:', error);
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (Array.isArray(data.users)) {
          setUserData(data.users);
        } else {
          console.error('Invalid API response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    setChecked(true);
    fetchBtcPrice();
    fetchFearGreedIndex();
    fetchData();

    // BTC 가격을 10초마다 새로고침
    const intervalId = setInterval(fetchBtcPrice, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // 비트코인 가격이 변경될 때마다 유저 데이터 다시 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (Array.isArray(data.users)) {
          setUserData(data.users);
        } else {
          console.error('Invalid API response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [btcPrice]);

  // 정렬 핸들러
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 수익률 계산 및 정렬된 데이터 생성
  const sortedData = useMemo(() => {
    const calculatedData = userData.map((user) => {
      const totalAsset = user.krw_balance + user.btc_balance * btcPrice;
      const rateOfReturn = ((totalAsset - INITIAL_ASSET) / INITIAL_ASSET) * 100;
      return {
        ...user,
        totalAsset,
        rateOfReturn,
      };
    });

    // 수익률 기준으로 내림차순 정렬
    const sorted = calculatedData.sort((a, b) => b.rateOfReturn - a.rateOfReturn);

    // 순위 추가
    return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [userData, btcPrice]);

  // 표시할 데이터 정렬
  const displayedData = useMemo(() => {
    return [...sortedData].sort((a, b) => {
      if (orderBy === 'rateOfReturn' || orderBy === 'totalAsset') {
        return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
      } else {
        if (a[orderBy] < b[orderBy]) {
          return order === 'asc' ? -1 : 1;
        }
        if (a[orderBy] > b[orderBy]) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  }, [order, orderBy, sortedData]);

  // 메달 아이콘 반환 함수
  const getMedalIcon = (rank) => {
    const style = { fontSize: '2rem' };
    switch (rank) {
      case 1:
        return <span style={style}>🥇</span>;
      case 2:
        return <span style={style}>🥈</span>;
      case 3:
        return <span style={style}>🥉</span>;
      default:
        return rank;
    }
  };

  // 공포 및 탐욕 지수 상태 반환 함수
  const getFearGreedState = (index) => {
    if (index <= 25) return '공포';
    if (index <= 50) return '중립';
    if (index <= 75) return '탐욕';
    return '극단적 탐욕';
  };

  return (
    <>
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", position: "relative", height: "300px" }}>
      <div className="banner">
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
        <img src= {bannerImg} alt="Banner" className="moving-banner" />
      </div>
    </div>
    <Grow in={checked} timeout={1000}>
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* 상단 박스 */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} className="card">
              <CardContent className="card-content">
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      전체 회원 수
                    </Typography>
                    <Typography variant="h4">
                      <CountUp end={totalTraders} duration={2} />명
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} className="card">
              <CardContent className="card-content">
                <Box display="flex" alignItems="center">
                  <MoneyIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      현재 비트코인 가격
                    </Typography>
                    <Typography variant="h4">
                      <CountUp end={currentBtcPrice} duration={2} separator="," />원
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} className="card">
              <CardContent className="card-content">
                <Box display="flex" alignItems="center">
                  <FearIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      공포 및 탐욕 지수
                    </Typography>
                    <Typography variant="h4">
                      <CountUp end={fearGreedIndex} duration={2} />점
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={fearGreedIndex}
                      sx={{ height: 10, borderRadius: 5, mt: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {getFearGreedState(fearGreedIndex)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 순위 테이블 */}
        <Box mt={5}>
          <Typography variant="h4" gutterBottom>
            트레이더 순위
          </Typography>
          <TableContainer component={Paper} className="table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'rank'}
                      direction={orderBy === 'rank' ? order : 'asc'}
                      onClick={() => handleRequestSort('rank')}
                    >
                      순위
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>유저</TableCell>
                  <TableCell>상태 메시지</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'rateOfReturn'}
                      direction={orderBy === 'rateOfReturn' ? order : 'asc'}
                      onClick={() => handleRequestSort('rateOfReturn')}
                    >
                      수익률
                    </TableSortLabel>
                  </TableCell>
                  {/* <TableCell>원화 잔고</TableCell>
                  <TableCell>비트코인 잔고</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'totalAsset'}
                      direction={orderBy === 'totalAsset' ? order : 'asc'}
                      onClick={() => handleRequestSort('totalAsset')}
                    >
                      총 자산 (원화 환산)
                    </TableSortLabel>
                  </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedData.length > 0 ? (
                  displayedData.map((trader) => (
                    <TableRow
                      key={trader.id}
                      hover
                      className={`MuiTableRow-root table-row rank-${trader.rank}`}
                      sx={{
                        '&:hover': {
                          backgroundColor:
                            trader.rank === 1
                              ? '#ffd700'
                              : trader.rank === 2
                              ? '#b0b0b0'
                              : trader.rank === 3
                              ? '#cd7f32'
                              : '#f1f1f1',
                        },
                      }}
                    >
                      <TableCell className="medal">{getMedalIcon(trader.rank)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            alt={trader.id}
                            sx={{ mr: 2, width: 40, height: 40, bgcolor: '#1976d2' }}
                          >
                            <PersonIcon />
                          </Avatar>
                          {trader.id}
                        </Box>
                      </TableCell>
                      <TableCell>{trader.bio}</TableCell>
                      <TableCell>
                        <Typography
                          color={trader.rateOfReturn >= 0 ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 'bold' }}
                        >
                          {trader.rateOfReturn >= 0
                            ? `+${trader.rateOfReturn.toFixed(2)}%`
                            : `${trader.rateOfReturn.toFixed(2)}%`}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>{trader.krw_balance.toLocaleString()}원</TableCell>
                      <TableCell>{trader.btc_balance.toFixed(8)} BTC</TableCell>
                      <TableCell>{trader.totalAsset.toLocaleString()}원</TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

      </Container>
    </Grow>
    </>
  );
};

export default Rank;