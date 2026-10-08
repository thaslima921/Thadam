"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTripBudget = computeTripBudget;
function computeTripBudget(days, prefs, totalDistanceKm) {
    const travelersCount = prefs.travelers.adults + prefs.travelers.children + prefs.travelers.seniors;
    const daysCount = days.length;
    // 1. Stay Estimate (per room, approx 2 travelers per room)
    const roomsCount = Math.max(1, Math.ceil(travelersCount / 2));
    let costPerRoomNight = 1200;
    if (prefs.accommodation === 'Budget')
        costPerRoomNight = 800;
    else if (prefs.accommodation === 'Premium')
        costPerRoomNight = 3000;
    else if (prefs.accommodation === 'Resort')
        costPerRoomNight = 4500;
    else if (prefs.accommodation === 'Homestay')
        costPerRoomNight = 1400;
    const stayEstimate = (daysCount - 1) * roomsCount * costPerRoomNight;
    // 2. Food Estimate (per person, per day)
    const foodCostPerDayPerPerson = 450;
    const foodEstimate = daysCount * travelersCount * foodCostPerDayPerPerson;
    // 3. Transport Estimate (per km)
    let ratePerKm = 10;
    if (prefs.transport === 'Two-wheeler')
        ratePerKm = 3.5;
    else if (prefs.transport === 'Bus')
        ratePerKm = 2.5;
    else if (prefs.transport === 'Cab')
        ratePerKm = 16;
    else if (prefs.transport === 'Train')
        ratePerKm = 2.0;
    const transportEstimate = Math.round(totalDistanceKm * ratePerKm);
    // 4. Entry fees & Experiences
    let entryFees = 0;
    let experiencesTotal = 0;
    for (const day of days) {
        for (const stop of day.stops) {
            entryFees += stop.destination.entryFee * travelersCount;
            if (stop.experience) {
                experiencesTotal += stop.experience.price * travelersCount;
            }
        }
    }
    const totalEstimatedCost = stayEstimate + foodEstimate + transportEstimate + entryFees + experiencesTotal;
    const targetBudget = prefs.budget;
    const remainingAmount = targetBudget - totalEstimatedCost;
    const isOverBudget = remainingAmount < 0;
    return {
        stayEstimate,
        foodEstimate,
        transportEstimate,
        entryFees,
        experiencesTotal,
        totalEstimatedCost,
        targetBudget,
        remainingAmount,
        isOverBudget,
    };
}
