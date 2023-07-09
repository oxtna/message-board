import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type Message from "../interfaces/message";

interface APIResponse {
  count: number;
  next: string;
  previous: string;
  results: Message[];
}

const useMessages = (): UseQueryResult<APIResponse, AxiosError> => {
  return useQuery<APIResponse, AxiosError>({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8000/api/messages/");
      return response.data;
    },
  });
};

export default useMessages;
