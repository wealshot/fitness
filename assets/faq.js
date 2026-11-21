/**
 * Pulse Platform - FAQ Accordion Module
 * Renders an interactive FAQ block on Desktop and Mobile based on client.faq data.
 */
(function() {
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
    const faqList = client.faq || [];
    if (!faqList.length) return '';

    const accent = client.accentColor || '#FF6B00';
    const glow = client.accentGlow || 'rgba(255, 107, 0, 0.4)';
    const defaultVisibleCount = 5;
    const hasMore = faqList.length > defaultVisibleCount;

    let itemsHtml = '';
    faqList.forEach((item, index) => {
      const num = String(index + 1).padStart(2, '0');
      const isInitiallyOpen = (index === 0);
      const isHiddenInitially = index >= defaultVisibleCount;
      const hiddenClass = isHiddenInitially ? 'faq-extra-item hidden' : '';

      itemsHtml += `
        <div class="faq-item ${hiddenClass} border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 rounded-2xl transition-all duration-200 overflow-hidden mb-3">
          <button type="button" class="faq-toggle w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer select-none group" data-faq-index="${index}">
            <div class="flex items-center gap-3 min-w-0">
              <span class="font-mono text-xs font-bold px-2 py-0.5 rounded border shrink-0" style="color: ${accent}; background: rgba(255,107,0,0.1); border-color: rgba(255,107,0,0.25);">
                ${num}
              </span>
              <span class="font-display uppercase tracking-wide text-white text-sm sm:text-base group-hover:text-orange-400 transition-colors leading-snug">
                ${item.question}
              </span>
            </div>
            <div class="faq-icon-box w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/30 shrink-0 transition-all font-mono font-bold text-sm">
              <span class="faq-icon transition-transform duration-200">${isInitiallyOpen ? '−' : '+'}</span>
            </div>
          </button>
          <div class="faq-answer px-4 sm:px-5 pb-4 pt-0 text-zinc-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 ${isInitiallyOpen ? '' : 'hidden'}">
            <p class="pt-3">${item.answer}</p>
          </div>
        </div>
      `;
    });

    let moreBtnHtml = '';
    if (hasMore) {
      moreBtnHtml = `
        <div class="text-center mt-4">
          <button type="button" class="faq-more-btn px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-tech text-xs uppercase tracking-wider font-bold transition-all cursor-pointer">
            Показать все вопросы (${faqList.length}) ↓
          </button>
        </div>
      `;
    }

    if (isDesktop) {
      return `
        <section id="faq-section-desktop" class="w-full max-w-5xl mx-auto px-6 py-16 relative z-10">
          <div class="mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-tech font-bold uppercase tracking-widest mb-3">
              <span class="w-2 h-2 rounded-full animate-ping" style="background-color: ${accent};"></span>
              <span style="color: ${accent};">[05. FAQ]</span>
              <span class="text-zinc-400">// ВОПРОС-ОТВЕТ</span>
            </div>
            <h2 class="text-3xl lg:text-4xl font-display font-black text-white uppercase tracking-tight">
              ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ
            </h2>
            <p class="text-zinc-400 text-sm mt-1 max-w-xl">
              Разбираем главные сомнения перед стартом ведения: честно, открыто и по делу.
            </p>
          </div>
          <div class="faq-accordion-container">
            ${itemsHtml}
          </div>
          ${moreBtnHtml}
        </section>
      `;
    } else {
      return `
        <section id="faq-section-mobile" class="w-full px-4 py-8 border-t border-white/10 relative z-10">
          <div class="mb-5">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-tech font-bold uppercase tracking-widest mb-2">
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
          ${moreBtnHtml}
        </section>
      `;
    }
  }

  function bindFaqEvents(container) {
    if (!container) return;

    // Toggle accordion item
    const toggles = container.querySelectorAll('.faq-toggle');
    toggles.forEach(toggle => {
      toggle.onclick = function(e) {
        e.preventDefault();
        const item = toggle.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        const isHidden = answer.classList.contains('hidden');

        // Optional: close other items for accordion behavior
        const allAnswers = container.querySelectorAll('.faq-answer');
        const allIcons = container.querySelectorAll('.faq-icon');
        allAnswers.forEach(a => a.classList.add('hidden'));
        allIcons.forEach(i => i.textContent = '+');

        if (isHidden) {
          answer.classList.remove('hidden');
          icon.textContent = '−';
        }
      };
    });

    // Show more / less button
    const moreBtn = container.querySelector('.faq-more-btn');
    if (moreBtn) {
      moreBtn.onclick = function(e) {
        e.preventDefault();
        const extraItems = container.querySelectorAll('.faq-extra-item');
        const isExpanded = moreBtn.getAttribute('data-expanded') === 'true';

        if (isExpanded) {
          extraItems.forEach(el => el.classList.add('hidden'));
          moreBtn.setAttribute('data-expanded', 'false');
          moreBtn.textContent = `Показать все вопросы (${container.querySelectorAll('.faq-item').length}) ↓`;
        } else {
          extraItems.forEach(el => el.classList.remove('hidden'));
          moreBtn.setAttribute('data-expanded', 'true');
          moreBtn.textContent = 'Свернуть вопросы ↑';
        }
      };
    }
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
        // Insert right before CTA banner or right before footer
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

  // Run on DOMContentLoaded and watch for React updates
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
