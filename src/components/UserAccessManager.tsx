import { useEffect, useMemo, useState, type SetStateAction } from 'react';
import { Button, Typography, Modal } from 'antd';
import axios from '../api/axiosInstance';
import UserFeatureAccess from './UserFeatureAccess';
import type { TeamDTO, UserDTO } from '../types/dto';
import AuditTrail from './AuditTrail';
import UserFormModal from './UserFormModal';
import { DataGrid, GridToolbar, type GridColDef , type GridPaginationModel } from '@mui/x-data-grid';
import { IconButton, Tab, Tabs, TextField, Tooltip, useTheme } from '@mui/material';
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
  const theme = useTheme();
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
      title: `Delete user "${user.name}"?`,
      content: 'Are you sure you want to delete this user?',
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
      title: `User Information`,
      content: (
        <div style={{ lineHeight: '2' }}>
          <p>
            <strong>Email:</strong> {selectedUser.email}
          </p>
          <p>
            <strong>Employee ID:</strong> {selectedUser.empId}
          </p>
          <p>
            <strong>Role:</strong> {selectedUser.role}
          </p>
          <p>
            <strong>Team:</strong> {selectedUser.teamName}
          </p>
        </div>
      ),
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
    renderCell: (params) => (
      <Button variant="text" onClick={() => openAccessModal(params.row)}>
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
    renderCell: (params) => (
      <>
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
      </>
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
    <div style={{ padding: 24 }}>
      <Title level={4}>User Access Manager</Title>
      <div className='d-flex justify-content-end mb-3'>
        <Button
        type="primary"
        onClick={() => setAddModalOpen(true)}
      >
        Add New User
      </Button>
      </div>
      
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Active Users" />
        <Tab label="Inactive Users" />
      </Tabs>

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

      <Modal
        title={`Access for ${selectedUser?.name}`}
        open={accessModalOpen}
        onCancel={closeAccessModal}
        footer={null}
        destroyOnClose
        width={600}
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
