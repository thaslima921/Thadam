"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = __importDefault(require("node:test"));
const destinations_ts_1 = require("../../data/destinations.ts");
const experiences_ts_1 = require("../../data/experiences.ts");
const config_ts_1 = require("../config.ts");
const generate_ts_1 = require("../generate.ts");
const replace_ts_1 = require("../replace.ts");
const facilities_ts_1 = require("../facilities.ts");
const preferences_ts_1 = require("../../types/preferences.ts");
(0, node_test_1.default)('Engine: Generate 4-day demo trip under budget with hidden places and experiences', () => {
    const data = {
        destinations: destinations_ts_1.DESTINATIONS,
        experiences: experiences_ts_1.EXPERIENCES,
    };
    const { trip, stageLogs } = (0, generate_ts_1.generateTrip)(preferences_ts_1.DEFAULT_PREFERENCES, data, config_ts_1.DEFAULT_ENGINE_CONFIG);
    // 1. Duration check
    strict_1.default.equal(trip.daysCount, 4, 'Trip must have exactly 4 days');
    strict_1.default.equal(trip.days.length, 4, 'Trip days array must contain 4 days');
    // 2. Budget check (against Rs 10,000)
    strict_1.default.ok(trip.estimatedSpend > 0, 'Estimated spend should be positive');
    strict_1.default.ok(trip.budget === 10000, 'Budget should be 10000');
    // 3. Hidden places & Experiences count
    strict_1.default.ok(trip.hiddenDiscoveriesCount >= 2, `Expected at least 2 hidden places, found ${trip.hiddenDiscoveriesCount}`);
    strict_1.default.ok(trip.localExperiencesCount >= 2, `Expected at least 2 local experiences, found ${trip.localExperiencesCount}`);
    // 4. Every stop has at least 3 explanation reasons
    for (const day of trip.days) {
        for (const stop of day.stops) {
            strict_1.default.ok(stop.explanationReasons.length >= 3, `Stop ${stop.destination.name} must have at least 3 explanation reasons, had ${stop.explanationReasons.length}`);
        }
    }
    // 5. Stage logs produced
    strict_1.default.ok(stageLogs.length >= 5, 'Stage logs should be populated');
});
(0, node_test_1.default)('Engine: Replace a stop on Day 2 leaves Days 1, 3, and 4 unchanged', () => {
    const data = {
        destinations: destinations_ts_1.DESTINATIONS,
        experiences: experiences_ts_1.EXPERIENCES,
    };
    const { trip } = (0, generate_ts_1.generateTrip)(preferences_ts_1.DEFAULT_PREFERENCES, data, config_ts_1.DEFAULT_ENGINE_CONFIG);
    const day1Before = JSON.stringify(trip.days[0].stops.map((s) => s.id));
    const day3Before = JSON.stringify(trip.days[2].stops.map((s) => s.id));
    const day4Before = JSON.stringify(trip.days[3].stops.map((s) => s.id));
    const targetStopId = trip.days[1].stops[0].id;
    const alternatives = (0, replace_ts_1.replaceStop)(trip, targetStopId, 'Too crowded', data, config_ts_1.DEFAULT_ENGINE_CONFIG);
    strict_1.default.ok(alternatives.length > 0, 'Should find at least 1 alternative option');
    const chosenAlt = alternatives[0];
    const updatedTrip = (0, replace_ts_1.applyReplacement)(trip, targetStopId, chosenAlt.destination.id, data, config_ts_1.DEFAULT_ENGINE_CONFIG, chosenAlt.experience);
    const day1After = JSON.stringify(updatedTrip.days[0].stops.map((s) => s.id));
    const day3After = JSON.stringify(updatedTrip.days[2].stops.map((s) => s.id));
    const day4After = JSON.stringify(updatedTrip.days[3].stops.map((s) => s.id));
    // Verify immutability of other days
    strict_1.default.equal(day1Before, day1After, 'Day 1 stops must remain identical');
    strict_1.default.equal(day3Before, day3After, 'Day 3 stops must remain identical');
    strict_1.default.equal(day4Before, day4After, 'Day 4 stops must remain identical');
    // Verify Day 2 stop was replaced
    strict_1.default.notEqual(updatedTrip.days[1].stops[0].destination.id, trip.days[1].stops[0].destination.id, 'Day 2 stop should be replaced');
});
(0, node_test_1.default)('Engine: Gangaikonda Cholapuram triggers remote or limited facility alert', () => {
    const p8 = destinations_ts_1.DESTINATIONS.find((d) => d.id === 'p8' || d.name.includes('Gangaikonda'));
    strict_1.default.ok(p8, 'Gangaikonda Cholapuram should exist in seed data');
    const facilityResult = (0, facilities_ts_1.evaluateFacilityCoverage)(p8.facilities, config_ts_1.DEFAULT_ENGINE_CONFIG);
    strict_1.default.ok(facilityResult.label === 'Remote' || facilityResult.label === 'Limited', `Expected Remote or Limited, got ${facilityResult.label}`);
    strict_1.default.ok(facilityResult.reason.includes('hospital') || facilityResult.reason.includes('km'), 'Reason should explain hospital distance');
});
