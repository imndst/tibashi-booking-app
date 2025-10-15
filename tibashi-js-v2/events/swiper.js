import { fetchSlides, BASE_URL } from "../../utils.js";

export async function initImageCarousel(container) {
  const slidesData = await fetchSlides();
  const images = slidesData || [];

  if (!images.length) {
    container.innerHTML = "<div>در حال بارگذاری تصاویر...</div>";
    return;
  }

  // Add base class
  container.classList.add("carousel-container");

  // Create structure
  container.innerHTML = `
    <div class="owl-carousel owl-theme"></div>
    <div class="carousel-overlay">
      <h2 class="carousel-title"></h2>
    </div>
  `;

  const owlContainer = container.querySelector(".owl-carousel");
  const titleEl = container.querySelector(".carousel-title");

  // Create slides
  images.forEach((img) => {
    const slide = document.createElement("div");
    slide.classList.add("item");
    slide.innerHTML = `
      <img 
        src="${img.imgDesk.startsWith("http") ? img.imgDesk : `${BASE_URL}/${img.imgDesk}`}" 
        alt="slide" 
        class="carousel-image"
      />
    `;
    owlContainer.appendChild(slide);
  });

  // Initialize Owl Carousel
  $(owlContainer).owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    smartSpeed: 600,
    dots: true,
    nav: true,
    rtl: true, // since you have Persian text (RTL)
    navText: ["<", ">"],
    onChanged: (event) => updateTitle(event.item.index),
  });

  // Function to update title text
  function updateTitle(index) {
    // `index` includes cloned slides in Owl, so normalize
    const realIndex = (index - 2 + images.length) % images.length;
    titleEl.textContent = `اسلاید ${realIndex + 1} از ${images.length}`;
  }

  // Set initial title
  updateTitle(0);
}
