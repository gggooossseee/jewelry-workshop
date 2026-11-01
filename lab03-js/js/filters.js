// Чистые функции: фильтрация, сортировка и работа с адресной строкой (без DOM)
import { CATEGORIES } from './data.js';
import { daysBetween, todayISO } from './utils.js';

export const DEFAULT_STATE = {
  q: '', category: '', metal: 'any', maxPrice: 50000,
  needBy: '', stock: false, favOnly: false, sort: 'new',
};

export const SORTERS = {
  new: (a, b) => b.addedAt.localeCompare(a.addedAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  title: (a, b) => a.title.localeCompare(b.title, 'ru'),
};

export function filterProducts(products, f, favorites = [], today = todayISO()) {
  const q = f.q.trim().toLowerCase();
  return products.filter((p) =>
    (!q || p.title.toLowerCase().includes(q)) &&
    (!f.category || p.category === f.category) &&
    (f.metal === 'any' || p.metal === f.metal) &&
    p.price <= f.maxPrice &&
    (!f.stock || p.inStock) &&
    (!f.favOnly || favorites.includes(p.id)) &&
    (!f.needBy || p.leadDays <= daysBetween(today, f.needBy)),
  );
}

export const sortProducts = (list, key) => [...list].sort(SORTERS[key] ?? SORTERS.new);

// Состояние фильтров -> параметры адреса (только отличающиеся от значений по умолчанию)
export function stateToParams(s) {
  const p = new URLSearchParams();
  if (s.q) p.set('q', s.q);
  if (s.category) p.set('category', s.category);
  if (s.metal !== 'any') p.set('metal', s.metal);
  if (s.maxPrice !== DEFAULT_STATE.maxPrice) p.set('price', String(s.maxPrice));
  if (s.needBy) p.set('date', s.needBy);
  if (s.stock) p.set('stock', '1');
  if (s.favOnly) p.set('fav', '1');
  if (s.sort !== DEFAULT_STATE.sort) p.set('sort', s.sort);
  return p;
}

// Адрес -> состояние (с проверкой значений: из ссылки нельзя подставить что угодно)
export function paramsToState(search) {
  const p = new URLSearchParams(search);
  const price = Number(p.get('price'));
  return {
    q: p.get('q') ?? '',
    category: p.get('category') in CATEGORIES ? p.get('category') : '',
    metal: ['gold', 'silver'].includes(p.get('metal')) ? p.get('metal') : 'any',
    maxPrice: price >= 1000 && price <= 50000 ? price : DEFAULT_STATE.maxPrice,
    needBy: /^\d{4}-\d{2}-\d{2}$/.test(p.get('date') ?? '') ? p.get('date') : '',
    stock: p.get('stock') === '1',
    favOnly: p.get('fav') === '1',
    sort: p.get('sort') in SORTERS ? p.get('sort') : DEFAULT_STATE.sort,
  };
}
