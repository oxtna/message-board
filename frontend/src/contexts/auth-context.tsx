import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import jwt_decode from "jwt-decode";
import {
  LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER,
  LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER,
} from "../constants";
import { type Token } from "../api/types/tokens";
import { obtainTokens, refreshTokens } from "../api/api";

type LoginFunction = (username: string, password: string) => Promise<boolean>;
type GetTokenFunction = () => string | null;
type RefreshTokenFunction = () => Promise<boolean>;

export type AuthUser = {
  userID: number;
  username: string;
};

export type AuthContextData = {
  user?: AuthUser;
  loginUser: LoginFunction;
  getToken: GetTokenFunction;
  refreshToken: RefreshTokenFunction;
};

const authContext = createContext<AuthContextData>({
  loginUser: async (_, __) => false,
  getToken: () => null,
  refreshToken: async () => false,
});

type AuthProviderProps = {
  children?: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const [userID, setUserID] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const loginUser: LoginFunction = useCallback(
    async (username, password) => {
      const result = await obtainTokens(username, password);
      if (result.error !== undefined) {
        // todo: do something with this API response
        // const message =
        //   result.error.password !== undefined
        //     ? result.error.password[0]
        //     : result.error.username !== undefined
        //     ? result.error.username[0]
        //     : result.error.detail ?? "";
        return false;
      }
      if (result.data === undefined) {
        throw new Error("Bad API response");
      }

      const decoded = jwt_decode<Token>(result.data.access);
      setUserID(decoded.user_id);
      setUsername(decoded.username);
      localStorage.setItem(
        LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER,
        result.data.refresh
      );
      localStorage.setItem(
        LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER,
        result.data.access
      );
      return true;
    },
    [obtainTokens, setUserID, setUsername]
  );

  const getToken: GetTokenFunction = useCallback(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER);
    return token;
  }, []);

  const refreshToken: RefreshTokenFunction = useCallback(async () => {
    const refreshToken = localStorage.getItem(
      LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER
    );
    if (refreshToken === null) {
      return false;
    }
    const result = await refreshTokens(refreshToken);
    if (result.error !== undefined) {
      setUserID(null);
      setUsername(null);
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER);
      localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER);
      return false;
      // throw new Error(`${result.error.code}: ${result.error.detail}`);
    }
    if (result.data === undefined) {
      throw new Error("Bad API response");
    }

    localStorage.setItem(
      LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER,
      result.data.refresh
    );
    localStorage.setItem(
      LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER,
      result.data.access
    );
    return true;
  }, [refreshTokens, setUserID, setUsername]);

  useEffect(() => {
    const token = getToken();
    if (token !== null) {
      const decoded = jwt_decode<Token>(token);
      setUserID(decoded.user_id);
      setUsername(decoded.username);
    }
  }, []);

  const value: AuthContextData = { loginUser, getToken, refreshToken };
  if (userID !== null && username !== null) {
    value.user = { userID, username };
  }

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export const useAuthUser = (): AuthUser | null => {
  const user = useContext(authContext).user;
  return user ?? null;
};

export default authContext;
