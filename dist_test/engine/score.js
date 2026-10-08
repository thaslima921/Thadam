"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreDestinationFactors = scoreDestinationFactors;
function scoreDestinationFactors(dest, prefs, experiences, cfg) {
    const w = cfg.scoreWeights;
    // 1. Intent (30 pts max)
    let matchingTags = 0;
    for (const tag of dest.tags) {
        if (prefs.interests.includes(tag)) {
            matchingTags++;
        }
    }
    const intentScore = prefs.interests.length > 0
        ? (matchingTags / prefs.interests.length) * w.intent
        : (w.intent * 0.7);
    // 2. Destination Preference (Famous/Moderate/Hidden) (15 pts max)
    let mixShare = 33;
    if (dest.popularityType === 'famous')
        mixShare = prefs.destinationMix.famous;
    else if (dest.popularityType === 'moderate')
        mixShare = prefs.destinationMix.moderate;
    else if (dest.popularityType === 'hidden')
        mixShare = prefs.destinationMix.hidden;
    const destinationPrefScore = (mixShare / 100) * w.destinationPref;
    // 3. Capacity Suitability (15 pts max)
    const capacityScore = Math.min(w.capacity, (dest.capacity / 2000) * w.capacity);
    // 4. Pressure / Crowd (15 pts max)
    let pressureNormalized = 0.7;
    if (prefs.crowdPreference === 'Low') {
        if (dest.pressureLevel === 'LOW')
            pressureNormalized = 1.0;
        else if (dest.pressureLevel === 'MODERATE')
            pressureNormalized = 0.6;
        else
            pressureNormalized = 0.3;
    }
    else if (prefs.crowdPreference === 'Moderate') {
        pressureNormalized = dest.pressureLevel === 'HIGH' ? 0.6 : 0.9;
    }
    else {
        pressureNormalized = 0.85;
    }
    const pressureScore = pressureNormalized * w.pressure;
    // 5. Trust (10 pts max)
    const trustScore = (dest.trustScore / 100) * w.trust;
    // 6. Local Value (experiences attached) (10 pts max)
    const hasExp = experiences.some((e) => e.destinationId === dest.id && e.status === 'ACTIVE');
    const localValueScore = hasExp ? w.localValue : (w.localValue * 0.4);
    // 7. Accessibility (5 pts max)
    let accessCount = 0;
    if (dest.accessibility.wheelchair)
        accessCount++;
    if (dest.accessibility.familyFriendly)
        accessCount++;
    if (dest.accessibility.seniorFriendly)
        accessCount++;
    const accessibilityScore = (accessCount / 3) * w.accessibility;
    const totalScore = Math.round(intentScore +
        destinationPrefScore +
        capacityScore +
        pressureScore +
        trustScore +
        localValueScore +
        accessibilityScore);
    return {
        intentScore,
        destinationPrefScore,
        capacityScore,
        pressureScore,
        trustScore,
        localValueScore,
        accessibilityScore,
        totalScore,
    };
}
