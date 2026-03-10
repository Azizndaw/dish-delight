import Layout from "@/components/Layout";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Package, ShoppingCart, AlertCircle, ChevronLeft } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const typeIcons: Record<string, React.ReactNode> = {
  order_placed: <ShoppingCart className="h-5 w-5 text-primary" />,
  order_status: <Package className="h-5 w-5 text-blue-500" />,
  new_order_admin: <AlertCircle className="h-5 w-5 text-amber-500" />,
  product_sold: <ShoppingCart className="h-5 w-5 text-green-500" />,
  default: <Bell className="h-5 w-5 text-muted-foreground" />,
};

const Notifications = () => {
  const { user, loading } = useAuth();
  const { data: notifications = [], unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!loading && !user) return <Navigate to="/connexion" />;

  return (
    <Layout>
      <div className="container max-w-2xl py-8 md:py-12">
        <Link to="/compte" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Retour au compte
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">{unreadCount > 0 ? `${unreadCount} non lue(s)` : "Tout est lu"}</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Tout marquer lu
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead.mutate(notif.id)}
                className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${
                  notif.is_read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
                } hover:bg-muted/50`}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {typeIcons[notif.type] || typeIcons.default}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.is_read ? "text-foreground" : "font-semibold text-foreground"}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
