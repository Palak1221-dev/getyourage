(function () {
  interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    tags: string[];
    rating: number;
    sales: number;
  }

  interface CartItem {
    product: Product;
    quantity: number;
  }

  const products: Product[] = [
    { id: 'p1', title: 'Resume Template Pack', description: '50 ATS-friendly resume templates for every industry. Compatible with Word, Google Docs, and PDF.', price: 12.99, category: 'templates', tags: ['resume', 'job', 'career', 'ats', 'cv', 'templates', 'word', 'google docs'], rating: 4.8, sales: 3420 },
    { id: 'p2', title: 'Study Planner PDF Bundle', description: 'Printable study planners, revision trackers, and exam countdown sheets. 30 pages of organized productivity.', price: 8.99, category: 'templates', tags: ['study', 'planner', 'printable', 'exam', 'revision', 'productivity'], rating: 4.6, sales: 2150 },
    { id: 'p3', title: 'Focus Timer Pro', description: 'A premium Pomodoro timer app with smart break scheduling, analytics, and customizable intervals for deep work.', price: 19.99, category: 'tools', tags: ['pomodoro', 'timer', 'focus', 'productivity', 'deep work', 'time management'], rating: 4.9, sales: 890 },
    { id: 'p4', title: 'Complete SEO Guide 2026', description: 'Master search engine optimization with this comprehensive guide covering technical SEO, content strategy, and analytics.', price: 14.99, category: 'ebooks', tags: ['seo', 'marketing', 'guide', 'search', 'traffic', 'analytics', 'content'], rating: 4.7, sales: 1560 },
    { id: 'p5', title: 'UI Component Library', description: '300+ reusable UI components built with Tailwind CSS. Buttons, modals, forms, tables, and more. Ready to copy-paste.', price: 24.99, category: 'design', tags: ['ui', 'components', 'tailwind', 'css', 'design', 'frontend', 'react'], rating: 4.8, sales: 1230 },
    { id: 'p6', title: 'React Developer Course', description: 'From zero to production. Learn React, Next.js, TypeScript, and modern frontend development with real projects.', price: 39.99, category: 'courses', tags: ['react', 'javascript', 'course', 'frontend', 'next.js', 'typescript', 'web dev'], rating: 4.9, sales: 670 },
    { id: 'p7', title: 'Exam Preparation Workbook', description: 'A structured workbook to plan exam revision, track progress, and build confidence before test day.', price: 6.99, category: 'templates', tags: ['exam', 'study', 'workbook', 'revision', 'preparation', 'tracker'], rating: 4.5, sales: 1890 },
    { id: 'p8', title: 'Python Automation Scripts', description: '100 ready-to-use Python scripts for file management, web scraping, data processing, and API automation.', price: 16.99, category: 'tools', tags: ['python', 'automation', 'scripts', 'scraping', 'data', 'api', 'coding'], rating: 4.7, sales: 980 },
    { id: 'p9', title: 'Social Media Template Kit', description: '100+ templates for Instagram, LinkedIn, Twitter, and TikTok. Editable in Canva and Figma.', price: 11.99, category: 'design', tags: ['social media', 'templates', 'canva', 'figma', 'instagram', 'linkedin', 'design'], rating: 4.6, sales: 2100 },
    { id: 'p10', title: 'Freelancer Starter Pack', description: 'Contracts, invoices, proposals, and client management templates for freelance professionals.', price: 9.99, category: 'templates', tags: ['freelance', 'contract', 'invoice', 'business', 'client', 'proposal', 'templates'], rating: 4.4, sales: 1650 },
    { id: 'p11', title: 'JavaScript Mastery Guide', description: 'Deep dive into modern JavaScript: closures, promises, async/await, modules, and advanced patterns.', price: 18.99, category: 'ebooks', tags: ['javascript', 'guide', 'ebook', 'coding', 'programming', 'async', 'promises'], rating: 4.8, sales: 1340 },
    { id: 'p12', title: 'Notion Dashboard Bundle', description: 'Premium Notion templates for project management, habit tracking, goal setting, and team collaboration.', price: 7.99, category: 'templates', tags: ['notion', 'dashboard', 'productivity', 'project management', 'habits', 'goals'], rating: 4.7, sales: 2780 },
  ];

  let cart: CartItem[] = JSON.parse(localStorage.getItem('ds_cart') || '[]');
  let searchTerm = '';
  let categoryFilter = 'all';

  const grid = document.getElementById('products-grid');
  const noResults = document.getElementById('no-results');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartPanel = document.getElementById('cart-panel');
  const cartItems = document.getElementById('cart-items');
  const cartFooter = document.getElementById('cart-footer');
  const cartTotal = document.getElementById('cart-total');
  const closeCart = document.getElementById('close-cart');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const categoryFilterEl = document.getElementById('category-filter') as HTMLSelectElement;
  const aiRecs = document.getElementById('ai-recs');
  const aiEmpty = document.getElementById('ai-empty');
  const aiHint = document.getElementById('ai-hint');
  const toast = document.getElementById('toast');
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutOverlay = document.getElementById('checkout-overlay');
  const checkoutContent = document.getElementById('checkout-content');
  const checkoutSummary = document.getElementById('checkout-summary');
  const checkoutTotal = document.getElementById('checkout-total');
  const closeCheckout = document.getElementById('close-checkout');
  const placeOrderBtn = document.getElementById('place-order-btn');
  const checkoutEmail = document.getElementById('checkout-email') as HTMLInputElement;
  const checkoutPayment = document.getElementById('checkout-payment') as HTMLSelectElement;

  function renderProducts() {
    if (!grid) return;
    const filtered = products.filter(p => {
      const matchesSearch = searchTerm === '' ||
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(t => t.includes(searchTerm));
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
      noResults?.classList.remove('hidden');
      return;
    }
    noResults?.classList.add('hidden');

    grid.innerHTML = filtered.map(p => `
      <div class="product-card bg-canvas border border-hairline rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-fuchsia-200/40 transition-all p-4 flex flex-col cursor-pointer" data-id="${p.id}" data-tags="${p.tags.join(',')}">
        <div class="w-full h-32 rounded-xl bg-gradient-to-br from-fuchsia-50 to-indigo-50 flex items-center justify-center mb-3 text-3xl">
          ${getProductEmoji(p.category)}
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="text-xs font-bold text-ink leading-snug">${p.title}</h3>
            <span class="shrink-0 text-xs font-black text-fuchsia-600">$${p.price.toFixed(2)}</span>
          </div>
          <p class="text-[11px] text-mute leading-relaxed line-clamp-2 mb-2">${p.description}</p>
        </div>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-hairline">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-bold text-amber-600">${'★'.repeat(Math.round(p.rating))}</span>
            <span class="text-[10px] text-mute">(${p.sales})</span>
          </div>
          <span class="text-[10px] font-medium text-mute uppercase px-1.5 py-0.5 rounded bg-canvas-soft">${p.category}</span>
        </div>
        <button class="add-to-cart-btn mt-3 w-full py-2 text-[11px] font-extrabold text-white bg-fuchsia-600 rounded-xl hover:bg-fuchsia-700 active:scale-[0.97] transition-all" data-id="${p.id}">
          Add to Cart
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).dataset.id;
        if (id) addToCart(id);
      });
    });

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset.id;
        if (id) showAIRecommendations(id);
      });
    });
  }

  function getProductEmoji(category: string): string {
    const map: Record<string, string> = {
      'templates': '📄',
      'ebooks': '📖',
      'tools': '🛠️',
      'design': '🎨',
      'courses': '🎓',
    };
    return map[category] || '📦';
  }

  function addToCart(id: string) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.product.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ product, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${product.title} added to cart`);
  }

  function removeFromCart(id: string) {
    cart = cart.filter(item => item.product.id !== id);
    saveCart();
    updateCartUI();
  }

  function updateQuantity(id: string, delta: number) {
    const item = cart.find(i => i.product.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
      updateCartUI();
    }
  }

  function saveCart() {
    localStorage.setItem('ds_cart', JSON.stringify(cart));
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    if (cartCount) {
      cartCount.textContent = `${totalItems}`;
      cartCount.classList.toggle('hidden', totalItems === 0);
    }

    if (cartItems && cartFooter && cartTotal) {
      if (cart.length === 0) {
        cartItems.innerHTML = `<div class="text-center py-12"><div class="w-12 h-12 rounded-2xl bg-fuchsia-100/60 flex items-center justify-center mx-auto mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-fuchsia-600"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div><p class="text-sm font-bold text-ink mb-1">Your cart is empty</p><p class="text-xs text-mute">Browse products and add items you like.</p></div>`;
        cartFooter.classList.add('hidden');
      } else {
        cartItems.innerHTML = cart.map(item => `
          <div class="flex items-center gap-3 p-3 bg-canvas-soft rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-50 to-indigo-50 flex items-center justify-center text-lg shrink-0">
              ${getProductEmoji(item.product.category)}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-ink truncate">${item.product.title}</p>
              <p class="text-[10px] text-mute">$${item.product.price.toFixed(2)} each</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button class="qty-minus w-6 h-6 rounded-lg bg-canvas border border-hairline flex items-center justify-center hover:bg-hairline text-xs font-bold" data-id="${item.product.id}">-</button>
              <span class="w-6 text-center text-xs font-bold text-ink">${item.quantity}</span>
              <button class="qty-plus w-6 h-6 rounded-lg bg-canvas border border-hairline flex items-center justify-center hover:bg-hairline text-xs font-bold" data-id="${item.product.id}">+</button>
            </div>
            <button class="remove-item w-7 h-7 rounded-lg bg-rose-100/60 flex items-center justify-center hover:bg-rose-200/60 text-rose-600 shrink-0" data-id="${item.product.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `).join('');
        cartFooter.classList.remove('hidden');
        cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

        document.querySelectorAll('.qty-minus').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset.id;
            if (id) updateQuantity(id, -1);
          });
        });
        document.querySelectorAll('.qty-plus').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset.id;
            if (id) updateQuantity(id, 1);
          });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset.id;
            if (id) removeFromCart(id);
          });
        });
      }
    }
  }

  function showAIRecommendations(id: string) {
    const product = products.find(p => p.id === id);
    if (!product || !aiRecs || !aiEmpty || !aiHint) return;

    aiEmpty.classList.add('hidden');
    aiHint!.textContent = `Because you viewed "${product.title}"`;

    const scored = products
      .filter(p => p.id !== id)
      .map(p => {
        const tagOverlap = p.tags.filter(t => product.tags.includes(t)).length;
        const categoryBonus = p.category === product.category ? 3 : 0;
        const titleOverlap = p.title.toLowerCase().split(' ').filter(w => product.title.toLowerCase().includes(w)).length;
        const score = tagOverlap * 2 + categoryBonus + titleOverlap + Math.random() * 0.5;
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    aiRecs.innerHTML = scored.map(({ product: rec }) => `
      <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-canvas-soft border border-hairline hover:border-fuchsia-200/40 transition-all cursor-pointer" data-id="${rec.id}">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-50 to-indigo-50 flex items-center justify-center text-sm shrink-0">
          ${getProductEmoji(rec.category)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[11px] font-bold text-ink truncate">${rec.title}</p>
          <p class="text-[10px] text-fuchsia-600 font-bold">$${rec.price.toFixed(2)}</p>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('#ai-recs .cursor-pointer').forEach(el => {
      el.addEventListener('click', () => {
        const recId = (el as HTMLElement).dataset.id;
        if (recId) showAIRecommendations(recId);
      });
    });
  }

  function showToast(message: string) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('translate-y-4', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');
    clearTimeout((toast as any)._hideTimer);
    (toast as any)._hideTimer = setTimeout(() => {
      toast?.classList.add('translate-y-4', 'opacity-0');
      toast?.classList.remove('translate-y-0', 'opacity-100');
      setTimeout(() => toast?.classList.add('pointer-events-none'), 300);
    }, 2500);
  }

  function openCart() {
    cartSidebar?.classList.remove('pointer-events-none');
    cartOverlay?.classList.remove('pointer-events-none');
    cartOverlay?.classList.add('opacity-100');
    cartPanel?.classList.remove('translate-x-full');
  }

  function closeCartFn() {
    cartOverlay?.classList.remove('opacity-100');
    cartPanel?.classList.add('translate-x-full');
    setTimeout(() => {
      cartSidebar?.classList.add('pointer-events-none');
      cartOverlay?.classList.add('pointer-events-none');
    }, 300);
  }

  function openCheckout() {
    if (cart.length === 0) return;
    checkoutModal?.classList.remove('pointer-events-none');
    checkoutOverlay?.classList.remove('pointer-events-none');
    checkoutOverlay?.classList.add('opacity-100');
    checkoutContent?.classList.remove('scale-95', 'opacity-0');
    checkoutContent?.classList.add('scale-100', 'opacity-100');

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (checkoutSummary && checkoutTotal) {
      checkoutSummary.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between text-xs">
          <span class="text-body">${item.product.title} × ${item.quantity}</span>
          <span class="font-bold text-ink">$${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
      checkoutTotal.textContent = `$${total.toFixed(2)}`;
    }
  }

  function closeCheckoutFn() {
    checkoutOverlay?.classList.remove('opacity-100');
    checkoutContent?.classList.add('scale-95', 'opacity-0');
    checkoutContent?.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
      checkoutModal?.classList.add('pointer-events-none');
      checkoutOverlay?.classList.add('pointer-events-none');
    }, 300);
  }

  cartBtn?.addEventListener('click', openCart);
  closeCart?.addEventListener('click', closeCartFn);
  cartOverlay?.addEventListener('click', closeCartFn);
  closeCheckout?.addEventListener('click', closeCheckoutFn);
  checkoutOverlay?.addEventListener('click', closeCheckoutFn);

  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    closeCartFn();
    setTimeout(openCheckout, 350);
  });

  placeOrderBtn?.addEventListener('click', () => {
    const email = checkoutEmail?.value.trim();
    const payment = checkoutPayment?.value;
    if (!email) { showToast('Please enter your email address'); return; }
    if (!payment) { showToast('Please select a payment method'); return; }
    showToast('Order placed! Check your email for download links.');
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutFn();
    if (checkoutEmail) checkoutEmail.value = '';
    if (checkoutPayment) checkoutPayment.value = '';
  });

  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value.toLowerCase().trim();
    renderProducts();
  });

  categoryFilterEl?.addEventListener('change', () => {
    categoryFilter = categoryFilterEl.value;
    renderProducts();
  });

  renderProducts();
  updateCartUI();
})();