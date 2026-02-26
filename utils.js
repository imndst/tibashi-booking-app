// tibashi-js/utils/api.js
 const API_BASE = "https://bdcast.gishot.ir/api";
// export const API_BASE = "https://localhost:7032/api";
export const BASE_URL = "https://gishot.ir/";

// export const API_BASE_URL = "https://localhost:7032/api";
export const API_BASE_URL = "https://bdcast.gishot.ir/api";
export const BASE_URL_ACC = "https://gishot.ir/";


export const ENDPOINTS = {
  slides: `${API_BASE}/slides/Slides`,
  tickets: `${API_BASE}/TempSeat/SubmitTickets`,
  ticketsSeatLess: `${API_BASE}/TempSeat/SubmitTicketsSeatLess`,
  events: `${API_BASE}/events/Events`,
  boxOffice: `${API_BASE}/Box/BoxOffice`,
  profiles: `${API_BASE}/Profiles/Profiles`,
  checkDiscount: `${API_BASE}/Discounts/CheckDiscountCode`,
  comments: (eventId, page = 1) =>
    `${API_BASE}/Comments/GetComments/${eventId}?page=${page}`,
  times: (eventId) => `${API_BASE}/Time/GetTimes/${eventId}`,
  capacity: (eventId) => `${API_BASE}/Capacity/GetCapacity/${eventId}`,
  actorDetails: (eventId) => `${API_BASE}/Actores/GetActorDetails/${eventId}`,
  e: (eventId) => `${API_BASE}/events/event/${eventId}`,
  deleteTempSeats: `${API_BASE}/TempSeat/delete-by-temp`, // add the API endpoint
  deleteRecentByProgram: (programId) =>
    `${API_BASE}/TempSeat/delete-recent-by-program?programId=${programId}`,
    boxOffice: `${API_BASE}/Box/BoxOffice`, // ✅ Matches BoxController route

     walletBalance: (programId) =>
    `${API_BASE}/TempSeat/GetWalletBalance?programId=${programId}`,

      submitTicketsUseWalletLess: (useWallet = 1) =>
    `${API_BASE}/TempSeat/SubmitTicketsUseWalletLess?useWallet=${useWallet}`,
};

export async function deleteTempSeats() {
  try {
    const res = await fetch(ENDPOINTS.deleteTempSeats, {
      method: "GET", // since your API is GET
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn("Delete temp seats API returned:", err);
      return {
        status: false,
        message: err?.message || "خطا در پاکسازی صندلی‌ها",
      };
    }

    const data = await res.json();
    console.log("Temp seats deleted:", data);
    return data;
  } catch (err) {
    console.error("Error deleting temp seats:", err);
    return { status: false, message: "خطا در پاکسازی صندلی‌ها" };
  }
}

export async function deleteRecentByProgram(programId) {
  try {
    const res = await fetch(ENDPOINTS.deleteRecentByProgram(programId), {
      method: "GET", // your API is GET
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json();
      console.warn("Delete recent by program API returned:", err);
      return { status: false, message: err?.message || "خطا در پاکسازی صندلی‌ها" };
    }

    const data = await res.json();
    console.log(`Recent seats deleted for program ${programId}:`, data);
    return data;
  } catch (err) {
   
    return { status: false, message: "خطا در پاکسازی صندلی‌ها" };
  }
}
export async function getBoxOffice() {
  try {
    const res = await fetch(ENDPOINTS.boxOffice);
    const data = await res.json();

    if (!data.status) {
      console.warn("Box office API returned error:", data.message);
      return [];
    }

    return data.result || [];
  } catch (err) {
    console.error("Error fetching Box Office:", err);
    return [];
  }
}
export async function getProfiles() {
  try {
    const res = await fetch(ENDPOINTS.profiles);
    const data = await res.json();

    if (!data.status) {
      console.warn("Profiles API returned error:", data.message);
      return [];
    }

    return data.result || [];
  } catch (err) {
    console.error("Error fetching profiles:", err);
    return [];
  }
}
export async function checkDiscountCode(programId, discountCode) {
  try {
    const res = await fetch(ENDPOINTS.checkDiscount, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ProgramId: programId,
        DiscountCode: discountCode,
      }),
    });

    if (!res.ok) throw new Error( res?.message||"تعداد درخواست های شما زیاد است  دقایقی بعد مجدد امتخان کنید");

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return { status: false, message: err?.message|| "تعداد درخواست های شما زیاد است  دقایقی بعد مجدد امتحان کنید" };
  }
}
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

