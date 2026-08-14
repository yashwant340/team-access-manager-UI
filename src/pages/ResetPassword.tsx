import { FormEvent, useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import PasswordRoundedIcon from "@mui/icons-material/PasswordRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

type RecoveryStep = "request" | "verify" | "reset";

const RESEND_DELAY_SECONDS = 60;

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return responseMessage || fallback;
};

const getResendDelay = (error: unknown) => {
  const delay = Number((error as { response?: { data?: { resendAvailableIn?: number } } })?.response?.data?.resendAvailableIn);
  return Number.isFinite(delay) && delay > 0 ? delay : 0;
};

const formatCountdown = (seconds: number) => `00:${String(seconds).padStart(2, "0")}`;

const ResetPassword = () => {
  const [step, setStep] = useState<RecoveryStep>("request");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsUntilResend, setSecondsUntilResend] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (secondsUntilResend <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsUntilResend((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsUntilResend]);

  const goToLogin = () => navigate("/login");

  const requestOtp = async (isResend = false) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    try {
      setLoading(true);
      const response = await axios.post(
        isResend ? "/auth/forgot-password/resend-otp" : "/auth/forgot-password/send-otp",
        { username: trimmedUsername },
      );
      const resendDelay = Number(response.data?.resendAvailableIn);
      setUsername(trimmedUsername);
      setOtp("");
      setResetToken("");
      setSecondsUntilResend(Number.isFinite(resendDelay) && resendDelay > 0 ? resendDelay : RESEND_DELAY_SECONDS);
      setStep("verify");
      toast.success(isResend ? "A new verification code has been sent." : "Verification code sent.");
    } catch (error) {
      const resendDelay = getResendDelay(error);
      if (resendDelay > 0) {
        setUsername(trimmedUsername);
        setStep("verify");
        setSecondsUntilResend(resendDelay);
      }
      toast.error(getErrorMessage(error, isResend ? "Unable to resend the code. Please try again." : "Unable to send a verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (event: FormEvent) => {
    event.preventDefault();
    void requestOtp();
  };

  const handleResendOtp = () => {
    if (secondsUntilResend > 0 || loading) return;
    void requestOtp(true);
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) return;

    try {
      setLoading(true);
      const response = await axios.post("/auth/forgot-password/verify-otp", { username, otp: trimmedOtp });
      const verifiedResetToken = response.data?.resetToken;
      if (!verifiedResetToken) {
        throw new Error("The verification response did not include a reset token.");
      }
      setOtp(trimmedOtp);
      setResetToken(verifiedResetToken);
      setStep("reset");
      toast.success("Code verified. Choose a new password.");
    } catch (error) {
      toast.error(getErrorMessage(error, "That verification code is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword || !resetToken) return;

    try {
      setLoading(true);
      await axios.post("/auth/forgot-password/reset", { username, newPassword, resetToken });
      toast.success("Password updated. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update your password. Please verify your code and try again."));
    } finally {
      setLoading(false);
    }
  };

  const returnToUsername = () => {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
    setSecondsUntilResend(0);
    setStep("request");
  };

  const stepIndex = step === "request" ? 1 : step === "verify" ? 2 : 3;
  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <Box className="page-shell recovery-page" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", px: 2, py: { xs: 2, sm: 5 } }}>
      <Paper className="app-surface recovery-card" elevation={0}>
        <Box className="recovery-card-header">
          <Button size="small" startIcon={<ArrowBackRoundedIcon />} onClick={goToLogin}>
            Back to sign in
          </Button>
          <Typography variant="overline" className="recovery-eyebrow">ACCOUNT RECOVERY</Typography>
        </Box>

        <Box className="recovery-form">
          <Box className="recovery-icon" aria-hidden="true">
            {step === "request" ? <LockResetRoundedIcon /> : step === "verify" ? <MarkEmailReadRoundedIcon /> : <PasswordRoundedIcon />}
          </Box>
          <Typography variant="h4" className="recovery-title">
            {step === "request" ? "Reset your password" : step === "verify" ? "Check your code" : "Set a new password"}
          </Typography>
          <Typography color="text.secondary" className="recovery-description">
            {step === "request"
              ? "Enter your username and we’ll send a one-time verification code."
              : step === "verify"
                ? `Enter the code sent to the account for ${username}.`
                : "Choose a strong password that you have not used before."}
          </Typography>

          <Box className="recovery-progress" aria-label={`Step ${stepIndex} of 3`}>
            {[1, 2, 3].map((item) => <span key={item} className={item <= stepIndex ? "is-active" : ""} />)}
          </Box>

          {step === "request" && (
            <Stack component="form" spacing={2} onSubmit={handleSendOtp}>
              <TextField
                label="Username"
                fullWidth
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={!username.trim() || loading}>
                {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Send verification code"}
              </Button>
            </Stack>
          )}

          {step === "verify" && (
            <Stack component="form" spacing={2} onSubmit={handleVerifyOtp}>
              <TextField
                label="Verification code"
                fullWidth
                autoFocus
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                helperText="Enter the six-digit code from your email."
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={otp.length !== 6 || loading}>
                {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Verify code"}
              </Button>
              <Box className="recovery-resend-panel">
                <Typography variant="body2" color="text.secondary">
                  Didn’t receive a code?
                </Typography>
                <Button variant="outlined" size="small" onClick={handleResendOtp} disabled={secondsUntilResend > 0 || loading}>
                  {secondsUntilResend > 0 ? `Resend available in ${formatCountdown(secondsUntilResend)}` : "Resend code"}
                </Button>
              </Box>
              <Button variant="text" size="small" onClick={returnToUsername} disabled={loading}>
                Use a different username
              </Button>
            </Stack>
          )}

          {step === "reset" && (
            <Stack component="form" spacing={2} onSubmit={handleResetPassword}>
              <TextField
                label="New password"
                fullWidth
                required
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><IconButton aria-label={showNewPassword ? "Hide password" : "Show password"} edge="end" onClick={() => setShowNewPassword((current) => !current)}>{showNewPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment>,
                }}
              />
              <TextField
                label="Confirm new password"
                fullWidth
                required
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                error={passwordMismatch}
                helperText={passwordMismatch ? "Passwords do not match." : ""}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><IconButton aria-label={showConfirmPassword ? "Hide password" : "Show password"} edge="end" onClick={() => setShowConfirmPassword((current) => !current)}>{showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}</IconButton></InputAdornment>,
                }}
              />
              <Alert severity="info" className="recovery-password-note">Your password update is protected by the verified code from the previous step.</Alert>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={!newPassword || !confirmPassword || passwordMismatch || !resetToken || loading}>
                {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Reset password"}
              </Button>
              <Button variant="text" size="small" onClick={() => { setResetToken(""); setStep("verify"); }} disabled={loading}>
                Back to code verification
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
