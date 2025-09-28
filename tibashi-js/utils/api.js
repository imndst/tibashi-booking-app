// tibashi-js/utils/api.js
const API_BASE = "https://bdcast.gishot.ir/api";

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

export async function fetchComments(eventId, page = 1) {
  try {
    const res = await fetch(ENDPOINTS.comments(eventId, page));
    if (!res.ok) throw new Error("خطا در دریافت نظرات");
    const data = await res.json();
    return data.result || { comments: [] };
  } catch (err) {
    console.error(err);
    return { comments: [] };
  }
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
