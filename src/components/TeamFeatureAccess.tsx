import { useEffect, useState } from 'react';
import { Table, Switch, Button, message, Spin } from 'antd';
import axios from '../api/axiosInstance';
import type { TeamAccessControlDTO } from '../types/dto';


interface Props {
  teamId: number;
}

export default function TeamFeatureAccess({ teamId }: Props) {
  const [features, setFeatures] = useState<TeamAccessControlDTO[]>([]);
  const [accessMap, setAccessMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false)
  
  useEffect(() => {
    if (!teamId) return;

    setLoading(true);
    axios
      .get<{ teamAccessControlDTOS: TeamAccessControlDTO[] }>('/v1/team-access-manager/team/team-permissions', {
        params : {
            teamId : teamId,
        }
      })
      .then((res) => {
        const list = res.data.teamAccessControlDTOS || [];
        setFeatures(list);

        const initialMap: Record<number, boolean> = {};
        list.forEach((item) => {
          initialMap[item.featureId] = item.hasAccess;
        });
        setAccessMap(initialMap);
      })
      .catch(() => message.error('Failed to load team feature access'))
      .finally(() => setLoading(false));
  }, [teamId]);

  const handleToggle = (featureId: number, value: boolean) => {
    setAccessMap((prev) => ({ ...prev, [featureId]: value }));
  };

  const handleSave = () => {
    setSaving(true);
   const payload = features
    .filter((f) => accessMap[f.featureId] !== f.hasAccess) 
    .map((f) => ({
      id: f.id,
      teamId: f.teamId,
      featureId: f.featureId,
      hasAccess: accessMap[f.featureId],
    }));

    axios
      .post(`/v1/team-access-manager/team/updateAccess`, payload)
      .then((res) => {
            const updatedItems = res.data as TeamAccessControlDTO[];

            const mergedFeatures = features.map((f) => {
            const updated = updatedItems.find((u) => u.featureId === f.featureId);
            return updated ? { ...f, ...updated } : f;
            });
            setFeatures(mergedFeatures);

            setAccessMap((prev) => {
            const nextMap = { ...prev };
            updatedItems.forEach((u) => {
                nextMap[u.featureId] = u.hasAccess;
            });
            return nextMap;
            });
            message.success('Team feature access updated')
        })
      .catch(() => message.error('Failed to save access changes'))
      .finally(() => setSaving(false));
  };

  const columns = [
    {
      title: 'Feature',
      dataIndex: 'featureName',
    },
    {
      title: 'Access',
      render: (_: any, record: TeamAccessControlDTO) => (
        <Switch
          checked={accessMap[record.featureId] || false}
          onChange={(val) => handleToggle(record.featureId, val)}
        />
      ),
    },
  ];

  return loading ? (
    <Spin size="large" />
  ) : (
    <>
      <Table
        rowKey="featureId"
        columns={columns}
        dataSource={features}
        pagination={false}
        bordered
      />
      <Button
        type="primary"
        onClick={handleSave}
        loading={saving}
        style={{ marginTop: 16 }}
      >
        Save Changes
      </Button>
    </>
  );
}
