'use strict';

// Progressive enhancement: navigation and all content work without JavaScript.
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('navbarResponsive');
if (toggle && menu) {
  toggle.hidden = false;
  document.documentElement.classList.add('js');
  const close = () => { toggle.setAttribute('aria-expanded','false'); menu.classList.remove('is-open'); };
  toggle.addEventListener('click',()=>{
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded',String(open));
    menu.classList.toggle('is-open',open);
  });
  menu.addEventListener('click',event=>{ if (event.target.closest('a')) close(); });
  document.addEventListener('keydown',event=>{ if (event.key==='Escape' && toggle.getAttribute('aria-expanded')==='true') { close(); toggle.focus(); } });
}
