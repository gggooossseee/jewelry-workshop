// Данные каталога: единственный источник правды для карточек и заказов
export const CATEGORIES = { ring: 'Кольца', ear: 'Серьги', pend: 'Подвески', brac: 'Браслеты' };
export const METALS = { gold: 'Золото 585', silver: 'Серебро 925' };

export const PRODUCTS = [
  { id: 'ring-loza', title: 'Кольцо «Лоза»', category: 'ring', metal: 'gold', price: 24500, leadDays: 10, inStock: false, addedAt: '2026-09-20', img: 'ring1.png', description: 'Золотая ветвь с голубым топазом' },
  { id: 'ear-kaplya', title: 'Серьги «Капля»', category: 'ear', metal: 'silver', price: 6900, leadDays: 3, inStock: true, addedAt: '2026-08-15', img: 'ear1.png', description: 'Серебряные серьги-капли' },
  { id: 'pend-zvezda', title: 'Подвеска «Звезда»', category: 'pend', metal: 'gold', price: 12800, leadDays: 5, inStock: true, addedAt: '2026-10-01', img: 'pend1.png', description: 'Золотая звезда на цепочке' },
  { id: 'brac-zveno', title: 'Браслет «Звено»', category: 'brac', metal: 'silver', price: 8700, leadDays: 4, inStock: true, addedAt: '2026-07-10', img: 'brac1.png', description: 'Браслет из серебряных звеньев' },
  { id: 'ring-classic', title: 'Обручальное кольцо «Классика»', category: 'ring', metal: 'gold', price: 18900, leadDays: 7, inStock: false, addedAt: '2026-06-01', img: 'ring2.png', description: 'Гладкое обручальное кольцо' },
  { id: 'ring-emerald', title: 'Кольцо «Изумруд»', category: 'ring', metal: 'gold', price: 31500, leadDays: 14, inStock: false, addedAt: '2026-10-12', img: 'ring3.png', description: 'Золото и зелёный камень' },
  { id: 'ear-tochka', title: 'Серьги-гвоздики «Точка»', category: 'ear', metal: 'gold', price: 9800, leadDays: 2, inStock: true, addedAt: '2026-05-18', img: 'ear2.png', description: 'Маленькие золотые гвоздики' },
  { id: 'pend-serdce', title: 'Подвеска «Сердце»', category: 'pend', metal: 'silver', price: 5400, leadDays: 3, inStock: true, addedAt: '2026-09-05', img: 'pend2.png', description: 'Серебряное сердце' },
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
