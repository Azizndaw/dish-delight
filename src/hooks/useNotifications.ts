import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  order_id: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const unreadCount = (query.data || []).filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  return { ...query, unreadCount, markAsRead, markAllAsRead };
};

// Helper to create notifications
export const createNotification = async (userId: string, type: string, message: string, orderId?: string) => {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    message,
    order_id: orderId || null,
  });
};

// Notify all admins
export const notifyAdmins = async (type: string, message: string, orderId?: string) => {
  const { data: adminRoles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (adminRoles) {
    for (const role of adminRoles) {
      await createNotification(role.user_id, type, message, orderId);
    }
  }
};
