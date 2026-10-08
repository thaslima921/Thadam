"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineKm = haversineKm;
exports.computeTravelMinutes = computeTravelMinutes;
exports.getStopSlot = getStopSlot;
// Straight-line distance (Haversine)
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
// Travel time = straight-line distance x 1.3, divided by speed for transport mode
function computeTravelMinutes(distanceKm, transport, cfg) {
    const roadDistanceKm = distanceKm * 1.3;
    const speed = cfg.transportSpeedsKmH[transport] || 40;
    const hours = roadDistanceKm / speed;
    return Math.max(10, Math.round(hours * 60));
}
// Generate time slot strings starting at 09:00 with lunch slot
function getStopSlot(orderIndex, durationMinutes) {
    // Slots:
    // 0 -> 09:00 AM - 11:30 AM
    // 1 -> 11:45 AM - 01:15 PM
    // Lunch slot: 01:15 PM - 02:30 PM
    // 2 -> 02:45 PM - 05:00 PM
    // 3 -> 05:15 PM - 07:15 PM
    switch (orderIndex) {
        case 0:
            return { startTime: '09:00 AM', endTime: '11:30 AM' };
        case 1:
            return { startTime: '11:45 AM', endTime: '01:15 PM' };
        case 2:
            return { startTime: '02:45 PM', endTime: '05:00 PM' };
        case 3:
            return { startTime: '05:15 PM', endTime: '07:15 PM' };
        default:
            return { startTime: '07:30 PM', endTime: '09:00 PM' };
    }
}
