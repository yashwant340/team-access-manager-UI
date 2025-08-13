import { Button, TextField, useTheme } from "@mui/material";
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import {  Typography } from "antd";
import { useEffect, useState } from "react";
import type { PendingRequestDTO } from "../types/dto";
import axios from '../api/axiosInstance';
import AdminApprovalDialog from "./AdminApprovalDialog";
import { toast } from 'react-toastify';

const { Title } = Typography;

export default function PendingRequest(){

    const theme = useTheme();
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
    }, [searchText]);
    
    useEffect(() => {
        fetchPendingRequest();
    },[]);

    const fetchPendingRequest = async () => {
        try{
            const res = await axios.get<PendingRequestDTO[]>('/v1/team-access-manager/team/pending-request');
            setPendingRequest(res.data || []);
            setFilteredPendingRequest(res.data);

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
        },
        {
            field: 'featureName',
            headerName: 'Feature Name',
            sortable: true,
            filterable: true,
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'requestedOn',
            headerName: 'Requested On',
            sortable: true,
            filterable: true,
            flex: 1,
            minWidth: 150,
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 250,
            renderCell: (params) => (
                <>
                <Button
                    variant="contained"
                    color="success"
                    size="small"
                    style={{ marginRight: 8 }}
                    onClick={() => {
                        setCurrRequestData(params.row)
                        setDialogOpen(true)
                    }}
                >
                    Take Decision
                </Button>
                </>
            ),
        },
    ]

    

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
      pageSize: 10,
      page: 0,
    });
    
    return (
        <div style={{ padding: 24 }}>
            <Title level = {4}> Pending Request Dashboard </Title>
            <div style={{ height: 600, width: '100%' }}>
              <TextField
                    label="Search users"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
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
                        backgroundColor:'#f0f0f0 !important',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      },
                      '& .MuiDataGrid-cell': {
                        fontSize: '0.95rem',
                        padding: '8px',
                      },
                      '& .MuiDataGrid-row': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                      '& .MuiDataGrid-footerContainer': {
                        mt: 2,
                      },
                    }}
                  />
            </div>

            <AdminApprovalDialog
                open={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onApprove={(notes) => {
                    console.log("Approved with notes:", notes);
                    handleDecision("APPROVED")
                    setDialogOpen(false);
                }}
                onReject={(notes) => {
                    console.log("Rejected with notes:", notes);
                    handleDecision("REJECTED")
                    setDialogOpen(false);
                }}
                requestData={currRequesData}
            />

        
        </div>

    );
}