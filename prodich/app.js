/**
 * PRODICH // KINETIC TITAN — JS ENGINE
 * Author: Arthur Silkin Coaching Ecosystem
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. SCROLL REVEAL ANIMATIONS
     ========================================================================== */
  document.body.classList.add('js-animate');
  const fadeElements = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));
  } else {
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  /* ==========================================================================
     2. BEFORE / AFTER COMPARISON SLIDER
     ========================================================================== */
  const compSlider = document.getElementById('comparisonSlider');
  const compOverlay = document.getElementById('compOverlayAfter');
  const compHandle = document.getElementById('compHandle');

  if (compSlider && compOverlay && compHandle) {
    let isDragging = false;

    const setPosition = (clientX) => {
      const rect = compSlider.getBoundingClientRect();
      let x = clientX - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      const percent = (x / rect.width) * 100;
      compOverlay.style.width = `${percent}%`;
      compHandle.style.left = `${percent}%`;
    };

    // Mouse events
    compSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      setPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch events
    compSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches[0]) return;
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /* ==========================================================================
     3. CASE SWITCHER
     ========================================================================== */
  const caseData = {
    '1': {
      title: 'Михаил, 34 года',
      imgBefore: './assets/images/case1_before.jpg',
      imgAfter: './assets/images/case1_after.jpg',
      tags: ['–16 кг жира', '16 недель', 'Офисная работа'],
      m1: '–16 кг',
      m2: '–14 см',
      m3: '16 недель',
      m4: '3 раза/нед',
      quote: '«До Артура пробовал разные диеты — постоянно срывался через месяц. С Артуром впервые понял, что можно худеть, есть нормальную еду и не чувствовать вечного упадка сил. Результат говорит сам за себя!»'
    },
    '2': {
      title: 'Степан, 28 лет',
      imgBefore: './assets/images/case2_before.jpg',
      imgAfter: './assets/images/case2_after.jpg',
      tags: ['–18 кг', '16 недель', 'Рекомпозиция'],
      m1: '–18 кг',
      m2: '–16 см',
      m3: '16 недель',
      m4: '3 раза/нед',
      quote: '«Сбросил 18 кг без голодовок, тренировался дома и в зале. Главное — Артур всегда поддерживал, вовремя корректировал меню и объяснял каждую мелочь!»'
    }
  };

  const caseTabs = document.querySelectorAll('.case-tab-btn');
  const compImgBefore = document.getElementById('compImgBefore');
  const compImgAfter = document.getElementById('compImgAfter');
  const caseTitle = document.getElementById('caseTitle');
  const caseTags = document.getElementById('caseTags');
  const caseM1 = document.getElementById('caseMetric1');
  const caseM2 = document.getElementById('caseMetric2');
  const caseM3 = document.getElementById('caseMetric3');
  const caseM4 = document.getElementById('caseMetric4');
  const caseQuote = document.getElementById('caseQuote');

  caseTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      caseTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const caseId = tab.getAttribute('data-case');
      const item = caseData[caseId];
      if (!item) return;

      if (compImgBefore) compImgBefore.src = item.imgBefore;
      if (compImgAfter) compImgAfter.src = item.imgAfter;
      if (caseTitle) caseTitle.textContent = item.title;
      if (caseM1) caseM1.textContent = item.m1;
      if (caseM2) caseM2.textContent = item.m2;
      if (caseM3) caseM3.textContent = item.m3;
      if (caseM4) caseM4.textContent = item.m4;
      if (caseQuote) caseQuote.textContent = item.quote;

      if (caseTags) {
        caseTags.innerHTML = item.tags.map((tag, idx) => 
          `<span class="case-tag ${idx === 0 ? 'highlight' : ''}">${tag}</span>`
        ).join('');
      }

      // Reset slider to center
      if (compOverlay && compHandle) {
        compOverlay.style.width = '50%';
        compHandle.style.left = '50%';
      }
    });
  });

  /* ==========================================================================
     4. KBJU & METABOLISM CALCULATOR
     ========================================================================== */
  let currentGender = 'male';
  let currentGoal = 'deficit';
  let currentActivity = 1.375;

  const rangeWeight = document.getElementById('rangeWeight');
  const rangeHeight = document.getElementById('rangeHeight');
  const rangeAge = document.getElementById('rangeAge');

  const dispWeight = document.getElementById('dispWeight');
  const dispHeight = document.getElementById('dispHeight');
  const dispAge = document.getElementById('dispAge');

  const resCalories = document.getElementById('resCalories');
  const resProtein = document.getElementById('resProtein');
  const resFats = document.getElementById('resFats');
  const resCarbs = document.getElementById('resCarbs');
  const resWater = document.getElementById('resWater');

  const calculateKBJU = () => {
    const weight = parseFloat(rangeWeight ? rangeWeight.value : 82);
    const height = parseFloat(rangeHeight ? rangeHeight.value : 180);
    const age = parseFloat(rangeAge ? rangeAge.value : 30);

    if (dispWeight) dispWeight.textContent = `${weight} кг`;
    if (dispHeight) dispHeight.textContent = `${height} см`;
    if (dispAge) dispAge.textContent = `${age} лет`;

    // Mifflin - St Jeor Equation
    let bmr = 0;
    if (currentGender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * currentActivity;

    let targetCalories = tdee;
    if (currentGoal === 'deficit') {
      targetCalories = tdee * 0.80; // 20% deficit
    } else if (currentGoal === 'surplus') {
      targetCalories = tdee * 1.15; // 15% surplus
    }

    targetCalories = Math.round(targetCalories);

    // Macro distributions
    // Protein: 2.0g/kg (male), 1.8g/kg (female)
    const proteinFactor = currentGender === 'male' ? 2.0 : 1.8;
    const proteinGrams = Math.round(weight * proteinFactor);
    const proteinCals = proteinGrams * 4;

    // Fat: 0.9g/kg
    const fatGrams = Math.round(weight * 0.9);
    const fatCals = fatGrams * 9;

    // Carbs: Remaining calories / 4
    let carbsCals = targetCalories - (proteinCals + fatCals);
    if (carbsCals < 50) carbsCals = 50;
    const carbsGrams = Math.round(carbsCals / 4);

    // Water: 33ml per kg
    const waterLiters = (weight * 0.033).toFixed(1);

    if (resCalories) resCalories.textContent = targetCalories.toLocaleString('ru-RU');
    if (resProtein) resProtein.textContent = `${proteinGrams} г`;
    if (resFats) resFats.textContent = `${fatGrams} г`;
    if (resCarbs) resCarbs.textContent = `${carbsGrams} г`;
    if (resWater) resWater.textContent = `${waterLiters} литра`;

    return {
      cals: targetCalories,
      p: proteinGrams,
      f: fatGrams,
      c: carbsGrams,
      w: waterLiters
    };
  };

  // Gender toggle
  const genderBtns = document.querySelectorAll('#genderToggle .seg-btn');
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      genderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGender = btn.getAttribute('data-val') || 'male';
      calculateKBJU();
    });
  });

  // Goal toggle
  const goalBtns = document.querySelectorAll('#goalToggle .seg-btn');
  goalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      goalBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGoal = btn.getAttribute('data-val') || 'deficit';
      calculateKBJU();
    });
  });

  // Activity toggle
  const actBtns = document.querySelectorAll('#activityToggle .seg-btn');
  actBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      actBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentActivity = parseFloat(btn.getAttribute('data-val') || '1.375');
      calculateKBJU();
    });
  });

  // Range inputs
  [rangeWeight, rangeHeight, rangeAge].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', calculateKBJU);
    }
  });

  // Initial calculation
  calculateKBJU();

  // Button: Use calculation in questionnaire
  const btnUseCalories = document.getElementById('btnUseCalories');
  const userComment = document.getElementById('userComment');
  if (btnUseCalories && userComment) {
    btnUseCalories.addEventListener('click', () => {
      const stats = calculateKBJU();
      const goalText = currentGoal === 'deficit' ? 'Снижение жира' : (currentGoal === 'surplus' ? 'Набор массы' : 'Поддержание формы');
      userComment.value = `Параметры из калькулятора:\nЦель: ${goalText}\nКалории: ${stats.cals} ккал (Б: ${stats.p}г, Ж: ${stats.f}г, У: ${stats.c}г, Вода: ${stats.w}л)`;
      
      const anketaSec = document.getElementById('anketa');
      if (anketaSec) {
        anketaSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ==========================================================================
     5. QUESTIONNAIRE / APPLICATION FORM (TELEGRAM DEEP LINK GENERATOR)
     ========================================================================== */
  const anketaForm = document.getElementById('anketaForm');
  if (anketaForm) {
    anketaForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (document.getElementById('userName')?.value || '').trim();
      const tg = (document.getElementById('userTelegram')?.value || '').trim();
      const goal = (document.getElementById('userGoal')?.value || '').trim();
      const exp = (document.getElementById('userExp')?.value || '').trim();
      const comment = (document.getElementById('userComment')?.value || '').trim();

      const messageParts = [
        `🔥 Заявка на разбор формы (fitprod.vercel.app/prodich):`,
        `👤 Имя: ${name}`,
        `💬 Telegram: ${tg}`,
        `🎯 Цель: ${goal}`,
        `🏋️ Опыт тренировок: ${exp}`
      ];

      if (comment) {
        messageParts.push(`📝 Дополнительно: ${comment}`);
      }

      const encodedMessage = encodeURIComponent(messageParts.join('\n'));
      const telegramUrl = `https://t.me/silkinbeyond?text=${encodedMessage}`;

      window.open(telegramUrl, '_blank');
    });
  }

});
