import { useState, useEffect, type SetStateAction, useMemo } from "react";
import { Box, Typography, Card, CardContent, Tabs, Tab, TextField, useTheme, Button, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import axios from "../api/axiosInstance";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../providers/AuthProvider";
import {  type UserDTO, type UserDashboardAccessDataDTO } from "../types/dto";
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel  } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import {
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon
} from "@mui/icons-material";

export default function UserDashboard() {
  const {user} = useAuth();
  const [accesses, setAccesses] = useState<UserDashboardAccessDataDTO[]>([]);
  const [selectedTab,setSelectedTab] = useState(0);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const theme = useTheme();
  const [filteredAccess, setFilteredAccess] = useState<UserDashboardAccessDataDTO[]>([])
  const [pendingFilteredAccess, setPendingFilteredAccess] = useState<UserDashboardAccessDataDTO[]>([])
  const [userData, setUserData] = useState<UserDTO>();

  useEffect(() => {
    const pendingRequests = accesses.filter( x => !!x.pendingRequestDTO);
    const lowerSearch = searchText.toLowerCase();
    const accessList = selectedTab === 0 ? accesses : pendingRequests;
    const filtered = accessList.filter((feature) =>
      Object.values(feature).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
    if(selectedTab === 1){
      setPendingFilteredAccess(filtered);
    }else{
      setFilteredAccess(filtered);
    }
  }, [searchText, accesses ,selectedTab]);

  const fetchUserData = async () => {
    try{
      const userRes = await axios.get<UserDTO>('/v1/team-access-manager/user/getUser',{
        params : {
          userId: user?.id || 0
        }
      });
      setUserData(userRes.data)
    } catch {
      toast.error('Error in fetching user details. Please try again after sometime or contact administrator', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
    }
  }

  const fetchAuditData = async () => {

    try{
      const audit = await axios.get('/v1/team-access-manager/user/userDashboard/auditLog',{
        params: {
          userId: user?.id || 0
        }
      });
      setAuditData(audit.data);
    } catch {
      toast.error('Error in fetching audit details. Please try again after sometime or contact administrator', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
    } 
  }

  useEffect(() => {
      fetchUserData();
      fetchAuditData();
  },[])

  const fetchDashboardData = async () => {
      try {
        const accessRes = await axios.get("/v1/team-access-manager/user/userDashboard/accessData", {
            params:{
                userId: user?.id || 0
            }
        });
        setAccesses(accessRes.data);
      } catch (err) {
        toast.error('Error fetching dashboard data. Please try again after sometime or contact administrator', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTab]);

  const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
      setSelectedTab(newValue);
  };

  const handleRequestAccess = async (access: UserDashboardAccessDataDTO, type: "REVOKE" | "GRANT", isCancel? : boolean) => {
    try {
      const payload = {
        id: access.pendingRequestDTO?.id || 0,
        userId : access.userId,
        featureId: access.featureId,
        featureName: access.featureName,
        requestType: type,
        requestStatus: isCancel ? "CANCELLED": "PENDING"
      }
      await axios.post("/v1/team-access-manager/user/access-request", 
        payload
      );
      fetchDashboardData();
      if(!isCancel){
        toast.success('Request submitted successfully',
          {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          }
        );
      }else{
        toast.success('Request cancelled successfully',
          {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          }
        )
      }
    } catch (err) {
        toast.error('Something unexpected happened, Please try again after sometime or contact administrator', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });    
      }
  };

  const auditColumns :GridColDef[] = [
    {
      field: 'auditDescription',
      headerName: 'Action',
      flex: 2,
      minWidth: 150,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            maxHeight: 100,
            overflowY: 'auto',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'actor',
      headerName: 'Updated By',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'date',
      headerName: 'Updated Date',
      flex: 1,
      minWidth: 150,
    },
  ]

  const columns: GridColDef[] = [
  {
    field: 'featureName',
    headerName: 'Feature Name',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'hasAccess',
    headerName: 'Access Status',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'lastUpdatedDate',
    headerName: 'Last Updated',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'requestStatus',
    headerName: 'Request Status',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) =>
      row.pendingRequestDTO?.requestStatus ?? '—',
  },
  {
    field: 'requestType',
    headerName: 'Request Type',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) =>
      row.pendingRequestDTO?.requestType ?? '—',
  },
  {
    field: 'requestedOn',
    headerName: 'Requested On',
    flex: 1,
    minWidth: 180,
    valueGetter: (_value, row) =>
      row.pendingRequestDTO?.requestedOn ?? '—',
  },
  {
    field: 'pendingWith',
    headerName: 'Pending With',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) =>
      row.pendingRequestDTO?.pendingWith ?? '—',
  },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    filterable: false,
    width: 150,
    renderCell: (params) => {
      const hasAccess = params.row.hasAccess;
        return (
          <Button
            variant="contained"
            size="small"
            color={selectedTab === 1 ? "primary" : hasAccess ? "error" : "primary"}
            onClick={() => {
              if(selectedTab === 1){
                handleRequestAccess(params.row, params.row.pendingRequestDTO.requestType, true );

              }
              else if (hasAccess) {
                handleRequestAccess(params.row,"REVOKE");
              } else {
                handleRequestAccess(params.row,"GRANT");
              }
            }}
            disabled={selectedTab === 0 && !!params.row.pendingRequestDTO}
          >
            {selectedTab === 1 ? "Cancel Request" : hasAccess ? "Revoke Access" : "Request Access"}
          </Button>
        );
      }
  },
];

  const baseColumns = useMemo(()=>{
    if(selectedTab == 0){
      return columns.filter(x => x.field !== 'requestStatus' && x.field !== 'requestType' && x.field !== 'requestedOn' && x.field !== 'pendingWith');
    }
    return columns.filter(x => x.field !== 'hasAccess' && x.field !== 'lastUpdatedDate');
  },[selectedTab])

  const rowsWithId = auditData.map((row, index) => ({
    id: index + 1,
    ...row
  }));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 5,
    page: 0,
  });
    
    if (loading) return <Typography>Loading...</Typography>;

  return (
    <DashboardLayout>
    
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h4">My Dashboard</Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" gutterBottom>
            My Personal Info
          </Typography>        </AccordionSummary>
        <AccordionDetails>
        <Card>
        <CardContent>
          
          <Stack spacing={1}>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
            Name : {userData?.name}
          </Box>
          <Box display="flex" alignItems="center">
            <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
            Email : {userData?.email}
          </Box>
          <Box display="flex" alignItems="center">
            <BadgeIcon sx={{ mr: 1, color: "primary.main" }} />
            Employee ID : {userData?.empId}
          </Box>
          <Box display="flex" alignItems="center">
            <ApartmentIcon sx={{ mr: 1, color: "primary.main" }} />
            Team : {userData?.teamName}
          </Box>
          <Box display="flex" alignItems="center">
            <WorkIcon sx={{ mr: 1, color: "primary.main" }} />
            Position/Role : {userData?.role}
          </Box>
          <Box display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
            Access Mode : {userData?.accessMode === "OVERRIDE_TEAM_ACCESS" ? "Overriding Team Access" : "Inheriting Team Access"}
          </Box>

          </Stack>
        </CardContent>
      </Card>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" gutterBottom>
            My Accesses
          </Typography>        </AccordionSummary>
        <AccordionDetails>
          <Card>
        <CardContent>
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Current Access" />
            <Tab label="Pending Requests" />
          </Tabs>
          <div style={{width: '100%' }}>
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
                  rows={selectedTab === 0? filteredAccess : pendingFilteredAccess}
                  columns={baseColumns}
                  getRowId={(row) => row.id}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  pageSizeOptions={[5,10, 20, 50]}
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
        </CardContent>
      </Card>
        </AccordionDetails>
      </Accordion>
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" gutterBottom>
            Actions Taken on My Profile
          </Typography>        
        </AccordionSummary>
        <AccordionDetails>
          <Card>
          <CardContent>
            <div style={{width: '100%' }}>
              <DataGrid
                    rows={rowsWithId}
                    columns={auditColumns}
                    getRowId={(row) => row.id}
                    getRowHeight={() => 'auto'} // or function returning 'auto'
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5,10, 20, 50]}
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

            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
      
      
    </Box>
    </DashboardLayout>
  );
}
