export type User = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmedPassword: string;
  role: string;
};

export type SharedNote = {
  id: number;
  ownerId: number;
  ownerUsername: string;
  noteName: string;
  collaboraterUsernamesAndIds: Map<string, number>;
  text: string;
  createdDate: string;
  optionsDropdownOpen?: boolean;
  removeUsers?: boolean;
  usersToRemove?: string[];
  sharedUsers?: string[];
  isRenamingNote?: boolean;
  isAddingUsers?: boolean;
  isDeletingNote?: boolean;
  websocketId?: string;
  isViewingPreview?: boolean
  usernameLastEdited?: string
  lastEdited?: string
  collaboratorUsernames?: string[]
};

export type UserDetailsResponse = {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    base64Image: string;
    lastInitial: string;
    isAddingToNote?: boolean
}
