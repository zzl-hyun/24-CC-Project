import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  Person as PersonIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

const theme = createTheme({
  typography: {
    fontFamily: 'Noto Sans KR, sans-serif',
  },
});

const Profile = () => {
  const INITIAL_ASSET = 1000000; // 초기 자산 (100만 원)

  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0); // 초기값 0으로 설정
  const [statusMessage, setStatusMessage] = useState('');
  const [rateOfReturn, setRateOfReturn] = useState(0);

  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('');

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const currentUser = localStorage.getItem('currentUser');

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        console.warn('No currentUser found in localStorage');
        return; // currentUser가 없으면 함수 종료
      }

      try {
        //const response = await axios.get(`http://23.23.207.68:4000/user/${currentUser}`); 주석지우지말것!!!!!!
        const response = await axios.get(`http://localhost:4000/user/${currentUser}`);
        const data = response.data;

        // 현재 BTC 가격 가져오기
        const btcResponse = await axios.get('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
        const btcPrice = btcResponse.data[0].trade_price;

        // 총 잔고 계산 (원화 + BTC 잔고를 원화로 환산)
        const totalBalance = data.user.krw_balance + data.user.btc_balance * btcPrice;

        // 수익률 계산
        const rateOfReturn = ((totalBalance - INITIAL_ASSET) / INITIAL_ASSET) * 100;

        // 데이터 검증 후 상태 업데이트
        setName(data.user.id || 'Guest');
        setBalance(totalBalance);
        setStatusMessage(data.user.bio || 'No status message provided');
        setRateOfReturn(rateOfReturn.toFixed(2));

        console.log('Fetched data:', data.user.id); // 디버깅용 로그
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentUser]); // 의존성 배열에 currentUser 추가

  const handlePasswordChange = () => {
    setOpenPasswordDialog(true);
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/change-password', {
        id: currentUser,
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        setOpenPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const canSubmitPasswordChange =
    newPassword === confirmNewPassword && newPassword !== '';

  const handleWithdraw = () => {
    setOpenWithdrawDialog(true);
  };

  const confirmWithdraw = async () => {
    if (withdrawConfirmText !== '탈퇴') {
      alert('탈퇴 확인 문구를 정확히 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/withdraw', {
        id: currentUser,
      });

      if (response.status === 200) {
        alert('계정이 성공적으로 탈퇴되었습니다.');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      } else {
        alert('계정 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error withdrawing account:', error);
      alert('계정 탈퇴 중 오류가 발생했습니다.');
    }
  };

  const handleStatusMessageChange = async () => {
    try {
      const response = await axios.post('http://localhost:4000/update-status', {
        id: currentUser,
        bio: statusMessage,
      });

      if (response.status === 200) {
        alert('상태 메시지가 성공적으로 변경되었습니다.');
      } else {
        alert('상태 메시지 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating status message:', error);
      alert('상태 메시지 변경 중 오류가 발생했습니다.');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Avatar
                alt={name}
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  bgcolor: '#1976d2',
                }}
              >
                <PersonIcon sx={{ fontSize: 80 }} />
              </Avatar>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {name}
              </Typography>
              <TextField
                label="상태메시지"
                fullWidth
                margin="normal"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
              />
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStatusMessageChange}
                  sx={{ mr: 2 }}
                >
                  상태메시지 변경
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={4} mt={4}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="textSecondary">
                        잔고
                      </Typography>
                      <Typography variant="h5">
                        {balance.toLocaleString()}원
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="textSecondary">
                        수익률
                      </Typography>
                      <Typography
                        variant="h5"
                        color={rateOfReturn >= 0 ? 'success.main' : 'error.main'}
                      >
                        {`${rateOfReturn}%`}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              onClick={handlePasswordChange}
              sx={{ mr: 2 }}
            >
              비밀번호 변경
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleWithdraw}
            >
              탈퇴
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>비밀번호 변경</DialogTitle>
        <DialogContent>
          <TextField
            label="현재 비밀번호"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            label="새 비밀번호"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            fullWidth
            margin="normal"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} color="primary">
            취소
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            color="primary"
            disabled={!canSubmitPasswordChange}
          >
            변경
          </Button>
        </DialogActions>
      </Dialog>

      {/* 탈퇴 다이얼로그 */}
      <Dialog open={openWithdrawDialog} onClose={() => setOpenWithdrawDialog(false)}>
        <DialogTitle>계정 탈퇴</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            계정을 탈퇴하시려면 아래 입력란에 '탈퇴'를 입력해주세요.
          </Typography>
          <TextField
            label="탈퇴 확인"
            fullWidth
            margin="normal"
            value={withdrawConfirmText}
            onChange={(e) => setWithdrawConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWithdrawDialog(false)} color="primary">
            취소
          </Button>
          <Button onClick={confirmWithdraw} color="secondary">
            탈퇴
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default Profile;
