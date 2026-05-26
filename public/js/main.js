// Padding do body para compensar header fixed
const header = document.querySelector('header');
if (header) {
  const ajustarPadding = () => {
    const h = header.offsetHeight;
    document.body.style.paddingTop = h + 'px';
    document.documentElement.style.setProperty('--nav-h', h + 'px');
  };
  ajustarPadding();
  window.addEventListener('resize', ajustarPadding);
}

// Header esconde ao scrollar para baixo, aparece ao scrollar para cima
let ultimoScroll = 0;
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  if (scroll > ultimoScroll && scroll > 120) {
    header.classList.add('oculto');
  } else {
    header.classList.remove('oculto');
  }
  ultimoScroll = scroll <= 0 ? 0 : scroll;
}, { passive: true });

// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const mobile = document.getElementById('nav-mobile');
if (toggle && mobile) {
  toggle.addEventListener('click', () => mobile.classList.toggle('aberto'));
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !mobile.contains(e.target)) {
      mobile.classList.remove('aberto');
    }
  });
}

// FAQ Accordion
document.querySelectorAll('.faq-pergunta').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('aberto');
    document.querySelectorAll('.faq-item.aberto').forEach(el => {
      el.classList.remove('aberto');
      el.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('aberto');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Animacoes de entrada (Intersection Observer)
(function () {
  const seletores = '.area-card, .perfil-card, .post-card, .depo-card, .sec-head, .faq-titulo, .sobre-texto, .sobre-img, .historia-grid > div, .contato-info, .formulario';
  const alvos = document.querySelectorAll(seletores);
  alvos.forEach(el => {
    if (!el.closest('.hero-split') && !el.closest('.hero')) el.classList.add('fade-up');
  });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const irmaos = Array.from(entry.target.parentElement.children)
        .filter(c => c.classList.contains('fade-up'));
      const idx = irmaos.indexOf(entry.target);
      entry.target.style.transitionDelay = Math.min(idx * 0.1, 0.4) + 's';
      entry.target.classList.add('visivel');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  alvos.forEach(el => obs.observe(el));
})();

// Marca link ativo no nav
document.querySelectorAll('.nav-esq a, .nav-dir-links a, .nav-mobile a').forEach(link => {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const linkPath    = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
  if (currentPath === linkPath || (linkPath !== '/' && currentPath.endsWith(linkPath))) {
    link.classList.add('ativo');
  }
});
