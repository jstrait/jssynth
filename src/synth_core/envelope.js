"use strict";

export function Envelope(targetAttackAmplitude, envelopeConfig, gateOnTime, gateOffTime) {
  var attackEndTime = gateOnTime + envelopeConfig.attackTime;
  var attackEndAmplitude, attackEndAmplitudePercentage;
  var decayEndTime, decayEndAmplitude, decayEndAmplitudePercentage;
  var sustainAmplitude;
  var delta;

  var valueAtTime = function(rawTime, rawGateOffTime) {
    var time = rawTime - gateOnTime;
    var gateOffTime = rawGateOffTime - gateOnTime;
    var sustainAmplitude = targetAttackAmplitude * envelopeConfig.sustainPercentage;

    if (time < 0.0) {
      return 0.0;
    }
    else if (time > gateOffTime) {
      // In release portion
      if (time >= (gateOffTime + envelopeConfig.releaseTime)) {
        return 0.0;
      }
      else {
        return (1.0 - ((time - gateOffTime) / envelopeConfig.releaseTime)) * sustainAmplitude;
      }
    }
    else if (time <= envelopeConfig.attackTime) {
      // In attack portion
      if (envelopeConfig.attackTime === 0) {
        return targetAttackAmplitude;
      }
      else {
        return (time / envelopeConfig.attackTime) * targetAttackAmplitude;
      }
    }
    else if (time <= (envelopeConfig.attackTime + envelopeConfig.decayTime)) {
      // In decay portion
      return ((1.0 - ((time - envelopeConfig.attackTime) / envelopeConfig.decayTime)) * (targetAttackAmplitude - sustainAmplitude)) + sustainAmplitude;
    }
    else {
      // In sustain portion
      return sustainAmplitude;
    }
  };

  if (attackEndTime < gateOffTime) {
    attackEndAmplitude = targetAttackAmplitude;
  }
  else {
    attackEndAmplitudePercentage = ((gateOffTime - gateOnTime) / (attackEndTime - gateOnTime));
    attackEndAmplitude = targetAttackAmplitude * attackEndAmplitudePercentage;
    attackEndTime = gateOffTime;
  }

  decayEndTime = attackEndTime + Math.max(envelopeConfig.decayTime, 0.001);
  sustainAmplitude = targetAttackAmplitude * envelopeConfig.sustainPercentage;
  if (gateOffTime > decayEndTime) {
    decayEndAmplitude = sustainAmplitude;
  }
  else {
    decayEndAmplitudePercentage = ((gateOffTime - attackEndTime) / (decayEndTime - attackEndTime));
    decayEndTime = gateOffTime;

    delta = attackEndAmplitude - sustainAmplitude;
    decayEndAmplitude = attackEndAmplitude - (delta * decayEndAmplitudePercentage);
  }

  return {
    attackEndTime: attackEndTime,
    attackEndAmplitude: attackEndAmplitude,
    decayEndTime: decayEndTime,
    decayEndAmplitude: decayEndAmplitude,
    valueAtTime: valueAtTime,
  };
};
