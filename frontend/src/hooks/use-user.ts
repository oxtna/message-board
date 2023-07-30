import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getUser } from "../api/api";
import type User from "../api/types/user";

export const useUser = (id: number): UseQueryResult<User> => {
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => await getUser(id),
  });
};

export default useUser;
