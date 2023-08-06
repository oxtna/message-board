import axios, { isAxiosError } from "axios";
import type Result from "./types/result";
import type PagedResponse from "./types/paged-response";
import type Message from "./types/message";
import type User from "./types/user";
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

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
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
    throw error;
  }
);

API.interceptors.response.use(
  (response) => response,
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

export const getMessage = async (id: number): Promise<Message> => {
  const response = await API.get(`messages/${id}/`);
  const message = response.data as Message;
  message.created = new Date(message.created);
  return message;
};

export const getMessages = async (page = 1): Promise<Message[]> => {
  const response = await API.get(`messages/?page=${page}`);
  const messages = (response.data as PagedResponse<Message>).results;
  for (const message of messages) {
    message.created = new Date(message.created);
  }
  return messages;
};

export const getPosts = async (page = 1): Promise<Message[]> => {
  const response = await API.get(`messages/?page=${page}&posts=true`);
  const posts = (response.data as PagedResponse<Message>).results;
  for (const post of posts) {
    post.created = new Date(post.created);
  }
  return posts;
};

export const getComments = async (page = 1): Promise<Message[]> => {
  const response = await API.get(`messages/?page=${page}&posts=false`);
  const comments = (response.data as PagedResponse<Message>).results;
  for (const comment of comments) {
    comment.created = new Date(comment.created);
  }
  return comments;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await API.get(`users/${id}/`);
  return response.data as User;
};

export const getUsers = async (page = 1): Promise<User[]> => {
  const response = await API.get(`users/?page=${page}`);
  return (response.data as PagedResponse<User>).results;
};

export const obtainTokens = async (
  username: string,
  password: string
): Promise<Result<TokenPair, ObtainTokenError>> => {
  try {
    const response = await API.post("token/", {
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
    const response = await API.post("token/refresh/", { refresh });
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
    const response = await API.post("register/", {
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
    return await API.post(`messages/${messageID}/favorite/`, {});
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
    return await API.delete(`messages/${messageID}/favorite/`);
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
