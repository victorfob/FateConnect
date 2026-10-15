/**
 * Só os avisos por push. ⛔ Sem `fetch` e sem cache: o app não funciona offline
 * por decisão, e um `fetch` aqui passaria a servir versão velha do app.
 */
const NOTIFICATION_TITLE = 'FateConnect';
const NOTIFICATION_ICON = '/icon-192.png';
const OPEN_NOTIFICATION_PATH = '/notificacoes/abrir';
const OPEN_NOTIFICATION_MESSAGE = 'open-notification';

/** O tipo vai à URL como no filtro da central: o rótulo em minúsculo e sem acento. */
const TYPE_SLUGS = {
  RideToNeighborhood: 'caronas',
  ItemArchived: 'achados-perdidos',
  ReportReceived: 'denuncias',
  PublicationRemoved: 'exclusoes',
};

function openNotificationUrl({ id, type, referenceId }) {
  const params = new URLSearchParams({ aviso: String(id), tipo: TYPE_SLUGS[type] ?? '' });
  if (referenceId) params.set('referencia', referenceId);

  return `${OPEN_NOTIFICATION_PATH}?${params.toString()}`;
}

/** Com o app aberto, a navegação é dele: assim a tela com alteração não salva segura a saída. */
async function focusOrOpen(url) {
  const [openWindow] = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  if (!openWindow) {
    await self.clients.openWindow(url);
    return;
  }

  await openWindow.focus();
  openWindow.postMessage({ kind: OPEN_NOTIFICATION_MESSAGE, url });
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('push', (event) => {
  const notification = event.data?.json();
  if (!notification) return;

  event.waitUntil(
    self.registration.showNotification(NOTIFICATION_TITLE, {
      body: notification.content,
      icon: NOTIFICATION_ICON,
      tag: String(notification.id),
      data: notification,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(focusOrOpen(openNotificationUrl(event.notification.data)));
});
