"use client";
import { useEffect } from "react";
import useSWR from "swr";
import { fetchNotifications } from "@swr/fetcher";
import { Notification } from "@sharedTypes/types";
import { getNotificationsKey } from "@swr/getKeys";


export function useNotifications() {
  const getKey = getNotificationsKey();
  const { data, error, isLoading, isValidating, mutate } = useSWR<Notification[]>(
    getKey,
    fetchNotifications,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
    }
  );

  useEffect(() => {
    if (!data) {
      mutate();
    }
  }, []);

  return {
    notifications: data ?? [],
    isLoading,
    isValidating,
    isError: !!error,
    mutate,
    getKey
  };
}
