"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrip = generateTrip;
const filters_1 = require("./filters");
const score_1 = require("./score");
const explain_1 = require("./explain");
const schedule_1 = require("./schedule");
const budget_1 = require("./budget");
const facilities_1 = require("./facilities");
function generateTrip(prefs, data, cfg) {
    const stageLogs = [];
    const logStage = (stage, detail) => {
        stageLogs.push({ stage, detail, timestamp: new Date().toISOString() });
    };
    logStage('1. Filter Candidates', 'Filtering closed, unverified, and inaccessible destinations');
    const validDests = data.destinations.filter((d) => (0, filters_1.passesHardFilters)(d, prefs));
    logStage('2. Score Candidates', 'Scoring candidates across intent, destination mix, capacity, pressure, trust, and local value');
    const scoredDests = validDests.map((dest) => {
        const factors = (0, score_1.scoreDestinationFactors)(dest, prefs, data.experiences, cfg);
        return { dest, factors };
    });
    // Sort descending by score
    scoredDests.sort((a, b) => b.factors.totalScore - a.factors.totalScore);
    logStage('3. Balance Discovery Mix', 'Enforcing Famous, Moderate, and Hidden target ratio');
    const famousPool = scoredDests.filter((s) => s.dest.popularityType === 'famous');
    const moderatePool = scoredDests.filter((s) => s.dest.popularityType === 'moderate');
    const hiddenPool = scoredDests.filter((s) => s.dest.popularityType === 'hidden');
    // Daily stops per pace: Relaxed = 2, Balanced = 3, Packed = 4
    const pace = prefs.travelPace || prefs.travelStyle;
    const stopsPerDay = pace === 'Relaxed' ? 2 : pace === 'Packed' ? 4 : 3;
    const totalStopsNeeded = stopsPerDay * prefs.daysCount;
    // Distribute selected stops across days
    const selectedPool = [];
    // Ensure at least 2 hidden places and 2 experiences for pilot demo
    let hiddenAdded = 0;
    for (const h of hiddenPool) {
        if (hiddenAdded < Math.max(2, Math.round(totalStopsNeeded * (prefs.destinationMix.hidden / 100)))) {
            selectedPool.push(h);
            hiddenAdded++;
        }
    }
    // Fill remaining from moderate and famous
    for (const m of moderatePool) {
        if (selectedPool.length < totalStopsNeeded && !selectedPool.some((s) => s.dest.id === m.dest.id)) {
            selectedPool.push(m);
        }
    }
    for (const f of famousPool) {
        if (selectedPool.length < totalStopsNeeded && !selectedPool.some((s) => s.dest.id === f.dest.id)) {
            selectedPool.push(f);
        }
    }
    // Fallback if still under total
    for (const s of scoredDests) {
        if (selectedPool.length < totalStopsNeeded && !selectedPool.some((p) => p.dest.id === s.dest.id)) {
            selectedPool.push(s);
        }
    }
    logStage('4. Construct Route Schedule', 'Assigning time slots starting at 09:00 with lunch slots and travel times');
    const days = [];
    let poolIndex = 0;
    let totalDistanceKm = 0;
    let totalTravelMinutes = 0;
    let hiddenCount = 0;
    let expCount = 0;
    for (let d = 1; d <= prefs.daysCount; d++) {
        const dayStops = [];
        let prevDest = null;
        let dayCost = 0;
        let dayTravelMins = 0;
        for (let s = 0; s < stopsPerDay && poolIndex < selectedPool.length; s++) {
            const { dest, factors } = selectedPool[poolIndex % selectedPool.length];
            poolIndex++;
            // Find local experience if available
            const experience = data.experiences.find((e) => e.destinationId === dest.id && e.status === 'ACTIVE');
            if (experience)
                expCount++;
            if (dest.popularityType === 'hidden')
                hiddenCount++;
            // Travel time from previous stop
            let distFromPrev = 0;
            let minsFromPrev = 0;
            if (prevDest) {
                distFromPrev = (0, schedule_1.haversineKm)(prevDest.lat, prevDest.lng, dest.lat, dest.lng);
                minsFromPrev = (0, schedule_1.computeTravelMinutes)(distFromPrev, prefs.transport, cfg);
                totalDistanceKm += distFromPrev;
                dayTravelMins += minsFromPrev;
                totalTravelMinutes += minsFromPrev;
            }
            prevDest = dest;
            const durationMinutes = experience ? 90 : 75;
            const slot = (0, schedule_1.getStopSlot)(s, durationMinutes);
            const reasons = (0, explain_1.explainStop)(dest, prefs, factors, experience);
            const stopCost = (dest.entryFee + (experience ? experience.price : 0)) * (prefs.travelers.adults + prefs.travelers.children);
            dayCost += stopCost;
            dayStops.push({
                id: `stop-d${d}-s${s + 1}`,
                tripId: 'trip-current',
                dayNumber: d,
                destinationId: dest.id,
                destination: dest,
                experienceId: experience?.id,
                experience,
                startTime: slot.startTime,
                endTime: slot.endTime,
                durationMinutes,
                orderIndex: s,
                status: 'PLANNED',
                estimatedCost: stopCost,
                aiReasons: reasons,
                scoreMatch: Math.min(99, Math.max(75, factors.totalScore)),
                crowdStatus: dest.pressureLevel,
                dataFreshness: 'DEMO',
                distanceFromPrevKm: distFromPrev,
                travelMinutesFromPrev: minsFromPrev,
            });
        }
        days.push({
            dayNumber: d,
            date: `2026-10-1${4 + d}`,
            title: d === 1 ? 'Heritage & Living Arts' : d === 2 ? 'Temple Architecture & Crafts' : d === 3 ? 'Cauvery Basin Trails' : 'Silk Weaving & Rural Guilds',
            theme: d % 2 === 1 ? 'Chola Imperial Legacy' : 'Living Artisan Hamlets',
            stops: dayStops,
            totalEstimatedCost: dayCost,
            totalTravelMinutes: dayTravelMins,
        });
    }
    logStage('5. Evaluate Budget & Facilities', 'Computing comprehensive spend breakdown and facility coverage readiness');
    const budget = (0, budget_1.computeTripBudget)(days, prefs, totalDistanceKm);
    // Overall facility readiness
    let remoteStopsCount = 0;
    for (const day of days) {
        for (const stop of day.stops) {
            const fac = (0, facilities_1.evaluateFacilityCoverage)(stop.destination.facilities, cfg);
            if (fac.isRemoteAlert)
                remoteStopsCount++;
        }
    }
    const facilityCoverage = remoteStopsCount >= 2 ? 'Remote' : remoteStopsCount > 0 ? 'Limited' : 'Good';
    const readiness = Math.min(98, Math.max(82, 100 - (remoteStopsCount * 6)));
    const trip = {
        id: 'trip-current',
        userId: 'usr-tourist-demo',
        title: `${prefs.startLocation} to ${prefs.destination} Smart Adaptive Journey`,
        daysCount: prefs.daysCount,
        budget: prefs.budget,
        startDate: prefs.startDate || '2026-10-15',
        endDate: prefs.endDate || `2026-10-1${4 + prefs.daysCount}`,
        days,
        estimatedSpend: budget.totalEstimatedCost,
        totalTravelMinutes,
        hiddenDiscoveriesCount: hiddenCount,
        localExperiencesCount: expCount,
        facilityReadiness: facilityCoverage === 'Remote' ? 'REMOTE' : facilityCoverage === 'Limited' ? 'LIMITED' : 'GOOD',
        facilityCoverage,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    logStage('6. Finalize Explainable Journey', 'Itinerary ready with explainability cards and real-time adaptation listeners');
    return { trip, stageLogs };
}
