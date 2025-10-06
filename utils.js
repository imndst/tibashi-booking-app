// tibashi-js/utils/api.js
// const API_BASE = "https://bdcast.gishot.ir/api";
const API_BASE = "https://localhost:7032/api";
export const BASE_URL =  "https://new.gishot.ir/";

export const ENDPOINTS = {
  slides: `${API_BASE}/slides/Slides`,
  tickets: `${API_BASE}/TempSeat/SubmitTickets`,
  events: `${API_BASE}/events/Events`,
  boxOffice: `${API_BASE}/Box/BoxOffice`,
  profiles: `${API_BASE}/Profiles/Profiles`,
  comments: (eventId, page = 1) =>
    `${API_BASE}/Comments/GetComments/${eventId}?page=${page}`,
  times: (eventId) => `${API_BASE}/Time/GetTimes/${eventId}`,
  capacity: (eventId) => `${API_BASE}/Capacity/GetCapacity/${eventId}`,
  actorDetails: (eventId) => `${API_BASE}/Actores/GetActorDetails/${eventId}`,
  e: (eventId) => `${API_BASE}/events/event/${eventId}`,
};

export async function fetchSlides() {
  try {
    const res = await fetch(ENDPOINTS.slides);
    if (!res.ok) throw new Error("خطا در دریافت اسلایدها");
    const data = await res.json();
    return data.result || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchEvents() {
  try {
    const res = await fetch(ENDPOINTS.events);
    if (!res.ok) throw new Error("خطا در دریافت رویدادها");
    const data = await res.json();
    return data.result || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchComments(programId, page = 1) {
  const res = await fetch(
    `${API_BASE}/comments/GetComments/${programId}?page=${page}`
  );
  const data = await res.json();
  return data.result;
}

export async function postComment(programId, comment, rating) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${API_BASE}/comments/AddComment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ programId, comment, rating }),
  });
  return res.json();
}

export async function editComment(commentId, comment) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${API_BASE}/comments/EditComment/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });
  return res.json();
}

export async function replyComment(programId, parentCommentId, comment) {
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(`${API_BASE}/comments/AddComment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      programId,
      comment,
      parentId: parentCommentId,
      rating: 5,
    }),
  });
  return res.json();
}

export async function fetchProfiles() {
  try {
    const res = await fetch(ENDPOINTS.profiles);
    if (!res.ok) throw new Error("خطا در دریافت پروفایل‌ها");
    const data = await res.json();
    return data.result || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchTimes(eventId) {
  try {
    const res = await fetch(ENDPOINTS.times(eventId));
    if (!res.ok) throw new Error("خطا در دریافت اطلاعات سانس‌ها");
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchActorDetails(eventId) {
  try {
    const res = await fetch(ENDPOINTS.actorDetails(eventId));
    const data = await res.json();
    return data.status ? data.result : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchE(eventId) {
  try {
    const res = await fetch(ENDPOINTS.e(eventId));
    const data = await res.json();
    return data.status ? data.result : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
// seat/api.js

export async function fetchSeatPlan(eventId) {
  const res = await fetch(`${API_BASE}/Seat/plan/${eventId}`);
  return res.json();
}

export async function fetchSeatStatus(timeId) {
  const res = await fetch(`${API_BASE}/TempSeat/SeatStatus/${timeId}`);
  return res.json();
}

export async function submitTickets(payload) {
  try {
    const res = await fetch(ENDPOINTS.tickets, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { status: false, message: "خطا در ارسال اطلاعات به سرور" };
  }
}

/**
 * Build a flattened seat plan with global IDs for an event.
 * @param {string|number} eventId
 * @returns {Promise<Array<{globalId:number,rowNumber:string|number,seatNumber:number}>>}
 */
async function buildSeatPlan(eventId) {
  const res = await fetch(`${API_BASE}/Seat/plan/${eventId}`);
  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || "Failed to fetch seat plan");
  }

  let globalId = 0;
  const plan = [];

  const rows = data.result || [];
  rows.forEach((row, rowIndex) => {
    const seatCount = parseInt(row.seat_in_rows || 0, 10);
    for (let i = 0; i < seatCount; i++) {
      globalId++;
      plan.push({
        globalId,
        rowNumber: row.row_title?.trim() || rowIndex + 1,
        seatNumber: i + 1,
      });
    }
  });

  return plan;
}

/**
 * Get seat info by global seat ID.
 * @param {string|number} eventId
 * @param {number} globalSeatId
 * @returns {Promise<{rowNumber:string|number,seatNumber:number}|null>}
 */
export async function getSeatByGlobalId(eventId, globalSeatId) {
  if (!eventId || !globalSeatId) {
    throw new Error("Both eventId and globalSeatId are required");
  }

  const plan = await buildSeatPlan(eventId);
  return plan.find(s => s.globalId === Number(globalSeatId)) || null;
}

/**
 * Get seat class name based on seat status arrays.
 * @param {string|number} seatId
 * @param {object} lists - Lists of seat IDs
 * @param {string[]} [lists.book] - Booked seat IDs
 * @param {string[]} [lists.temp] - Temporary seat IDs
 * @param {string[]} [lists.ipg] - In-progress seat IDs
 * @param {string[]} [lists.soc] - Social seat IDs
 * @returns {string} Class name ("Book" | "Temp" | "Ipg" | "Soc" | "")
 */
export function getSeatClass(seatId, { book = [], temp = [], ipg = [], soc = [] }) {
  const idStr = seatId.toString();
  if (book.includes(idStr)) return "Book";
  if (temp.includes(idStr)) return "Temp";
  if (ipg.includes(idStr)) return "Ipg";
  if (soc.includes(idStr)) return "Soc";
  return "";
}
