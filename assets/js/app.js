
/**
 * JUNU ATELIER • Client Application Logic
 * Brand: JUNU • Wear Your Power
 * Creative Direction: Roselyn Magar • Kathmandu, Nepal
 */

// Global State
const JUNU_STATE = {
  theme: localStorage.getItem('junu_theme') || 'dark',
  currency: localStorage.getItem('junu_currency') || 'NPR',
  activeCategory: 'all',
  searchQuery: '',
  sortOrder: 'featured',
  viewMode: 'lookbook',
  cart: JSON.parse(localStorage.getItem('junu_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('junu_wishlist') || '[]'),
  selectedQvSize: 'S',
  activeQvProduct: null
};

if (typeof window !== 'undefined') {
  window.JUNU_STATE = JUNU_STATE;
}
if (typeof globalThis !== 'undefined') {
  globalThis.JUNU_STATE = JUNU_STATE;
}
if (typeof global !== 'undefined') {
  global.JUNU_STATE = JUNU_STATE;
}

// Safe helper to access catalog products across all environments
function getCatalogProducts() {
  if (typeof window !== 'undefined' && Array.isArray(window.JUNU_PRODUCTS)) return window.JUNU_PRODUCTS;
  if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.JUNU_PRODUCTS)) return globalThis.JUNU_PRODUCTS;
  if (typeof global !== 'undefined' && Array.isArray(global.JUNU_PRODUCTS)) return global.JUNU_PRODUCTS;
  if (typeof JUNU_PRODUCTS !== 'undefined' && Array.isArray(JUNU_PRODUCTS)) return JUNU_PRODUCTS;
  return [];
}

// Currency Exchange Rates (Base NPR)
const EXCHANGE_RATES = {
  NPR: { rate: 1, symbol: "Rs. ", code: "NPR" },
  USD: { rate: 0.0075, symbol: "$", code: "USD" },
  INR: { rate: 0.625, symbol: "₹", code: "INR" },
  GBP: { rate: 0.0060, symbol: "£", code: "GBP" },
  EUR: { rate: 0.0070, symbol: "€", code: "EUR" }
};

function formatMoney(amountNpr) {
  const c = EXCHANGE_RATES[JUNU_STATE.currency] || EXCHANGE_RATES.NPR;
  const converted = Math.round(amountNpr * c.rate);
  return `${c.symbol}${converted.toLocaleString()}`;
}

// =========================================================================
// 1. Theme Manager (White Mode & Dark Mode)
// =========================================================================
function initTheme() {
  const saved = localStorage.getItem('junu_theme');
  if (saved) {
    JUNU_STATE.theme = saved;
  }
  const isLight = JUNU_STATE.theme === 'light';
  applyTheme(isLight);
}

function setTheme(mode) {
  JUNU_STATE.theme = mode;
  localStorage.setItem('junu_theme', mode);
  applyTheme(mode === 'light');
}

function toggleTheme() {
  const isCurrentlyLight = document.documentElement.classList.contains('light');
  const nextLight = !isCurrentlyLight;
  setTheme(nextLight ? 'light' : 'dark');
}

function applyTheme(isLight) {
  const html = document.documentElement;
  const body = document.body;

  if (isLight) {
    html.classList.remove('dark');
    html.classList.add('light');
    body.classList.remove('junu-dark-theme');
    body.classList.add('junu-light-theme');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    body.classList.remove('junu-light-theme');
    body.classList.add('junu-dark-theme');
  }

  // Update theme icons across header and mobile drawer
  document.querySelectorAll('#theme-icon, .mobile-theme-icon').forEach(icon => {
    icon.textContent = isLight ? 'dark_mode' : 'light_mode';
  });
  document.querySelectorAll('.theme-label').forEach(label => {
    label.textContent = isLight ? 'Dark Mode' : 'White Mode';
  });
}

// =========================================================================
// 2. Currency Selector
// =========================================================================
function setCurrency(curr) {
  if (!EXCHANGE_RATES[curr]) return;
  JUNU_STATE.currency = curr;
  localStorage.setItem('junu_currency', curr);
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof renderHomeCollections === 'function') renderHomeCollections();
  if (typeof updateStaticPrices === 'function') updateStaticPrices();
  if (typeof updatePriceDisplay === 'function') updatePriceDisplay();
  if (typeof renderCheckoutPage === 'function') renderCheckoutPage();
  updateCartDrawer();
  showSalonToast(`Currency set to ${curr}`);
}

function updateStaticPrices() {
  document.querySelectorAll('[data-price-npr]').forEach(el => {
    const npr = parseInt(el.getAttribute('data-price-npr'), 10);
    if (!isNaN(npr)) {
      el.textContent = formatMoney(npr);
    }
  });
}

// =========================================================================
// 3. Category & Search Filters
// =========================================================================
function filterCategory(cat) {
  JUNU_STATE.activeCategory = cat;
  
  // Update category buttons UI
  document.querySelectorAll('.cat-pill-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-cat') === cat;
    btn.classList.toggle('active', isTarget);
    btn.classList.toggle('text-primary', isTarget);
    btn.classList.toggle('text-on-surface-variant', !isTarget);
    const line = btn.querySelector('.cat-line');
    if (line) line.classList.toggle('opacity-0', !isTarget);
  });

  renderProducts();
}

function handleSearch(query) {
  JUNU_STATE.searchQuery = query.toLowerCase().trim();
  renderProducts();
}

function handleSort(order) {
  JUNU_STATE.sortOrder = order;
  renderProducts();
}

function setViewMode(mode) {
  JUNU_STATE.viewMode = mode;
  const grid = document.getElementById('product-grid');
  const btnLookbook = document.getElementById('view-lookbook');
  const btnGrid = document.getElementById('view-grid');

  if (mode === 'grid') {
    grid.className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";
    btnGrid.className = "p-1.5 text-primary bg-surface-container-high transition-colors";
    btnLookbook.className = "p-1.5 text-outline hover:text-primary transition-colors";
  } else {
    grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
    btnLookbook.className = "p-1.5 text-primary bg-surface-container-high transition-colors";
    btnGrid.className = "p-1.5 text-outline hover:text-primary transition-colors";
  }
}

