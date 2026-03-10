import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { Link } from "react-router-dom";

const NotificationBell = () => {
  const { unreadCount } = useNotifications();

  return (
    <Link to="/notifications">
      <Button variant="ghost" size="icon" className="relative" title="Notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default NotificationBell;
