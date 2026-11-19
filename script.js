(() => {
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme');

  // Dark mode
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const initial = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-pressed', String(t === 'dark'));
    themeBtn.textContent = t === 'dark' ? 'Гэрэлтэй горим' : 'Харанхуй горим';
  };
  applyTheme(initial);
  themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Flip cards: button toggles, hidden face is inert for keyboard/AT
  document.querySelectorAll('.card').forEach((card) => {
    const btn = card.querySelector('.flip-btn');
    const front = card.querySelector('.front');
    const back = card.querySelector('.back');
    const set = (flipped) => {
      card.classList.toggle('is-flipped', flipped);
      btn.setAttribute('aria-pressed', String(flipped));
      btn.textContent = flipped ? 'Буцах' : 'Дэлгэрэнгүй';
      front.inert = flipped;
      back.inert = !flipped;
    };
    set(false);
    const toggle = () => set(!card.classList.contains('is-flipped'));
    btn.addEventListener('click', toggle);
    card.querySelector('.flip').addEventListener('click', toggle);
  });

  // Cart
  const fmt = (n) => n.toLocaleString('en-US') + '₮';
  const dlg = document.getElementById('cart');
  const list = document.getElementById('cart-list');
  const status = document.getElementById('cart-status');
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('cart') || '{}') || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) {} };
  const render = () => {
    const items = Object.entries(cart);
    document.getElementById('cart-count').textContent = items.reduce((a, [, v]) => a + v.qty, 0);
    document.getElementById('cart-total').textContent = fmt(items.reduce((a, [, v]) => a + v.qty * v.price, 0));
    list.innerHTML = '';
    if (!items.length) { list.innerHTML = '<li class="empty">Сагс хоосон байна.</li>'; return; }
    items.forEach(([id, v]) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = v.name + ' — ' + fmt(v.price);
      const qty = document.createElement('span');
      qty.className = 'qty';
      const mk = (txt, label, d) => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = txt; b.setAttribute('aria-label', label + ': ' + v.name);
        b.addEventListener('click', () => { change(id, d); });
        return b;
      };
      const n = document.createElement('span'); n.textContent = v.qty;
      qty.append(mk('−', 'Багасгах', -1), n, mk('+', 'Нэмэх', 1));
      li.append(name, qty);
      list.append(li);
    });
  };
  const change = (id, d) => {
    if (!cart[id]) return;
    cart[id].qty += d;
    if (cart[id].qty <= 0) delete cart[id];
    save(); render();
  };
  document.querySelectorAll('.card').forEach((card) => {
    card.querySelector('.add-btn').addEventListener('click', () => {
      const { id, name, price } = card.dataset;
      cart[id] = cart[id] || { name, price: Number(price), qty: 0 };
      cart[id].qty += 1;
      save(); render();
      status.textContent = name + ' сагсанд нэмэгдлээ';
    });
  });
  document.getElementById('cart-btn').addEventListener('click', () => dlg.showModal());
  document.getElementById('cart-close').addEventListener('click', () => dlg.close());
  document.getElementById('cart-clear').addEventListener('click', () => { cart = {}; save(); render(); });
  render();

  // Loader
  const done = () => document.body.classList.add('loaded');
  if (document.readyState === 'complete') done();
  else addEventListener('load', done);
  setTimeout(done, 3000);
})();