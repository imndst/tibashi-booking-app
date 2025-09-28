// seat/createReservationPayload.js

export function createReservationPayload(selectedSeats, programId, timeId) {
  return {
    ProgramId: programId.toString(),
    ProgramSing: programId.toString(),
    Pval: timeId.toString(),
    ProgramTimeID: timeId.toString(),
    Phone: prompt("شماره تلفن خود را وارد کنید:"),
    CustomerName: prompt("نام مشتری را وارد کنید:"),
    ProgramDate: new Date().toISOString(),
    Seats: selectedSeats.map(s => ({
      SeatId: s.seatNumber,
      RowNumber: s.row,
      Number: s.seatNumber,
      Price: s.price
    }))
  };
}
