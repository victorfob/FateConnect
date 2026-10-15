import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { openNotificationUrlOf } from '@app/utils/pushNotificationClick';

/** O toque no aviso com o app aberto chega como mensagem do service worker. */
export function usePushNotificationClicks(): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const container = navigator.serviceWorker;
    const handleMessage = ({ data }: MessageEvent) => {
      const url = openNotificationUrlOf(data);
      if (url) void navigate(url);
    };

    container.addEventListener('message', handleMessage);
    container.startMessages();

    return () => container.removeEventListener('message', handleMessage);
  }, [navigate]);
}
