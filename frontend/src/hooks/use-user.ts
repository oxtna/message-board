import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type User from "../interfaces/user";

export const useUser = (url: string): UseQueryResult<User, AxiosError> => {
  return useQuery<User, AxiosError>({
    queryKey: ["users", url],
    queryFn: async () => {
      const response = await axios.get<User>(url);
      return response.data;
    },
  });
};

export default useUser;
