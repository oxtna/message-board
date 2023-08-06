import { createContext, useEffect, useCallback } from "react";
import jwt_decode from "jwt-decode";
import {
  LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER,
  LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER,
  LOCAL_STORAGE_USERNAME_IDENTIFIER,
  LOCAL_STORAGE_USER_ID_IDENTIFIER,
} from "../constants";
import { type Token } from "../api/types/tokens";
import { obtainTokens } from "../api/api";

type GetAuthUserFunction = () => AuthUser | null;
type LoginFunction = (username: string, password: string) => Promise<boolean>;

export type AuthUser = {
  userID: number;
  username: string;
};

export type AuthContextData = {
  getUser: GetAuthUserFunction;
  loginUser: LoginFunction;
};

const authContext = createContext<AuthContextData>({
  getUser: () => null,
  loginUser: async (_, __) => false,
});

type AuthProviderProps = {
  children?: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const getUser: GetAuthUserFunction = useCallback(() => {
    const userID = localStorage.getItem(LOCAL_STORAGE_USER_ID_IDENTIFIER);
    const username = localStorage.getItem(LOCAL_STORAGE_USERNAME_IDENTIFIER);
    if (userID === null || username === null) {
      return null;
    }
    return { username, userID: +userID };
  }, []);

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
      localStorage.setItem(
        LOCAL_STORAGE_USER_ID_IDENTIFIER,
        decoded.user_id.toString()
      );
      localStorage.setItem(LOCAL_STORAGE_USERNAME_IDENTIFIER, decoded.username);
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
    [obtainTokens]
  );

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER);
    if (token !== null) {
      const decoded = jwt_decode<Token>(token);
      localStorage.setItem(
        LOCAL_STORAGE_USER_ID_IDENTIFIER,
        decoded.user_id.toString()
      );
      localStorage.setItem(LOCAL_STORAGE_USERNAME_IDENTIFIER, decoded.username);
    }
  }, []);

  const value: AuthContextData = { getUser, loginUser };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export default authContext;
