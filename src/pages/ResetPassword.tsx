import { useState } from "react";
import axios from "../api/axiosInstance";
import { Box, Button, CircularProgress, TextField, Typography, Paper } from "@mui/material";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";


const ResetPassword = () =>{
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try{
        setLoading(true);
        await axios.post("/auth/forgot-password/send-otp", { username });
        toast.success('OTP sent successfully',{
            position: "top-right",
            autoClose: 5000
        }
        );

    }catch{
        toast.error('Unable to send OTP. Please try again after sometime',{
            position: "top-right",
            autoClose: 5000
        }
        );
    }finally{
        setLoading(false);
        setStep(2);
    }
  };

  const handleVerifyOtp = async () => {
    try{
        setLoading(true);
        await axios.post("/auth/forgot-password/verify-otp", { username, otp });
        toast.success('OTP verification successfull',{
            position: "top-right",
            autoClose: 5000
        }
        );

    }catch{
        toast.error('The OTP you entered is incorrect. Please try with the correct one.',{
            position: "top-right",
            autoClose: 5000
        }
        );
    }finally{
        setLoading(false);
        setStep(3);
    }
  };

  const handleResetPassword = async () => {
    try{
        setLoading(true);
        await axios.post("/auth/forgot-password/reset", { username, newPassword });
        toast.success('Password has been updated successfully',{
            position: "top-right",
            autoClose: 5000
        }
        );

    }catch{
        toast.error('Error in updating the password. Please try again after sometime',{
            position: "top-right",
            autoClose: 5000
        }
        );
    }finally{
        setLoading(false);
        navigate('/login')
    }
  };

  return (
    <Box className="page-shell" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 5 }}>
    <Paper className="app-surface" elevation={0} sx={{ maxWidth: 440, width: '100%', p: { xs: 3, sm: 5 } }}>
      
    <div className="recovery-form">
      <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.14em' }}>ACCOUNT RECOVERY</Typography>
      {step === 1 && (
        <>
        <Typography variant="h5" mb={1} mt={1}>Forgot Password</Typography>
        <Typography color="text.secondary" mb={3}>Enter your username to receive a verification code.</Typography>
        <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
        />
        <Button color="primary" variant="contained" fullWidth disabled = {username.length === 0} onClick={handleSendOtp}>{loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : "Send OTP"}</Button>
        </>
      )}

      {step === 2 && (
        <>
          <Typography variant="h5" mb={2}>Verify OTP</Typography>
            <TextField
                label="otp"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button color="primary" variant="contained" fullWidth disabled = {otp.length === 0} onClick={handleVerifyOtp}>{loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : "Verify OTP"}</Button>
        </>
      )}

      {step === 3 && (
        <>
          <Typography variant="h5" mb={2}>Reset Password</Typography>
            <TextField
                label="newpassword"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="confirmpassword"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button color="primary" variant="contained" fullWidth disabled = {confirmPassword !== newPassword} onClick={handleResetPassword}>{loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : "Reset Password"}</Button>

        </>
      )}
    </div>
    </Paper>
    </Box>
    
  );
};

export default ResetPassword;
