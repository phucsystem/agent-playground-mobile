import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/admin-users-api";
import { queryKeys } from "../types/api-types";

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
