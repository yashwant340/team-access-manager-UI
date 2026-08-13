import { useEffect, useMemo, useState, type SetStateAction } from 'react';
import { Button, Typography, Modal } from 'antd';
import axios from '../api/axiosInstance';
import UserFeatureAccess from './UserFeatureAccess';
import type { TeamDTO, UserDTO } from '../types/dto';
import AuditTrail from './AuditTrail';
import UserFormModal from './UserFormModal';
import { DataGrid, GridToolbar, type GridColDef , type GridPaginationModel } from '@mui/x-data-grid';
import { Box, IconButton, Tab, Tabs, TextField, Tooltip, Typography as MuiTypography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../providers/AuthProvider';
import { toast } from 'react-toastify';


const { Title } = Typography;

const newFormInitialValues = {
  name: '',
  email: '',
  empId: '',
  team: 0,
  role: '',
};

export default function UserAccessManager() {
  const {user} = useAuth();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [accessModalOpen, setAccessModalOpen] = useState(false);

  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditData, setAuditData] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDTO | null>(null);

  const [teams, setTeams] = useState<TeamDTO[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserDTO[]>(users);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const userList = selectedTab === 0 ? activeUsers : inActiveUsers;
    const filtered = userList.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
    setFilteredUsers(filtered);
  }, [searchText, users,selectedTab]);

  useEffect(() => {
    if(user?.platformRole === 'PLATFORM_ADMIN'){
      axios
      .get<UserDTO[]>('/v1/team-access-manager/user/getAll')
      .then((res) => setUsers(res.data || []))
      .catch(() => toast.error('Failed to load users. Please try again after sometime',
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
          }
        ));
      
    }else if(user?.platformRole === 'TEAM_ADMIN'){
      axios
      .get<UserDTO[]>('/v1/team-access-manager/user/teamId/', {
        params : {
          teamId : user.teamId
        }
      })
      .then((res) => setUsers(res.data || []))
      .catch(() => toast.error('Failed to load users. Please try again after sometime',
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
          }));
    }

    axios.get<TeamDTO[]>('v1/team-access-manager/team/getAll').then((res) => setTeams(res.data || []));
  }, []);

  const activeUsers = users.filter(user => user.active);
  const inActiveUsers = users.filter(user => !user.active);

  const openAccessModal = (user: UserDTO) => {
    setSelectedUser(user);
    setAccessModalOpen(true);
  };

  const closeAccessModal = () => {
    setAccessModalOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: UserDTO) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleEditSave = (values: any, team: TeamDTO | undefined) => {
    const updatedUser: UserDTO = {
      ...editUser!,
      name: values.name,
      email: values.email,
      teamId: team?.id || 0,
      teamName: team?.name || '',
      role: values.role,
    };

    axios.post<UserDTO>('v1/team-access-manager/user/updateUser', updatedUser).then(() => {
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      toast.success('User details edited successfully',
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
          }
        );
      setEditModalOpen(false);
      setEditUser(null);
    });
  };

  const updateUserAccessMode = (userId: number, newMode: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, accessMode: newMode } : user))
    );
  };

  const openAuditModal = async (userId: number) => {
    setAuditModalOpen(true);
    setAuditLoading(true);
    try {
      const res = await axios.get('/v1/team-access-manager/user/userAuditLog', {
        params: { userId },
      });
      setAuditData(res.data || []);
    } catch {
      toast.error('Failed to fetch audit data. Please try again after sometime',
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
          });
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAddSave = (values: any, team: TeamDTO | undefined) => {
    const payload = {
      name: values.name,
      email: values.email,
      empId: values.empId,
      teamId: team?.id || 0,
      teamName: team?.name || '',
      role: values.role,
      inheritTeamAccess: true,
    };

    axios.post<UserDTO>('/v1/team-access-manager/user/addNew', payload).then((res) => {
      toast.success('User has been added successfully',
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false
          });
      const result = {
        ...res.data,
        teamName: teams.find((x) => x.id === res.data.teamId)?.name || '',
      };
      setUsers((prev) => [...prev, result]);
      setAddModalOpen(false);
    });
  };

  const handleDelete = (user: UserDTO) => {
    Modal.confirm({
      className: 'polished-confirm-modal',
      title: `Delete user "${user.name}"?`,
      content: 'This removes the user and their direct access configuration. This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        axios
          .post('/v1/team-access-manager/user/deleteUser', null, {
            params: { userId: user.id },
          })
          .then(() => {
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            toast.success('User has been deleted successfully',
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false
            });
          })
          .catch(() => toast.error('Failed to delete the user. Please try again after sometime',
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false
            })
        )
      },
    });
  };

  const openInfoModal = (selectedUser: UserDTO) => {
    Modal.info({
      className: 'polished-confirm-modal',
      title: `User information`,
      content: (
        <div className="info-summary-card">
          <div className="info-summary-row"><span>Email</span><strong>{selectedUser.email || '—'}</strong></div>
          <div className="info-summary-row"><span>Employee ID</span><strong>{selectedUser.empId || '—'}</strong></div>
          <div className="info-summary-row"><span>Role</span><strong>{selectedUser.role || '—'}</strong></div>
          <div className="info-summary-row"><span>Team</span><strong>{selectedUser.teamName || '—'}</strong></div>
        </div>
      ),
      okText: 'Done',
      onOk() {},
    });
  };

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'email',
    headerName: 'Email',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'empId',
    headerName: 'Employee ID',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'teamName',
    headerName: 'Team Name',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'role',
    headerName: 'Role',
    sortable: true,
    filterable: true,
    flex: 1,
    minWidth: 150, 
  },
  {
    field: 'permissions',
    headerName: 'Permissions',
    sortable: false,
    filterable: false,
    width: 180,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Box className="grid-cell-content grid-cell-content-center"><Button variant="outlined" className="grid-action-button" onClick={() => openAccessModal(params.row)}>
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
    width: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Box className="grid-cell-content grid-cell-content-center"><Button variant="outlined" className="grid-action-button" onClick={() => openAuditModal(params.row.id)}>
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
    width: 150,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <Box className="grid-action-buttons">
        <Tooltip title="View Details">
          <IconButton onClick={() => openInfoModal(params.row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={() => handleDelete(params.row)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

const baseColumns = useMemo(() => {
  if (selectedTab === 1) {
    return columns.filter((col) => col.field !== 'permissions' && col.field !== 'actions');
  }
  return columns.filter((col) => col.field !== 'email' && col.field !== 'empId' && col.field !== 'role');
}, [selectedTab]);

const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
  pageSize: 10,
  page: 0,
});

const handleTabChange = (_event: any, newValue: SetStateAction<number>) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="user-access-manager">
      <div className="user-access-heading">
        <div>
          <Title level={4} style={{ margin: 0 }}>User access</Title>
          <MuiTypography variant="body2" color="text.secondary">Review people, permissions, and account activity in one place.</MuiTypography>
        </div>
        <Button
        type="primary"
        onClick={() => setAddModalOpen(true)}
      >
          Add user
      </Button>
      </div>
      
      <UserFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddSave}
        teams={teams}
        initialValues={newFormInitialValues}
        mode="add"
      />

      <UserFormModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditUser(null);
        }}
        onSubmit={handleEditSave}
        teams={teams}
        initialValues={editUser || newFormInitialValues}
        mode="edit"
        originalValues={editUser!}
      />

