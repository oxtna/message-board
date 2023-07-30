import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import jwt_decode from "jwt-decode";
import { type TokenPair, type Token } from "../api/types/tokens";
import { obtainTokens, refreshTokens } from "../api/api";

type LoginFunction = (username: string, password: string) => Promise<boolean>;
type RefreshFunction = () => Promise<boolean>;

export type AuthUser = {
  userID: number;
  username: string;
};

export type AuthContextData = {
  user?: AuthUser;
  token?: string;
  loginUser: LoginFunction;
  refreshToken: RefreshFunction;
};

const LOCAL_STORAGE_TOKENS_IDENTIFIER = "auth-token";

const authContext = createContext<AuthContextData>({
  loginUser: async (_, __) => false,
  refreshToken: async () => false,
});

type AuthProviderProps = {
  children?: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const [tokens, setTokens] = useState<TokenPair | null>(null);
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

      setTokens(result.data);
      const decoded = jwt_decode<Token>(result.data.access);
      setUserID(decoded.user_id);
      setUsername(decoded.username);
      localStorage.setItem(
        LOCAL_STORAGE_TOKENS_IDENTIFIER,
        result.data.refresh
      );
      return true;
    },
    [obtainTokens, setTokens, setUserID, setUsername]
  );

  const refreshToken: RefreshFunction = useCallback(async () => {
    if (tokens === null) {
      return false;
    }
    const result = await refreshTokens(tokens.refresh);
    if (result.error !== undefined) {
      setUserID(null);
      setUsername(null);
      setTokens(null);
      return false;
      // throw new Error(`${result.error.code}: ${result.error.detail}`);
    }
    if (result.data === undefined) {
      throw new Error("Bad API response");
    }

    setTokens(result.data);
    localStorage.setItem(LOCAL_STORAGE_TOKENS_IDENTIFIER, result.data.refresh);
    return true;
  }, [refreshTokens, setTokens, setUserID, setUsername]);

  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKENS_IDENTIFIER);
    if (storedToken === null) {
      return;
    }
    setTokens({ access: "", refresh: storedToken });
    refreshToken()
      .then((ok) => {
        if (ok) {
          const token = tokens?.access ?? "never";
          const decoded = jwt_decode<Token>(token);
          setUserID(decoded.user_id);
          setUsername(decoded.username);
        }
      })
      .catch((error) => {
        throw error;
      });
  }, []);

  const value: AuthContextData = { loginUser, refreshToken };
  if (userID !== null && username !== null) {
    value.user = { userID, username };
  }
  if (tokens !== null) {
    value.token = tokens.access;
  }

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export const useAuthUser = (): AuthUser | null => {
  const user = useContext(authContext).user;
  return user ?? null;
};

export default authContext;
