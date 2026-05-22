function calculatePrice(baseFare, cabType, dateTime, passengers, hasDiscount) {
  // Cab multiplier
  const cabMultipliers = { Economic: 1, Premium: 1.2, Executive: 1.4 };
  const cabMultiplier = cabMultipliers[cabType] || 1;

  // Daytime multiplier — night rate between midnight and 8am
  const hour = new Date(dateTime).getHours();
  const daytimeMultiplier = (hour >= 0 && hour < 8) ? 1.2 : 1;

  // Passengers multiplier
  let passengersMultiplier;
  if (passengers >= 1 && passengers <= 4) passengersMultiplier = 1;
  else if (passengers >= 5 && passengers <= 8) passengersMultiplier = 2;
  else throw new Error('Passenger count not allowed (max 8)');

  // Discount multiplier
  const discountMultiplier = hasDiscount ? 0.9 : 1;

  const totalPrice = baseFare * cabMultiplier * daytimeMultiplier * passengersMultiplier * discountMultiplier;

  return {
    baseFare,
    cabMultiplier,
    daytimeMultiplier,
    passengersMultiplier,
    discountMultiplier,
    totalPrice: Math.round(totalPrice * 100) / 100
  };
}

module.exports = { calculatePrice };