import { useEffect, useState } from 'react';

export function useUserSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch('/api/user-settings');
      const data = await res.json();
      setSettings(data);
      setLoading(false);
    }

    fetchSettings();
  }, []);

  async function toggleNotificationSound(enabled) {
    setSettings((prev) => ({ ...prev, notification_sound_enabled: enabled }));

    await fetch('/api/user-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: settings.id,
        notification_sound_enabled: enabled,
      }),
    });
  }

  return {
    settings,
    loading,
    toggleNotificationSound,
  };
}
