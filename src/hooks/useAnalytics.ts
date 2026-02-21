
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useAnalytics = () => {
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const trackVisit = async () => {
            try {
                const { error } = await supabase.from("site_visits").insert({
                    page_path: location.pathname + location.search,
                    user_id: user?.id || null,
                    user_agent: navigator.userAgent,
                    referrer: document.referrer || null,
                });

                if (error) {
                    console.error("Error tracking visit:", error);
                }
            } catch (err) {
                console.error("Failed to track visit:", err);
            }
        };

        trackVisit();
    }, [location.pathname, location.search, user?.id]);
};
