import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import {  type LoginRequestDTO, type TeamDTO } from "../types/dto";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField, Typography } from "@mui/material";
import {  useEffect, useMemo, useState } from "react";
import { Input } from "reactstrap";
import {CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";
import axios from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { notifyAccessDataChanged, subscribeToAccessDataChanges } from '../utils/accessDataRefresh';



export default function LoginRequest(){

    const [currRequesData, setCurrRequestData] = useState<LoginRequestDTO>(); 
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<TeamDTO|null>();
    const [teams, setTeams] = useState<TeamDTO[]>();
    const [loginRequestData, setLoginRequestData] = useState<LoginRequestDTO[]>([]);
    const [searchText, setSearchText] = useState('');


    useEffect(()=>{
        const refreshLists = () => {
          void fetchLoginRequests();
          void fetchTeams();
        };
        refreshLists();
        return subscribeToAccessDataChanges(refreshLists);
    },[]);

    useEffect(() => {
      if (isDialogOpen) {
        void fetchTeams();
      }
    }, [isDialogOpen]);

    const handleApprove =async() => {
        try{
        await axios.post('/v1/team-access-manager/admin/login-request/approve',null,{
            params:{
                reqId: currRequesData?.id,
                teamId: selectedTeam?.id
            }
        });
        void fetchLoginRequests();
        notifyAccessDataChanged();
        toast.success('Login request successfully approved.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
        })
        }catch{
            toast.error('Failed to approve login request. Please try again after sometime',{
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
            })
        }finally{
            setDialogOpen(false);
        }
    }

    const fetchLoginRequests = async() => {
      try{
        const res = await axios.get<LoginRequestDTO[]>('/v1/team-access-manager/admin/login-request/pending');
        setLoginRequestData(res.data);
      }catch{
        toast.error('Failed to fetch login requests. Please try again after sometime',{
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false
        })
      }
    };

    const fetchTeams = async () => {
          try{
              const response = await axios.get<TeamDTO[]>('/v1/team-access-manager/team/getAll');
              setTeams(response.data);
          } catch (error) {
            toast.error('Error fetching team data. Please try again after sometime',
                    {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false
                    }
            );
          }
        };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedTeam(undefined);
    }
    const filteredLoginRequests = useMemo(() => {
      const query = searchText.trim().toLowerCase();
      if (!query) return loginRequestData;
      return loginRequestData.filter((request) =>
        Object.values(request).some((value) => String(value).toLowerCase().includes(query))
      );
    }, [loginRequestData, searchText]);

    const columns: GridColDef[] = [
        {
            field:'name',
            headerName:'User',
            flex:1,
            minWidth: 150,
        },
        {
            field:'email',
            headerName:'Email ID',
            flex:2,
            minWidth: 150,
        },
        {
            field:'createdDate',
            headerName:'Requested On',
            flex:1,
            minWidth: 150,
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box className="grid-cell-content grid-cell-content-center">
                <Button
                    variant="outlined"
                    size="small"
                    className="grid-action-button"
                    onClick={() => {
                        setCurrRequestData(params.row)
                        setDialogOpen(true)
                    }}
                >
                    Review
                </Button>
                </Box>
            ),
        },
    ]



    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
          pageSize: 10,
          page: 0,
        });
        
    return (
        <div className="login-request-view">
            <div className="login-request-heading">
              <div>
                <Typography variant="h6" fontWeight={750}>Login requests</Typography>
                <Typography variant="body2" color="text.secondary">Review new account requests and assign each person to a team.</Typography>
              </div>
            </div>
            <div className="login-request-table app-surface">
              <Box className="login-request-toolbar">
                <TextField
                  label="Search requests"
                  size="small"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {filteredLoginRequests.length} {filteredLoginRequests.length === 1 ? 'request' : 'requests'} shown
                </Typography>
              </Box>
              <DataGrid
                    rows={filteredLoginRequests}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    autoHeight
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                      '& .MuiDataGrid-cell': {
                        padding: '10px 12px',
                      },
                  }}
                  />
            </div>

            {isDialogOpen && 
            <Dialog className="polished-dialog approval-dialog" open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    <Typography variant="h6" fontWeight={750}>Review login request</Typography>
                    <Typography variant="body2" color="text.secondary">Confirm the requester’s details and assign their team.</Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Box className="request-summary-card">
                        <Stack spacing={1.25}>
                            <Box className="summary-row"><Typography color="text.secondary">Name</Typography><Typography fontWeight={700}>{currRequesData?.name || '—'}</Typography></Box>
                            <Box className="summary-row"><Typography color="text.secondary">Email</Typography><Typography>{currRequesData?.email || '—'}</Typography></Box>
                            <Box className="summary-row"><Typography color="text.secondary">Employee ID</Typography><Typography>{currRequesData?.empId || '—'}</Typography></Box>
                            <Box className="summary-row"><Typography color="text.secondary">Requested team</Typography><Typography>{currRequesData?.team || '—'}</Typography></Box>
                            <Box className="summary-row"><Typography color="text.secondary">Role</Typography><Typography>{currRequesData?.role || '—'}</Typography></Box>
                            <Box className="summary-row"><Typography color="text.secondary">Requested on</Typography><Typography>{currRequesData?.createdDate || '—'}</Typography></Box>
                        </Stack>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography component="label" htmlFor="team-select" variant="body2" fontWeight={700}>Assign to team</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 1.25 }}>This team determines the user’s inherited permissions.</Typography>
                    <Input
                        type="select"
                        id="team-select"
                        className="modal-select-input"
                        value={selectedTeam?.name || ''}
                        onChange={(e) => {
                            const selectedTeamName = e.target.value;
                            const selected = teams?.find((x) => x.name === selectedTeamName);
                            setSelectedTeam(selected);
                            }}
                        required
                    >
                        <option value="" disabled>
                        Choose a team
                        </option>
                        {teams?.map((team) => (
                        <option key={team.id} value={team.name}>
                            {team.name}
                        </option>
                        ))}
                    </Input>

                </DialogContent>
                <DialogActions className="dialog-actions decision-actions">
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CancelIcon />}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={closeDialog}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          disabled={selectedTeam === undefined }
                          onClick={handleApprove}
                        >
                          Approve
                        </Button>
                    </DialogActions>
            </Dialog>
            }
        

        </div>
    );

}
