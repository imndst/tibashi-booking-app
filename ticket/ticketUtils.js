import { getSeatByGlobalId as getSeatGlobal } from '../tibashi-js/modal/seat/seatUtils.js';

export async function getSeatInfo(programId, seatId) {
  return await getSeatGlobal(programId.toString(), seatId.toString());
}
