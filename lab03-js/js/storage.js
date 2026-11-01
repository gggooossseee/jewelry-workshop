// Обёртка над localStorage: все ключи с префиксом, любые ошибки не ломают страницу.
// Пароли в хранилище НЕ записываются.
const PREFIX = 'zz:';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const getOrders = () => read('orders', []);
export const addOrder = (order) => write('orders', [order, ...getOrders()]);
export const cancelOrder = (id) =>
  write('orders', getOrders().map((o) => (o.id === id ? { ...o, status: 'canceled' } : o)));

export const getFavorites = () => read('favorites', []);
export function toggleFavorite(id) {
  const favs = getFavorites();
  const on = !favs.includes(id);
  write('favorites', on ? [...favs, id] : favs.filter((x) => x !== id));
  return on;
}

export const getUser = () => read('user', null);
export const setUser = ({ name, email }) => write('user', { name, email });