<div className="user-access-table-wrap app-surface">
  <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2.5 }}>
    <Tab label="Active users" />
    <Tab label="Inactive users" />
  </Tabs>
  <Box className="user-access-toolbar">
    <TextField
        label="Search users"
        variant="outlined"
        size="small"
        sx={{ flex: 1, minWidth: 220 }}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    <MuiTypography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
      {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} shown
    </MuiTypography>
  </Box>
  <DataGrid
        rows={filteredUsers}
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
          '& .MuiDataGrid-cell': {
            fontSize: '0.95rem',
            padding: '10px 12px',
          },
          '& .MuiDataGrid-footerContainer': {
            minHeight: 52,
          },
        }}
      />
</div>

      <Modal
        className="polished-modal permission-modal"
        title={<div className="modal-title-block"><Title level={4}>User permissions</Title><Typography.Text type="secondary">{selectedUser?.name}</Typography.Text></div>}
        open={accessModalOpen}
        onCancel={closeAccessModal}
        footer={null}
        destroyOnClose
        width={680}
      >
        {selectedUser && (
          <UserFeatureAccess
            userId={selectedUser.id}
            initialOverride={selectedUser.accessMode}
            onClose={closeAccessModal}
            onAccessModeChange={updateUserAccessMode}
          />
        )}
      </Modal>

      {auditModalOpen && (
        <AuditTrail
          visible={true}
          onClose={() => setAuditModalOpen(false)}
          auditData={auditData}
          loading={auditLoading}
        />
      )}
    </div>
  );
}
