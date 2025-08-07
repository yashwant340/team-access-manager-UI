import  { useEffect, useMemo, useState, type SetStateAction } from 'react';
import {  Button, Modal, Typography, message } from 'antd';
import axios from '../api/axiosInstance';
import type {  TeamDTO, UserDTO } from '../types/dto';
import TeamFeatureAccess from './TeamFeatureAccess';
import { useStoreState, useStoreActions } from '../store/hooks';
import AuditTrail from './AuditTrail';
import { DataGrid, GridToolbar, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import { IconButton, Tab, Tabs, TextField, Tooltip, useTheme } from '@mui/material';
import { useAuth } from '../providers/AuthProvider';

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
            message.error('Failed to fetch audit trail');
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        if(addModalOpen && features.length == 0){
            fetchFeatures();
        }
    },[addModalOpen]);

    const fetchTeams = async () => {
      try{
        
        if (user?.platformRole === "PLATFORM_ADMIN") {
          const response = await axios.get<TeamDTO[]>('/v1/team-access-manager/team/getAll');
          setTeams(response.data);
        }else if (user?.platformRole === "TEAM_ADMIN") {
          const response = await axios.get<TeamDTO[]>('/v1/team-access-manager/team/getAll');
          setTeams(response.data);
        }
      }catch (error) {
        message.error('Error fetching users');
      }
    }
    
    useEffect(() => {
      fetchTeams()
    }, []);

    const confirmDeleteTeam = (team: TeamDTO) => {
        Modal.confirm({
          title: `You are about to inactivate the team "${team.name}".`,
          content: (
            <div>
              <p>This action will:</p>
              <ul style={{ paddingLeft: 20 }}>
                <li>Inactivate the team to preserve the team and its audit history</li>
                <li>Switch all users in the team to override team access</li>
                <li>Set their access to all features as <strong>“Not Granted”</strong> by default</li>
              </ul>
              <p style={{ marginTop: 16 }}>Are you sure you want to continue?</p>
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
        message.warning('Please enter a team name');
        return;
    }

    const accessList = features.map((feature) => ({
        featureId: feature.id,
        hasAccess: selectedFeatures.includes(feature.name),
    }));

    axios.post('/v1/team-access-manager/team/addNew', {
        name: newTeamName,
        accessList : accessList
    })
        .then((res) => {
        setTeams((prev) => [...prev, res.data]);
        setAddModalOpen(false);
        setNewTeamName('');
        setSelectedFeatures([]);
        message.success('Team created successfully');
        })
        .catch(() => {
        message.error('Failed to create team');
        });
};

    const handleDeleteTeam = (team: TeamDTO) => {
        axios.post('/v1/team-access-manager/team/delete',null,{
            params : {
                teamId : team.id,
            }
        }).then(() => {
            fetchTeams();
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
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'userList',
      headerName: 'Members',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Button type="link" onClick={() => openUserListModal(params.row)}>
            {params.row.userList?.length ?? 0}
        </Button>   
        ),
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      sortable: false,
      filterable: false,
      width: 180,
      renderCell: (params) => (
        <Button variant="text" onClick={() => openPermissionsModal(params.row)}>
          <ManageAccountsIcon fontSize="small" style={{ marginRight: 4 }} />
          Manage
        </Button>
      ),
      
    },
    {
      field: 'audit',
      headerName: 'Audit Trail',
      sortable: false,
      filterable: false,
      width: 150,
      renderCell: (params) => (
        <Button variant="text" onClick={() => openAuditModal(params.row.id)}>
          <HistoryIcon fontSize="small" style={{ marginRight: 4 }} />
          View
        </Button>
      ),
    },
    {
        field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            width: 150,
            renderCell: (params) => {
              const canDelete = user?.platformRole === 'PLATFORM_ADMIN'
              return(
              <>
                <Tooltip title="Delete">
                  <IconButton onClick={() => confirmDeleteTeam(params.row)} color="error" disabled = {!canDelete}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
              )
            },
    }
 
  ];

  const baseColumns = useMemo(() => {
    if (selectedTab === 1) {
      return columns.filter((col) => col.field !== 'permissions' && col.field !== 'actions' && col.field !== 'userList');
    }
    return columns
  }, [selectedTab]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const theme = useTheme();

  const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
      setSelectedTab(newValue);
    };
    
  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Team Access Control</Title>
      <div className='d-flex justify-content-end mb-3'>
        {user?.platformRole === 'PLATFORM_ADMIN' && <Button type="primary" onClick={() => setAddModalOpen(true)}>
          Add New Team
        </Button>}
      </div>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Active Teams" />
        <Tab label="Inactive Teams" />
      </Tabs>

        <Modal
            title="Add New Team"
            open={addModalOpen}
            onCancel={() => setAddModalOpen(false)}
            onOk={handleAddTeam}
            okText="Create Team"
        >
            <div style={{ marginBottom: 12 }}>
                <label>Team Name:</label>
                <input
                style={{ width: '100%', padding: 8, marginTop: 4 }}
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                />
            </div>

            <div>
                <label>Select Feature Permissions:</label>
                <div style={{ maxHeight: 200, overflowY: 'auto', padding: 8 }}>
                    {features.map((feature) => (
                    <div key={feature.id}>
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
      <Modal
  title={`Users in ${selectedTeamName}`}
  open={userModalOpen}
  onCancel={() => setUserModalOpen(false)}
  footer={null}
>
  <ul>
    {selectedUsers.map((user) => (
      <li key={user.id}>
        {user.name} ({user.email})
      </li>
    ))}
  </ul>
  <p style={{ marginTop: 16, fontStyle: 'italic', color: '#888' }}>
    To view or edit individual user access, please navigate to the <strong>User Access View</strong>.
  </p>
</Modal>

      <Modal
        title={`Permissions for ${selectedTeam?.name}`}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        {selectedTeam && <TeamFeatureAccess teamId={selectedTeam.id} />}
      </Modal>

      <Modal>

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
