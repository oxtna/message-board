export type CreateMessageError = {
  text?: string[];
  parent?: string[];
};

export type ObtainTokenError = {
  detail?: string;
  username?: string[];
  password?: string[];
};

export type RefreshTokenError = {
  detail: string;
  code: string;
};

export type RegisterError = {
  username?: string[];
  email?: string[];
  password?: string[];
  passwordRepeat?: string[];
};

export type FavoriteError = {
  detail: string;
  code?: string;
  messages?: unknown[];
};
