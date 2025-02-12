"use client";
import useSWR from "swr";
import { fetchNotifications } from "@swr/fetcher";
import { Notification } from "@sharedTypes/types";

export function useNotifications() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Notification[]>(
    "/api/notifications",
    fetchNotifications,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      fallbackData: []
    }
  );
  console.log("SWR data:", data);

  return {
    notifications: data ?? [],
    isLoading,
    isValidating,
    isError: !!error,
    mutate,
  };
}
