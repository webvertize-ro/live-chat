import { useEffect, useRef } from 'react';
import { supabase } from '../db/db';

export default function useUserNotifications({
  visitorId,
  soundEnabled = false,
}) {
  const audioRef = useRef(null);
  const prevUnreadRef = useRef(0);
  const initializedRef = useRef(false);
  const soundEnabledRef = useRef(soundEnabled);

  // keep ref in sync
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // init audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  // initial unread fetch
  useEffect(() => {
    if (!visitorId) return;

    async function fetchUnread() {
      const { data, error } = await supabase
        .from('visitors')
        .select('unread_count_user')
        .eq('id', visitorId)
        .single();

      if (!error && data) {
        prevUnreadRef.current = data.unread_count_user ?? 0;
        initializedRef.current = true;
      }
    }

    fetchUnread();
  }, [visitorId]);

  // realtime listener
  useEffect(() => {
    if (!visitorId) return;

    const channel = supabase
      .channel(`visitor-user-${visitorId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitors',
          filter: `id=eq.${visitorId}`,
        },
        (payload) => {
          const newUnread = payload.new.unread_count_user ?? 0;
          const prevUnread = prevUnreadRef.current;

          if (
            initializedRef.current &&
            soundEnabledRef.current &&
            newUnread > prevUnread
          ) {
            audioRef.current?.play().catch(() => {});
          }

          prevUnreadRef.current = newUnread;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [visitorId]);
}
