// seat/api.js
export const API_BASE = 'https://bdcast.gishot.ir/api';

export async function fetchSeatPlan(eventId) {
  const res = await fetch(`${API_BASE}/Seat/plan/${eventId}`);
  return res.json();
}

export async function fetchSeatStatus(timeId) {
  const res = await fetch(`${API_BASE}/TempSeat/SeatStatus/${timeId}`);
  return res.json();
}

export async function submitTickets(payload) {
  const res = await fetch(`${API_BASE}/TempSeat/SubmitTickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}
