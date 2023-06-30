import { createContext, useState } from "react";
import jwt_decode from "jwt-decode";
import type { TokenPair, AccessToken } from "../interfaces/tokens";
import { isTokens } from "../interfaces/tokens";
import type User from "../interfaces/user";

type LoginFunction = (username: string, password: string) => Promise<boolean>;

export interface AuthContextData {
  user: User | null;
  token: string | null;
  loginUser: LoginFunction;
}

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }: Props) => {
  const [tokens, setTokens] = useState<TokenPair>();
  const [user, setUser] = useState<User | null>(null);

  const loginUser: LoginFunction = async (username, password) => {
    const response = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (response.status === 200) {
      const object = await response.json();
      if (isTokens(object)) {
        setTokens(object);
        const decoded = jwt_decode<AccessToken>(object.access);
        setUser({ id: decoded.user_id });
        return true;
      } else {
        throw new Error(
          "Something went very wrong! If you see this page, please contact our support team."
        );
      }
    } else {
      console.log(response);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token: tokens?.access ?? null, loginUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const AuthContext = createContext<AuthContextData | null>(null);

export default AuthContext;
