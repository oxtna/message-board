import axios, { type RawAxiosRequestHeaders, isAxiosError } from "axios";
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

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
  timeout: 2000,
});

export const getMessage = async (
  id: number,
  token?: string
): Promise<Message> => {
  const headers: RawAxiosRequestHeaders = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await API.get<Message>(`messages/${id}/`, { headers });
  const message = response.data;
  message.created = new Date(message.created);
  return message;
};

export const getMessages = async (
  page = 1,
  token?: string
): Promise<Message[]> => {
  const headers: RawAxiosRequestHeaders = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await API.get<PagedResponse<Message>>(
    `messages/?page=${page}`,
    { headers }
  );
  const messages = response.data.results;
  for (const message of messages) {
    message.created = new Date(message.created);
  }
  return messages;
};

export const getPosts = async (
  page = 1,
  token?: string
): Promise<Message[]> => {
  const headers: RawAxiosRequestHeaders = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await API.get<PagedResponse<Message>>(
    `messages/?page=${page}&posts=true`,
    { headers }
  );
  const posts = response.data.results;
  for (const post of posts) {
    post.created = new Date(post.created);
  }
  return posts;
};

export const getComments = async (
  page = 1,
  token?: string
): Promise<Message[]> => {
  const headers: RawAxiosRequestHeaders = {};
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await API.get<PagedResponse<Message>>(
    `messages/?page=${page}&posts=false`,
    { headers }
  );
  const comments = response.data.results;
  for (const comment of comments) {
    comment.created = new Date(comment.created);
  }
  return comments;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await API.get<User>(`users/${id}/`);
  return response.data;
};

export const getUsers = async (page = 1): Promise<User[]> => {
  const response = await API.get<PagedResponse<User>>(`users/?page=${page}`);
  return response.data.results;
};

export const obtainTokens = async (
  username: string,
  password: string
): Promise<Result<TokenPair, ObtainTokenError>> => {
  try {
    const response = await API.post<TokenPair>("token/", {
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
    const response = await API.post<TokenPair>("token/refresh/", { refresh });
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
    const response = await API.post<RegisterResponse>("register/", {
      username,
      email,
      password,
      password_repeat: passwordRepeat,
    });
    return { data: response.data };
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
  messageID: number,
  token: string
): Promise<Result<undefined, FavoriteError>> => {
  try {
    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${token}`,
    };
    await API.post<undefined>(
      `messages/${messageID}/favorite/`,
      {},
      { headers }
    );
    return {};
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
  messageID: number,
  token: string
): Promise<Result<undefined, FavoriteError>> => {
  try {
    const headers: RawAxiosRequestHeaders = {
      Authorization: `Bearer ${token}`,
    };
    await API.delete<undefined>(`messages/${messageID}/favorite/`, { headers });
    return {};
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
