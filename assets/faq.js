/**
 * Pulse Platform - FAQ Accordion Module (v4 - Perfect Spacing & Distinct Card Gap)
 */
(function() {
  // Inject dedicated FAQ styles
  if (!document.getElementById('faq-accordion-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'faq-accordion-styles';
    styleEl.textContent = `
      #faq-section-desktop {
        padding-top: 40px !important;
        padding-bottom: 70px !important;
      }
      #faq-section-mobile {
        padding-top: 30px !important;
        padding-bottom: 40px !important;
      }
      .faq-accordion-container {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important;
      }
      .faq-card {
        margin-bottom: 0 !important;
        transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                    background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .faq-card.is-open {
        border-color: rgba(255, 107, 0, 0.5) !important;
        box-shadow: 0 0 35px rgba(255, 107, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        background: linear-gradient(180deg, rgba(255, 107, 0, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
      }
      .faq-card.is-open .faq-badge-icon {
        border-color: rgba(255, 107, 0, 0.6) !important;
        background-color: rgba(255, 107, 0, 0.22) !important;
        color: #FF6B00 !important;
        box-shadow: 0 0 20px rgba(255, 107, 0, 0.4) !important;
      }
      .faq-card.is-open .faq-svg-plus {
        transform: rotate(45deg);
      }
      .faq-anim-grid {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.38s cubic-bezier(0.16, 1, 0.3, 1), 
                    opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0;
      }
      .faq-anim-grid.is-open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .faq-anim-inner {
        overflow: hidden;
      }
      .faq-svg-plus {
        transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease;
      }
    `;
    document.head.appendChild(styleEl);
  } else {
    // Update existing style element if already injected
    const styleEl = document.getElementById('faq-accordion-styles');
    styleEl.textContent = `
      #faq-section-desktop {
        padding-top: 40px !important;
        padding-bottom: 70px !important;
      }
      #faq-section-mobile {
        padding-top: 30px !important;
        padding-bottom: 40px !important;
      }
      .faq-accordion-container {
        display: flex !important;
        flex-direction: column !important;
        gap: 16px !important;
      }
      .faq-card {
        margin-bottom: 0 !important;
        transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                    background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .faq-card.is-open {
        border-color: rgba(255, 107, 0, 0.5) !important;
        box-shadow: 0 0 35px rgba(255, 107, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        background: linear-gradient(180deg, rgba(255, 107, 0, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
      }
      .faq-card.is-open .faq-badge-icon {
        border-color: rgba(255, 107, 0, 0.6) !important;
        background-color: rgba(255, 107, 0, 0.22) !important;
        color: #FF6B00 !important;
        box-shadow: 0 0 20px rgba(255, 107, 0, 0.4) !important;
      }
      .faq-card.is-open .faq-svg-plus {
        transform: rotate(45deg);
      }
      .faq-anim-grid {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.38s cubic-bezier(0.16, 1, 0.3, 1), 
                    opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0;
      }
      .faq-anim-grid.is-open {
        grid-template-rows: 1fr;
        opacity: 1;
      }
      .faq-anim-inner {
        overflow: hidden;
      }
      .faq-svg-plus {
        transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), color 0.25s ease;
      }
    `;
  }

  function getClientSlug() {
    if (typeof window === 'undefined') return 'bernetskiy';
    const params = new URLSearchParams(window.location.search);
    const clientParam = params.get('client');
    if (clientParam && clientParam.trim()) return clientParam.trim().toLowerCase();
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && pathParts[0] !== 'admin') {
      return pathParts[0].toLowerCase();
    }
    return 'bernetskiy';
  }

  function getClientData() {
    const slug = getClientSlug();
    if (window.CLIENTS && window.CLIENTS[slug]) {
      return window.CLIENTS[slug];
    }
    return null;
  }

  function buildFaqHtml(client, isDesktop) {
    const fullList = client.faq || [];
    // Strictly 5 questions as requested
    const faqList = fullList.slice(0, 5);
    if (!faqList.length) return '';

    const accent = client.accentColor || '#FF6B00';

    let itemsHtml = '';
    faqList.forEach((item, index) => {
      const num = String(index + 1).padStart(2, '0');
      const isInitiallyOpen = (index === 0);

      itemsHtml += `
        <div class="faq-card ${isInitiallyOpen ? 'is-open' : ''} border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 rounded-2xl overflow-hidden">
          <button type="button" class="faq-toggle w-full p-4 sm:p-5 lg:p-6 flex items-center justify-between gap-4 text-left cursor-pointer select-none group" data-faq-index="${index}">
            <div class="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <span class="font-mono text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border shrink-0" 
                    style="color: ${accent}; background: rgba(255,107,0,0.12); border-color: rgba(255,107,0,0.3);">
                ${num}
              </span>
              <span class="font-display uppercase tracking-wide text-white text-sm sm:text-base lg:text-lg group-hover:text-orange-400 transition-colors leading-snug">
                ${item.question}
              </span>
            </div>
            
            <!-- Prominent Large Plus/Minus Button Badge -->
            <div class="faq-badge-icon w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-white/30 shrink-0 transition-all duration-300 shadow-sm">
              <svg class="faq-svg-plus w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          </button>

          <!-- Smooth Animated Answer Container -->
          <div class="faq-anim-grid ${isInitiallyOpen ? 'is-open' : ''}">
            <div class="faq-anim-inner">
              <div class="px-4 sm:px-5 lg:px-6 pb-5 pt-1 text-zinc-300 text-xs sm:text-sm lg:text-base leading-relaxed border-t border-white/5">
                <p class="pt-3 font-normal opacity-95">${item.answer}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    if (isDesktop) {
      return `
        <section id="faq-section-desktop" class="w-full max-w-5xl mx-auto px-6 relative z-10">
          <div class="mb-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-tech font-bold uppercase tracking-widest mb-3.5">
              <span class="w-2 h-2 rounded-full animate-ping" style="background-color: ${accent};"></span>
              <span style="color: ${accent};">[05. FAQ]</span>
              <span class="text-zinc-400">// ВОПРОС-ОТВЕТ</span>
            </div>
            <h2 class="text-3xl lg:text-4xl font-display font-black text-white uppercase tracking-tight">
              ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ
            </h2>
            <p class="text-zinc-400 text-sm mt-1.5 max-w-xl">
              Разбираем главные сомнения перед стартом ведения: честно, открыто и по делу.
            </p>
          </div>
          <div class="faq-accordion-container">
            ${itemsHtml}
          </div>
        </section>
      `;
    } else {
      return `
        <section id="faq-section-mobile" class="w-full px-4 border-t border-white/10 relative z-10">
          <div class="mb-6">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-tech font-bold uppercase tracking-widest mb-2.5">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${accent};"></span>
              <span style="color: ${accent};">[05. FAQ]</span>
              <span class="text-zinc-400">// ВОПРОСЫ</span>
            </div>
            <h2 class="text-2xl font-display font-black text-white uppercase tracking-tight">
              ОТВЕТЫ НА ВОПРОСЫ
            </h2>
            <p class="text-zinc-400 text-xs mt-1">
              Всё, что важно знать перед началом работы
            </p>
          </div>
          <div class="faq-accordion-container">
            ${itemsHtml}
          </div>
        </section>
      `;
    }
  }

  function bindFaqEvents(container) {
    if (!container) return;

    const toggles = container.querySelectorAll('.faq-toggle');
    toggles.forEach(toggle => {
      toggle.onclick = function(e) {
        e.preventDefault();
        const card = toggle.closest('.faq-card');
        const grid = card.querySelector('.faq-anim-grid');
        const isOpen = grid.classList.contains('is-open');

        // Close other open cards for an accordion feel
        const allCards = container.querySelectorAll('.faq-card');
        const allGrids = container.querySelectorAll('.faq-anim-grid');
        allCards.forEach(c => c.classList.remove('is-open'));
        allGrids.forEach(g => g.classList.remove('is-open'));

        if (!isOpen) {
          card.classList.add('is-open');
          grid.classList.add('is-open');
        }
      };
    });
  }

  function mountFaq() {
    const client = getClientData();
    if (!client || !client.faq || !client.faq.length) return;

    // 1. Mount Desktop FAQ
    const desktopContainer = document.querySelector('#root .hidden.lg\\:block');
    if (desktopContainer) {
      const desktopFooter = desktopContainer.querySelector('footer');
      if (desktopFooter && !document.getElementById('faq-section-desktop')) {
        const desktopWrapper = document.createElement('div');
        desktopWrapper.innerHTML = buildFaqHtml(client, true);
        const faqSection = desktopWrapper.firstElementChild;
        const ctaBlock = desktopContainer.querySelector('section:last-of-type') || desktopFooter;
        if (ctaBlock && ctaBlock !== desktopFooter) {
          ctaBlock.parentNode.insertBefore(faqSection, ctaBlock);
        } else {
          desktopFooter.parentNode.insertBefore(faqSection, desktopFooter);
        }
        bindFaqEvents(faqSection);
      }
    }

    // 2. Mount Mobile FAQ
    const mobileContainer = document.querySelector('#root .lg\\:hidden main');
    if (mobileContainer) {
      const mobileFooter = mobileContainer.querySelector('footer');
      if (mobileFooter && !document.getElementById('faq-section-mobile')) {
        const mobileWrapper = document.createElement('div');
        mobileWrapper.innerHTML = buildFaqHtml(client, false);
        const faqSection = mobileWrapper.firstElementChild;
        mobileFooter.parentNode.insertBefore(faqSection, mobileFooter);
        bindFaqEvents(faqSection);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountFaq();
      startObserver();
    });
  } else {
    mountFaq();
    startObserver();
  }

  function startObserver() {
    const target = document.getElementById('root') || document.body;
    let timeoutId = null;
    const observer = new MutationObserver(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        mountFaq();
      }, 100);
    });
    observer.observe(target, { childList: true, subtree: true });
  }
})();
