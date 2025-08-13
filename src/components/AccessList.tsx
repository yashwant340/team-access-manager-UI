import { Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from "@mui/material";
import type { AccessControlDTO } from "../types/dto";

// interface Access {
//   id: string;
//   name: string;
//   provisioned: boolean;
//   pendingRequestType?: string;
// }

export default function AccessList({
  accesses,
  onRequestAction
}: {
  accesses: AccessControlDTO;
  onRequestAction: (id: number, type: "REVOKE" | "NEW") => void;
}) {

  const finalAccess = accesses.userAccessControlDTOS.length > 0 ? accesses.userAccessControlDTOS : accesses.teamAccessControlDTOS;
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Access Name</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {finalAccess.map((acc) => (
          <TableRow key={acc.id}>
            <TableCell>{acc.featureName}</TableCell>
            <TableCell>
              {acc.hasAccess ? (
                <Chip label="Provisioned" color="success" />
              ) : (
                <Chip label="Not Provisioned" color="warning" />
              )}
            </TableCell>
            <TableCell>
              {acc.hasAccess ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onRequestAction(acc.id, "REVOKE")}
                >
                  Request Revoke
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => onRequestAction(acc.id, "NEW")}
                >
                  Request Access
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
