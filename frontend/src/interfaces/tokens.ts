export interface TokenPair {
  refresh: string;
  access: string;
}

export interface Token {
  token_type: "access" | "refresh";
  exp: number;
  iat: number;
  jti: string;
}

export type AccessToken = Token & { user_id: number };
export type RefreshToken = Token & { user_id: number };

export function isTokens(object: unknown): object is TokenPair {
  return (
    (object as TokenPair).access !== undefined &&
    (object as TokenPair).refresh !== undefined
  );
}
