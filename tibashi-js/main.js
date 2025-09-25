import { initEvents } from './events.js';
import { initHamburgerTheme } from './side-menu/hamburgerTheme.js';
import { initModal } from './modal/modal-close.js';
import { initTibashiSlider } from './swiper.js';
import BoxOffice from './boxOffice.js';
import Profiles from './profile/profiles.js';
document.addEventListener('DOMContentLoaded', async () => {

  
  // Initialize slider
  initTibashiSlider();

  // Initialize events grid (wait until complete)
  await initEvents(); // <-- make sure initEvents returns a Promise

  // Initialize modal for event details
  initModal();

  // Initialize Box Office component **after events grid is ready**
  new BoxOffice('boxOfficeContainer', 'https://localhost:7032/api/Box/BoxOffice');
  new Profiles('profilesContainer', 'https://localhost:7032/api/Profiles/Profiles');
  // Optional: init Hamburger & theme toggle
  // initHamburgerTheme();
});
