import { useState } from "react";
import axios from "../api/axiosInstance";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
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
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
      
    <div style={{ maxWidth: 400, margin: "auto" }}>
      {step === 1 && (
        <>
        <Typography variant="h5" mb={2}>Forgot Password</Typography>
        <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
        />
        <Button color= "inherit" variant="contained" fullWidth disabled = {username.length === 0} onClick={handleSendOtp}>{loading ? <CircularProgress size={24} /> : "Send OTP"}</Button>
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
            <Button color= "inherit" variant="contained" fullWidth disabled = {otp.length === 0} onClick={handleVerifyOtp}>{loading ? <CircularProgress size={24} /> : "Verify OTP"}</Button>
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
            <Button color= "inherit" variant="contained" fullWidth disabled = {confirmPassword !== newPassword} onClick={handleResetPassword}>{loading ? <CircularProgress size={24} /> : "Reset Password"}</Button>

        </>
      )}
    </div>
    </Box>
    
  );
};

export default ResetPassword;
