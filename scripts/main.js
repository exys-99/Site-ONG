// main.js - menu hambúrguer, submenu acessível e utilitários

document.addEventListener('DOMContentLoaded', function () {
  // Atualiza altura do header como variável CSS para que o main possa ser empurrado
  function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (!header) return;
    // calcula altura atual do header
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }
  // Chama inicialmente e ao redimensionar
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);

  // NAV TOGGLE
  const navToggles = document.querySelectorAll('.nav-toggle');
  navToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const header = btn.closest('header');
      const navId = btn.getAttribute('aria-controls');
      const nav = document.getElementById(navId);
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (header) header.classList.toggle('nav-open');
      if (nav) nav.setAttribute('data-open', String(!expanded));
      
      if (typeof updateHeaderHeight === 'function') updateHeaderHeight();
    });
  });

  // SUBMENU TOGGLING (acessível)
  const submenuParents = document.querySelectorAll('.has-submenu');
  submenuParents.forEach(item => {
    
    item.setAttribute('tabindex', '-1');
    const anchor = item.querySelector('a');
    const submenu = item.querySelector('.submenu');
    // Em dispositivos móveis, clique no link pai deve abrir/fechar o submenu
    const isMobile = () => window.matchMedia('(max-width: 959px)').matches;
    if (anchor) {
      anchor.addEventListener('click', (e) => {
        if (isMobile()) {
          e.preventDefault();
          const expanded = item.getAttribute('aria-expanded') === 'true';
          item.setAttribute('aria-expanded', String(!expanded));
        }
        // Em desktop, deixamos o link navegar normalmente (hover abre submenu)
      });
    }

    // Também abrimos/fechamos ao clicar no próprio item (útil para o touhc)
    item.addEventListener('click', (e) => {
      // Se o link não for um nav real (href='#'), previne navegação
      if (anchor && anchor.getAttribute('href') === '#') {
        e.preventDefault();
      }
      const expanded = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', String(!expanded));
    });

    // Fecha submenu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) {
        item.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close nav on 'ESC'
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('header.nav-open').forEach(h => h.classList.remove('nav-open'));
      document.querySelectorAll('.nav-toggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
  });


  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal-open');
      const modal = document.getElementById(id);
      if (modal) modal.setAttribute('aria-hidden', 'false');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal-close');
      const modal = document.getElementById(id);
      if (modal) modal.setAttribute('aria-hidden', 'true');
    });
  });

  /* ================================
     Acessibilidade: Tema Escuro e de Alto Contraste
     - Insere botões acessíveis no header .header-actions;
     - Persiste escolha em localStorage;
     - Permite atalhos: dos modos de tema do site
     ================================ */
  (function setupThemes() {
    const ROOT = document.documentElement;
    const storageKey = 'site-theme'; // 'light' | 'dark' | 'high-contrast'

    function applyTheme(name) {
      // remove previous theme classes
      ROOT.classList.remove('theme-dark', 'theme-high-contrast');
      if (name === 'dark') ROOT.classList.add('theme-dark');
      if (name === 'high-contrast') ROOT.classList.add('theme-high-contrast');
     
      try { localStorage.setItem(storageKey, name); } catch (e) { /* noop */ }
    
      const darkBtn = document.getElementById('btn-theme-dark');
      const contrastBtn = document.getElementById('btn-theme-contrast');
      if (darkBtn) darkBtn.setAttribute('aria-pressed', String(name === 'dark'));
      if (contrastBtn) contrastBtn.setAttribute('aria-pressed', String(name === 'high-contrast'));
    }

    function readPreferred() {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return stored;
      } catch (e) { /* noop */ }
    
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
      return 'light';
    }

    function createToggleButtons() {
      const headerActions = document.querySelector('.header-actions');
      if (!headerActions) return;

      // container wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'theme-toggle-group';
      wrapper.style.display = 'flex';
      wrapper.style.gap = '0.5rem';

      const btnDark = document.createElement('button');
      btnDark.id = 'btn-theme-dark';
      btnDark.className = 'theme-toggle-btn';
      btnDark.type = 'button';
      btnDark.setAttribute('aria-pressed', 'false');
      btnDark.setAttribute('aria-label', 'Ativar modo escuro (Alt+Shift+D)');
      btnDark.textContent = 'Modo Escuro';
      btnDark.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));

      const btnContrast = document.createElement('button');
      btnContrast.id = 'btn-theme-contrast';
      btnContrast.className = 'theme-toggle-btn';
      btnContrast.type = 'button';
      btnContrast.setAttribute('aria-pressed', 'false');
      btnContrast.setAttribute('aria-label', 'Ativar alto contraste (Alt+Shift+H)');
      btnContrast.textContent = 'Alto Contraste';
      btnContrast.addEventListener('click', () => applyTheme(currentTheme() === 'high-contrast' ? 'light' : 'high-contrast'));

      wrapper.appendChild(btnDark);
      wrapper.appendChild(btnContrast);

  
      headerActions.insertAdjacentElement('beforeend', wrapper);
    }

    function currentTheme() {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) return stored;
      } catch (e) { /* noop */ }
      if (ROOT.classList.contains('theme-dark')) return 'dark';
      if (ROOT.classList.contains('theme-high-contrast')) return 'high-contrast';
      return 'light';
    }

    // initialize
    createToggleButtons();
    applyTheme(readPreferred());

    // keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!e.altKey || !e.shiftKey) return;
      // Alt+Shift+D -> dark
      if (e.key.toLowerCase() === 'd') { e.preventDefault(); applyTheme('dark'); }
      // Alt+Shift+H -> high contrast
      if (e.key.toLowerCase() === 'h') { e.preventDefault(); applyTheme('high-contrast'); }
      // Alt+Shift+L -> light
      if (e.key.toLowerCase() === 'l') { e.preventDefault(); applyTheme('light'); }
    });
  })();

  /* ================================ */
  (function setupTemplateSystem() {
    function escapeHtml(str) {
      if (str == null) return '';
      return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '`': '&#96;',
          '=': '&#61;',
          '/': '&#47;'
        })[s];
      });
    }

    function resolvePath(obj, path) {
      if (!path) return undefined;
      const parts = path.split('.');
      let cur = obj;
      for (let i = 0; i < parts.length; i++) {
        if (cur == null) return undefined;
        cur = cur[parts[i]];
      }
      return cur;
    }

    function render(template, data) {
      
      template = template.replace(/{{#each\s+([\w$.@]+)}}([\s\S]*?){{\/each}}/g, function (_, path, inner) {
        const arr = resolvePath(data, path) || [];
        if (!Array.isArray(arr)) return '';
        return arr.map((it, idx) => {
          const ctx = Object.assign({}, data, { this: it, '@index': idx });
          return render(inner, ctx);
        }).join('');
      });

      // If blocks
      template = template.replace(/{{#if\s+([\w$.@]+)}}([\s\S]*?){{\/if}}/g, function (_, path, inner) {
        const val = resolvePath(data, path);
        return val ? render(inner, data) : '';
      });

      // Unescaped
      template = template.replace(/{{{\s*([\w$.@]+)\s*}}}/g, function (_, key) {
        const v = resolvePath(data, key);
        return v == null ? '' : String(v);
      });

      // Escaped
      template = template.replace(/{{\s*([\w$.@]+)\s*}}/g, function (_, key) {
        const v = resolvePath(data, key);
        return escapeHtml(v);
      });

      return template;
    }

    function compile(tpl) {
      return function (data) { return render(tpl, data); };
    }

    function renderInto(el, tplOrSelector, data) {
      let tpl = tplOrSelector;
      if (typeof tpl === 'string' && tpl.trim().charAt(0) === '#') {
        const node = document.querySelector(tpl);
        if (node) tpl = node.innerHTML;
      }
      if (typeof tpl !== 'string') tpl = el.getAttribute('data-template') || '';
      el.innerHTML = render(tpl, data || {});
    }

    function applyAll(selector = '[data-template]') {
      document.querySelectorAll(selector).forEach(el => {
        const tplRef = el.getAttribute('data-template');
        if (!tplRef) return;
        renderInto(el, tplRef, window[el.getAttribute('data-context')] || {});
      });
    }

    // Expose
    window.Template = {
      render,
      compile,
      renderInto,
      applyAll
    };

    // Aplicação automática: procura elementos com data-template ao carregar
    try { setTimeout(() => Template.applyAll(), 10); } catch (e) { /* noop */ }
  })();

  /* ================================
     Máscaras de input: CPF, Telefone, CEP conforme requisição da atividade
     - Aplicar em inputs com data-mask="cpf" | "phone" | "cep"
     - Define inputmode="numeric" automaticamente
  ================================ */
  (function setupInputMasks() {
    function onlyDigits(v) { return (v || '').replace(/\D/g, ''); }

    function formatCPF(v) {
      v = onlyDigits(v).slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      return v;
    }

    function formatPhone(v) {
      v = onlyDigits(v).slice(0, 11);
      // (AA) NNNN-NNNN or (AA) NNNNN-NNNN
      v = v.replace(/^(\d{2})(\d)/, '($1) $2');
      if (v.replace(/\D/g, '').length > 10) {
        v = v.replace(/(\d{5})(\d)/, '$1-$2');
      } else {
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
      }
      return v;
    }

    function formatCEP(v) {
      v = onlyDigits(v).slice(0, 8);
      v = v.replace(/^(\d{5})(\d)/, '$1-$2');
      return v;
    }

    function attachMaskTo(input, formatter) {
      if (!input) return;
 
      try { input.setAttribute('inputmode', 'numeric'); } catch (e) { /* noop */ }

      const handler = () => {
        const start = input.selectionStart;
        const old = input.value;
        const formatted = formatter(old);
        input.value = formatted;
        // attempt to keep caret near the end — do minimal adjustment
        try { input.selectionStart = input.selectionEnd = formatted.length; } catch (e) { /* noop */ }
      };

      input.addEventListener('input', handler);
      input.addEventListener('blur', handler);
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        input.value = formatter(text);
        input.dispatchEvent(new Event('input'));
      });
    }

    // attach to existing elements
    document.querySelectorAll('[data-mask]').forEach(el => {
      const mask = el.getAttribute('data-mask');
      if (mask === 'cpf') attachMaskTo(el, formatCPF);
      if (mask === 'phone') attachMaskTo(el, formatPhone);
      if (mask === 'cep') attachMaskTo(el, formatCEP);
    });
  })();

});