// =========================================================================
// 4. Render Product Cards (Stitch Screen 2 Exact Blueprint)
// =========================================================================
function renderProducts() {
  const container = document.getElementById('product-grid');
  const catalog = getCatalogProducts();
  if (!container || !catalog.length) return;

  // Filter
  let items = catalog.filter(p => {
    const matchCat = JUNU_STATE.activeCategory === 'all' || p.category === JUNU_STATE.activeCategory;
    const matchSearch = !JUNU_STATE.searchQuery || 
      p.name.toLowerCase().includes(JUNU_STATE.searchQuery) ||
      p.description.toLowerCase().includes(JUNU_STATE.searchQuery) ||
      p.material.toLowerCase().includes(JUNU_STATE.searchQuery);
    return matchCat && matchSearch;
  });

  // Sort
  if (JUNU_STATE.sortOrder === 'price-asc') {
    items.sort((a, b) => a.price_npr - b.price_npr);
  } else if (JUNU_STATE.sortOrder === 'price-desc') {
    items.sort((a, b) => b.price_npr - a.price_npr);
  } else if (JUNU_STATE.sortOrder === 'stock') {
    items.sort((a, b) => a.remaining_stock - b.remaining_stock);
  }

  // Update category counts
  const allCount = catalog.length;
  const goddessCount = catalog.filter(p => p.category === 'goddess').length;
  const afterdarkCount = catalog.filter(p => p.category === 'afterdark').length;
  const accentsCount = catalog.filter(p => p.category === 'accents').length;

  const elAll = document.getElementById('count-all');
  const elGod = document.getElementById('count-goddess');
  const elAft = document.getElementById('count-afterdark');
  const elAcc = document.getElementById('count-accents');
  if (elAll) elAll.textContent = allCount;
  if (elGod) elGod.textContent = goddessCount;
  if (elAft) elAft.textContent = afterdarkCount;
  if (elAcc) elAcc.textContent = accentsCount;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-on-surface-variant font-light space-y-3">
        <span class="material-symbols-outlined text-4xl text-outline">search_off</span>
        <p class="text-lg">No silhouettes match your search criteria.</p>
        <button onclick="handleSearch(''); document.getElementById('catalog-search').value='';" class="text-secondary text-xs uppercase tracking-widest font-semibold hover:underline">
          Clear Search Filter
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((product, idx) => {
    const isWishlisted = JUNU_STATE.wishlist.includes(product.id);
    const priceFormatted = formatMoney(product.price_npr);

    const staggerClass = `junu-stagger-${(idx % 4) + 1}`;

    return `
      <article class="group flex flex-col bg-surface-container-low border border-outline-variant/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative junu-reveal ${staggerClass}" data-id="${product.id}">
        
        <!-- Media Canvas with Hover Size Slide-Up -->
        <div class="relative w-full aspect-[3/4] overflow-hidden bg-surface-container-lowest flex items-center justify-center">
          
          <!-- Primary Centered Garment Image (Links to dedicated product page) -->
          <a href="product.html?id=${product.id}" class="w-full h-full block overflow-hidden">
            <img class="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" 
                 src="${product.image}" 
                 alt="${product.name}" 
                 loading="lazy">
          </a>

          <!-- Subtle Scrim Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"></div>

          <!-- Badges (Top Left) -->
          <div class="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none z-10">
            <span class="bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary font-semibold border border-secondary/30">
              ${product.pill_label || product.badge}
            </span>
            <span class="bg-surface-container-high/90 backdrop-blur-md px-2.5 py-1 font-label-sm text-label-sm uppercase tracking-[0.16em] text-primary">
              Only ${product.remaining_stock} Left
            </span>
          </div>

          <!-- Wishlist Heart Button (Top Right) -->
          <button onclick="toggleWishlist('${product.id}', this)" aria-label="Add to wishlist" class="absolute top-4 right-4 w-9 h-9 bg-surface-container-lowest/70 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:text-secondary hover:bg-surface-container-lowest transition-colors z-10" type="button">
            <span class="material-symbols-outlined text-[18px] ${isWishlisted ? 'text-secondary fill-1' : ''}">favorite</span>
          </button>

          <!-- Hover Size Pills Bar (Slides up on card hover - Stitch Blueprint) -->
          <div class="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-surface-container-lowest/95 backdrop-blur-lg flex flex-col space-y-3 z-20 border-t border-outline-variant/30">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm uppercase tracking-widest text-outline font-semibold">Select Measure</span>
              <button onclick="openQuickView('${product.id}')" class="text-[11px] text-secondary hover:underline font-semibold uppercase tracking-wider flex items-center space-x-0.5">
                <span>Quick View</span>
                <span class="material-symbols-outlined text-[12px]">visibility</span>
              </button>
            </div>
            
            <!-- Size Pills -->
            <div class="flex items-center space-x-2">
              ${product.sizes.map(size => `
                <button onclick="quickAddProduct('${product.id}', '${size}')" class="flex-1 py-1.5 font-label-sm text-label-sm uppercase bg-surface-container hover:bg-secondary hover:text-on-secondary text-primary transition-colors font-semibold border border-outline-variant/30" type="button">
                  ${size}
                </button>
              `).join('')}
            </div>

            <!-- Primary Action Button (Direct to product page) -->
            <a href="product.html?id=${product.id}" class="w-full bg-primary text-on-primary py-2.5 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary hover:text-on-secondary transition-colors font-semibold flex items-center justify-center space-x-1.5 text-center">
              <span>Inspect Garment • ${priceFormatted}</span>
            </a>
          </div>

        </div>

        <!-- Card Metadata & Description -->
        <div class="p-6 flex flex-col space-y-3 flex-1 justify-between">
          <div class="space-y-2">
            <div class="flex items-baseline justify-between text-xs">
              <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">${product.sub_title || product.category_label}</span>
              <span class="font-body-md text-body-md text-on-surface-variant font-light text-[12px]">${product.material_badge || product.accent_color}</span>
            </div>
            <a href="product.html?id=${product.id}" class="block">
              <h3 class="font-title-lg text-title-lg text-primary tracking-tight group-hover:text-secondary transition-colors cursor-pointer leading-snug">
                ${product.name}
              </h3>
            </a>
            <p class="font-body-md text-body-md text-on-surface-variant font-light line-clamp-2 text-sm leading-relaxed">
              ${product.description}
            </p>
          </div>

          <!-- Bottom Price & Reserve CTA -->
          <div class="pt-3 flex items-center justify-between border-t border-outline-variant/30">
            <span class="font-headline-md text-headline-md text-primary font-semibold">${priceFormatted}</span>
            <div class="flex items-center space-x-3">
              <a href="https://ig.me/m/junu.clo" target="_blank" rel="noopener noreferrer" class="text-xs text-rose-400 hover:underline uppercase tracking-wider font-semibold flex items-center space-x-1" title="Inquire on Instagram">
                <span>DM on IG</span>
              </a>
              <a href="product.html?id=${product.id}" class="font-label-sm text-label-sm text-secondary uppercase tracking-wider flex items-center space-x-1 font-semibold hover:underline" title="Inspect Garment Details">
                <span>Inspect Piece</span>
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>

      </article>
    `;
  }).join('');

  if (typeof observeNewReveals === 'function') {
    observeNewReveals(container);
  }
}

