// Silk & Bows — UI interactions only (no web3)
(function(){
  console.log('Script loaded, checking libraries...');

  // Wait for libraries to load
  const checkLibraries = () => {
    if (typeof solanaWeb3 !== 'undefined' && typeof BigNumber !== 'undefined' && typeof SolanaPay !== 'undefined') {
      console.log('All libraries loaded successfully');
      initializeApp();
    } else {
      console.log('Libraries not ready, retrying...');
      console.log('solanaWeb3:', typeof solanaWeb3);
      console.log('BigNumber:', typeof BigNumber);
      console.log('SolanaPay:', typeof SolanaPay);
      setTimeout(checkLibraries, 100);
    }
  };

  const initializeApp = () => {
    console.log('Initializing app...');

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
    imageModal.style.display = 'flex';
  };
  const closeModal = () => { if(imageModal){ imageModal.style.display = 'none'; } };
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
  $$('.product-card').forEach(card => {
    const img = $('.product-image img', card);
    const qv = $('.quick-view', card);
    const open = () => img && openModal(img.src, img.alt);
    if(img) img.addEventListener('click', open);
    if(qv) qv.addEventListener('click', open);
  });

  // Thumbnail swapping for products with .product-thumbs
  $$('.product-card').forEach(card => {
    const mainImg = $('.product-image img', card);
    const thumbs = $$('.product-thumbs img', card);
    if(mainImg && thumbs.length){
      thumbs.forEach(t => t.addEventListener('click', ()=>{
        const tmp = mainImg.src;
        mainImg.src = t.src;
        t.src = tmp; // simple swap for visual feedback
      }));
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
  const runSearch = () => {
    const q = (searchInput?.value || '').trim().toLowerCase();
    if(!productGrid) return;
    $$('.product-card', productGrid).forEach(card => {
      const name = (card.getAttribute('data-name') || '').toLowerCase();
      card.style.display = name.includes(q) ? '' : 'none';
    });
  };
  if(searchBtn) searchBtn.addEventListener('click', runSearch);
  if(searchInput) searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); runSearch(); }});

  // Add to bag (client-side demo toast)
  const toast = document.createElement('div');
  toast.setAttribute('role','status');
  toast.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:18px;background:#141418;border:1px solid rgba(255,255,255,.08);color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 10px 20px rgba(0,0,0,.35);opacity:0;transition:opacity .2s ease;z-index:50;pointer-events:none';
  document.body.appendChild(toast);
  const showToast = (msg) => {
    toast.textContent = msg; toast.style.opacity = '1';
    clearTimeout(showToast._t); showToast._t = setTimeout(()=> toast.style.opacity = '0', 1400);
  };

  // Click on product to simulate add-to-bag via toast when no add button present
  $$('.product-card').forEach(card => {
    card.addEventListener('dblclick', ()=>{
      const name = card?.getAttribute('data-name') || 'Item';
      showToast(`${name} added to bag`);
    });
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
      imgWrap.style.position = imgWrap.style.position || 'relative';
      imgWrap.appendChild(btn);
      console.log(`Added cart button to: ${name}`);
    });
  };

  // Wait for DOM to be ready, then inject buttons
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCartButtons);
  } else {
    injectCartButtons();
  }

  // On submit, show payment QR and wait for payment
  if(checkoutForm && orderField){
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if(cart.length === 0) return;
      
      const totalAmount = new BigNumber(cart.length * 0.20);
      const orderReference = solanaWeb3.Keypair.generate().publicKey;
      const paymentUrl = SolanaPay.encodeURL({ recipient: MERCHANT_WALLET, amount: totalAmount, reference: orderReference, label, message, memo, splToken: USDC_MINT });
      
      const qr = SolanaPay.createQR(paymentUrl, 256, '#000'); // size, color
      const qrContainer = document.getElementById('qrCodeContainer');
      qrContainer.innerHTML = '';
      qrContainer.appendChild(qr);
      
      document.getElementById('paymentAmount').textContent = totalAmount.toString() + ' USDC';
      document.getElementById('paymentModal').style.display = 'flex';
      
      // Poll for payment confirmation
      let pollAbort = null;
      const startPolling = async () => {
        if (pollAbort) pollAbort.aborted = true;
        pollAbort = new AbortController();

        while (!pollAbort.aborted) {
          try {
            // 1) Find a transaction that includes our unique reference
            const { signature } = await SolanaPay.findReference(connection, orderReference, { finality: 'confirmed' });

            // 2) Validate the transfer details (recipient, amount, token) from that signature
            await SolanaPay.validateTransfer(
              connection,
              signature,
              {
                recipient: MERCHANT_WALLET,
                amount: totalAmount,
                splToken: USDC_MINT,
                reference: orderReference,
              },
              { commitment: 'confirmed' }
            );

            console.log('Payment confirmed!');
            // Update UI
            document.getElementById('paymentTitle').textContent = 'Payment Successful!';
            document.getElementById('paymentText').textContent = 'Your payment has been confirmed. Processing your order...';
            document.getElementById('qrCodeContainer').innerHTML = '';
            // Wait a bit then submit
            setTimeout(() => {
              orderField.value = JSON.stringify(cart, null, 2);
              checkoutForm.submit();
            }, 2000);
            break;
          } catch (e) {
            // No match yet — back off a bit and retry
            await new Promise(r => setTimeout(r, 1200));
          }
        }
      };
      startPolling();
    });
  }

  // Step 4: Encode the Link into a QR Code and Display It
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof SolanaPay !== 'undefined' && typeof SolanaPay.createQR === 'function' && typeof url !== 'undefined') {
      const qrCode = SolanaPay.createQR(url, 256, '#000'); // size, color
      const element = document.getElementById('qr-code-container');
      if (element && qrCode) {
        element.appendChild(qrCode);
      }
    }
  });
  };

  // Start checking for libraries
  checkLibraries();
})();
// if ($usd) $usd.addEventListener('input', renderUsdToSol);
// refreshPrice();
// setInterval(refreshPrice, POLL_MS);
