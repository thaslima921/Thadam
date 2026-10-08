"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ENGINE_CONFIG = void 0;
exports.DEFAULT_ENGINE_CONFIG = {
    scoreWeights: {
        intent: 30,
        destinationPref: 15,
        capacity: 15,
        pressure: 15,
        trust: 10,
        localValue: 10,
        accessibility: 5,
    },
    facilityThresholds: {
        hospitalKm: 20,
        pharmacyKm: 10,
        stayKm: 15,
        fuelKm: 15,
        remoteHospitalKm: 30,
    },
    transportSpeedsKmH: {
        Car: 45,
        Cab: 45,
        'Two-wheeler': 40,
        Bus: 30,
        Train: 50,
        Walking: 5,
    },
};
