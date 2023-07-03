export interface TokenPair {
  refresh: string;
  access: string;
}

export interface Token {
  token_type: "access" | "refresh";
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  username: string;
}

export function isTokens(object: unknown): object is TokenPair {
  return (
    (object as TokenPair).access !== undefined &&
    (object as TokenPair).refresh !== undefined
  );
}

export default TokenPair;
