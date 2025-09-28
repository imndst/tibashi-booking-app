// seatControls.js
export function initSeatControls(tabContent) {
  const selectedSeats = [];
  const totalDisplay = tabContent.querySelector('#total-price'); // updated
  const btnPay = tabContent.querySelector('#btn-pay');           // updated
  const btnNext = tabContent.querySelector('#btn-next');         // updated

  if (!totalDisplay || !btnPay || !btnNext) {
    throw new Error("Required seat control elements not found in tabContent.");
  }

  // Update total price and button text
  function update() {
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    totalDisplay.textContent = `مبلغ: ${total.toLocaleString('fa-IR')} تومان`;
    btnPay.textContent = `سبد خرید (${selectedSeats.length} بلیت)`;
    btnPay.disabled = selectedSeats.length === 0;
  }

  // Handle seat selection toggle
  function handleSeatClick(seatEl) {
    const seatNumber = seatEl.dataset.seat;
    const row = seatEl.dataset.row;
    const price = parseInt(seatEl.dataset.price, 10);

    const idx = selectedSeats.findIndex(s => s.seatNumber === seatNumber && s.row === row);
    if (idx === -1) {
      seatEl.classList.add('selected');
      selectedSeats.push({ seatNumber, row, price, element: seatEl });
    } else {
      selectedSeats[idx].element.classList.remove('selected');
      selectedSeats.splice(idx, 1);
    }
    update();
  }

  // Add click listener to all free seats
  tabContent.querySelectorAll('.Seat').forEach(seatEl => {
    if (!seatEl.classList.contains('Book') &&
        !seatEl.classList.contains('Temp') &&
        !seatEl.classList.contains('Ipg') &&
        !seatEl.classList.contains('Soc')) {
      seatEl.addEventListener('click', () => handleSeatClick(seatEl));
    }
  });

  // Expose pay button click handler
  function onPay(callback) {
    btnPay.addEventListener('click', () => callback(selectedSeats));
  }

  // Expose next button click handler
  function onNext(callback) {
    btnNext.addEventListener('click', () => callback(selectedSeats));
  }

  // Initialize display
  update();

  return {
    selectedSeats,
    update,
    onPay,
    onNext
  };
}
