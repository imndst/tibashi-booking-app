import { fetchComments, postComment, editComment, replyComment } from '../../utils.js'
import showCustomAlert from '../alert/showCustomAlert.js';

function toPersianTime(isoDate) {
  try {
    const dt = new Date(isoDate);
    return dt.toLocaleDateString("fa-IR") + " " + dt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoDate;
  }
}

/* ---------------------------- 💬 Comments Renderer ---------------------------- */

export async function renderComments(ev, tabContent, page = 1) {
  tabContent.innerHTML = `<div class="tibashi-loader"></div>`;

  try {
    const commentsData = await fetchComments(ev.id, page);
    const token = localStorage.getItem("jwt_token");

    // --- Comment input box ---
    const commentBoxHTML = token
      ? `
      <div class="tibashi-comment-box">
        <textarea id="newComment" placeholder="نظر خود را بنویسید..."></textarea>
        <div class="tibashi-rating-stars">
          ${[1, 2, 3, 4, 5].map((i) => `<span class="star" data-value="${i}">☆</span>`).join("")}
        </div>
        <button id="submitComment">ثبت نظر</button>
      </div>
    `
      : `
      <div class="tibashi-comment-box tibashi-blur">
        <textarea placeholder="برای ثبت نظر وارد شوید..." disabled></textarea>
        <div class="tibashi-rating-stars">
          ${[1, 2, 3, 4, 5].map(() => `<span class="star disabled">☆</span>`).join("")}
        </div>
        <a href="/account/?redirect=${encodeURIComponent(window.location.href)}" class="tibashi-login-link">وارد شوید</a>
      </div>
    `;

    // --- Comments list ---
    let commentsHTML = `<p>هنوز نظری ثبت نشده است.</p>`;
    if (commentsData?.comments?.length) {
      commentsHTML = commentsData.comments
        .map((c) => {
          const repliesHTML = (c.replies || [])
            .map(
              (r) => `
              <div class="tibashi-reply-card">
                <div class="tibashi-reply-header">${r.writer || "کاربر"} - ${toPersianTime(r.timeduration)}</div>
                <div class="tibashi-reply-text">${r.oherdet || ""}</div>
              </div>
            `
            )
            .join("");

          let actions = `<button class="tibashi-reply-btn" data-id="${c.id}">پاسخ</button>`;
          if (token && c.isMine && c.price !== "32000") {
            actions += `<button class="tibashi-edit-btn" data-id="${c.id}" data-comment="${c.comment}" data-rating="${c.rating}">ویرایش</button>`;
          }

          return `
            <div class="tibashi-comment-card" data-id="${c.id}">
              <div class="tibashi-comment-header">
                <span>${toPersianTime(c.timeduration)}</span>
                <span style="float:right;">${c.writer ?? "حبیب خدا"} ⭐ ${c.rating}</span>
              </div>
              <p class="tibashi-comment-text">${c.comment}</p>
              <div class="tibashi-comment-actions">${actions}</div>
              <div class="tibashi-reply-box-container">${repliesHTML}</div>
            </div>
          `;
        })
        .join("");
    }

    // --- Pagination ---
    const paginationHTML = `
      <div class="tibashi-comments-pagination">
        ${page > 1 ? `<button class="tibashi-comments-prev">قبلی</button>` : ""}
        ${commentsData.comments.length === 10 ? `<button class="tibashi-comments-next">بعدی</button>` : ""}
      </div>
    `;

    // --- Render all ---
    tabContent.innerHTML = `
      ${commentBoxHTML}
      <div class="tibashi-comments-list">${commentsHTML}</div>
      ${paginationHTML}
    `;

    /* ⭐ Rating Selection */
    const submitBtn = tabContent.querySelector("#submitComment");
    if (submitBtn) {
      let selectedRating = 0;
      tabContent.querySelectorAll(".tibashi-rating-stars .star").forEach((star) => {
        star.onclick = () => {
          selectedRating = parseInt(star.dataset.value);
          tabContent.querySelectorAll(".tibashi-rating-stars .star").forEach((s) => (s.textContent = "☆"));
          for (let i = 0; i < selectedRating; i++) star.parentNode.children[i].textContent = "★";
        };
      });

      submitBtn.onclick = async () => {
        const comment = tabContent.querySelector("#newComment").value.trim();
        if (!comment || selectedRating <= 0) return showCustomAlert("لطفا نظر و امتیاز خود را وارد کنید");
        try {
          const result = await postComment(ev.id, comment, selectedRating);
          if (result?.status) renderComments(ev, tabContent, 1);
          else showCustomAlert("❌ " + result?.message);
        } catch {
          showCustomAlert("خطا در ارسال نظر");
        }
      };
    }

    /* 💬 Reply buttons */
    tabContent.querySelectorAll(".tibashi-reply-btn").forEach((btn) => {
      btn.onclick = () => {
        if (!token) return (window.location.href = `/account/?redirect=${encodeURIComponent(window.location.href)}`);
        const card = btn.closest(".tibashi-comment-card");
        const container = card.querySelector(".tibashi-reply-box-container");
        container.insertAdjacentHTML(
          "beforeend",
          `
          <div class="tibashi-reply-input-wrapper">
            <textarea class="tibashi-reply-input" placeholder="پاسخ خود را وارد کنید..."></textarea>
            <button class="tibashi-submit-reply">ثبت پاسخ</button>
          </div>
        `
        );
        container.querySelector(".tibashi-submit-reply").onclick = async () => {
          const replyText = container.querySelector(".tibashi-reply-input").value.trim();
          if (!replyText) return showCustomAlert("لطفا پاسخ را وارد کنید");
          try {
            const res = await replyComment(ev.id, btn.dataset.id, replyText);
            if (res.status) renderComments(ev, tabContent, page);
            else showCustomAlert("❌ " + res.message);
          } catch {
            showCustomAlert("خطا در ثبت پاسخ");
          }
        };
      };
    });

    /* ✏️ Edit button */
    tabContent.querySelectorAll(".tibashi-edit-btn").forEach((btn) => {
      btn.onclick = async () => {
        const newComment = prompt("ویرایش نظر:", btn.dataset.comment);
        if (newComment === null) return;
        const newRating = prompt("ویرایش امتیاز (1-5):", btn.dataset.rating);
        if (newRating === null) return;
        try {
          const res = await editComment(btn.dataset.id, newComment, parseFloat(newRating));
          if (res.status) renderComments(ev, tabContent, page);
          else showCustomAlert("❌ " + res.message);
        } catch {
          showCustomAlert("خطا در ویرایش");
        }
      };
    });

    /* 🔁 Pagination buttons */
    const prevBtn = tabContent.querySelector(".tibashi-comments-prev");
    const nextBtn = tabContent.querySelector(".tibashi-comments-next");
    if (prevBtn) prevBtn.onclick = () => renderComments(ev, tabContent, page - 1);
    if (nextBtn) nextBtn.onclick = () => renderComments(ev, tabContent, page + 1);
  } catch (err) {
    console.error(err);
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری نظرات</div>`;
  }
}