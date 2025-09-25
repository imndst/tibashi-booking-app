export function initHamburgerTheme() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  const toggleThemeBtn = document.getElementById('toggleTheme');
  const toggleThumb = toggleThemeBtn.querySelector('.toggle-thumb');

  // Hamburger toggle
  hamburger.addEventListener('click', ()=> menu.style.display = menu.style.display==='flex' ? 'none' : 'flex');

  // Theme toggle
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  toggleThemeBtn.addEventListener('click', ()=>{
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  function applyTheme(theme){
    document.body.classList.remove('dark','light');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    if(theme==='dark'){
      toggleThumb.classList.add('dark');
    } else {
      toggleThumb.classList.remove('dark');
    }
  }
}
