import { fetchActorDetails } from "../../utils.js";
export async function renderInfo(ev, tabContent) {
  tabContent.innerHTML = `<div class="tibashi-loader"></div>`;
  try {
    const data = await fetchActorDetails(ev.id);
    if (!data) throw new Error("هیچ رکوردی یافت نشد");

    tabContent.innerHTML = `
      <div class="tibashi-info-content">
        ${data.details || '<p>اطلاعات موجود نیست</p>'}
      </div>
    `;
  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری اطلاعات</div>`;
    console.error(err);
  }
}
