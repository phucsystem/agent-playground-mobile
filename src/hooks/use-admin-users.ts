import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/admin-users-api";
import { queryKeys } from "../types/api-types";

export function useAdminUsers(searchQuery?: string) {
  return useQuery({
    queryKey: [...queryKeys.users.list(), searchQuery ?? ""],
    queryFn: () => fetchUsers(searchQuery),
    staleTime: 30_000,
  });
}
