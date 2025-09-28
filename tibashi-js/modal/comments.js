import { fetchComments } from "../utils/api.js";
export async function renderComments(ev, tabContent, page = 1) {
  tabContent.innerHTML = `<div class="tibashi-loader"></div>`;
  try {
    const commentsData = await fetchComments(ev.id, page);
    if (
      !commentsData ||
      !commentsData.comments ||
      commentsData.comments.length === 0
    ) {
      tabContent.innerHTML = `<p>هنوز نظری ثبت نشده است.</p>`;
      return;
    }
    const commentsHTML = commentsData.comments
      .map(
        (c) => `
      <div class="tibashi-comment-card">
        <p class="tibashi-comment-text">${c.comment}</p>
        <p class="tibashi-comment-text">${c.rating}</p>
      </div>
    `
      )
      .join("");

    const paginationHTML = `
      <div class="tibashi-comments-pagination">
        ${page > 1 ? `<button class="tibashi-comments-prev">قبلی</button>` : ""}
        ${
          commentsData.comments.length === 10
            ? `<button class="tibashi-comments-next">بعدی</button>`
            : ""
        }
      </div>
    `;

    tabContent.innerHTML = `<div class="tibashi-comments-list">${commentsHTML}</div>${paginationHTML}`;
    const prevBtn = tabContent.querySelector(".tibashi-comments-prev");
    const nextBtn = tabContent.querySelector(".tibashi-comments-next");
    if (prevBtn)
      prevBtn.onclick = () => renderComments(ev, tabContent, page - 1);
    if (nextBtn)
      nextBtn.onclick = () => renderComments(ev, tabContent, page + 1);
  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری نظرات</div>`;
    console.error(err);
  }
}
