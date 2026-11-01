// Небольшие вспомогательные функции без привязки к странице
export const qs = (selector, root = document) => root.querySelector(selector);

export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const rub = new Intl.NumberFormat('ru-RU');
export const formatPrice = (n) => `${rub.format(n)} ₽`;

export function pluralize(n, [one, few, many]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayISO = () => toISO(new Date());

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export const daysBetween = (fromISO, toISO_) =>
  Math.round((new Date(`${toISO_}T00:00:00`) - new Date(`${fromISO}T00:00:00`)) / 86400000);

export function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
