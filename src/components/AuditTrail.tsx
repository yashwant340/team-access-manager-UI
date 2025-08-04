import { Modal, Table } from 'antd';
import type { FC } from 'react';

interface AuditTrailProps {
  visible: boolean;
  onClose: () => void;
  auditData: any[];
  loading: boolean;
}

const AuditTrail: FC<AuditTrailProps> = ({visible, onClose, auditData, loading }) => {
  const columns = [
    { title: 'Action', dataIndex: 'auditDescription' },
    { title: 'Updated By', dataIndex: 'actor' },
    { title: 'Updated Date', dataIndex: 'date' },
  ];

  return (
    <Modal title="Audit Trail" open = {visible} onCancel={onClose} footer={null} width={800}>
      <Table
        rowKey="id"
        dataSource={auditData}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default AuditTrail;
