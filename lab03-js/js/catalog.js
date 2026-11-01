// Страница каталога: отрисовка из <template>, фильтры, сортировка, избранное, адресная строка
import { PRODUCTS, CATEGORIES, METALS, getProduct } from './data.js';
import { filterProducts, sortProducts, stateToParams, paramsToState } from './filters.js';
import { debounce, formatPrice, pluralize, qs } from './utils.js';
import { getFavorites, toggleFavorite } from './storage.js';
import { initOrderDialog } from './booking.js';

const form = qs('#filters');
const grid = qs('#catalog-grid');
const tpl = qs('#card-tpl');
const count = qs('#count');
const empty = qs('#empty');
const priceOut = qs('#price-out');
const dialog = initOrderDialog();
const el = (name) => form.elements.namedItem(name);

function readState() {
  return {
    q: el('q').value.trim().toLowerCase(), category: el('category').value, metal: el('metal').value,
    maxPrice: Number(el('price').value), needBy: el('date').value,
    stock: el('stock').checked, favOnly: el('fav').checked, sort: el('sort').value,
  };
}

function writeState(s) {
  el('q').value = s.q; el('category').value = s.category; el('metal').value = s.metal;
  el('price').value = s.maxPrice; el('date').value = s.needBy;
  el('stock').checked = s.stock; el('fav').checked = s.favOnly; el('sort').value = s.sort;
}

function setFav(btn, on) {
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Убрать из избранного' : 'Добавить в избранное');
  btn.textContent = on ? '♥' : '♡';
}

// Все пользовательские/данные значения вставляются через textContent, не innerHTML
function createCard(p, isFav) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = p.id;
  const img = qs('.card__img', node);
  img.src = `img/${p.img}`;
  img.alt = `${p.title}, ${METALS[p.metal]}`;
  qs('.card__title', node).textContent = p.title;
  qs('.card__meta', node).textContent =
    `${CATEGORIES[p.category]} · ${METALS[p.metal]} · ${p.inStock ? 'в наличии' : `под заказ, ${p.leadDays} дн.`}`;
  qs('.card__price', node).textContent = formatPrice(p.price);
  setFav(qs('.fav', node), isFav);
  return node;
}

function update() {
  const state = readState();
  const favs = getFavorites();
  const list = sortProducts(filterProducts(PRODUCTS, state, favs), state.sort);
  grid.replaceChildren(...list.map((p) => createCard(p, favs.includes(p.id))));
  count.textContent = `Найдено: ${list.length} ${pluralize(list.length, ['изделие', 'изделия', 'изделий'])}`;
  empty.hidden = list.length > 0;
  const params = stateToParams(state).toString();
  history.replaceState(null, '', location.pathname + (params ? `?${params}` : ''));
}

const updatePriceOut = () => { priceOut.textContent = formatPrice(Number(el('price').value)); };
const debouncedUpdate = debounce(update, 300);

form.addEventListener('input', (e) => {
  if (e.target.name === 'price') updatePriceOut();
  if (e.target.name === 'q') debouncedUpdate(); else update();
});
form.addEventListener('submit', (e) => { e.preventDefault(); update(); });
form.addEventListener('reset', () => setTimeout(() => { updatePriceOut(); update(); }));

// Делегирование №1: одна подписка на сетку вместо обработчика на каждой кнопке
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  if (btn.dataset.action === 'order') dialog.open(getProduct(id));
  if (btn.dataset.action === 'fav') {
    setFav(btn, toggleFavorite(id));
    if (readState().favOnly) update();
  }
});
empty.addEventListener('click', (e) => {
  if (e.target.closest('[data-action="reset-filters"]')) form.reset();
});

writeState(paramsToState(location.search));
updatePriceOut();
update();
