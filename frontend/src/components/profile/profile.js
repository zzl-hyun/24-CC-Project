import React, { useState } from 'react';
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

const theme = createTheme({
  typography: {
    fontFamily: 'Noto Sans KR, sans-serif',
  },
});

const Profile = () => {
  // 상태 변수 선언
  const [balance, setBalance] = useState(100000);
  const [rateOfReturn, setRateOfReturn] = useState(12.5);
  const [name, setName] = useState('홍길동');
  const [statusMessage, setStatusMessage] = useState('오늘도 화이팅!');

  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [withdrawConfirmText, setWithdrawConfirmText] = useState('');

  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

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
    // TODO: Implement status message change logic here
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

        {/* 비밀번호 변경 모달 */}
        <Dialog
          open={openPasswordDialog}
          onClose={() => setOpenPasswordDialog(false)}
        >
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="현재 비밀번호"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              margin="dense"
              label="새 비밀번호"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              margin="dense"
              label="새 비밀번호 확인"
              type="password"
              fullWidth
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={
                newPassword !== confirmNewPassword && confirmNewPassword !== ''
              }
              helperText={
                newPassword !== confirmNewPassword && confirmNewPassword !== ''
                  ? '비밀번호가 일치하지 않습니다.'
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>취소</Button>
            <Button
              onClick={handlePasswordSubmit}
              color="primary"
              disabled={!canSubmitPasswordChange}
            >
              변경
            </Button>
          </DialogActions>
        </Dialog>

        {/* 탈퇴 확인 모달 */}
        <Dialog
          open={openWithdrawDialog}
          onClose={() => setOpenWithdrawDialog(false)}
        >
          <DialogTitle>탈퇴 확인</DialogTitle>
          <DialogContent>
            <Typography>
              탈퇴하시겠습니까? 그러면 되돌릴 수 없습니다.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="탈퇴를 원하시면 '탈퇴합니다'를 입력해주세요."
              fullWidth
              value={withdrawConfirmText}
              onChange={(e) => setWithdrawConfirmText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenWithdrawDialog(false)}>취소</Button>
            <Button
              onClick={confirmWithdraw}
              color="secondary"
              disabled={withdrawConfirmText !== '탈퇴합니다'}
            >
              탈퇴
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default Profile;