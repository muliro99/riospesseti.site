// Padding do body para compensar header fixed
const header = document.querySelector('header');
if (header) {
  const ajustarPadding = () => {
    document.body.style.paddingTop = header.offsetHeight + 'px';
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
  toggle.addEventListener('click', () => {
    mobile.classList.toggle('aberto');
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !mobile.contains(e.target)) {
      mobile.classList.remove('aberto');
    }
  });
}

// Marca link ativo no nav
document.querySelectorAll('.nav-esq a, .nav-dir-links a, .nav-mobile a').forEach(link => {
  if (link.classList.contains('nav-cta')) return;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const linkPath    = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
  if (currentPath === linkPath || (linkPath !== '/' && currentPath.endsWith(linkPath))) {
    link.classList.add('ativo');
  }
});
