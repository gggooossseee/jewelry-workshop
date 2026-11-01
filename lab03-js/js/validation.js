// Мини-движок валидации: правило = функция (value, form) => '' | 'текст ошибки'
export const rules = {
  required: (msg = 'Обязательное поле') => (v) => (String(v).trim() ? '' : msg),
  minLength: (n, msg) => (v) => (!v || v.length >= n ? '' : msg ?? `Минимум ${n} символов`),
  maxLength: (n, msg) => (v) => (v.length <= n ? '' : msg ?? `Не более ${n} символов`),
  pattern: (re, msg) => (v) => (!v || re.test(v) ? '' : msg),
  email: (msg = 'Введите корректный e-mail') => (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : msg),
  custom: (fn) => fn,
};

export const getValue = (el) => (el.type === 'checkbox' ? (el.checked ? 'on' : '') : el.value);

export function validateValue(value, ruleList, form) {
  for (const rule of ruleList) {
    const message = rule(value, form);
    if (message) return message;
  }
  return '';
}

function errorBox(input) {
  let box = document.getElementById(`${input.id}-error`);
  if (!box) {
    box = document.createElement('p');
    box.className = 'form__error';
    box.id = `${input.id}-error`;
    box.setAttribute('role', 'alert');
    box.hidden = true;
    (input.type === 'checkbox' ? input.closest('label') : input).insertAdjacentElement('afterend', box);
  }
  return box;
}

export function setError(input, message) {
  const box = errorBox(input);
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', box.id);
    box.textContent = message;
    box.hidden = false;
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    box.textContent = '';
    box.hidden = true;
  }
}

export function checkField(form, schema, name) {
  const input = form.elements.namedItem(name);
  if (!input || !schema[name]) return '';
  const message = validateValue(getValue(input), schema[name], form);
  setError(input, message);
  return message;
}

// Проверка всей формы; фокус уходит на первое неверное поле
export function validateForm(form, schema) {
  let first = null;
  for (const name of Object.keys(schema)) {
    const input = form.elements.namedItem(name);
    if (!input || input.disabled || input.closest('[hidden]')) continue;
    if (checkField(form, schema, name) && !first) first = input;
  }
  if (first) first.focus();
  return !first;
}

// «Живая» проверка: делегирование событий на форме, а не на каждом поле
export function attachLiveValidation(form, schema) {
  const check = (e) => { if (e.target.name in schema) checkField(form, schema, e.target.name); };
  form.addEventListener('focusout', check);
  form.addEventListener('change', check);
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') check(e);
  });
}

export function clearErrors(form) {
  form.querySelectorAll('[aria-invalid]').forEach((el) => setError(el, ''));
}

export function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-zа-яё]/.test(pw) && /[A-ZА-ЯЁ]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^\w\s]/.test(pw) || pw.length >= 12) score++;
  return { score, label: ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Надёжный'][score] };
}
