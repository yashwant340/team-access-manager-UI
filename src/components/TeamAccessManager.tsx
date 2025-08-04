import  { useEffect, useState } from 'react';
import { Table, Button, Modal, Typography, message } from 'antd';
import axios from '../api/axiosInstance';
import type {  TeamDTO, UserDTO } from '../types/dto';
import TeamFeatureAccess from './TeamFeatureAccess';
import { useStoreState, useStoreActions } from '../store/hooks';
import { DeleteOutlined } from '@ant-design/icons';
import AuditTrail from './AuditTrail';

const { Title } = Typography;

export default function TeamAccessManager() {
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

    useEffect(() => {
    axios
        .get<TeamDTO[]>('/v1/team-access-manager/team/getAll')
        .then((res) => setTeams(res.data))
        .catch(() => message.error('Failed to load teams'));
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
            setTeams((prev) => prev.filter(x => x.id !== team.id))
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

  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'name',
    },
    {
      title: 'Members',
      render: (_: any, team: TeamDTO) => (
        <Button type="link" onClick={() => openUserListModal(team)}>
            {team.userList?.length ?? 0}
        </Button>   
        ),
    },
    {
      title: 'Permissions',
      render: (_: any, team: TeamDTO) => (
        <Button type="link" onClick={() => openPermissionsModal(team)}>
          Manage Permissions
        </Button>
      ),
    },
    {
    title: 'Audit',
    render: (_: any, team: TeamDTO) => (
        <Button type="link" onClick={() => openAuditModal(team.id)}>
            View Audit
        </Button>
    ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: (_: any, team: TeamDTO) => (
        <DeleteOutlined
            onClick={() => confirmDeleteTeam(team)}
            style={{ color: 'red', fontSize: 18, cursor: 'pointer' }}
        />
        ),
    }
 
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Team Access Control</Title>
      <Button type="primary" onClick={() => setAddModalOpen(true)} style={{ marginBottom: 16 }}>
        Add New Team
      </Button>
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

      <Table rowKey="id" columns={columns} dataSource={teams} pagination={false} bordered />
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
