import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const useOrganicSocket = (
  onCreated: (organic: any) => void,
  onUpdated: (organic: any) => void,
  onDeleted: (id: string) => void
) => {
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("[useOrganicSocket] Connected to server:", socket.id);
    });

    socket.on("organicCreated", (organic) => {
      console.log("[useOrganicSocket] organicCreated", organic);
      onCreated(organic);
    });

    socket.on("organicUpdated", (organic) => {
      console.log("[useOrganicSocket] organicUpdated", organic);
      onUpdated(organic);
    });

    socket.on("organicDeleted", (data) => {
      console.log("[useOrganicSocket] organicDeleted", data);
      onDeleted(data.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [onCreated, onUpdated, onDeleted]);
};
