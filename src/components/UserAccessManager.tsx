import { useEffect, useState } from 'react';
import { Table, Button, Dropdown, Menu, Typography, message, Modal } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import axios from '../api/axiosInstance';
import UserFeatureAccess from './UserFeatureAccess';
import type { UserDTO } from '../types/dto';
import AuditTrail from './AuditTrail';

const { Title } = Typography;

export default function UserAccessManager() {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [accessModalOpen, setAccessModalOpen] = useState(false);

    const [auditModalOpen, setAuditModalOpen] = useState(false);
    const [auditData, setAuditData] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    useEffect(() => {
        axios
        .get<UserDTO[]>('/v1/team-access-manager/user/getAll')
        .then((res) => setUsers(res.data || []))
        .catch(() => message.error('Failed to load users'));
    }, []);

    const openAccessModal = (user: UserDTO) => {
        setSelectedUser(user);
        setAccessModalOpen(true);
    };

    const closeAccessModal = () => {
        setAccessModalOpen(false);
        setSelectedUser(null);
    };

    const handleEdit = (user: UserDTO) => {
        message.info(`Edit user: ${user.name}`);
    };

    const updateUserAccessMode = (userId: number, newMode: string) => {
    setUsers((prev) =>
        prev.map((user) =>
        user.id === userId ? { ...user, accessMode: newMode } : user
        )
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
                message.error('Failed to fetch audit trail');
            } finally {
                setAuditLoading(false);
            }
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
            .post('/v1/team-access-manager/user/delete', null, { params: { userId: user.id } })
            .then(() => {
                setUsers((prev) => prev.filter((u) => u.id !== user.id));
                message.success('User deleted');
            })
            .catch(() => message.error('Failed to delete user'));
        },
        });
    };

    const openInfoModal = (selectedUser: UserDTO) => {
        Modal.info({
            title: `User Information`,
            content: (
                <div style={{ lineHeight: '2' }}>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Employee ID:</strong> {selectedUser.empId}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Team:</strong> {selectedUser.teamName}</p>
                </div>
            ),
            onOk() {},
        }
        )
    }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Team Name',
      dataIndex: 'teamName',
    },
    {
      title: 'Access',
      render: (_: any, user: UserDTO) => (
        <Button type="link" onClick={() => openAccessModal(user)}>
          Manage Permissions
        </Button>
      ),
    },
    {
    title: 'Audit Trail',
    render: (_: any, user: UserDTO) => (
        <Button type="link" onClick={() => openAuditModal(user.id)}>
            View Audit
        </Button>
    ),
    },
    {
      title: 'Actions',
      render: (_: any, user: UserDTO) => {
        const menu = (
          <Menu>
            <Menu.Item key="view" onClick={() => openInfoModal(user)}>
              View Personal Details
            </Menu.Item>
            <Menu.Item key="edit" onClick={() => handleEdit(user)}>
              Edit Personal Details
            </Menu.Item>
            <Menu.Item key="delete" danger onClick={() => handleDelete(user)}>
              Delete User
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <EllipsisOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>User Access Manager</Title>
      <Table rowKey="id" columns={columns} dataSource={users} pagination={false} bordered />

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
            onAccessModeChange = {updateUserAccessMode}
          />
        )}
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
