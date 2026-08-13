import { Modal, Table, Typography, Tag, Empty } from 'antd';
import type { FC } from 'react';

interface AuditTrailProps {
  visible: boolean;
  onClose: () => void;
  auditData: any[];
  loading: boolean;
}

const AuditTrail: FC<AuditTrailProps> = ({visible, onClose, auditData, loading }) => {
  const columns = [
    { title: 'Action', dataIndex: 'auditDescription', render: (value: string) => <div className="audit-action"><span className="audit-marker" /><Typography.Text strong>{value || '—'}</Typography.Text></div> },
    { title: 'Updated by', dataIndex: 'actor', render: (value: string) => value || '—' },
    { title: 'Updated date', dataIndex: 'date', render: (value: string) => <Typography.Text type="secondary">{value || '—'}</Typography.Text> },
  ];

  return (
    <Modal className="polished-modal audit-modal" title={<div className="modal-title-block"><Typography.Title level={4}>Audit trail</Typography.Title><Typography.Text type="secondary">A chronological record of permission and account changes.</Typography.Text></div>} open={visible} onCancel={onClose} footer={null} width={800}>
      <div className="audit-summary">
        <Typography.Text type="secondary">Activity</Typography.Text>
        <Tag color="blue">{auditData.length} {auditData.length === 1 ? 'event' : 'events'}</Tag>
      </div>
      <Table
        className="modal-table"
        rowKey="id"
        dataSource={auditData}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No audit activity yet" /> }}
        scroll={{ x: 560 }}
      />
    </Modal>
  );
};

export default AuditTrail;
