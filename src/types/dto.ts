export interface TeamDTO {
  id: number;
  name: string;
  userList: UserDTO[];
}

export interface UserDTO{
    id : number;
    name : string;
    email : string;
    role : string;
    teamId :number;
    teamName : string;
    accessMode : string;
    isActive :boolean;
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

export interface AccessControlDTO {
  teamAccessControlDTOS: TeamAccessControlDTO[];
  userAccessControlDTOS: any[]; // replace with correct type if needed
}
