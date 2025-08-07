import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { Form, FormFeedback, FormGroup, Input, Label } from 'reactstrap';
import type { TeamDTO, UserDTO } from '../types/dto';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<UserDTO>, selectedTeam?: TeamDTO) => void;
  teams: TeamDTO[];
  initialValues: Partial<UserDTO>;
  mode: 'add' | 'edit';
  originalValues?: Partial<UserDTO>;
}

const initialValidation = {
  name: false,
  email: false,
  empId: false,
  team: false,
  role: false,
};

const initialTouchValidation = {
  name: false,
  email: false,
  empId: false,
  team: false,
  role: false,
};

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  teams,
  initialValues,
  mode,
  originalValues
}: Props) {
  const [formValues, setFormValues] = useState(initialValues);
  const [formValidation, setFormValidation] = useState(initialValidation);
  const [touchedValidation, setTouchedValidation] = useState(initialTouchValidation);
  const [selectedTeam, setSelectedTeam] = useState<TeamDTO | undefined>(
    teams.find((x) => x.id === initialValues.teamId)
  );

  useEffect(() => {
    setFormValues(initialValues);
    setSelectedTeam(teams.find((x) => x.id === initialValues.teamId));
  }, [initialValues, teams]);

  const isEdited = mode === 'edit' && initialValues
  ? JSON.stringify(formValues) !== JSON.stringify(initialValues)
  : true;

  console.log(originalValues)
  console.log(isEdited)
  console.log(mode)
 console.log((mode === 'edit' && !isEdited))
  const isFormValid = () => {
    return Object.values(formValidation).every((val) => val);
  };

  const handleSubmit = () => {
    if ((mode === 'add' && isFormValid()) || (mode === 'edit' && isEdited)) {
      onSubmit(formValues, selectedTeam);
    }

  };

  return (
    <Modal
      title={mode === 'add' ? 'Add New User' : `Edit User: ${initialValues.name}`}
      open={open}
      onCancel={() => {
        setFormValidation(initialValidation);
        setTouchedValidation(initialTouchValidation);
        onClose();
      }}
      onOk={handleSubmit}
      okText={mode === 'add' ? 'Create' : 'Save'}
      okButtonProps={{ disabled: mode === 'add' ? !isFormValid() : !isEdited}}
    >
      <Form>
        <FormGroup>
          <Label for={'name'}>User Name:</Label>
          <Input
            id="user-name"
            type="text"
            placeholder="User Name"
            value={formValues.name || ''}
            onChange={(e) => {
              setFormValues({ ...formValues, name: e.target.value });
              setFormValidation({ ...formValidation, name: e.target.value.trim().length > 0 });
            }}
            onBlur={() => setTouchedValidation({ ...touchedValidation, name: true })}
            invalid={touchedValidation.name && !formValidation.name}
            required
          />
          <FormFeedback>Name is required</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for={'email'}>Email ID:</Label>
          <Input
            id="email-id"
            type="text"
            placeholder="Email ID"
            value={formValues.email || ''}
            onChange={(e) => {
              setFormValues({ ...formValues, email: e.target.value });
              setFormValidation({ ...formValidation, email: e.target.value.trim().length > 0 });
            }}
            onBlur={() => setTouchedValidation({ ...touchedValidation, email: true })}
            invalid={touchedValidation.email && !formValidation.email}
            required
          />
          <FormFeedback>Email is required</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for={'empId'}>Employee ID:</Label>
          <Input
            id="emp-id"
            type="text"
            placeholder="Employee ID"
            value={formValues.empId || ''}
            onChange={(e) => {
              setFormValues({ ...formValues, empId: e.target.value });
              setFormValidation({ ...formValidation, empId: e.target.value.trim().length > 0 });
            }}
            onBlur={() => setTouchedValidation({ ...touchedValidation, empId: true })}
            invalid={touchedValidation.empId && !formValidation.empId}
            required
            disabled={mode === 'edit'}
          />
          <FormFeedback>Employee ID is required</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for={'team'}>Team:</Label>
          <Input
            type="select"
            id="team-select"
            value={selectedTeam?.name || ''}
            onChange={(e) => {
              const selectedTeamName = e.target.value;
              const selected = teams.find((x) => x.name === selectedTeamName);
              setSelectedTeam(selected);
              setFormValues({ ...formValues, teamId: selected?.id || 0 });
              setFormValidation({ ...formValidation, team: selectedTeamName.trim().length > 0 });
            }}
            onBlur={() => setTouchedValidation({ ...touchedValidation, team: true })}
            invalid={touchedValidation.team && !formValidation.team}
            required
          >
            <option value="" disabled>
              -- Choose a team --
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </Input>
          <FormFeedback>Team is required</FormFeedback>
        </FormGroup>

        <FormGroup>
          <Label for={'role'}>Role:</Label>
          <Input
            id="role"
            type="text"
            placeholder="Role"
            value={formValues.role || ''}
            onChange={(e) => {
              setFormValues({ ...formValues, role: e.target.value });
              setFormValidation({ ...formValidation, role: e.target.value.trim().length > 0 });
            }}
            onBlur={() => setTouchedValidation({ ...touchedValidation, role: true })}
            invalid={touchedValidation.role && !formValidation.role}
            required
          />
          <FormFeedback>Role is required</FormFeedback>
        </FormGroup>
      </Form>
    </Modal>
  );
}
