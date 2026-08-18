import { useState, useEffect, type SetStateAction, useMemo } from "react";
import { Avatar, Box, Chip, Typography, Card, CardContent, Tabs, Tab, TextField, useTheme, Button, Accordion, AccordionSummary, AccordionDetails, MenuItem, TablePagination } from "@mui/material";
import axios from "../api/axiosInstance";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../providers/AuthProvider";
import {  type UserDTO, type UserDashboardAccessDataDTO } from "../types/dto";
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel  } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import { notifyAccessDataChanged } from '../utils/accessDataRefresh';
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
  const [accessPaginationModel, setAccessPaginationModel] = useState<GridPaginationModel>({ pageSize: 5, page: 0 });
  const [auditPage, setAuditPage] = useState(0);
  const [auditPageSize, setAuditPageSize] = useState(5);
  const [auditSearchText, setAuditSearchText] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('all');

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
      setAccessPaginationModel((current) => ({ ...current, page: 0 }));
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
      await Promise.all([fetchDashboardData(), fetchAuditData()]);
      notifyAccessDataChanged();
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

  const columns: GridColDef[] = [
  {
    field: 'featureName',
    headerName: 'Feature Name',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
    renderCell: (params) => <Typography fontWeight={700}>{params.value}</Typography>,
  },
  {
    field: 'hasAccess',
    headerName: 'Access Status',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
    renderCell: (params) => <Chip className={params.value ? 'member-status-chip is-granted' : 'member-status-chip'} label={params.value ? 'Granted' : 'Not granted'} size="small" />,
  },
  {
    field: 'lastUpdatedDate',
    headerName: 'Last Updated',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
    renderCell: (params) => <Typography variant="body2" color="text.secondary">{formatDate(params.value)}</Typography>,
  },
  {
    field: 'requestStatus',
    headerName: 'Request Status',
    flex: 1,
    minWidth: 150,
    valueGetter: (_value, row) =>
      row.pendingRequestDTO?.requestStatus ?? '—',
    renderCell: (params) => <Chip className="member-status-chip is-pending" label={String(params.value).toLowerCase()} size="small" />,
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
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => {
      const hasAccess = params.row.hasAccess;
        return (
          <Box className="grid-cell-content grid-cell-content-center">
            <Button
              className="member-access-action"
              variant={selectedTab === 1 || hasAccess ? 'outlined' : 'contained'}
              size="small"
              color={selectedTab === 1 ? 'primary' : hasAccess ? 'error' : 'primary'}
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
              {selectedTab === 1 ? 'Cancel request' : hasAccess ? 'Request revoke' : 'Request access'}
            </Button>
          </Box>
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

  const accessSummary = useMemo(() => ({
    total: accesses.length,
    granted: accesses.filter((access) => access.hasAccess).length,
    pending: accesses.filter((access) => !!access.pendingRequestDTO).length,
  }), [accesses]);

  const getAuditType = (description: string) => {
    const value = description.toLowerCase();
    if (/(access|permission|grant|revoke)/.test(value)) return 'access';
    if (/(profile|user|team|role)/.test(value)) return 'profile';
    return 'other';
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };

  const filteredAuditData = useMemo(() => {
    const query = auditSearchText.trim().toLowerCase();
    return auditData.filter((entry) => {
      const description = String(entry.auditDescription || '');
      const matchesQuery = !query || [description, entry.actor, entry.date].some((value) => String(value || '').toLowerCase().includes(query));
      return matchesQuery && (auditTypeFilter === 'all' || getAuditType(description) === auditTypeFilter);
    });
  }, [auditData, auditSearchText, auditTypeFilter]);

  const paginatedAuditData = filteredAuditData.slice(auditPage * auditPageSize, auditPage * auditPageSize + auditPageSize);

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(filteredAuditData.length / auditPageSize) - 1);
    if (auditPage > lastPage) setAuditPage(lastPage);
  }, [auditPage, auditPageSize, filteredAuditData.length]);
    
    if (loading) return <DashboardLayout><Typography color="text.secondary">Loading your dashboard...</Typography></DashboardLayout>;

  return (
    <DashboardLayout>
    
    <Box className="member-dashboard" display="flex" flexDirection="column" gap={2.5}>
      <Box className="app-surface dashboard-hero" sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.13em' }}>MEMBER WORKSPACE</Typography>
        <Typography variant="h4" sx={{ mt: .5 }}>Member Dashboard</Typography>
        <Typography color="text.secondary">Review your profile, access, and account activity.</Typography>
      </Box>
      <Accordion className="member-dashboard-section personal-info-section" defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">My personal information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card className="personal-info-card" elevation={0}>
            <CardContent>
              <Box className="personal-info-overview">
                <Avatar className="personal-info-avatar">
                  {(userData?.name || user?.username || 'M').charAt(0).toUpperCase()}
                </Avatar>
                <Box className="personal-info-identity">
                  <Typography variant="h6">{userData?.name || user?.username || 'Member'}</Typography>
                  <Typography variant="body2" color="text.secondary">{userData?.email || 'Email unavailable'}</Typography>
                </Box>
                <Chip
                  className="personal-info-access-chip"
                  label={userData?.accessMode === 'OVERRIDE_TEAM_ACCESS' ? 'Custom access' : 'Team access'}
                  size="small"
                />
              </Box>

              <Box className="personal-info-grid">
                <Box className="personal-info-item">
                  <Box className="personal-info-icon"><PersonIcon fontSize="small" /></Box>
                  <Box><Typography variant="caption">Full name</Typography><Typography>{userData?.name || '—'}</Typography></Box>
                </Box>
                <Box className="personal-info-item">
                  <Box className="personal-info-icon"><EmailIcon fontSize="small" /></Box>
                  <Box><Typography variant="caption">Email address</Typography><Typography>{userData?.email || '—'}</Typography></Box>
                </Box>
                <Box className="personal-info-item">
                  <Box className="personal-info-icon"><BadgeIcon fontSize="small" /></Box>
                  <Box><Typography variant="caption">Employee ID</Typography><Typography>{userData?.empId || '—'}</Typography></Box>
                </Box>
                <Box className="personal-info-item">
                  <Box className="personal-info-icon"><ApartmentIcon fontSize="small" /></Box>
                  <Box><Typography variant="caption">Team</Typography><Typography>{userData?.teamName || '—'}</Typography></Box>
                </Box>
                <Box className="personal-info-item">
                  <Box className="personal-info-icon"><WorkIcon fontSize="small" /></Box>
                  <Box><Typography variant="caption">Position / role</Typography><Typography>{userData?.role || '—'}</Typography></Box>
                </Box>
                <Box className="personal-info-item">
                  <Box className="personal-info-icon"><SecurityIcon fontSize="small" /></Box>
                  <Box><Typography variant="caption">Access mode</Typography><Typography>{userData?.accessMode === 'OVERRIDE_TEAM_ACCESS' ? 'Custom override' : 'Inherited from team'}</Typography></Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      <Accordion className="member-dashboard-section" defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">My access</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card className="member-access-card" elevation={0}>
            <CardContent>
              <Box className="member-access-summary">
                <Box><Typography variant="caption">Features</Typography><Typography variant="h6">{accessSummary.total}</Typography></Box>
                <Box><Typography variant="caption">Granted</Typography><Typography variant="h6">{accessSummary.granted}</Typography></Box>
                <Box><Typography variant="caption">Pending</Typography><Typography variant="h6">{accessSummary.pending}</Typography></Box>
              </Box>
              <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label={`Current access (${accessSummary.total})`} />
                <Tab label={`Pending requests (${accessSummary.pending})`} />
              </Tabs>
              <div className="responsive-grid-wrap">
                <Box className="member-access-toolbar">
                  <TextField
                    label="Search features"
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{ flex: 1, minWidth: 220 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {(selectedTab === 0 ? filteredAccess : pendingFilteredAccess).length} shown
                  </Typography>
                </Box>
                <DataGrid
                  rows={selectedTab === 0 ? filteredAccess : pendingFilteredAccess}
                  columns={baseColumns}
                  getRowId={(row) => row.featureId}
                  paginationModel={accessPaginationModel}
                  onPaginationModelChange={setAccessPaginationModel}
                  pageSizeOptions={[5, 10, 20, 50]}
                  disableRowSelectionOnClick
                  autoHeight
                  slots={{ toolbar: GridToolbar }}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.95rem',
                      padding: '8px',
                    },
                    '& .MuiDataGrid-row': {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
      
      <Accordion className="member-dashboard-section" defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Actions taken on my profile</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card className="member-activity-card" elevation={0}>
            <CardContent>
              <Box className="member-activity-toolbar">
                <TextField
                  label="Search activity"
                  size="small"
                  value={auditSearchText}
                  onChange={(event) => {
                    setAuditSearchText(event.target.value);
                    setAuditPage(0);
                  }}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                <TextField
                  select
                  label="Activity type"
                  size="small"
                  value={auditTypeFilter}
                  onChange={(event) => {
                    setAuditTypeFilter(event.target.value);
                    setAuditPage(0);
                  }}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="all">All activity</MenuItem>
                  <MenuItem value="access">Access changes</MenuItem>
                  <MenuItem value="profile">Profile changes</MenuItem>
                  <MenuItem value="other">Other activity</MenuItem>
                </TextField>
              </Box>
              {paginatedAuditData.length > 0 ? (
                <Box className="member-activity-timeline">
                  {paginatedAuditData.map((entry, index) => {
                    const type = getAuditType(String(entry.auditDescription || ''));
                    return (
                      <Box className="member-activity-item" key={`${entry.id || entry.date || index}-${index}`}>
                        <Box className="member-activity-marker" />
                        <Box className="member-activity-content">
                          <Box className="member-activity-heading">
                            <Typography fontWeight={700}>{entry.auditDescription || 'Profile activity updated'}</Typography>
                            <Chip className={`member-activity-type is-${type}`} label={type} size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {entry.actor || 'System'} · {formatDate(entry.date)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box className="member-activity-empty"><Typography color="text.secondary">No matching profile activity yet.</Typography></Box>
              )}
              <TablePagination
                component="div"
                count={filteredAuditData.length}
                page={auditPage}
                onPageChange={(_event, page) => setAuditPage(page)}
                rowsPerPage={auditPageSize}
                onRowsPerPageChange={(event) => {
                  setAuditPageSize(Number(event.target.value));
                  setAuditPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>
      
      
    </Box>
    </DashboardLayout>
  );
}
