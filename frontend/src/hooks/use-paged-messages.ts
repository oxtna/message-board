import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type Message from "../api/types/message";

type APIResponse = {
  count: number;
  next: string;
  previous: string;
  results: Message[];
};

export type PagedMessages = {
  messages: Message[];
  previousPage: string;
  nextPage: string;
};

export const usePagedMessages = (
  pageUrl = "http://localhost:8000/api/messages/"
): UseQueryResult<PagedMessages, AxiosError> => {
  return useQuery<PagedMessages, AxiosError>({
    queryKey: ["messages", pageUrl],
    queryFn: async () => {
      const response = await axios.get<APIResponse>(pageUrl);
      response.data.results.forEach((message) => {
        message.created = new Date(message.created);
      });
      return {
        messages: response.data.results,
        previousPage: response.data.previous,
        nextPage: response.data.next,
      };
    },
  });
};

export default usePagedMessages;
