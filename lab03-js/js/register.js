// Регистрация: валидация, индикатор надёжности пароля, показ пароля, «живая» проверка e-mail
import { rules, validateForm, attachLiveValidation, checkField, passwordStrength, setError } from './validation.js';
import { debounce, qs } from './utils.js';
import { setUser } from './storage.js';
import { toast } from './common.js';

const form = qs('#register-form');
const field = (n) => form.elements.namedItem(n);
const spinner = qs('#email-spinner');
const statusText = qs('#email-status-text');
const TAKEN = ['test@example.com', 'admin@example.com', 'user@example.com'];

// Заглушка запроса к серверу (в ЛР 6 здесь будет fetch)
const checkEmailFree = (email) =>
  new Promise((resolve) => setTimeout(() => resolve(!TAKEN.includes(email.toLowerCase())), 900));

let emailState = null; // null | 'free' | 'taken'
let token = 0;
let pending = Promise.resolve();

// Возвращает промис, который завершается, когда известен результат последней проверки
function runEmailCheck() {
  const input = field('email');
  const email = input.value.trim();
  if (!email || rules.email()(email)) {
    emailState = null;
    statusText.textContent = '';
    return Promise.resolve();
  }
  const mine = ++token;
  spinner.hidden = false;
  statusText.textContent = 'Проверяем e-mail…';
  pending = checkEmailFree(email).then((free) => {
    if (mine !== token) return pending; // ответ устарел: ждём результат более свежей проверки
    spinner.hidden = true;
    emailState = free ? 'free' : 'taken';
    statusText.textContent = free ? 'E-mail свободен' : '';
    setError(input, free ? '' : 'Этот e-mail уже зарегистрирован');
    return undefined;
  });
  return pending;
}

const schema = {
  name: [rules.required('Введите имя'), rules.minLength(2, 'Имя не короче 2 символов'),
    rules.pattern(/^[A-Za-zА-Яа-яЁё\-\s]+$/, 'Имя может содержать только буквы, пробел и дефис')],
  email: [rules.required('Укажите e-mail'), rules.email(),
    rules.custom(() => (emailState === 'taken' ? 'Этот e-mail уже зарегистрирован' : ''))],
  password: [rules.required('Введите пароль'), rules.minLength(8, 'Пароль — не короче 8 символов'),
    rules.custom((v) => (/[a-zа-яё]/.test(v) && /[A-ZА-ЯЁ]/.test(v) ? '' : 'Нужны строчные и заглавные буквы')),
    rules.custom((v) => (/\d/.test(v) ? '' : 'Добавьте хотя бы одну цифру'))],
  password2: [rules.required('Повторите пароль'),
    rules.custom((v) => (v === field('password').value ? '' : 'Пароли не совпадают'))],
  agree: [rules.required('Необходимо принять условия')],
};
attachLiveValidation(form, schema);

field('email').addEventListener('input', () => { emailState = null; statusText.textContent = ''; });
field('email').addEventListener('input', debounce(runEmailCheck, 500));

field('password').addEventListener('input', () => {
  const { score, label } = passwordStrength(field('password').value);
  qs('#strength').dataset.level = String(score);
  qs('#strength-text').textContent = `Надёжность пароля: ${field('password').value ? label : '—'}`;
  if (field('password2').value) checkField(form, schema, 'password2');
});

qs('#show-pass').addEventListener('change', (e) => {
  const type = e.target.checked ? 'text' : 'password';
  field('password').type = type;
  field('password2').type = type;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm(form, schema)) return;
  if (emailState !== 'free') {
    await runEmailCheck();
    if (emailState !== 'free') { field('email').focus(); return; }
  }
  setUser({ name: field('name').value.trim(), email: field('email').value.trim() }); // без пароля
  toast('Аккаунт создан');
  setTimeout(() => location.assign('profile.html'), 900);
});
