// Заказ изделия: схема правил, форма (на странице изделия) и модальное окно (в каталоге)
import { rules, validateForm, attachLiveValidation, clearErrors, getValue } from './validation.js';
import { addDays, todayISO, formatDate, qs, uid } from './utils.js';
import { addOrder } from './storage.js';
import { toast } from './common.js';

// Своё правило №1 (бизнес): изделие нельзя получить раньше, чем оно будет изготовлено
export const leadTimeRule = (getProduct) => (value) => {
  const p = getProduct();
  if (!value || !p) return '';
  const min = addDays(todayISO(), p.leadDays);
  return value < min ? `Изделие изготавливается ${p.leadDays} дн.: ближайшая дата — ${formatDate(min)}` : '';
};

// Своё правило №2: гравировка — только буквы, цифры, пробел и простые знаки
export const engravingRule = (value) =>
  /^[A-Za-zА-Яа-яЁё0-9 .,\-]*$/.test(value) ? '' : 'Гравировка: только буквы, цифры, пробел и знаки . , -';

// Правило №3: размер нужен только для колец (14–24, шаг 0,5)
export const sizeRule = (getProduct) => (value) => {
  const p = getProduct();
  if (!p || p.category !== 'ring') return '';
  if (!value) return 'Укажите размер кольца';
  const n = Number(value.replace(',', '.'));
  if (Number.isNaN(n) || n < 14 || n > 24) return 'Размер кольца — от 14 до 24';
  return (n * 2) % 1 === 0 ? '' : 'Шаг размера — 0,5';
};

export const orderSchema = (getProduct) => ({
  name: [
    rules.required('Введите имя и фамилию'),
    rules.minLength(2, 'Имя не короче 2 символов'),
    rules.pattern(/^[A-Za-zА-Яа-яЁё\-\s]+$/, 'Имя может содержать только буквы, пробел и дефис'),
  ],
  phone: [rules.required('Укажите телефон'), rules.pattern(/^\+7\d{10}$/, 'Формат: +7 и 10 цифр, например +79991234567')],
  email: [rules.required('Укажите e-mail'), rules.email()],
  size: [rules.custom(sizeRule(getProduct))],
  date: [rules.required('Выберите дату получения'), rules.custom(leadTimeRule(getProduct))],
  engraving: [rules.maxLength(20, 'Не более 20 символов'), rules.custom(engravingRule)],
  agree: [rules.required('Необходимо согласие на обработку данных')],
});

export function initOrderForm(form, getProduct, onSuccess) {
  const schema = orderSchema(getProduct);
  attachLiveValidation(form, schema);

  const field = (name) => form.elements.namedItem(name);

  function refresh() {
    const p = getProduct();
    const sizeBox = form.querySelector('[data-size-field]');
    const size = field('size');
    if (sizeBox && size) {
      const need = p?.category === 'ring';
      sizeBox.hidden = !need;
      size.disabled = !need;
    }
    if (field('date') && p) field('date').min = addDays(todayISO(), p.leadDays);
    const hint = form.querySelector('[data-lead-hint]');
    if (hint && p) hint.textContent = `Срок изготовления: ${p.leadDays} дн.`;
    clearErrors(form);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form, schema)) return;
    const p = getProduct();
    const val = (n) => (field(n) ? getValue(field(n)).trim() : '');
    addOrder({
      id: uid(), productId: p.id, title: p.title, price: p.price,
      size: p.category === 'ring' ? val('size') : '', date: val('date'),
      engraving: val('engraving'), customer: val('name'), phone: val('phone'),
      status: 'active', createdAt: new Date().toISOString(),
    });
    toast(`Заказ оформлен: ${p.title}`);
    form.reset();
    refresh();
    onSuccess?.();
  });

  refresh();
  return { refresh };
}

export function initOrderDialog() {
  const dialog = qs('#order-dialog');
  const form = qs('#order-form', dialog);
  let current = null;
  const api = initOrderForm(form, () => current, () => dialog.close());

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });

  return {
    open(product) {
      current = product;
      qs('#order-title').textContent = `Заказ: ${product.title}`;
      api.refresh();
      dialog.showModal();
      form.elements.namedItem('name').focus();
    },
  };
}
