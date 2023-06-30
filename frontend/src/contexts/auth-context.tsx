import { createContext, useState, useEffect } from "react";
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

export const AuthProvider: React.FC<Props> = ({ children }: Props) => {
  // todo: load tokens from local storage on first load
  const [tokens, setTokens] = useState<TokenPair | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const loginUser: LoginFunction = async (username, password) => {
    const response = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.status === 200) {
      const data = await response.json();
      if (isTokens(data)) {
        setTokens(data);
        const decoded = jwt_decode<Token>(data.access);
        setUser({ id: decoded.user_id, username: decoded.username });
        return true;
      } else {
        throw new Error(
          "Something went very wrong! If you see this page, please contact our support team."
        );
      }
    } else {
      console.error(response);
      return false;
    }
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
    <AuthContext.Provider
      value={{ user, token: tokens?.access ?? null, loginUser, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const AuthContext = createContext<AuthContextData | null>(null);

export default AuthContext;
