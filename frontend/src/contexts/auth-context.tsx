import { createContext, useState, useEffect, useContext } from "react";
import jwt_decode from "jwt-decode";
import type { TokenPair, Token } from "../interfaces/tokens";
import { isTokens } from "../interfaces/tokens";
import type User from "../interfaces/user";

type LoginFunction = (username: string, password: string) => Promise<boolean>;
type RefreshFunction = () => Promise<boolean>;

export interface AuthContextData {
  user: User | null;
  token: string | null;
  loginUser: LoginFunction;
  refreshToken: RefreshFunction;
}

interface Props {
  children: React.ReactNode;
}

const LOCAL_STORAGE_TOKENS_IDENTIFIER = "auth-tokens";

const authContext = createContext<AuthContextData | null>(null);

export const AuthProvider: React.FC<Props> = ({ children }: Props) => {
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
    setUser({ id: decoded.user_id, username: decoded.username });
  }, []);

  const loginUser: LoginFunction = async (username, password) => {
    const response = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.status !== 200) {
      console.error(response);
      return false;
    }
    const data = await response.json();
    if (!isTokens(data)) {
      throw new Error(
        "Something went very wrong! If you see this page, please contact our support team."
      );
    }
    setTokens(data);
    const decoded = jwt_decode<Token>(data.access);
    setUser({ id: decoded.user_id, username: decoded.username });
    localStorage.setItem(LOCAL_STORAGE_TOKENS_IDENTIFIER, JSON.stringify(data));
    return true;
  };

  const refreshToken: RefreshFunction = async () => {
    if (tokens === null) {
      return false;
    }
    const response = await fetch("http://localhost:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (response.status === 401) {
      setUser(null);
      setTokens(null);
      return false;
    }
    const data = await response.json();
    if (response.status !== 200 || !isTokens(data)) {
      throw new Error(
        "Something went very wrong! If you see this page, please contact our support team."
      );
    }
    setTokens(data);
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

export const useUser = (): User | null => {
  const user = useContext(authContext)?.user;
  return user ?? null;
};

export default authContext;
