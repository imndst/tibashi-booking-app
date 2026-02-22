
export function initViewPort(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let loaded = false;
  container.innerHTML ;
  const observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !loaded) {
          loaded = true;
          observer.disconnect();
          await loadData();
        }
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(container);
  async function loadData() {
    
  }
  function render(items) {
    container.innerHTML = `
    `;
  }
  return { reload: loadData };
}
