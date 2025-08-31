// Silk & Bows — UI interactions only (no web3)
(function(){
  // Lightweight startup: wait for DOM ready then init
  const whenReady = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  const initializeApp = () => {

    // ------- CONFIG -------
    const CLUSTER = 'mainnet-beta'; // 'devnet' for testing
    const RPC = solanaWeb3.clusterApiUrl(CLUSTER);
    const connection = new solanaWeb3.Connection(RPC, 'confirmed');

    const MERCHANT_WALLET = new solanaWeb3.PublicKey('89znXatBP5yXeA3JowynCwXTYqGSB833A9p96kfLcGkZ');
    const USDC_MINTS = {
      'mainnet-beta': new solanaWeb3.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC mainnet
      'devnet': new solanaWeb3.PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),  // USDC test mint
    };
    const USDC_MINT = USDC_MINTS[CLUSTER];

    const amount = new BigNumber(0.20); // 0.20 USDC per product
    const reference = solanaWeb3.Keypair.generate().publicKey; // Unique per transaction
    const label = 'Silk & Bows';
    const message = 'Order #001234 - Thank you for your purchase!';
    const memo = 'ORDER#001234';

    const url = SolanaPay.encodeURL({ recipient: MERCHANT_WALLET, amount, reference, label, message, memo, splToken: USDC_MINT });

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Image modal quick-view
    const imageModal = $('#imageModal');
    const modalImage = $('#modalImage');
    const openModal = (src, alt) => {
      if(!imageModal || !modalImage) return;
      modalImage.src = src; modalImage.alt = alt || '';
      imageModal.style.display = 'flex'; imageModal.setAttribute('aria-hidden','false');
    };
    const closeModal = () => { if(imageModal){ imageModal.style.display = 'none'; imageModal.setAttribute('aria-hidden','true'); modalImage.src=''; } };
    if(imageModal){
      imageModal.addEventListener('click', (e)=>{ if(e.target === imageModal) closeModal(); });
      document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });
    }

  // Image load fade-in
    $$('.product-image img').forEach(img => {
      if(img.complete) img.classList.add('loaded');
      else img.addEventListener('load', ()=> img.classList.add('loaded'));
    });

  // Attach quick-view on product cards
    // Use event delegation for quick view & image clicks
    document.addEventListener('click', (e) => {
      const qv = e.target.closest('.quick-view');
      if (qv) {
        const card = qv.closest('.product-card');
        const img = card && card.querySelector('.product-image img');
        if (img) openModal(img.src, img.alt);
      }
      const imgClick = e.target.closest('.product-image img');
      if (imgClick) {
        const card = imgClick.closest('.product-card');
        if (card) openModal(imgClick.src, imgClick.alt);
      }
    });

  // Thumbnail swapping for products with .product-thumbs
    // Thumbnail click swapping (delegated)
    document.addEventListener('click', (e)=>{
      const thumb = e.target.closest('.product-thumbs img');
      if (!thumb) return;
      const card = thumb.closest('.product-card');
      const mainImg = card && card.querySelector('.product-image img');
      if (mainImg) {
        const tmp = mainImg.src;
        mainImg.src = thumb.src;
        thumb.src = tmp;
      }
    });

  // Filters
  const productGrid = $('#productGrid');
  // Note: No explicit filter buttons in current markup; leave hooks if added later
  const applyFilter = (filter) => {
    if(!productGrid) return;
    $$('.product-card', productGrid).forEach(card => {
      const cat = card.getAttribute('data-category');
      card.style.display = (filter==='all' || filter===cat) ? '' : 'none';
    });
  };

  // Search
    const searchInput = $('#searchInput');
    const searchBtn = $('#searchBtn');
    // debounce helper
    const debounce = (fn, wait=200) => { let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); }; };
    const runSearch = () => {
      const q = (searchInput?.value || '').trim().toLowerCase();
      if(!productGrid) return;
      $$('.product-card', productGrid).forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    };
    if(searchBtn) searchBtn.addEventListener('click', runSearch);
    if(searchInput) searchInput.addEventListener('input', debounce(runSearch, 180));

  // Add to bag (client-side demo toast)
    const toast = document.createElement('div');
    toast.setAttribute('role','status');
    toast.className = 'site-toast';
    toast.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:18px;background:#141418;border:1px solid rgba(255,255,255,.08);color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 20px rgba(0,0,0,.35);opacity:0;transition:opacity .2s ease;z-index:50;pointer-events:none';
    document.body.appendChild(toast);
    const showToast = (msg) => {
      toast.textContent = msg; toast.style.opacity = '1';
      clearTimeout(showToast._t); showToast._t = setTimeout(()=> toast.style.opacity = '0', 1400);
    };

  // Click on product to simulate add-to-bag via toast when no add button present
    // double-click to add to bag (accessible fallback)
    document.addEventListener('dblclick', (e)=>{
      const card = e.target.closest('.product-card');
      if (!card) return;
      const name = card.getAttribute('data-name') || 'Item';
      showToast(`${name} added to bag`);
    });

  // --- Simple Cart Implementation ---
  const cart = [];
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const orderField = document.getElementById('order-data');
  const checkoutForm = document.getElementById('checkout-form');

  function renderCart(){
    if(!cartItemsEl || !cartTotalEl) return;
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-name">${item.product}</div>
        <div class="cart-item-price">${item.price.toFixed(2)} USDC</div>
        <button class="cart-remove" data-index="${idx}">Remove</button>
      `;
      cartItemsEl.appendChild(row);
    });
    cartTotalEl.textContent = total.toFixed(2) + ' USDC';
    // wire remove buttons
    cartItemsEl.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', (e)=>{
        const i = parseInt(e.currentTarget.getAttribute('data-index'));
        if(!Number.isNaN(i)){
          cart.splice(i,1);
          renderCart();
        }
      });
    });
  }

  function addToCart(product, price){
    cart.push({ product, price });
    renderCart();
    showToast(`${product} added to cart`);
  }

  // Inject an add-to-cart button with cart icon into each product card
  const injectCartButtons = () => {
    const cartIconSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14h9.94c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.58 5H6.21l-.94-2H2v2h1.61l3.6 7.59L5.25 13A2 2 0 0 0 7.16 14z"/></svg>';
    console.log('Injecting cart buttons...');
    const productCards = $$('.product-card');
    console.log('Found product cards:', productCards.length);

  productCards.forEach((card, index) => {
      console.log(`Processing card ${index}:`, card.getAttribute('data-name'));
      const btn = document.createElement('button');
      btn.className = 'add-to-cart';
      btn.type = 'button';
      btn.innerHTML = '🛒'; // Simple cart emoji for testing
      btn.style.cssText = 'position: absolute; right: 12px; bottom: 12px; background: #ff4444; color: white; border: 2px solid white; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
      btn.title = 'Add to Cart';
      const name = card.getAttribute('data-name') || 'Item';
      // Price in USDC
      let price = 0.20;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Cart button clicked for:', name);
        alert(`Added ${name} to cart for ${price} USDC!`);
        addToCart(name, price);
      });
        const imgWrap = $('.product-image', card) || card;
        if (imgWrap) {
          imgWrap.style.position = imgWrap.style.position || 'relative';
          imgWrap.appendChild(btn);
        }
      console.log(`Added cart button to: ${name}`);
    });
  };

  // Wait for DOM to be ready, then inject buttons
  whenReady(injectCartButtons);

  // On submit, show payment QR and wait for payment
  if(checkoutForm && orderField){
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if(cart.length === 0) return;
      
      const totalAmount = new BigNumber(cart.length * 0.20);
      const orderReference = solanaWeb3.Keypair.generate().publicKey;
      const paymentUrl = SolanaPay.encodeURL({ recipient: MERCHANT_WALLET, amount: totalAmount, reference: orderReference, label, message, memo, splToken: USDC_MINT });
      
      // Render QR with dynamic loader fallback
      const qrContainer = document.getElementById('qrCodeContainer');
      qrContainer.innerHTML = '';
      const renderQR = async (el, url) => {
        if (typeof SolanaPay !== 'undefined' && SolanaPay.createQR) {
          try {
            const q = SolanaPay.createQR(url, 256, '#000');
            el.appendChild(q);
            return;
          } catch (e) { /* try fallback */ }
        }
        // Fallback: ensure qrcodejs
        if (typeof QRCode === 'undefined') {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.async = true; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
          }).catch(()=>{});
        }
        try { new QRCode(el, { text: url, width: 256, height: 256 }); } catch(e){ el.innerHTML = `<input readonly value="${url}" style="width:100%;padding:8px;font-family:monospace;"/>`; }
      };
      await renderQR(qrContainer, paymentUrl);
      
      document.getElementById('paymentAmount').textContent = totalAmount.toString() + ' USDC';
      document.getElementById('paymentModal').style.display = 'flex';
      
      // Poll for payment confirmation
      let pollAbort = null;
      const startPolling = async () => {
        if (pollAbort) pollAbort.aborted = true;
        pollAbort = new AbortController();
        while (!pollAbort.aborted) {
          try {
            const { signature } = await SolanaPay.findReference(connection, orderReference, { finality: 'confirmed' });
            await SolanaPay.validateTransfer(connection, signature, { recipient: MERCHANT_WALLET, amount: totalAmount, splToken: USDC_MINT, reference: orderReference }, { commitment: 'confirmed' });
            document.getElementById('paymentTitle').textContent = 'Payment Successful!';
            document.getElementById('paymentText').textContent = 'Your payment has been confirmed. Processing your order...';
            document.getElementById('qrCodeContainer').innerHTML = '';
            setTimeout(() => { orderField.value = JSON.stringify(cart, null, 2); checkoutForm.submit(); }, 1000);
            break;
          } catch (e) {
            await new Promise(r => setTimeout(r, 1200));
          }
        }
      };
      startPolling();
    });
  }

  // Step 4: Encode the Link into a QR Code and Display It
    whenReady(()=>{
      if (typeof SolanaPay !== 'undefined' && typeof SolanaPay.createQR === 'function' && typeof url !== 'undefined') {
        const qrCode = SolanaPay.createQR(url, 256, '#000');
        const element = document.getElementById('qr-code-container');
        if (element && qrCode) element.appendChild(qrCode);
      }
    });
  };

  // Start app when DOM is ready (external libs are loaded with defer)
  whenReady(initializeApp);
})();
// if ($usd) $usd.addEventListener('input', renderUsdToSol);
// refreshPrice();
// setInterval(refreshPrice, POLL_MS);
