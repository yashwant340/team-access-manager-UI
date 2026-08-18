import  { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';
import {  Button, Modal, Typography } from 'antd';
import axios from '../api/axiosInstance';
import type {   TeamDTO, UserDTO } from '../types/dto';
import TeamFeatureAccess from './TeamFeatureAccess';
import { useStoreState, useStoreActions } from '../store/hooks';
import AuditTrail from './AuditTrail';
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {History as HistoryIcon} from '@mui/icons-material';
import {  Avatar, Box, Chip, IconButton, Tab, Tabs, TextField, Tooltip, Typography as MuiTypography } from '@mui/material';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'react-toastify';
import { notifyAccessDataChanged, subscribeToAccessDataChanges } from '../utils/accessDataRefresh';

const { Title } = Typography;

export default function TeamAccessManager() {
    const {user} = useAuth();
    const [teams, setTeams] = useState<TeamDTO[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<TeamDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [userModalOpen, setUserModalOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<UserDTO[]>([]);
    const [selectedTeamName, setSelectedTeamName] = useState<string>('');

    const {features} = useStoreState((state) => state.featureModel);
    const {fetchFeatures} = useStoreActions((actions) => actions.featureModel);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [auditData, setAuditData] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [filteredTeams, setFilteredTeams] = useState<TeamDTO[]>(teams);
    const [selectedTab, setSelectedTab] = useState(0);


    useEffect(() => {
      const lowerSearch = searchText.toLowerCase();
      const teamList = selectedTab === 0 ? activeTeams : inActiveTeams;
      const filtered = teamList.filter((team) =>
        Object.values(team).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
      setFilteredTeams(filtered);
    }, [searchText, teams, selectedTab]);

    const activeTeams = teams.filter(team => team.active);
    const inActiveTeams = teams.filter(team => !team.active);

    

    const openAuditModal = async (teamId: number) => {
        setAuditModalOpen(true);
        setAuditLoading(true);
        try {
            const res = await axios.get('/v1/team-access-manager/team/auditLog', {
                params: { teamId },
            });
            setAuditData(res.data || []);
        } catch {
           toast.error('Failed to fetch audit trail. Please try again after sometime',
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                }
            );
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        if(addModalOpen && features.length == 0){
            fetchFeatures();
        }
    },[addModalOpen]);

    const fetchTeams = useCallback(async () => {
      try{
        if (user?.platformRole === "PLATFORM_ADMIN") {
          const response = await axios.get<TeamDTO[]>('/v1/team-access-manager/team/getAll');
          setTeams(response.data);
        } else if (user?.platformRole === "TEAM_ADMIN") {
          const response = await axios.get<TeamDTO[]>('/v1/team-access-manager/team/',
            {
              params : {
                teamId : user.teamId
              }
            }
          );
          setTeams(response.data);
        }
      } catch (error) {
        toast.error('Error fetching team data. Please try again after sometime',
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false
                }
        );
      }
    }, [user?.platformRole, user?.teamId]);
    
    useEffect(() => {
      void fetchTeams();
      return subscribeToAccessDataChanges(fetchTeams);
    }, [fetchTeams]);

    const confirmDeleteTeam = (team: TeamDTO) => {
        Modal.confirm({
          className: 'polished-confirm-modal',
          title: `Inactivate team "${team.name}"?`,
          content: (
            <div>
              <p>This change will:</p>
              <ul className="impact-list">
                <li>Inactivate the team to preserve the team and its audit history</li>
                <li>Switch all users in the team to override team access</li>
                <li>Set their access to all features as <strong>“Not Granted”</strong> by default</li>
              </ul>
              <p className="confirm-footnote">Review the impact before continuing.</p>
            </div>
          ),
          okText: 'Confirm and Inactivate',
          cancelText: 'Cancel',
          okType: 'danger',
          centered: true,
          onOk: () => handleDeleteTeam(team),
        });
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
        toast.warning('Please enter a team name', 
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
              }
            );
        return;
    }

    const accessList = features.map((feature) => ({
        featureId: feature.id,
        hasAccess: selectedFeatures.includes(feature.name),
    }));

    axios.post('/v1/team-access-manager/team/addNew', {
        name: newTeamName,
        accessList : accessList
    }).then((res) => {
        setTeams((prev) => [...prev, res.data]);
        notifyAccessDataChanged();
        setAddModalOpen(false);
        setNewTeamName('');
        setSelectedFeatures([]);
        toast.success('Team has been created Successfully', 
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
              }
            );        
        })
        .catch(() => {
            toast.error('Failed to create team. Please try again after sometime.', 
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
              }
            );        
          });
};

    const handleDeleteTeam = (team: TeamDTO) => {
        axios.post('/v1/team-access-manager/team/delete',null,{
            params : {
                teamId : team.id,
            }
        }).then(() => {
            toast.success('Team has been deleted Successfully', 
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false
              }
            );
            void fetchTeams();
            notifyAccessDataChanged();
        })
    }
    
  const openPermissionsModal = (team: TeamDTO) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const openUserListModal = (team: TeamDTO) => {
  setSelectedUsers(team.userList || []);
  setSelectedTeamName(team.name);
  setUserModalOpen(true);
};

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  const columns : GridColDef[] = [
    {
      field: 'name',
      headerName: 'Team Name',
      sortable: true,
      filterable: true,
      flex: 1.25,
      minWidth: 180,
    },
    {
      field: 'userList',
      headerName: 'Members',
      sortable: false,
      filterable: false,
      flex: 0.75,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box className="grid-cell-content grid-cell-link grid-cell-content-center"><Button className="member-count-button" type="link" onClick={() => openUserListModal(params.row)}>
            {params.row.userList?.length ?? 0}
        </Button></Box>
        ),
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box className="grid-cell-content grid-cell-content-center"><Button variant="outlined" color="primary" size="small" className="grid-action-button" onClick={() => openPermissionsModal(params.row)}>
          <ManageAccountsIcon fontSize="small" style={{ marginRight: 4 }} />
          Manage
        </Button></Box>
      ),
      
    },
    {
      field: 'audit',
      headerName: 'Audit Trail',
      sortable: false,
      filterable: false,
      flex: 0.8,
      minWidth: 140,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box className="grid-cell-content grid-cell-content-center"><Button variant="outlined" color="primary" size="small" className="grid-action-button" onClick={() => openAuditModal(params.row.id)}>
          <HistoryIcon fontSize="small" style={{ marginRight: 4 }} />
          View
        </Button></Box>
      ),
    },
    {
        field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            flex: 0.7,
            minWidth: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
              const canDelete = user?.platformRole === 'PLATFORM_ADMIN'
              return(
              <Box className="grid-action-buttons grid-cell-content-center">
                <Tooltip title="Delete">
                  <IconButton onClick={() => confirmDeleteTeam(params.row)} color="error" disabled = {!canDelete}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              )
            },
    }
 
  ];

  const baseColumns = useMemo(() => {
    if (selectedTab === 1) {
      return columns.filter((col) => col.field !== 'permissions' && col.field !== 'actions');
    }
    return columns
  }, [selectedTab]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
      setSelectedTab(newValue);
    };
    
  return (
    <div className="team-access-manager">
      <div className="team-access-heading">
        <div>
          <Title level={4} style={{ margin: 0 }}>Team access</Title>
          <MuiTypography variant="body2" color="text.secondary">Organize teams, members, permissions, and audit history.</MuiTypography>
        </div>
        {user?.platformRole === 'PLATFORM_ADMIN' && <Button type="primary" onClick={() => setAddModalOpen(true)}>
          Add New Team
        </Button>}
      </div>

      <div className="team-access-table app-surface">
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2.5 }}>
          <Tab label="Active Teams" />
          <Tab label="Inactive Teams" />
        </Tabs>

        <Modal
            className="polished-modal"
            title={<div className="modal-title-block"><Title level={4}>Add team</Title><Typography.Text type="secondary">Create a team and choose its starting permissions.</Typography.Text></div>}
            open={addModalOpen}
            onCancel={() => setAddModalOpen(false)}
            onOk={handleAddTeam}
            okText="Create Team"
        >
            <div className="modal-field">
                <label>Team name</label>
                <input
                className="modal-text-input"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                />
            </div>

            <div className="modal-field">
                <label>Feature permissions</label>
                <div className="feature-check-list">
                    {features.map((feature) => (
                    <div className="feature-check-row" key={feature.id}>
                        <input
                        type="checkbox"
                        id={`feature-${feature.id}`}
                        checked={selectedFeatures.includes(feature.name)}
                        onChange={(e) => {
                            const updated = e.target.checked
                            ? [...selectedFeatures, feature.name]
                            : selectedFeatures.filter((f) => f !== feature.name);
                            setSelectedFeatures(updated);
                        
                        }}
                        />
                        <label htmlFor={`feature-${feature.id}`} style={{ marginLeft: 8 }}>
                        {feature.name}
                        </label>
                    </div>
                    ))}
                </div>
            </div>

        </Modal>

        <Box className="team-access-toolbar">
          <TextField
                  label="Search teams"
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{ flex: 1, minWidth: 220 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
          <MuiTypography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} shown
          </MuiTypography>
        </Box>
        <DataGrid
                rows={filteredTeams}
                columns={baseColumns}
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
      <Modal
        title={<div><MuiTypography variant="h6" sx={{ fontWeight: 750 }}>Team members</MuiTypography><MuiTypography variant="body2" color="text.secondary">{selectedTeamName} · {selectedUsers.length} member{selectedUsers.length === 1 ? '' : 's'}</MuiTypography></div>}
        open={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        footer={null}
      >
        {selectedUsers.length > 0 ? (
          <Box className="member-list">
            {selectedUsers.map((member) => (
              <Box className="member-row" key={member.id}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#e2e7ff', color: '#3543a6', fontWeight: 750 }}>{member.name?.charAt(0).toUpperCase()}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <MuiTypography sx={{ fontWeight: 700 }} noWrap>{member.name}</MuiTypography>
                  <MuiTypography variant="body2" color="text.secondary" noWrap>{member.email}</MuiTypography>
                </Box>
                {member.role && <Chip label={member.role} size="small" variant="outlined" />}
              </Box>
            ))}
          </Box>
        ) : (
          <MuiTypography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No members are currently assigned to this team.</MuiTypography>
        )}
        <MuiTypography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Manage individual access from the User Access tab.</MuiTypography>
      </Modal>

      <Modal
        className="polished-modal permission-modal"
        title={<div className="modal-title-block"><Title level={4}>Permissions</Title><Typography.Text type="secondary">{selectedTeam?.name}</Typography.Text></div>}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        {selectedTeam && <TeamFeatureAccess teamId={selectedTeam.id} onCancel={closeModal} />}
      </Modal>

        {auditModalOpen && (
            <AuditTrail
                visible = {true}
                onClose={() => setAuditModalOpen(false)}
                auditData={auditData}
                loading={auditLoading}
            />
        )}

        

    </div>
  );
}
