// Личный кабинет: список заказов из localStorage с возможностью отмены
import { getOrders, cancelOrder, getUser } from './storage.js';
import { formatPrice, formatDate, qs } from './utils.js';
import { toast } from './common.js';

const body = qs('#orders-body');
const wrap = qs('#orders-wrap');
const empty = qs('#orders-empty');

function cell(tag, text, scope) {
  const c = document.createElement(tag);
  c.className = 'table__cell';
  if (scope) c.scope = scope;
  c.textContent = text;
  return c;
}

function row(order) {
  const tr = document.createElement('tr');
  tr.append(
    cell('th', order.id.slice(-4).toUpperCase(), 'row'),
    cell('td', order.title + (order.size ? `, размер ${order.size}` : '')),
    cell('td', formatDate(order.date)),
    cell('td', formatPrice(order.price)),
    cell('td', order.status === 'canceled' ? 'Отменён' : 'Оформлен'),
  );
  const action = cell('td', '');
  if (order.status !== 'canceled') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--sm';
    btn.dataset.action = 'cancel';
    btn.dataset.id = order.id;
    btn.textContent = 'Отменить';
    action.append(btn);
  } else {
    action.textContent = '—';
  }
  tr.append(action);
  return tr;
}

function render() {
  const orders = getOrders();
  body.replaceChildren(...orders.map(row));
  wrap.hidden = orders.length === 0;
  empty.hidden = orders.length > 0;
}

// Делегирование №2: один обработчик на всю таблицу
body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="cancel"]');
  if (!btn || !confirm('Отменить этот заказ?')) return;
  cancelOrder(btn.dataset.id);
  render();
  toast('Заказ отменён');
});

const user = getUser();
if (user) qs('#profile-user').textContent = `${user.name}, ${user.email}`;
render();
