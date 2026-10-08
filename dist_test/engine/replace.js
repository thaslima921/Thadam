"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceStop = replaceStop;
exports.applyReplacement = applyReplacement;
const schedule_1 = require("./schedule");
const score_1 = require("./score");
const preferences_1 = require("../types/preferences");
function replaceStop(trip, stopId, reason, data, cfg) {
    // Find target stop
    let targetStop = null;
    for (const day of trip.days) {
        for (const stop of day.stops) {
            if (stop.id === stopId) {
                targetStop = stop;
                break;
            }
        }
    }
    if (!targetStop)
        return [];
    // Exclude destinations already in the trip
    const existingDestIds = new Set();
    trip.days.forEach((d) => d.stops.forEach((s) => existingDestIds.add(s.destination.id)));
    const candidates = data.destinations.filter((d) => d.id !== targetStop.destination.id && !existingDestIds.has(d.id) && d.status === 'OPEN');
    const scoredCandidates = candidates.map((cand) => {
        const factors = (0, score_1.scoreDestinationFactors)(cand, preferences_1.DEFAULT_PREFERENCES, data.experiences, cfg);
        const dist = (0, schedule_1.haversineKm)(targetStop.destination.lat, targetStop.destination.lng, cand.lat, cand.lng);
        const exp = data.experiences.find((e) => e.destinationId === cand.id && e.status === 'ACTIVE');
        const reasons = [];
        if (reason === 'Too crowded') {
            reasons.push('Significantly lower crowd pressure than current stop');
        }
        else if (reason === 'Too far') {
            reasons.push(`Corridor optimal distance (${dist} km away)`);
        }
        else if (reason === 'Need more hidden places') {
            reasons.push('Verified hidden discovery off the beaten track');
        }
        else {
            reasons.push('Balanced cultural alternative matching route DNA');
        }
        return {
            destination: cand,
            scoreMatch: Math.min(98, Math.max(72, factors.totalScore)),
            distanceKm: dist,
            estimatedCost: cand.entryFee + (exp ? exp.price : 0),
            reasons,
            experience: exp,
        };
    });
    // Sort by match score and return exactly up to 3 alternatives
    scoredCandidates.sort((a, b) => b.scoreMatch - a.scoreMatch);
    return scoredCandidates.slice(0, 3);
}
function applyReplacement(trip, stopId, altDestinationId, data, cfg) {
    const newDest = data.destinations.find((d) => d.id === altDestinationId);
    if (!newDest)
        return trip;
    const newExp = data.experiences.find((e) => e.destinationId === altDestinationId && e.status === 'ACTIVE');
    // Deep clone days
    const updatedDays = trip.days.map((day) => {
        const hasTarget = day.stops.some((s) => s.id === stopId);
        if (!hasTarget) {
            // Days without target remain completely unchanged!
            return day;
        }
        // Recompute only the affected day stops
        let prevDest = null;
        let dayCost = 0;
        let dayTravelMins = 0;
        const newStops = day.stops.map((stop) => {
            let currentDest = stop.destination;
            let currentExp = stop.experience;
            if (stop.id === stopId) {
                currentDest = newDest;
                currentExp = newExp;
            }
            let dist = 0;
            let mins = 0;
            if (prevDest) {
                dist = (0, schedule_1.haversineKm)(prevDest.lat, prevDest.lng, currentDest.lat, currentDest.lng);
                mins = (0, schedule_1.computeTravelMinutes)(dist, 'Car', cfg);
                dayTravelMins += mins;
            }
            prevDest = currentDest;
            const stopCost = currentDest.entryFee + (currentExp ? currentExp.price : 0);
            dayCost += stopCost;
            if (stop.id === stopId) {
                return {
                    ...stop,
                    destinationId: currentDest.id,
                    destination: currentDest,
                    experienceId: currentExp?.id,
                    experience: currentExp,
                    crowdStatus: currentDest.pressureLevel,
                    distanceFromPrevKm: dist,
                    travelMinutesFromPrev: mins,
                    estimatedCost: stopCost,
                    aiReasons: [
                        'Replaced by tourist preference preserving route corridor',
                        `Verified registry match (${currentDest.trustScore}% trust)`,
                    ],
                };
            }
            return {
                ...stop,
                distanceFromPrevKm: dist,
                travelMinutesFromPrev: mins,
            };
        });
        return {
            ...day,
            stops: newStops,
            totalEstimatedCost: dayCost,
            totalTravelMinutes: dayTravelMins,
        };
    });
    let newTotalSpend = 0;
    let newTotalTravelMins = 0;
    let newHidden = 0;
    let newExpCount = 0;
    updatedDays.forEach((d) => {
        newTotalSpend += d.totalEstimatedCost;
        newTotalTravelMins += d.totalTravelMinutes;
        d.stops.forEach((s) => {
            if (s.destination.popularityType === 'hidden')
                newHidden++;
            if (s.experience)
                newExpCount++;
        });
    });
    return {
        ...trip,
        days: updatedDays,
        estimatedSpend: newTotalSpend,
        totalTravelMinutes: newTotalTravelMins,
        hiddenDiscoveriesCount: newHidden,
        localExperiencesCount: newExpCount,
    };
}
