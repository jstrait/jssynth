"use strict";

import { Envelope } from "./../../src/synth_core/envelope";

describe("Envelope", () => {
  test("calculates correctly when envelope is effectively a no-op", () => {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.001);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 1.1)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.025, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.05, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.075, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.1, 1.1)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.11, 1.1)).toEqual(0.0);
  });

  test("calculates correctly when attack time is longer than note duration", () => {
    var envelopeConfig = {
      attackTime: 0.2,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 1.1);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.1);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.25);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.1);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.2500000000000003);

    expect(calculatedEnvelope.valueAtTime(0.5, 1.1)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 1.1)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.025, 1.1)).toBeCloseTo(0.0625);
    expect(calculatedEnvelope.valueAtTime(1.05, 1.1)).toBeCloseTo(0.125);
    expect(calculatedEnvelope.valueAtTime(1.075, 1.1)).toBeCloseTo(0.1875);
    expect(calculatedEnvelope.valueAtTime(1.1, 1.1)).toBeCloseTo(0.25);
    expect(calculatedEnvelope.valueAtTime(1.11, 1.1)).toEqual(0.0);
  });

  test("calculates correctly when attack time is shorter than note duration ", () => {
    var envelopeConfig = {
      attackTime: 0.5,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.501);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.0);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.125, 2.0)).toEqual(0.125);
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(1.375, 2.0)).toEqual(0.375);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Attack end, decay start
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  test("calculates correctly when decay ends before note ends", () => {
    var envelopeConfig = {
      attackTime: 0.5,
      decayTime: 0.25,
      sustainPercentage: 0.5,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.75);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.25);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.0);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Attack end, decay start
    expect(calculatedEnvelope.valueAtTime(1.5625, 2.0)).toEqual(0.4375);
    expect(calculatedEnvelope.valueAtTime(1.625, 2.0)).toEqual(0.375);
    expect(calculatedEnvelope.valueAtTime(1.6875, 2.0)).toEqual(0.3125);
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.25);   // Decay end
    expect(calculatedEnvelope.valueAtTime(1.875, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.25);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  test("calculates correctly when decay is a no-op because sustain is 100%", () => {
    var envelopeConfig = {
      attackTime: 0.5,
      decayTime: 1.0,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.5);
    expect(calculatedEnvelope.attackEndAmplitude).toEqual(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.0);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Attack end, decay start
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  test("calculates correctly when decay ends before gate off, but is a no-op due to sustain volume", () => {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime: 0.5,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.5);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.5);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.125, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.375, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Decay end
    expect(calculatedEnvelope.valueAtTime(1.625, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.875, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  test("calculates correctly when decay ends after gate off, but is a no-op due to sustain volume", () => {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime:1.5,
      sustainPercentage: 1.0,
      releaseTime: 0.0,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBeCloseTo(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(2.0);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.5);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.125, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.25, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.375, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);   // Decay end
    expect(calculatedEnvelope.valueAtTime(1.625, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.75, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(1.875, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.01, 2.0)).toEqual(0.0);
  });

  test("calculates correctly when there is a release portion of the envelope", () => {
    var envelopeConfig = {
      attackTime: 0.0,
      decayTime: 0.0,
      sustainPercentage: 1.0,
      releaseTime: 0.5,
    };

    var calculatedEnvelope = Envelope(0.5, envelopeConfig, 1.0, 2.0);

    expect(calculatedEnvelope.attackEndTime).toEqual(1.0);
    expect(calculatedEnvelope.attackEndAmplitude).toBe(0.5);
    expect(calculatedEnvelope.decayEndTime).toEqual(1.001);
    expect(calculatedEnvelope.decayEndAmplitude).toEqual(0.5);

    expect(calculatedEnvelope.valueAtTime(0.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(1.0, 2.0)).toEqual(0.5);   // Attack start
    expect(calculatedEnvelope.valueAtTime(1.5, 2.0)).toEqual(0.5);
    expect(calculatedEnvelope.valueAtTime(2.0, 2.0)).toEqual(0.5);   // Release start
    expect(calculatedEnvelope.valueAtTime(2.125, 2.0)).toEqual(0.375);
    expect(calculatedEnvelope.valueAtTime(2.25, 2.0)).toEqual(0.25);
    expect(calculatedEnvelope.valueAtTime(2.375, 2.0)).toEqual(0.125);
    expect(calculatedEnvelope.valueAtTime(2.5, 2.0)).toEqual(0.0);
    expect(calculatedEnvelope.valueAtTime(2.6, 2.0)).toEqual(0.0);
  });
});
