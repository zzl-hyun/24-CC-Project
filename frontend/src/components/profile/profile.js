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
        const response = await axios.get(`http://23.23.207.68:4000/user/${currentUser}`);
        const data = response.data;

        // 데이터 검증 후 상태 업데이트
        setName(data.user.id || 'Guest');
        setBalance(data.user.krw_balance || 0);
        setStatusMessage(data.user.bio || 'No status message provided');

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

  const handlePasswordSubmit = () => {
    // 비밀번호 변경 로직 처리
    setOpenPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const canSubmitPasswordChange =
    newPassword === confirmNewPassword && newPassword !== '';

  const handleWithdraw = () => {
    setOpenWithdrawDialog(true);
  };

  const confirmWithdraw = () => {
    // 탈퇴 로직 처리
    setOpenWithdrawDialog(false);
    setWithdrawConfirmText('');
  };

  const handleStatusMessageChange = () => {
    // 상태 메시지 변경 로직 처리
    alert('상태 메시지가 변경되었습니다.');
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
    </ThemeProvider>
  );
};

export default Profile;
