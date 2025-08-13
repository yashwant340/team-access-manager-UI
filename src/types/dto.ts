export interface TeamDTO {
  id: number;
  name: string;
  userList: UserDTO[];
  active : boolean;
}

export interface LoginRequestDTO{
    id : number;
    name : string;
    empId : string;
    email : string;
    role : string;
    team : string;
    createdDate: string;
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

export interface UserDashboardAccessDataDTO{
  userId: number;
  featureId: number;
  featureName: string;
  hasAccess: boolean;
  lastUpdatedDate: string;
  pendingRequestDTO?: PendingRequestDTO ;
}

export interface PendingRequestDTO{
  id: number;
  email: string;
  teamId: number;
  teamName:string;
  accessMode: string;
  requestedOn: string;
  pendingWith: string;
  requestType: string;
  requestStatus: string;
  userId : number;
  featureId: number;
  featureName: string;
  name: string;
  otherFeatures: AccessControlDTO;
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
