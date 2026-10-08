"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainStop = explainStop;
function explainStop(dest, prefs, factors, experience) {
    const reasons = [];
    // Factor 1: Intent
    if (factors.intentScore >= 15) {
        const matched = dest.tags.filter((t) => prefs.interests.includes(t));
        if (matched.length > 0) {
            reasons.push(`Matches your interest in ${matched.slice(0, 2).join(' & ')}`);
        }
        else {
            reasons.push(`Selected based on your curated travel theme`);
        }
    }
    // Factor 2: Destination Preference
    if (dest.popularityType === 'hidden' && prefs.destinationMix.hidden >= 30) {
        reasons.push(`Verified lesser-known discovery (${dest.discoveryScore}/100 discovery index)`);
    }
    else if (dest.popularityType === 'famous' && prefs.destinationMix.famous >= 30) {
        reasons.push(`Iconic Tamil Nadu heritage landmark`);
    }
    else {
        reasons.push(`Balanced regional cultural stop`);
    }
    // Factor 3: Pressure / Crowd
    if (dest.pressureLevel === 'LOW') {
        reasons.push(`Low crowd pressure fits your tranquil travel style`);
    }
    else if (dest.pressureLevel === 'MODERATE') {
        reasons.push(`Moderate footfall with comfortable flow`);
    }
    else {
        reasons.push(`Popular landmark visit scheduled during optimal window`);
    }
    // Factor 4: Local Experience
    if (experience) {
        reasons.push(`Includes verified local workshop with ${experience.providerName}`);
    }
    // Factor 5: Trust
    if (dest.trustScore >= 95) {
        reasons.push(`Official verified registry record (${dest.trustScore}% trust index)`);
    }
    return reasons;
}
