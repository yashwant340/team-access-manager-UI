import { Box, Button, TextField, Typography as MuiTypography } from "@mui/material";
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import {  Typography } from "antd";
import { useEffect, useState } from "react";
import type { PendingRequestDTO } from "../types/dto";
import axios from '../api/axiosInstance';
import AdminApprovalDialog from "./AdminApprovalDialog";
import { toast } from 'react-toastify';

const { Title } = Typography;

export default function PendingRequest(){
    const [searchText, setSearchText] = useState('');
    const [pendingRequest, setPendingRequest] = useState<PendingRequestDTO[]>([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [currRequesData, setCurrRequestData] = useState<PendingRequestDTO>(); 
    const [filteredPendingRequest, setFilteredPendingRequest] = useState<PendingRequestDTO[]>([]);



    useEffect(() => {
          const lowerSearch = searchText.toLowerCase();
          const filtered = pendingRequest.filter((team) =>
            Object.values(team).some((value) =>
              String(value).toLowerCase().includes(lowerSearch)
            )
          );
          setFilteredPendingRequest(filtered);
    }, [searchText, pendingRequest]);
    
    useEffect(() => {
        fetchPendingRequest();
    },[]);

    const fetchPendingRequest = async () => {
        try{
            const res = await axios.get<PendingRequestDTO[]>('/v1/team-access-manager/team/pending-request');
            setPendingRequest(res.data || []);
            setFilteredPendingRequest(res.data || []);

        }catch{
            toast.error('Error fetching pending request. Please try again after sometime',
                {
                    position : "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                }
            )
        }  
        
    }

    const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
        if (!currRequesData) return;
        try {
            const requestBody = {
                ...currRequesData,
                requestDecision: decision
            };
            await axios.post('/v1/team-access-manager/team/request-decision', requestBody);
            toast.success(`Request ${decision.toLowerCase()} successfully`,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                }
            )
            fetchPendingRequest(); 
            setDialogOpen(false);
        } catch {
            toast.error(`Failed to ${decision.toLowerCase()} request`,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                }
            )
        }
    };

    const columns : GridColDef[] = [
        {
            field: 'name',
            headerName: 'User Name',
            sortable: true,
            filterable: true,
            flex: 1,
            minWidth: 150,
            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'featureName',
            headerName: 'Feature Name',
            sortable: true,
            filterable: true,
            flex: 1,
            minWidth: 150,
            headerAlign: 'left',
            align: 'left',
        },
        {
            field: 'requestedOn',
            headerName: 'Requested On',
            sortable: true,
            filterable: true,
            flex: 1,
            minWidth: 150,
            headerAlign: 'left',
            align: 'left',
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
                    minWidth: 180,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box className="grid-cell-content grid-cell-content-center">
                <Button
                    variant="contained"
                    color="primary"
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
        <div className="pending-request-view">
            <div className="pending-request-heading">
              <div>
                <Title level = {4} style={{ margin: 0 }}>Pending requests</Title>
                <MuiTypography variant="body2" color="text.secondary">Review and decide on access requests waiting for approval.</MuiTypography>
              </div>
            </div>
            <div className="pending-request-table app-surface">
              <div className="pending-request-toolbar">
              <TextField
                    label="Search requests"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                <MuiTypography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {filteredPendingRequest.length} {filteredPendingRequest.length === 1 ? 'request' : 'requests'} shown
                </MuiTypography>
              </div>
              <DataGrid
                    rows={filteredPendingRequest}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    autoHeight
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                      '& .MuiDataGrid-columnHeader': {
                        backgroundColor:'#f5f7fb !important',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        borderBottom: '1px solid #e1e6ee',
                      },
                      '& .MuiDataGrid-cell': {
                        fontSize: '0.95rem',
                        padding: '10px 12px',
                      },
                    }}
                  />
            </div>

            <AdminApprovalDialog
                open={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onApprove={(notes) => {
                    void notes;
                    handleDecision("APPROVED")
                    setDialogOpen(false);
                }}
                onReject={(notes) => {
                    void notes;
                    handleDecision("REJECTED")
                    setDialogOpen(false);
                }}
                requestData={currRequesData}
            />

        
        </div>

    );
}
