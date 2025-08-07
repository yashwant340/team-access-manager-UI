export interface TeamDTO {
  id: number;
  name: string;
  userList: UserDTO[];
  active : boolean;
}

export interface UserDTO{
    id : number;
    name : string;
    empId : string;
    email : string;
    role : string;
    teamId :number;
    teamName : string;
    accessMode : string;
    active :boolean;
}

export interface FeatureDTO {
  id: number;
  name: string;
}

export interface TeamAccessControlDTO {
  id: number;
  teamId: number;
  teamName: string;
  featureId: number;
  featureName: string;
  hasAccess: boolean;
}

export interface UserAccessControlDTO {
  id: number;
  userId: number;
  userName: string;
  featureId: number;
  featureName: string;
  hasAccess: boolean;
}

export interface AccessControlDTO {
  teamAccessControlDTOS: TeamAccessControlDTO[];
  userAccessControlDTOS: UserAccessControlDTO[];
}