// =========================================================================
// 4B. Homepage Collection Preview (6 of 15 + Explore Expand)
// =========================================================================
let homeCollectionsExpanded = false;
let homeActiveCategory = 'all';

function setHomeCategory(cat) {
  homeActiveCategory = cat;
  document.querySelectorAll('.home-cat-pill').forEach(btn => {
    const isTarget = btn.getAttribute('data-cat') === cat;
    btn.classList.toggle('active', isTarget);
    btn.classList.toggle('border-secondary', isTarget);
    btn.classList.toggle('text-primary', isTarget);
    btn.classList.toggle('text-on-surface-variant', !isTarget);
    btn.classList.toggle('border-transparent', !isTarget);
  });
  renderHomeCollections();
}

function toggleHomeCollectionsExpand() {
  homeCollectionsExpanded = !homeCollectionsExpanded;
  renderHomeCollections();
  const btn = document.getElementById('home-expand-btn');
  if (btn) {
    btn.innerHTML = homeCollectionsExpanded ? 
      `<span>Show Curated 6 Pieces</span><span class="material-symbols-outlined text-[16px]">expand_less</span>` :
      `<span>Reveal Remaining 9 Silhouettes (15 Total)</span><span class="material-symbols-outlined text-[16px]">expand_more</span>`;
  }
}

