import { useEffect, useState } from 'react';
import { Table, Button, Typography, Segmented, message } from 'antd';
import axios from '../api/axiosInstance';
import type { AccessControlDTO, UserAccessControlDTO, TeamAccessControlDTO } from '../types/dto';

interface Props {
  userId: number;
  initialOverride: string;
  onClose: () => void;
  onAccessModeChange: (userId: number, newMode: string) => void;
}

export default function UserFeatureAccess({ userId, initialOverride, onClose, onAccessModeChange }: Props) {
  const [accessMode, setAccessMode] = useState<string>(initialOverride);
  const [userAccess, setUserAccess] = useState<UserAccessControlDTO[]>([]);
  const [teamAccess, setTeamAccess] = useState<TeamAccessControlDTO[]>([]);
  const [featureMap, setFeatureMap] = useState<Record<number, boolean>>({});
  const [originalMode, setOriginalMode] = useState<string>(initialOverride);
  const [originalFeatureMap, setOriginalFeatureMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  const updatedMap: Record<number, boolean> = {};

  if (accessMode === 'OVERRIDE_TEAM_ACCESS') {
    if (userAccess.length > 0) {
      userAccess.forEach((item) => {
        updatedMap[item.featureId] = item.hasAccess;
      });
    } else {
      // First time override: all false by default
      teamAccess.forEach((item) => {
        updatedMap[item.featureId] = false;
      });
    }
  } else {
    // INHERIT mode: use teamAccess values
    teamAccess.forEach((item) => {
      updatedMap[item.featureId] = item.hasAccess;
    });
  }

  setFeatureMap(updatedMap);
}, [accessMode]);


  useEffect(() => {
    axios
      .get<AccessControlDTO>(`/v1/team-access-manager/user/user-permissions`, {
        params: { userId : userId },
      })
      .then((res) => {
        const userList = res.data.userAccessControlDTOS || [];
        const teamList = res.data.teamAccessControlDTOS || [];

        setUserAccess(userList);
        setTeamAccess(teamList);

        let effectiveAccess = [];
        if (userList.length > 0) {
          effectiveAccess = userList;
        } else {
          effectiveAccess = teamList;
        }

        const initialMap: Record<number, boolean> = {};
        effectiveAccess.forEach((item) => {
          initialMap[item.featureId] = item.hasAccess;
        });

        // In case of first override (userAccess empty), build default map with all features set to false
        if (initialOverride && userList.length === 0) {
          teamList.forEach((item) => {
            if (!(item.featureId in initialMap)) {
              initialMap[item.featureId] = false;
            }
          });
        }

        setFeatureMap(initialMap);
        setOriginalFeatureMap(initialMap);
      })
      .catch(() => message.error('Failed to load user access'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAccessChange = (featureId: number, value: boolean) => {
    setFeatureMap((prev) => ({ ...prev, [featureId]: value }));
  };

  const hasChanges = () => {
    if (originalMode !== accessMode) return true;
    if (accessMode === 'OVERRIDE_TEAM_ACCESS') {
      return Object.keys(featureMap).some(
        (fid) => featureMap[+fid] !== originalFeatureMap[+fid]
      );
    }
    return false;
  };

  const handleSave = () => {
  setSaving(true);

  const payload: {
    userId: number;
    accessMode: string;
    featureAccessDetailsWrapper?: {
      featureAccessWrapperList: {
        featureId: number;
        access: boolean;
      }[];
    };
  } = {
    userId,
    accessMode,
  };

  if (accessMode === 'OVERRIDE_TEAM_ACCESS') {
    payload.featureAccessDetailsWrapper = {
      featureAccessWrapperList: Object.entries(featureMap).map(([fid, hasAccess]) => ({
        featureId: +fid,
        access: hasAccess,
      })),
    };
  }

  axios
    .post('/v1/team-access-manager/user/updateAccessMode', payload)
    .then(() => {
      message.success('User access updated');
      setOriginalMode(accessMode);
      setOriginalFeatureMap({ ...featureMap });
      onAccessModeChange(userId, accessMode);
      onClose();
    })
    .catch(() => message.error('Failed to save user access'))
    .finally(() => setSaving(false));
};


  const renderAccessToggle = (featureId: number, hasAccess: boolean, readonly: boolean) => (
    <Segmented
      options={['Not Granted', 'Granted']}
      value={hasAccess ? 'Granted' : 'Not Granted'}
      onChange={(val) => handleAccessChange(featureId, val === 'Granted')}
      disabled={readonly}
      style={{ width: 160 }}
    />
  );

  const getCurrentAccessList = (): UserAccessControlDTO[] => {
  if (accessMode === 'OVERRIDE_TEAM_ACCESS') {
    if (userAccess.length > 0) return userAccess;

    // Create default user-level access based on team access
    return teamAccess.map((item) => ({
      id: 0,
      userId,
      userName: '',
      featureId: item.featureId,
      featureName: item.featureName,
      hasAccess: false,
    }));
  }

  // Convert team access to user DTO shape for readonly display
  return teamAccess.map((item) => ({
    id: 0,
    userId,
    userName: '',
    featureId: item.featureId,
    featureName: item.featureName,
    hasAccess: item.hasAccess,
  }));
};


  return (
    <div style={{ padding: 12 }}>
      <Typography.Title level={5}>Access Mode</Typography.Title>
      <Segmented
        options={[
            { label: 'Inherit', value: 'INHERIT_TEAM_ACCESS' },
            { label: 'Override', value: 'OVERRIDE_TEAM_ACCESS' },
        ]}
        value={accessMode}
        onChange={(val) => setAccessMode(val as 'INHERIT_TEAM_ACCESS' | 'OVERRIDE_TEAM_ACCESS')}
        style={{ marginBottom: 16 }}
        />

      <Typography.Title level={5}>Feature Access</Typography.Title>
      <Table
        rowKey={(record) => record.featureId}
        dataSource={getCurrentAccessList()}
        pagination={false}
        columns={[
          {
            title: 'Feature',
            dataIndex: 'featureName',
          },
          {
            title: 'Access',
            render: (_, record) => {
              const readonly = accessMode !== 'OVERRIDE_TEAM_ACCESS';
              return renderAccessToggle(record.featureId, featureMap[record.featureId] ?? false, readonly);
            },
          },
        ]}
        bordered
        loading={loading}
      />

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button onClick={onClose} style={{ marginRight: 12 }}>
          Cancel
        </Button>
        <Button type="primary" disabled={!hasChanges()} onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
