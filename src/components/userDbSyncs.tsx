import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";

export function UserDbSync() {
  const { user, isLoaded } = useUser();
  const [hasSynced, setHasSynced] = useState(false);
  
  const { mutate: createUser } = api.user.create.useMutation({
    onSuccess: (dbUser) => {
      console.log("User synced to database:", dbUser.email);
      setHasSynced(true);
    },
    onError: (error) => {
      console.error("Failed to sync user:", error);
    }
  });

  useEffect(() => {
    if (isLoaded && user && !hasSynced) {
      createUser({ userId: user.id });
    }
  }, [isLoaded, user?.id, hasSynced, createUser]);

  return null; 
}