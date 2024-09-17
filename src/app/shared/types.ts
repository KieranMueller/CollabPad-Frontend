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
  id: number,
  ownerId: number, 
  ownerUsername: string
  noteName: string, 
  collaboraterUsernamesAndIds: Map<string, number>, 
  text: string, 
  createdDate: string
  optionsDropdownOpen?: boolean
  removeUsers?: boolean
  usersToRemove?: string[]
};
