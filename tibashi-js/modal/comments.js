import { fetchComments, postComment, editComment, replyComment } from "../utils/api.js";
// Helper to format writer, rating, and time
function formatCommentHeader(writer, rating, isoDate) {
  // 1️⃣ Writer default
  const displayWriter = writer || "حبیب";

  // 2️⃣ Rating stars (only if > 0)
  const stars = rating > 0 ? `⭐ ${rating}` : "";

  // 3️⃣ Time check (if before 2024)
  const dt = new Date(isoDate);
  const displayTime = dt.getFullYear() < 2024 ? "قدیمی" : toPersianTime(isoDate);

  return `<span>${displayTime}</span><span style="float:right;">${displayWriter} ${stars}</span>`;
}

// Convert ISO datetime to Persian date string
function toPersianTime(isoDate) {
  try {
    const dt = new Date(isoDate);
    return dt.toLocaleDateString('fa-IR') + " " + dt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoDate;
  }
}

export async function renderComments(ev, tabContent, page = 1) {
  tabContent.innerHTML = `<div class="tibashi-loader"></div>`;

  try {
    const commentsData = await fetchComments(ev.id, page);
    const token = localStorage.getItem("jwt_token");

    // --- Main comment input box ---
    let commentBoxHTML = token ? `
      <div class="tibashi-comment-box">
        <textarea id="newComment" placeholder="نظر خود را بنویسید..."></textarea>
        <div class="tibashi-rating-stars">
          ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">☆</span>`).join("")}
        </div>
        <button id="submitComment">ثبت نظر</button>
      </div>
    ` : `
      <div class="tibashi-comment-box tibashi-blur">
        <textarea placeholder="برای ثبت نظر وارد شوید..." disabled></textarea>
        <div class="tibashi-rating-stars">
          ${[1,2,3,4,5].map(i => `<span class="star disabled">☆</span>`).join("")}
        </div>
        <a href="/account/?redirect=${encodeURIComponent(window.location.href)}" class="tibashi-login-link">وارد شوید</a>
      </div>
    `;

    // --- Render comments with Persian time and replies ---
    let commentsHTML = `<p>هنوز نظری ثبت نشده است.</p>`;
    if (commentsData?.comments?.length) {
      commentsHTML = commentsData.comments.map(c => {
        // Render replies
       const repliesHTML = (c.replies || []).map(r => `
  <div class="tibashi-reply-card">
    <div class="tibashi-reply-header">${r.writer} - ${toPersianTime(r.timeduration)}</div>
    <div class="tibashi-reply-text">${r.oherdet || ''}</div>
  </div>
`).join("");

const repliesWrapperHTML = `
  <div class="tibashi-replies-grid">
    ${repliesHTML}
  </div>
`;


        // Actions
        let actions = `<button class="tibashi-reply-btn" data-id="${c.id}">پاسخ</button>`;
        if (token && c.isMine && c.price !== "32000") {
          actions += `<button class="tibashi-edit-btn" data-id="${c.id}" data-comment="${c.comment}" data-rating="${c.rating}">ویرایش</button>`;
        }

        return `
          <div class="tibashi-comment-card" data-id="${c.id}">
            <div class="tibashi-comment-header">
              <span>${toPersianTime(c.timeduration)}</span>
              <span style="float:right;">${c.writer??"حبیب خدا"} ⭐ ${c.rating }</span>
            </div>
            <p class="tibashi-comment-text">${c.comment}</p>
            <div class="tibashi-comment-actions">${actions}</div>
            <div class="tibashi-reply-box-container">
              ${repliesHTML}
            </div>
          </div>
        `;
      }).join("");
    }

    // --- Pagination ---
    const paginationHTML = `
      <div class="tibashi-comments-pagination">
        ${page > 1 ? `<button class="tibashi-comments-prev">قبلی</button>` : ""}
        ${commentsData.comments.length === 10 ? `<button class="tibashi-comments-next">بعدی</button>` : ""}
      </div>
    `;

    tabContent.innerHTML = `
      ${commentBoxHTML}
      <div class="tibashi-comments-list">${commentsHTML}</div>
      ${paginationHTML}
    `;

    // --- Rating selection ---
    const submitBtn = tabContent.querySelector("#submitComment");
    if (submitBtn) {
      let selectedRating = 0;
      tabContent.querySelectorAll(".tibashi-rating-stars .star").forEach(star => {
        star.onclick = () => {
          selectedRating = parseInt(star.dataset.value);
          tabContent.querySelectorAll(".tibashi-rating-stars .star").forEach(s => s.textContent = "☆");
          for (let i = 0; i < selectedRating; i++) star.parentNode.children[i].textContent = "★";
        };
      });

      submitBtn.onclick = async () => {
        const comment = tabContent.querySelector("#newComment").value.trim();
        if (!comment || selectedRating <= 0) return alert("لطفا نظر و امتیاز خود را وارد کنید");
        try {
          const result = await postComment(ev.id, comment, selectedRating);
          if (result?.status) renderComments(ev, tabContent, 1);
          else alert("❌ " + result?.message);
        } catch { alert("خطا در ارسال نظر"); }
      };
    }

    // --- Reply button ---
    tabContent.querySelectorAll(".tibashi-reply-btn").forEach(btn => {
      btn.onclick = () => {
        if (!token) return window.location.href = `/account/?redirect=${encodeURIComponent(window.location.href)}`;

        const card = btn.closest(".tibashi-comment-card");
        const container = card.querySelector(".tibashi-reply-box-container");

        // Remove previous input if exists
        container.querySelectorAll(".tibashi-reply-input, .tibashi-submit-reply").forEach(el => el.remove());

        // Add new reply input below replies
        container.insertAdjacentHTML('beforeend', `
          <div class="tibashi-reply-input-wrapper">
            <textarea class="tibashi-reply-input" placeholder="پاسخ خود را وارد کنید..."></textarea>
            <button class="tibashi-submit-reply">ثبت پاسخ</button>
          </div>
        `);

        const replyBtn = container.querySelector(".tibashi-submit-reply");
        replyBtn.onclick = async () => {
          const replyText = container.querySelector(".tibashi-reply-input").value.trim();
          if (!replyText) return alert("لطفا پاسخ را وارد کنید");
          try {
            const res = await replyComment(ev.id, btn.dataset.id, replyText);
            if (res.status) renderComments(ev, tabContent, page);
            else alert("❌ " + res.message);
          } catch { alert("خطا در ثبت پاسخ"); }
        };
      };
    });

    // --- Edit button ---
    tabContent.querySelectorAll(".tibashi-edit-btn").forEach(btn => {
      btn.onclick = async () => {
        const newComment = prompt("ویرایش نظر:", btn.dataset.comment);
        if (newComment === null) return;
        const newRating = prompt("ویرایش امتیاز (1-5):", btn.dataset.rating);
        if (newRating === null) return;
        try {
          const res = await editComment(btn.dataset.id, newComment, parseFloat(newRating));
          if (res.status) renderComments(ev, tabContent, page);
          else alert("❌ " + res.message);
        } catch { alert("خطا در ویرایش"); }
      };
    });

    // --- Pagination ---
    const prevBtn = tabContent.querySelector(".tibashi-comments-prev");
    const nextBtn = tabContent.querySelector(".tibashi-comments-next");
    if (prevBtn) prevBtn.onclick = () => renderComments(ev, tabContent, page - 1);
    if (nextBtn) nextBtn.onclick = () => renderComments(ev, tabContent, page + 1);

  } catch (err) {
    tabContent.innerHTML = `<div class="tibashi-error">خطا در بارگذاری نظرات</div>`;
    console.error(err);
  }
}
