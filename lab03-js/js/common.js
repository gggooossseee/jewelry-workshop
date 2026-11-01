// Общие элементы интерфейса: всплывающие уведомления
let host;

export function toast(message, type = 'ok') {
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }
  const item = document.createElement('p');
  item.className = type === 'error' ? 'toast toast--error' : 'toast';
  item.textContent = message;
  host.append(item);
  setTimeout(() => item.remove(), 3500);
}