function renderHomeCollections() {
  const container = document.getElementById('home-collections-grid');
  const catalog = getCatalogProducts();
  if (!container || !catalog.length) return;

  let items = catalog.filter(p => {
    return homeActiveCategory === 'all' || p.category === homeActiveCategory;
  });

  const displayLimit = homeCollectionsExpanded ? items.length : 6;
  const displayItems = items.slice(0, displayLimit);

  // Update counts if visible count element exists
  const countEl = document.getElementById('home-visible-count');
  if (countEl) {
    countEl.textContent = `Showing ${displayItems.length} of ${items.length} Silhouettes`;
  }

  container.innerHTML = displayItems.map((product, idx) => {
    const isWishlisted = (JUNU_STATE.wishlist || []).includes(product.id);
    const priceFormatted = formatMoney(product.price_npr);
    const staggerClass = `junu-stagger-${(idx % 3) + 1}`;

    return `
      <article class="group flex flex-col bg-surface-container-low border border-outline-variant/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative junu-reveal ${staggerClass}" data-id="${product.id}">
        
        <!-- Media Canvas -->
        <div class="relative w-full aspect-[3/4] overflow-hidden bg-surface-container-lowest flex items-center justify-center">
          <a href="product.html?id=${product.id}" class="w-full h-full block overflow-hidden" aria-label="Inspect ${product.name}">
            <img class="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" 
                 src="${product.image}" 
                 alt="${product.name}" 
                 loading="lazy">
          </a>

          <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"></div>

          <!-- Badges -->
          <div class="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col space-y-1.5 pointer-events-none z-10">
            <span class="bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 font-label-sm text-[10px] uppercase tracking-[0.2em] text-secondary font-semibold border border-secondary/30">
              ${product.pill_label || product.badge}
            </span>
            <span class="bg-surface-container-high/90 backdrop-blur-md px-2 py-0.5 font-label-sm text-[9px] uppercase tracking-[0.16em] text-primary">
              Only ${product.remaining_stock} Left
            </span>
          </div>

          <!-- Wishlist Heart Button -->
          <button onclick="toggleWishlist('${product.id}', this)" aria-label="Add to wishlist" class="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 bg-surface-container-lowest/70 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface hover:text-secondary hover:bg-surface-container-lowest transition-colors z-10" type="button">
            <span class="material-symbols-outlined text-[18px] ${isWishlisted ? 'text-secondary fill-1' : ''}">favorite</span>
          </button>

          <!-- Hover Quick Size Bar -->
          <div class="absolute bottom-0 inset-x-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-surface-container-lowest/95 backdrop-blur-lg flex flex-col space-y-2 z-20 border-t border-outline-variant/30">
            <div class="flex items-center justify-between text-[11px] text-outline font-label-sm uppercase tracking-wider">
              <span>Select Size to Add:</span>
              <a href="product.html?id=${product.id}" class="text-secondary hover:underline font-semibold">Inspect 3D →</a>
            </div>
            <div class="flex items-center space-x-1.5">
              ${product.sizes.map(size => `
                <button onclick="quickAddProduct('${product.id}', '${size}')" class="flex-1 py-1 font-label-sm text-[10px] uppercase bg-surface-container hover:bg-secondary hover:text-on-secondary text-primary transition-colors font-semibold border border-outline-variant/30" type="button">
                  ${size}
                </button>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Metadata -->
        <div class="p-5 flex flex-col space-y-2.5 flex-1 justify-between">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-label-sm uppercase tracking-widest text-secondary font-semibold">${product.category_label}</span>
              <span class="font-body-sm text-on-surface-variant font-light truncate max-w-[130px]">${product.material_badge || product.accent_color}</span>
            </div>
            <a href="product.html?id=${product.id}" class="block">
              <h3 class="font-title-lg text-base text-primary tracking-tight group-hover:text-secondary transition-colors cursor-pointer leading-snug line-clamp-1">
                ${product.name}
              </h3>
            </a>
            <p class="font-body-md text-xs text-on-surface-variant font-light line-clamp-2 leading-relaxed">
              ${product.description}
            </p>
          </div>

          <div class="pt-3 flex items-center justify-between border-t border-outline-variant/30">
            <span class="font-headline-md text-sm sm:text-base text-primary font-semibold">${priceFormatted}</span>
            <div class="flex items-center space-x-2">
              <a href="product.html?id=${product.id}" class="font-label-sm text-[11px] text-secondary uppercase tracking-wider flex items-center space-x-1 font-semibold hover:underline">
                <span>Inspect Piece</span>
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>

      </article>
    `;
  }).join('');

  if (typeof observeNewReveals === 'function') {
    observeNewReveals(container);
  }
}

// =========================================================================
// 5. Shopping Bag Operations
// =========================================================================
function saveCart() {
  localStorage.setItem('junu_cart', JSON.stringify(JUNU_STATE.cart));
  updateCartDrawer();
  if (typeof renderCheckoutPage === 'function') {
    try {
      renderCheckoutPage();
    } catch (e) {
      console.error('Error rendering checkout:', e);
    }
  }
}

function addToCart(productOrId, size = 'S', qty = 1) {
  let product = productOrId;
  if (typeof productOrId === 'string') {
    const catalog = getCatalogProducts();
    product = catalog.find(p => p.id === productOrId);
  }
  if (!product) {
    console.error('addToCart: Product not found for identifier:', productOrId);
    return;
  }

  const validSize = size || 'S';
  const validQty = parseInt(qty, 10) || 1;

  const existing = JUNU_STATE.cart.find(i => i.id === product.id && i.size === validSize);
  if (existing) {
    const curQty = parseInt(existing.qty || existing.quantity, 10) || 1;
    existing.qty = curQty + validQty;
    existing.quantity = existing.qty;
  } else {
    JUNU_STATE.cart.push({
      id: product.id,
      name: product.name,
      price_npr: product.price_npr,
      image: product.image,
      size: validSize,
      qty: validQty,
      quantity: validQty
    });
  }
  saveCart();
  showSalonToast(`Added ${product.short_name || product.name} (${validSize}) to Bag`);
}

function quickAddProduct(id, size = 'S') {
  addToCart(id, size, 1);
  openCartDrawer();
}

function quickAddWithSize(id, size = 'S') {
  addToCart(id, size, 1);
  openCartDrawer();
}

function updateCartQty(id, size, delta) {
  const item = JUNU_STATE.cart.find(i => i.id === id && i.size === size);
  if (!item) return;
  const curQty = parseInt(item.qty || item.quantity, 10) || 1;
  const newQty = curQty + delta;
  if (newQty <= 0) {
    JUNU_STATE.cart = JUNU_STATE.cart.filter(i => !(i.id === id && i.size === size));
  } else {
    item.qty = newQty;
    item.quantity = newQty;
  }
  saveCart();
}

function removeCartItem(id, size) {
  JUNU_STATE.cart = JUNU_STATE.cart.filter(i => !(i.id === id && i.size === size));
  saveCart();
}

// Global Aliases & Utilities for complete interoperability across all pages
if (typeof window !== 'undefined') {
  window.formatMoney = formatMoney;
  window.formatPrice = formatMoney;
  window.addToCart = addToCart;
  window.addToBag = addToCart;
  window.quickAddProduct = quickAddProduct;
  window.quickAddWithSize = quickAddWithSize;
  window.openCartDrawer = openCartDrawer;
  window.closeCartDrawer = closeCartDrawer;
  window.toggleCartDrawer = function() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer && drawer.classList.contains('translate-x-full')) {
      openCartDrawer();
    } else {
      closeCartDrawer();
    }
  };
}
if (typeof globalThis !== 'undefined') {
  globalThis.formatMoney = formatMoney;
  globalThis.formatPrice = formatMoney;
  globalThis.addToCart = addToCart;
  globalThis.addToBag = addToCart;
  globalThis.quickAddProduct = quickAddProduct;
  globalThis.quickAddWithSize = quickAddWithSize;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { JUNU_STATE, formatMoney, addToCart, quickAddProduct, quickAddWithSize };
}

// =========================================================================
// 6. Responsive Sidebars & Slide-out Drawers (Nav, Cart, Wishlist)
// =========================================================================
let savedBodyScrollTop = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  if (e.touches && e.touches.length === 1) {
    touchStartY = e.touches[0].clientY;
  }
}

function handleTouchMove(e) {
  if (!document.documentElement.classList.contains('junu-drawer-open')) return;

  const target = e.target;
  const drawer = target.closest('#mobile-nav-drawer, #cart-drawer, #wishlist-drawer');

  // If touch is outside all drawers (e.g. on overlay, header, background page)
  if (!drawer) {
    if (e.cancelable) {
      e.preventDefault();
    }
    return;
  }

  // Inside the drawer: determine scrollable container
  const scrollElement = target.closest('#cart-items-container, #wishlist-items-container') || drawer;
  const isScrollable = scrollElement.scrollHeight > scrollElement.clientHeight;

  if (!isScrollable) {
    if (e.cancelable) {
      e.preventDefault();
    }
    return;
  }

  // Prevent rubberband scroll-chaining to the document
  if (e.touches && e.touches.length === 1) {
    const currentY = e.touches[0].clientY;
    const isAtTop = scrollElement.scrollTop <= 0;
    const isAtBottom = (scrollElement.scrollTop + scrollElement.clientHeight) >= (scrollElement.scrollHeight - 1);

    if (isAtTop && currentY > touchStartY) {
      // Swiping down while already at the top of drawer
      if (e.cancelable) e.preventDefault();
    } else if (isAtBottom && currentY < touchStartY) {
      // Swiping up while already at the bottom of drawer
      if (e.cancelable) e.preventDefault();
    }
  }
}

function handleWheel(e) {
  if (!document.documentElement.classList.contains('junu-drawer-open')) return;
  const target = e.target;
  const drawer = target.closest('#mobile-nav-drawer, #cart-drawer, #wishlist-drawer');
  if (!drawer) {
    if (e.cancelable) e.preventDefault();
  }
}

function lockBodyScroll() {
  if (document.documentElement.classList.contains('junu-drawer-open')) return;
  savedBodyScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add('junu-drawer-open');
  document.body.classList.add('junu-drawer-open', 'overflow-hidden');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedBodyScrollTop}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('wheel', handleWheel, { passive: false });
}

function unlockBodyScroll() {
  // Only restore if all drawers are closed
  const navDrawer = document.getElementById('mobile-nav-drawer');
  const cartDrawer = document.getElementById('cart-drawer');
  const wishDrawer = document.getElementById('wishlist-drawer');

  const navOpen = navDrawer && !navDrawer.classList.contains('-translate-x-full');
  const cartOpen = cartDrawer && !cartDrawer.classList.contains('translate-x-full');
  const wishOpen = wishDrawer && !wishDrawer.classList.contains('translate-x-full');

  if (navOpen || cartOpen || wishOpen) return;

  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('wheel', handleWheel);

  document.documentElement.classList.remove('junu-drawer-open');
  document.body.classList.remove('junu-drawer-open', 'overflow-hidden');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, savedBodyScrollTop);
}

function openMobileNavDrawer() {
  // Close other drawers silently without unlocking scroll
  const cartDrawer = document.getElementById('cart-drawer');
  if (cartDrawer) {
    cartDrawer.classList.add('translate-x-full');
    cartDrawer.style.visibility = 'hidden';
    cartDrawer.style.pointerEvents = 'none';
  }
  const wishDrawer = document.getElementById('wishlist-drawer');
  if (wishDrawer) {
    wishDrawer.classList.add('translate-x-full');
    wishDrawer.style.visibility = 'hidden';
    wishDrawer.style.pointerEvents = 'none';
  }

  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('drawer-overlay') || document.getElementById('mobile-nav-backdrop');
  if (drawer) {
    drawer.classList.remove('-translate-x-full');
    drawer.style.visibility = 'visible';
    drawer.style.pointerEvents = 'auto';
  }
  if (overlay) {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
  }
  lockBodyScroll();
}

function closeMobileNavDrawer() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('drawer-overlay') || document.getElementById('mobile-nav-backdrop');
  if (drawer) {
    drawer.classList.add('-translate-x-full');
    drawer.style.visibility = 'hidden';
    drawer.style.pointerEvents = 'none';
  }
  if (overlay) {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
  }
  unlockBodyScroll();
}

function openCartDrawer() {
  const navDrawer = document.getElementById('mobile-nav-drawer');
  if (navDrawer) {
    navDrawer.classList.add('-translate-x-full');
    navDrawer.style.visibility = 'hidden';
    navDrawer.style.pointerEvents = 'none';
  }
  const wishDrawer = document.getElementById('wishlist-drawer');
  if (wishDrawer) {
    wishDrawer.classList.add('translate-x-full');
    wishDrawer.style.visibility = 'hidden';
    wishDrawer.style.pointerEvents = 'none';
  }

  updateCartDrawer();
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay') || document.getElementById('cart-drawer-backdrop');
  if (drawer) {
    drawer.classList.remove('translate-x-full');
    drawer.style.visibility = 'visible';
    drawer.style.pointerEvents = 'auto';
  }
  if (overlay) {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
  }
  lockBodyScroll();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('drawer-overlay') || document.getElementById('cart-drawer-backdrop');
  if (drawer) {
    drawer.classList.add('translate-x-full');
    drawer.style.visibility = 'hidden';
    drawer.style.pointerEvents = 'none';
  }
  if (overlay) {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
  }
  unlockBodyScroll();
}

// Backward compatibility aliases
const openCart = openCartDrawer;
const closeCart = closeCartDrawer;

function openWishlistDrawer() {
  const navDrawer = document.getElementById('mobile-nav-drawer');
  if (navDrawer) {
    navDrawer.classList.add('-translate-x-full');
    navDrawer.style.visibility = 'hidden';
    navDrawer.style.pointerEvents = 'none';
  }
  const cartDrawer = document.getElementById('cart-drawer');
  if (cartDrawer) {
    cartDrawer.classList.add('translate-x-full');
    cartDrawer.style.visibility = 'hidden';
    cartDrawer.style.pointerEvents = 'none';
  }

  updateWishlistDrawer();
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) {
    drawer.classList.remove('translate-x-full');
    drawer.style.visibility = 'visible';
    drawer.style.pointerEvents = 'auto';
  }
  if (overlay) {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100', 'pointer-events-auto');
  }
  lockBodyScroll();
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) {
    drawer.classList.add('translate-x-full');
    drawer.style.visibility = 'hidden';
    drawer.style.pointerEvents = 'none';
  }
  if (overlay) {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100', 'pointer-events-auto');
  }
  unlockBodyScroll();
}

function updateWishlistDrawer() {
  const container = document.getElementById('wishlist-items-container');
  const badgeEl = document.getElementById('wishlist-badge');
  const mobileBadge = document.getElementById('mobile-wishlist-badge');
  const totalCountEl = document.getElementById('wishlist-total-count');

  const count = (JUNU_STATE.wishlist || []).length;
  if (badgeEl) {
    badgeEl.textContent = count;
    badgeEl.classList.toggle('hidden', count === 0);
  }
  if (mobileBadge) mobileBadge.textContent = count;
  if (totalCountEl) totalCountEl.textContent = `(${count} ${count === 1 ? 'Piece' : 'Pieces'})`;

  if (!container) return;

  if (count === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-on-surface-variant font-light space-y-3">
        <span class="material-symbols-outlined text-4xl text-secondary">favorite</span>
        <p class="text-base text-primary font-serif">Your Wishlist is Empty</p>
        <p class="text-xs text-outline">Save your favorite limited silhouettes to view and order anytime.</p>
        <a href="collections.html" onclick="closeWishlistDrawer()" class="inline-block mt-3 px-5 py-2.5 bg-primary text-on-primary hover:bg-secondary font-label-sm text-xs uppercase tracking-wider font-semibold transition-all">Explore Collection</a>
      </div>
    `;
    return;
  }

  // Find products in catalog
  const catalog = getCatalogProducts();
  const items = JUNU_STATE.wishlist.map(id => {
    let p = catalog.find(x => x.id === id);
    if (!p) {
      p = {
        id,
        name: 'Numbered Atelier Piece',
        price_npr: 28500,
        image: 'assets/images/scattered_pearl.jpg'
      };
    }
    return p;
  });

  container.innerHTML = items.map(p => `
    <div class="flex items-center space-x-3 sm:space-x-4 bg-surface-container p-3 border border-outline-variant/30">
      <a href="product.html?id=${p.id}" onclick="closeWishlistDrawer()" class="block flex-shrink-0" title="Inspect ${p.name}">
        <img src="${p.image}" alt="${p.name}" class="w-16 h-20 object-cover bg-surface-container-lowest hover:opacity-80 transition-opacity">
      </a>
      <div class="flex-1 min-w-0 space-y-1">
        <a href="product.html?id=${p.id}" onclick="closeWishlistDrawer()" class="hover:text-secondary transition-colors block">
          <p class="text-sm font-semibold text-primary truncate font-serif">${p.name}</p>
        </a>
        <p class="text-xs text-secondary font-semibold font-mono">${formatMoney(p.price_npr)}</p>
        <div class="flex items-center space-x-2 pt-1">
          <button onclick="addToBagFromWishlist('${p.id}')" class="px-2.5 py-1 bg-secondary text-on-secondary hover:bg-primary font-label-sm text-[10px] uppercase tracking-wider font-semibold flex items-center space-x-1 transition-colors">
            <span class="material-symbols-outlined text-[12px]">shopping_bag</span>
            <span>Add to Bag</span>
          </button>
          <button onclick="toggleWishlist('${p.id}')" class="p-1 text-outline hover:text-red-400 transition-colors" title="Remove">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToBagFromWishlist(productId) {
  const catalog = getCatalogProducts();
  const p = catalog.find(x => x.id === productId);
  if (p) {
    addToCart(p.id, (p.sizes && p.sizes[0]) || 'M', 1);
    closeWishlistDrawer();
    openCartDrawer();
    showSalonToast(`"${p.name}" transferred to shopping bag`);
  }
}

function shareWishlistToInstagram() {
  const catalog = getCatalogProducts();
  const names = (JUNU_STATE.wishlist || []).map(id => {
    const p = catalog.find(x => x.id === id);
    return p ? p.name : id;
  });
  const text = encodeURIComponent(`Hello Roselyn! I would like to inquire about these pieces from my JUNU Wishlist:\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
  window.open(`https://ig.me/m/junu.clo?text=${text}`, '_blank');
}

function checkoutViaWhatsApp() {
  const itemsText = JUNU_STATE.cart.map((item, idx) => `${idx + 1}. ${item.name} (${item.size}) x${item.qty} - Rs. ${(item.price_npr * item.qty).toLocaleString()}`).join('\n');
  const totalNpr = JUNU_STATE.cart.reduce((sum, i) => sum + (i.price_npr * i.qty), 0);
  const text = encodeURIComponent(`Hello Roselyn / JUNU Concierge! I would like to place an order for:\n\n${itemsText}\n\nTotal: Rs. ${totalNpr.toLocaleString()}\n\nPlease guide me with payment and delivery details.`);
  window.open(`https://wa.me/9779800000000?text=${text}`, '_blank');
}

function updateCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const badgeEl = document.getElementById('cart-badge');
  const drawerCount = document.getElementById('cart-total-count') || document.getElementById('cart-drawer-count');

  const totalItems = (JUNU_STATE.cart || []).reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
  const totalNpr = (JUNU_STATE.cart || []).reduce((sum, i) => sum + ((i.price_npr || 0) * (i.qty || i.quantity || 1)), 0);

  if (badgeEl) {
    badgeEl.textContent = totalItems;
    badgeEl.classList.toggle('hidden', totalItems === 0);
  }
  if (drawerCount) {
    drawerCount.textContent = `(${totalItems} ${totalItems === 1 ? 'Piece' : 'Pieces'})`;
  }
  if (subtotalEl) {
    subtotalEl.textContent = formatMoney(totalNpr);
  }

  if (!container) return;

  if (!JUNU_STATE.cart || JUNU_STATE.cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-on-surface-variant font-light space-y-3">
        <span class="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
        <p class="text-base text-primary font-serif">Your shopping bag is empty.</p>
        <p class="text-xs text-outline">Discover our limited numbered drops.</p>
        <a href="collections.html" onclick="closeCartDrawer()" class="inline-block mt-3 px-5 py-2.5 bg-primary text-on-primary hover:bg-secondary font-label-sm text-xs uppercase tracking-wider font-semibold transition-all">Explore Collection</a>
      </div>
    `;
    return;
  }

  container.innerHTML = JUNU_STATE.cart.map(item => {
    const qty = item.qty || item.quantity || 1;
    const itemImg = item.image || 'assets/images/junu_official_logo.jpg';
    return `
    <div class="flex items-center space-x-3 sm:space-x-4 bg-surface-container p-3 border border-outline-variant/30">
      <a href="product.html?id=${item.id}" onclick="closeCartDrawer()" class="block flex-shrink-0" title="Inspect ${item.name}">
        <img src="${itemImg}" onerror="this.src='assets/images/junu_official_logo.jpg'" alt="${item.name}" class="w-16 h-20 object-cover bg-surface-container-lowest hover:opacity-80 transition-opacity">
      </a>
      <div class="flex-1 min-w-0 space-y-1">
        <a href="product.html?id=${item.id}" onclick="closeCartDrawer()" class="hover:text-secondary transition-colors block">
          <p class="text-sm font-semibold text-primary truncate font-serif">${item.name}</p>
        </a>
        <p class="text-xs text-secondary font-semibold font-mono">${formatMoney(item.price_npr)} • Size ${item.size || 'M'}</p>
        <div class="flex items-center space-x-2 pt-1">
          <button onclick="updateCartQty('${item.id}', '${item.size}', -1)" class="w-6 h-6 bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-xs text-primary hover:border-secondary transition-colors">-</button>
          <span class="text-xs font-mono font-bold text-primary px-2">${qty}</span>
          <button onclick="updateCartQty('${item.id}', '${item.size}', 1)" class="w-6 h-6 bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-xs text-primary hover:border-secondary transition-colors">+</button>
          <button onclick="removeCartItem('${item.id}', '${item.size}')" class="p-1 ml-auto text-outline hover:text-red-400 transition-colors" title="Remove">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function checkoutViaInstagram() {
  if (JUNU_STATE.cart.length === 0) {
    showSalonToast("Your bag is empty.");
    return;
  }
  const summary = JUNU_STATE.cart.map(i => `${i.name} (Size: ${i.size}, Qty: ${i.qty})`).join(', ');
  const total = formatMoney(JUNU_STATE.cart.reduce((s, i) => s + (i.price_npr * i.qty), 0));
  const msg = `Hi Roselyn, I would like to order: ${summary}. Total: ${total}.`;
  const url = `https://ig.me/m/junu.clo?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// =========================================================================
// 6. Quick View Modal
// =========================================================================
function openQuickView(id) {
  const catalog = getCatalogProducts();
  const product = catalog.find(p => p.id === id);
  if (!product) return;

  JUNU_STATE.activeQvProduct = product;
  JUNU_STATE.selectedQvSize = product.sizes[0] || 'S';

  document.getElementById('qv-img').src = product.image;
  document.getElementById('qv-badge').textContent = product.pill_label || product.badge;
  document.getElementById('qv-stock').textContent = `Only ${product.remaining_stock} Left in Edition`;
  document.getElementById('qv-title').textContent = product.name;
  document.getElementById('qv-price').textContent = formatMoney(product.price_npr);
  document.getElementById('qv-desc').textContent = product.description;
  document.getElementById('qv-mat').textContent = product.material;
  document.getElementById('qv-care').textContent = product.care;

  const sizesContainer = document.getElementById('qv-sizes');
  sizesContainer.innerHTML = product.sizes.map((s, idx) => `
    <button onclick="selectQvSize('${s}', this)" class="px-3.5 py-1.5 text-xs font-semibold uppercase border ${idx === 0 ? 'bg-secondary text-on-secondary border-secondary' : 'bg-surface-container text-primary border-outline-variant/40 hover:border-secondary'}">
      ${s}
    </button>
  `).join('');

  document.getElementById('qv-add-btn').onclick = () => {
    addToCart(product, JUNU_STATE.selectedQvSize, 1);
    closeQuickView();
    openCart();
  };

  const modal = document.getElementById('quickview-modal');
  const box = document.getElementById('quickview-box');
  modal.classList.remove('opacity-0', 'pointer-events-none');
  box.classList.remove('scale-95');
}

function selectQvSize(size, btn) {
  JUNU_STATE.selectedQvSize = size;
  document.querySelectorAll('#qv-sizes button').forEach(b => {
    b.className = "px-3.5 py-1.5 text-xs font-semibold uppercase border bg-surface-container text-primary border-outline-variant/40 hover:border-secondary";
  });
  btn.className = "px-3.5 py-1.5 text-xs font-semibold uppercase border bg-secondary text-on-secondary border-secondary";
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal');
  const box = document.getElementById('quickview-box');
  if (modal && box) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    box.classList.add('scale-95');
  }
}

// =========================================================================
// 7. Wishlist Operations
// =========================================================================
function toggleWishlist(id, btn) {
  const idx = JUNU_STATE.wishlist.indexOf(id);
  if (idx > -1) {
    JUNU_STATE.wishlist.splice(idx, 1);
    showSalonToast("Removed from Wishlist");
  } else {
    JUNU_STATE.wishlist.push(id);
    showSalonToast("Saved to Salon Wishlist");
  }
  localStorage.setItem('junu_wishlist', JSON.stringify(JUNU_STATE.wishlist));
  
  const badge = document.getElementById('wishlist-badge');
  if (badge) badge.textContent = JUNU_STATE.wishlist.length;

  if (btn) {
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.classList.toggle('text-secondary', idx === -1);
      icon.classList.toggle('fill-1', idx === -1);
    }
  }
}

// =========================================================================
// 8. Toast Notifications
// =========================================================================
let toastTimer = null;
function showSalonToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3200);
}

function openStoryModal(storyKey) {
  showSalonToast(`Feature opened: Salon Nocturne Editorial`);
}

function openPackagingModal() {
  const m = document.getElementById('packaging-modal');
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closePackagingModal() {
  const m = document.getElementById('packaging-modal');
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// =========================================================================
// 9. App Initialization
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Sync currency pickers across header and mobile drawer
  document.querySelectorAll('#currency-picker, .mobile-currency-select').forEach(sel => {
    sel.value = JUNU_STATE.currency;
  });

  // Sync wishlist badges
  const wBadge = document.getElementById('wishlist-badge');
  const mWBadge = document.getElementById('mobile-wishlist-badge');
  const count = (JUNU_STATE.wishlist || []).length;
  if (wBadge) {
    wBadge.textContent = count;
    wBadge.classList.toggle('hidden', count === 0);
  }
  if (mWBadge) mWBadge.textContent = count;

  // Render initial components
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof renderHomeCollections === 'function') renderHomeCollections();
  if (typeof updateStaticPrices === 'function') updateStaticPrices();
  if (typeof renderCheckoutPage === 'function') renderCheckoutPage();
  updateCartDrawer();
  updateWishlistDrawer();

  // Initialize Scarcity Drop Countdown Timer
  initDropCountdown();

  // Prevent background touch drag on drawer overlay
  const drawerOverlay = document.getElementById('drawer-overlay');
  if (drawerOverlay) {
    drawerOverlay.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  // Initialize Scroll & Micro-Animations
  initScrollAnimations();
});

// =========================================================================
// 10. Scarcity Drop Live Countdown Timer
// =========================================================================
function initDropCountdown() {
  const timerEls = document.querySelectorAll('.drop-countdown-timer, #drop-countdown-timer');
  if (!timerEls.length) return;

  let targetTime = localStorage.getItem('junu_drop_target');
  if (!targetTime) {
    targetTime = Date.now() + (3 * 24 * 3600 + 14 * 3600 + 22 * 60 + 45) * 1000;
    localStorage.setItem('junu_drop_target', targetTime);
  } else {
    targetTime = parseInt(targetTime, 10);
    if (isNaN(targetTime) || targetTime <= Date.now()) {
      targetTime = Date.now() + (3 * 24 * 3600 + 14 * 3600 + 22 * 60 + 45) * 1000;
      localStorage.setItem('junu_drop_target', targetTime);
    }
  }

  function update() {
    const diff = Math.max(0, targetTime - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `LIVE IN ${pad(days)}D : ${pad(hours)}H : ${pad(minutes)}M : ${pad(seconds)}S`;

    timerEls.forEach(el => {
      el.textContent = timeStr;
    });
  }

  update();
  setInterval(update, 1000);
}

// =========================================================================
// 10. Scroll Animations, Hairline Progress & Micro-Interactions
// =========================================================================
let junuScrollObserver = null;

function initScrollAnimations() {
  // 1. Hairline Scroll Progress Bar
  let progressBar = document.getElementById('junu-scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'junu-scroll-progress';
    document.body.prepend(progressBar);
  }

  // 2. Floating Back to Top Button
  let backToTop = document.getElementById('back-to-top');
  if (!backToTop) {
    backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Return to top of salon');
    backToTop.setAttribute('title', 'Return to Top');
    backToTop.innerHTML = '<span class="material-symbols-outlined text-[20px]">north</span>';
    backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(backToTop);
  }

  const header = document.getElementById('main-header') || document.querySelector('header');

  // Throttled high-performance scroll handler
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Update hairline progress bar
        if (progressBar) {
          progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
        }

        // Header glassmorphic elevation
        if (header) {
          if (scrollTop > 35) {
            header.classList.add('scrolled-header');
          } else {
            header.classList.remove('scrolled-header');
          }
        }

        // Back to top button visibility
        if (backToTop) {
          if (scrollTop > 380) {
            backToTop.classList.add('is-active');
          } else {
            backToTop.classList.remove('is-active');
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // 3. Setup IntersectionObserver for reveal elements
  if ('IntersectionObserver' in window) {
    junuScrollObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    document.querySelectorAll('.junu-reveal, .junu-reveal-left, .junu-reveal-right, .junu-reveal-scale').forEach(el => {
      junuScrollObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not available
    document.querySelectorAll('.junu-reveal, .junu-reveal-left, .junu-reveal-right, .junu-reveal-scale').forEach(el => {
      el.classList.add('is-visible');
    });
  }

  // 4. Counter animations for atelier metrics
  initCounterAnimations();
}

function observeNewReveals(scope) {
  if (!scope || typeof scope.querySelectorAll !== 'function') return;
  const els = scope.querySelectorAll('.junu-reveal, .junu-reveal-left, .junu-reveal-right, .junu-reveal-scale');
  if ('IntersectionObserver' in window && junuScrollObserver) {
    els.forEach(el => junuScrollObserver.observe(el));
  } else {
    els.forEach(el => el.classList.add('is-visible'));
  }
}

function initCounterAnimations() {
  const statNumbers = document.querySelectorAll('[data-counter]');
  if (!statNumbers.length || !('IntersectionObserver' in window)) return;

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetValue = parseInt(el.getAttribute('data-counter'), 10);
        const suffix = el.getAttribute('data-counter-suffix') || '';
        const prefix = el.getAttribute('data-counter-prefix') || '';
        const duration = 1200;
        let startTime = null;

        function animateCount(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const current = Math.floor(progress * targetValue);
          el.textContent = `${prefix}${current}${suffix}`;
          if (progress < 1) {
            window.requestAnimationFrame(animateCount);
          } else {
            el.textContent = `${prefix}${targetValue}${suffix}`;
          }
        }

        window.requestAnimationFrame(animateCount);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.35 });

  statNumbers.forEach(el => counterObserver.observe(el));
}