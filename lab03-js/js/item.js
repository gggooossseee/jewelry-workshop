// Страница изделия: форма заказа с той же валидацией, что и в диалоге каталога
import { getProduct } from './data.js';
import { initOrderForm } from './booking.js';
import { qs } from './utils.js';

const form = qs('#order-form-item');
const product = getProduct(form.dataset.productId);
initOrderForm(form, () => product);
