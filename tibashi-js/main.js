import { initEvents } from './events.js';
import { initHamburgerTheme } from './side-menu/hamburgerTheme.js';
import { initModal } from './modal/modal-close.js';
import { initTibashiSlider } from './swiper.js';
import BoxOffice from './boxOffice.js';
import Profiles from './profile/profiles.js';
import { ENDPOINTS } from './utils/api.js';
document.addEventListener('DOMContentLoaded', async () => {
  initTibashiSlider();
  await initEvents();
  initModal();
  new BoxOffice('boxOfficeContainer', ENDPOINTS.boxOffice);
  new Profiles('profilesContainer', ENDPOINTS.profiles);
});
