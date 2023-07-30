import {
  useQueries,
  type UseQueryResult,
  type UseQueryOptions,
} from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type Message from "../api/types/message";

export const useMessages = (
  urls: string[]
): Array<UseQueryResult<Message, AxiosError>> => {
  return useQueries({
    queries: urls.map<UseQueryOptions<Message, AxiosError>>((url) => {
      return {
        queryKey: ["message", url],
        queryFn: async () => {
          const response = await axios.get<Message>(url);
          response.data.created = new Date(response.data.created);
          return response.data;
        },
      };
    }),
  });
};

export default useMessages;
