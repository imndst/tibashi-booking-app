


const API_BASE = "https://bdcast.gishot.ir/api"; 

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
