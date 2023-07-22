import { createContext, useContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { isTokens, type TokenPair, type Token } from "../interfaces/tokens";
import type User from "../interfaces/user";

type LoginFunction = (username: string, password: string) => Promise<boolean>;
type RefreshFunction = () => Promise<boolean>;

export type AuthContextData = {
  user: User | null;
  token: string | null;
  loginUser: LoginFunction;
  refreshToken: RefreshFunction;
};

const LOCAL_STORAGE_TOKENS_IDENTIFIER = "auth-tokens";

const authContext = createContext<AuthContextData | null>(null);

type AuthProviderProps = {
  children?: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedTokenString = localStorage.getItem(
      LOCAL_STORAGE_TOKENS_IDENTIFIER
    );
    if (storedTokenString === null) {
      return;
    }
    const storedTokens = JSON.parse(storedTokenString);
    if (!isTokens(storedTokens)) {
      return;
    }
    setTokens(storedTokens);
    const decoded = jwt_decode<Token>(storedTokens.refresh);
    setUser({
      url: `http://localhost:8000/api/users/${decoded.user_id}/`,
      username: decoded.username,
    });
  }, []);

  const loginUser: LoginFunction = async (username, password) => {
    const response = await axios.post<TokenPair>(
      "http://localhost:8000/api/token/",
      {
        username,
        password,
      }
    );
    if (response.status !== 200) {
      console.error(response);
      return false;
    }
    if (!isTokens(response.data)) {
      throw new Error(
        "Something went very wrong! If you see this page, please contact our support team."
      );
    }
    setTokens(response.data);
    const decoded = jwt_decode<Token>(response.data.access);
    setUser({
      url: `http://localhost:8000/api/users/${decoded.user_id}/`,
      username: decoded.username,
    });
    localStorage.setItem(
      LOCAL_STORAGE_TOKENS_IDENTIFIER,
      JSON.stringify(response.data)
    );
    return true;
  };

  const refreshToken: RefreshFunction = async () => {
    if (tokens === null) {
      return false;
    }
    const response = await axios.post<TokenPair>(
      "http://localhost:8000/api/token/refresh/",
      { refresh: tokens.refresh }
    );
    if (response.status === 401) {
      setUser(null);
      setTokens(null);
      return false;
    }
    if (response.status !== 200 || !isTokens(response.data)) {
      throw new Error(
        "Something went very wrong! If you see this page, please contact our support team."
      );
    }
    setTokens(response.data);
    return true;
  };

  return (
    <authContext.Provider
      value={{ user, token: tokens?.access ?? null, loginUser, refreshToken }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuthUser = (): User | null => {
  const user = useContext(authContext)?.user;
  return user ?? null;
};

export default authContext;
