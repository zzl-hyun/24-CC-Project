import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import CountUp from 'react-countup';

const Rank = () => {
  const BTC_PRICE = 50000000; // BTC 가격 (5천만 원)
  const INITIAL_ASSET = 1000000; // 초기 자산 (100만 원)

  const [userData, setUserData] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('rank');
  const [checked, setChecked] = useState(false);

  // 상단 박스 데이터 (더미 데이터)
  const totalTraders = 300; // 전체 트레이더 수
  const activeTrades = 150; // 현재 활성 거래 수
  const totalVolume = 50000000; // 총 거래량

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://23.23.207.68:4000/users');
        const data = await response.json();
        console.log('Fetched data:', data); // 디버깅용 로그
        if (Array.isArray(data.users)) {
          setUserData(data.users);
          console.log('User data set:', data.users); // 디버깅용 로그
        } else {
          console.error('Invalid API response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    setChecked(true);
    fetchData();
  }, []);

  // 정렬 핸들러
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // 수익률 계산 및 정렬된 데이터 생성
  const sortedData = useMemo(() => {
    const calculatedData = userData.map((user) => {
      const totalAsset = user.krw_balance + user.btc_balance * BTC_PRICE;
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
  }, [userData]);

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

  return (
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
                      전체 트레이더 수
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
                  <TrendingUpIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      현재 활성 거래
                    </Typography>
                    <Typography variant="h4">
                      <CountUp end={activeTrades} duration={2} />건
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
                  <WalletIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6" color="textSecondary">
                      총 거래량
                    </Typography>
                    <Typography variant="h4">
                      <CountUp end={totalVolume} duration={2} separator="," />원
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
                  <TableCell>트레이더 이름</TableCell>
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
                  <TableCell>원화 잔고</TableCell>
                  <TableCell>비트코인 잔고</TableCell>
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
                            alt={trader.username}
                            sx={{ mr: 2, width: 40, height: 40, bgcolor: '#1976d2' }}
                          >
                            <PersonIcon />
                          </Avatar>
                          {trader.username}
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
                      <TableCell>{trader.krw_balance.toLocaleString()}원</TableCell>
                      <TableCell>{trader.btc_balance.toFixed(4)} BTC</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
  );
};

export default Rank;