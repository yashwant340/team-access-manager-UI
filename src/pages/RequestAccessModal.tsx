import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material";
import axios from "../api/axiosInstance";
import { toast } from 'react-toastify';


interface RequestAccessModalProps {
  open: boolean;
  onClose: () => void;
}

const RequestAccessModal: React.FC<RequestAccessModalProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    team: "",
    role: "",
    empId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post("/auth/login-request", formData);
      toast.success('Request sent to admin. You will receive a temporary login details upon approval.',
        {
            position:"top-right",
            autoClose: 5000
        }
      )
      onClose();
    } catch (error) {
      console.error(error);
       toast.error('Error in submitting the request, Please try again after sometime',
        {
            position:"top-right",
            autoClose: 5000
        }
      )    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Request Access</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          Fill in your details to request access. An admin will review and approve your request.
        </Typography>
        <TextField
          label="Full Name"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          label="Employee Id"
          name="empId"
          fullWidth
          margin="normal"
          value={formData.empId}
          onChange={handleChange}
        />

        <TextField
          label="Team"
          name="team"
          fullWidth
          margin="normal"
          value={formData.team}
          onChange={handleChange}
        />
    
        <TextField
          label="Role"
          name="role"
          fullWidth
          margin="normal"
          value={formData.role}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestAccessModal;
