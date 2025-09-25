// tibashi imndst 9-25-2025 seatDesign.js 

export function buildSeatPlan(seatData) {
  let seatMapHtml = `<div class="tibashi-seat-map" style="display:flex;flex-direction:column;gap:8px;">`;

  let globalSeatId = 0; // unique across all seats, optional if needed

  seatData.forEach((row, rowIndex) => {
    const seatCount = parseInt(row.seat_in_rows || 0, 10);

    const isIncr = Number(row.is_incr || 0) === 1;
    const incrStart = Number.isFinite(parseInt(row.incr_first_seat)) ? parseInt(row.incr_first_seat) : null;

    // Row styles
    const styleParts = [
      `position:${row.row_possition || 'relative'}`,
      row.top_in_abs ? `top:${row.top_in_abs}px` : '',
      row.left_in_abs ? `left:${row.left_in_abs}px` : '',
      row.row_top_margin ? `margin-top:${row.row_top_margin}px` : '',
      row.row_lef_margin ? `margin-left:${row.row_lef_margin}px` : '',
      row.transform_rows ? `transform:rotate(${row.transform_rows}deg)` : '',
      `direction:${row.seat_align || 'rtl'}`
    ].filter(Boolean);

    const style = styleParts.join('; ');

    seatMapHtml += `
      <div class="RowContainer" 
           data-idrow="${rowIndex}" 
           style="${style};display:flex;align-items:center;gap:6px;flex-wrap:nowrap;">
        <div class="RowHeader" style="min-width:28px;text-align:center;font-weight:700;color:#fff;">
          ${row.row_title?.trim() || (rowIndex + 1)}
        </div>
    `;

    // Determine starting seat number
    const startSeatNumber = (isIncr && incrStart !== null) ? incrStart : 1;

    for (let i = 0; i < seatCount; i++) {
      // Render blanks only if defined
      for (let j = 1; j <= 6; j++) {
        const blankIndex = row[`blank_after_${j}`];
        if (blankIndex !== null && blankIndex !== undefined && Number(blankIndex) === i) {
          const width = row[`width_space_${j}`] ?? 10;
          seatMapHtml += `<div class="BlankSpace" style="width:${width}px;min-width:${width}px;"></div>`;
        }
      }

      globalSeatId++; // unique ID
      const seatNumber = startSeatNumber + i;
      const price = parseInt(row.row_price || 0, 10);

      seatMapHtml += `
        <div class="Seat" 
             data-seat="${globalSeatId}" 
             data-row="${row.row_title?.trim() || (rowIndex + 1)}" 
             data-price="${price}">
             ${seatNumber}
        </div>`;
    }

    seatMapHtml += `
        <div class="RowEndHeader" style="min-width:28px;text-align:center;font-weight:700;color:#fff;">
          ${row.row_title?.trim() || (rowIndex + 1)}
        </div>
      </div>
    `;
  });

  seatMapHtml += `</div>`;
  return seatMapHtml;
}