export async function submitTicketsSeatLess(payload) {
  try {
    const res = await fetch(ENDPOINTS.ticketsSeatLess, {
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
  return plan.find((s) => s.globalId === Number(globalSeatId)) || null;
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
export function getSeatClass(
  seatId,
  { book = [], temp = [], ipg = [], soc = [] }
) {
  const idStr = seatId.toString();
  if (book.includes(idStr)) return "Book";
  if (temp.includes(idStr)) return "Temp";
  if (ipg.includes(idStr)) return "Ipg";
  if (soc.includes(idStr)) return "Soc";
  return "";
}

export function updateSeatClasses(seatStatus) {
  const { book = [], ipg = [], temp = [], soc = [] } = seatStatus.result;

  document.querySelectorAll(".Seat").forEach((seat) => {
    const id = (seat.dataset.seat.toString());
    seat.classList.remove("Temp","Ipg","Soc","Book");
    if (book.includes(id)) seat.classList.add("Book");
    if (temp.includes(id)) seat.classList.add("Temp");
    if (ipg.includes(id)) seat.classList.add("Ipg");
    if (soc.includes(id)) seat.classList.add("Soc");
  });
}




export async function getWalletBalance(programId) {
  try {
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) {
      return { status: false, message: "لطفاً وارد حساب کاربری شوید" };
    }

    const res = await fetch(ENDPOINTS.walletBalance(programId), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        status: false,
        message: data?.message || "خطا در دریافت موجودی کیف پول",
      };
    }

    return { status: true, ...data };
  } catch (err) {
    console.error("getWalletBalance error:", err);
    return { status: false, message: "خطا در دریافت موجودی کیف پول" };
  }
}

export async function submitTicketsUseWallet(payload, useWallet = 1) {
  try {
    const jwt = localStorage.getItem("jwt_token");
    if (!jwt) {
      return { status: false, message: "لطفاً وارد حساب کاربری شوید" };
    }

    const res = await fetch(
      ENDPOINTS.submitTicketsUseWalletLess(useWallet),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        status: false,
        message: data?.message || "خطا در پرداخت از کیف پول",
      };
    }

    return data;
  } catch (err) {
    console.error("submitTicketsUseWallet error:", err);
    return { status: false, message: "خطا در پرداخت از کیف پول" };
  }
}





/**
 * Build seatless plan from API with JWT authorization
 * @param {number} eventId - event ID
 * @param {string} token - JWT access token
 * @returns {Promise<Array>} - array of seatless items
 */
export async function buildSeatless(eventId, token) {
  const res = await fetch(`${API_BASE}/Seatless/plan/${eventId}`, {
    headers: {
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  // If unauthorized, just return the data without throwing
  let data;
  try {
    data = await res.json();
  } catch {
    data = { status: false, result: [] };
  }

  // If API gives 401, just return empty results
  if (!data.status || !data.result) {
    return [];
  }

  let globalId = 0;
  return data.result.map((item) => {
    globalId++;
    return {
      globalId,
      id: item.id,
      mid: item.mid,
      name: item.name,
      price: item.price,
      picPath: item.picPath,
      bgcolor: item.bgColor,
      capacity: item.capacity,
      remaining: item.remaining,
      sansId: item.sansId,
      status:item.status
    };
  });
}

