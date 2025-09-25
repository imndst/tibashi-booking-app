export async function renderInfo(ev, tabContent) {
  tabContent.innerHTML = `<div class="tibashi-loader"></div>`;
  try {
    const res = await fetch(`https://localhost:7032/api/Actores/GetActorDetails/${ev.id}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "هیچ رکوردی یافت نشد");

    tabContent.innerHTML = `
      <div class="tibashi-info-content">
        ${data.result.details || '<p>اطلاعات موجود نیست</p>'}
      </div>
    `;
  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری اطلاعات</div>`;
    console.error(err);
  }
}
