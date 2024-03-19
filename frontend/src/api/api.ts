import axios, { isAxiosError } from "axios";
import type Result from "./types/result";
import type User from "./types/user";
import type Message from "./types/message";
import { isTokens, type TokenPair } from "./types/tokens";
import type RegisterResponse from "./types/register-response";
import {
  type RegisterError,
  type ObtainTokenError,
  type RefreshTokenError,
  type FavoriteError,
} from "./types/errors";
import {
  LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER,
  LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER,
  LOCAL_STORAGE_USERNAME_IDENTIFIER,
  LOCAL_STORAGE_USER_ID_IDENTIFIER,
} from "../constants";
import type PagedResponse from "./types/paged-response";

const API = axios.create({
  timeout: 5000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER);
    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    // maybe add some logging here
    throw error;
  }
);

API.interceptors.response.use(
  (response) => response,
  // maybe add some logging here
  async (error) => {
    console.log(error);
    if (error.config === undefined) {
      throw error;
    }
    if (isAxiosError(error) && error.response?.status === 403) {
      const refreshToken = localStorage.getItem(
        LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER
      );
      if (refreshToken === null) {
        throw error;
      }
      const result = await refreshTokens(refreshToken);
      if (result.error !== undefined) {
        localStorage.removeItem(LOCAL_STORAGE_USER_ID_IDENTIFIER);
        localStorage.removeItem(LOCAL_STORAGE_USERNAME_IDENTIFIER);
        localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_IDENTIFIER);
        localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_IDENTIFIER);
        throw error;
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

      error.config.headers.Authorization = `Bearer ${result.data.access}`;
      return await API(error.config);
    }
    throw error;
  }
);

export const getData = async <T>(url: string): Promise<T> => {
  const response = await API.get(url);
  const data = response.data as T;
  return data;
};

export const getUser = async (
  identifier: string | number | null
): Promise<User> => {
  if (identifier === null) {
    return {
      id: 0,
      url: "",
      username: "Deleted",
      favorites: [],
      messages: [],
    };
  }
  if (typeof identifier === "number") {
    return await getData<User>(
      `http://localhost:8000/api/users/${identifier}/`
    );
  }
  return await getData<User>(identifier);
};

export const getMessage = async (
  identifier: string | number
): Promise<Message> => {
  if (typeof identifier === "number") {
    return await getData<Message>(
      `http://localhost:8000/api/messages/${identifier}/`
    );
  }
  return await getData<Message>(identifier);
};

export const getMessagesOfUser = async (
  userID: number
): Promise<PagedResponse<Message>> => {
  return await getData<PagedResponse<Message>>(
    `http://localhost:8000/api/messages/?user=${userID}`
  );
};

export const obtainTokens = async (
  username: string,
  password: string
): Promise<Result<TokenPair, ObtainTokenError>> => {
  try {
    const response = await API.post("http://localhost:8000/api/token/", {
      username,
      password,
    });
    if (!isTokens(response.data)) {
      throw new Error("Bad API Response");
    }
    return { data: response.data };
  } catch (error) {
    if (isAxiosError<ObtainTokenError>(error)) {
      if (error.response?.data === undefined) {
        throw error;
      }
      return { error: error.response.data };
    }
    throw error;
  }
};

export const refreshTokens = async (
  refresh: string
): Promise<Result<TokenPair, RefreshTokenError>> => {
  try {
    const response = await API.post(
      "http://localhost:8000/api/token/refresh/",
      { refresh }
    );
    if (!isTokens(response.data)) {
      throw new Error("Bad API Response");
    }
    return { data: response.data };
  } catch (error) {
    if (isAxiosError<RefreshTokenError>(error)) {
      if (error.response?.data === undefined) {
        throw error;
      }
      return { error: error.response.data };
    }
    throw error;
  }
};

export const register = async (
  username: string,
  email: string,
  password: string,
  passwordRepeat: string
): Promise<Result<RegisterResponse, RegisterError>> => {
  try {
    const response = await API.post("http://localhost:8000/api/register/", {
      username,
      email,
      password,
      password_repeat: passwordRepeat,
    });
    const data = response.data as RegisterResponse;
    return { data };
  } catch (error) {
    if (
      isAxiosError<RegisterError>(error) &&
      error.response?.data !== undefined
    ) {
      return { error: error.response.data };
    }
    throw error;
  }
};

export const favorite = async (
  messageID: number
): Promise<Result<undefined, FavoriteError>> => {
  try {
    return await API.post(
      `http://localhost:8000/api/messages/${messageID}/favorite/`,
      {}
    );
  } catch (error) {
    if (
      isAxiosError<FavoriteError>(error) &&
      error.response?.data !== undefined
    ) {
      return { error: error.response.data };
    }
    throw error;
  }
};

export const unfavorite = async (
  messageID: number
): Promise<Result<undefined, FavoriteError>> => {
  try {
    return await API.delete(
      `http://localhost:8000/api/messages/${messageID}/favorite/`
    );
  } catch (error) {
    if (
      isAxiosError<FavoriteError>(error) &&
      error.response?.data !== undefined
    ) {
      return { error: error.response.data };
    }
    throw error;
  }
};
