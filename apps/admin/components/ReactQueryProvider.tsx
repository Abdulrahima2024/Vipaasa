"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { getSocket } from "../lib/socket";

function SocketListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleInvalidate = () => {
      // For now, invalidate relevant queries when an event happens
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    };

    socket.on("organicCreated", handleInvalidate);
    socket.on("organicUpdated", handleInvalidate);
    socket.on("organicDeleted", handleInvalidate);
    socket.on("coupon_created", handleInvalidate);
    socket.on("order_created", handleInvalidate);
    socket.on("order_updated", handleInvalidate);

    return () => {
      socket.off("organicCreated", handleInvalidate);
      socket.off("organicUpdated", handleInvalidate);
      socket.off("organicDeleted", handleInvalidate);
      socket.off("coupon_created", handleInvalidate);
      socket.off("order_created", handleInvalidate);
      socket.off("order_updated", handleInvalidate);
    };
  }, [queryClient]);

  return null;
}

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SocketListener />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
