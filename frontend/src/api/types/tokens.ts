export type TokenType = "access" | "refresh";

export type TokenPair = {
  readonly access: string;
  readonly refresh: string;
};

export type Token = {
  readonly token_type: TokenType;
  readonly exp: number;
  readonly iat: number;
  readonly jti: string;
  readonly user_id: number;
  readonly username: string;
};

export function isTokens(object: unknown): object is TokenPair {
  return (
    (object as TokenPair).access !== undefined &&
    (object as TokenPair).refresh !== undefined
  );
}

export default TokenPair;
