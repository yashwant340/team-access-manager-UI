import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Stack,
  Button,
  TextField,
  Box
} from "@mui/material";
import {
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";
import type { PendingRequestDTO } from "../types/dto";

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
  requestData: PendingRequestDTO | undefined;
}

export default function AdminApprovalDialog({
  open,
  onClose,
  onApprove,
  onReject,
  requestData
}: ApprovalDialogProps) {
  const [notes, setNotes] = useState("");

  const [impactPreview, setImpactPreview] = useState<string[]>([]);

  useEffect(() => {
    if(requestData?.accessMode === 'INHERIT_TEAM_ACCESS'){
        setImpactPreview([
            "Mode will switch from Inherit → Override",
            `Access to '${requestData?.featureName}' will be granted`,
            "Other inherited accesses will be transferred to override mode"
        ])
    }
    else{
        setImpactPreview([
            `Access to '${requestData?.featureName}' will be granted`,
            "Other accesses will remain the same"
        ])
    }
    
  },[requestData]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          User Access Request
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Request Summary */}
        <Typography variant="subtitle2" gutterBottom>
          Request Summary
        </Typography>
        <Stack spacing={1}>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
            {requestData?.name} ({requestData?.email})
          </Box>
          <Box display="flex" alignItems="center">
            <ApartmentIcon sx={{ mr: 1, color: "primary.main" }} />
            {requestData?.teamName}
          </Box>
          <Box display="flex" alignItems="center">
            <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
            {requestData?.requestType} - {requestData?.featureName}
          </Box>
          <Box display="flex" alignItems="center">
            <EventIcon sx={{ mr: 1, color: "primary.main" }} />
            Requested On: {requestData?.requestedOn} 
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Current Access Snapshot */}
        <Typography variant="subtitle2" gutterBottom>
          Current Access Snapshot
        </Typography>
        <Stack spacing={0.5}>
          <Typography>Mode: {requestData?.accessMode}</Typography>
          <Typography>
            Current Feature Access: {"NO"}
          </Typography>
          
          <Typography>
            Other Features:{" "}
            {requestData? requestData.otherFeatures.userAccessControlDTOS !== null ? 
              requestData.otherFeatures.userAccessControlDTOS.map(
                (f) => `${f.hasAccess ? "✔" : "❌"} ${f.featureName}`
              )
              .join("   ") : requestData.otherFeatures.teamAccessControlDTOS.map(
                (f) => `${f.hasAccess ? "✔" : "❌"} ${f.featureName}`
              )
              .join("   ") : "N/A"}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Impact Preview */}
        <Typography variant="subtitle2" gutterBottom>
          Impact Preview
        </Typography>
        <ul>
          {impactPreview.map((impact, idx) => (
            <li key={idx}>
              <Typography>{impact}</Typography>
            </li>
          ))}
        </ul>

        <Divider sx={{ my: 2 }} />

        {/* Notes */}
        <TextField
          label="Notes (optional)"
          fullWidth
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => onReject(notes)}
        >
          Reject
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => onApprove(notes)}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
