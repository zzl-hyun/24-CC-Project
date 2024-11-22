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

const dummyData = [
  { name: '홍길동', rateOfReturn: 15.0, balance: 1000000, recentTrade: '2023-10-01' },
  { name: '김철수', rateOfReturn: 12.5, balance: 900000, recentTrade: '2023-09-25' },
  { name: '이영희', rateOfReturn: -5.0, balance: 850000, recentTrade: '2023-08-15' },
  { name: '박준호', rateOfReturn: 8.3, balance: 800000, recentTrade: '2023-10-05' },
  { name: '최지수', rateOfReturn: 20.1, balance: 750000, recentTrade: '2023-09-30' },
];

const Rank = () => {
  const totalTraders = 300;
  const activeTrades = 150;
  const totalVolume = 50000000;

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('rank');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    const sorted = [...dummyData].sort((a, b) => b.rateOfReturn - a.rateOfReturn);
    return sorted.map((item, index) => ({ ...item, rank: index + 1 }));
  }, []);

  const displayedData = useMemo(() => {
    return [...sortedData].sort((a, b) => {
      if (orderBy === 'recentTrade') {
        const dateA = new Date(a[orderBy]);
        const dateB = new Date(b[orderBy]);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
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

  const getMedalIcon = (rank) => {
    const style = { fontSize: '2rem' }; // 메달 크기 키움
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
        <Grid container spacing={4}>
          <Grow in={checked} timeout={1000}>
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
          </Grow>

          <Grow in={checked} timeout={1500}>
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
          </Grow>

          <Grow in={checked} timeout={2000}>
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
          </Grow>
        </Grid>

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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'rateOfReturn'}
                      direction={orderBy === 'rateOfReturn' ? order : 'asc'}
                      onClick={() => handleRequestSort('rateOfReturn')}
                    >
                      수익률
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'balance'}
                      direction={orderBy === 'balance' ? order : 'asc'}
                      onClick={() => handleRequestSort('balance')}
                    >
                      잔고
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'recentTrade'}
                      direction={orderBy === 'recentTrade' ? order : 'asc'}
                      onClick={() => handleRequestSort('recentTrade')}
                    >
                      최근 거래
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedData.map((trader) => (
                  <TableRow
                    key={trader.rank}
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
                            ? '#8b4513'
                            : '#f1f1f1',
                      },
                    }}
                  >
                    <TableCell className="medal">{getMedalIcon(trader.rank)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          alt={trader.name}
                          sx={{ mr: 2, width: 40, height: 40, bgcolor: '#1976d2' }}
                        >
                          <PersonIcon />
                        </Avatar>
                        {trader.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={trader.rateOfReturn >= 0 ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {trader.rateOfReturn >= 0 ? `+${trader.rateOfReturn}%` : `${trader.rateOfReturn}%`}
                      </Typography>
                    </TableCell>
                    <TableCell>{trader.balance.toLocaleString()}원</TableCell>
                    <TableCell>{trader.recentTrade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Grow>
  );
};

export default Rank;