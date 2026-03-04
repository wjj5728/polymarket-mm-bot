type BreakerState = {
  consecutiveFailures: number;
  openUntil: number;
};

const state: BreakerState = {
  consecutiveFailures: 0,
  openUntil: 0,
};

let recoveryMessage: string | null = null;

export function isCircuitOpen(now = Date.now()) {
  return now < state.openUntil;
}

export function onExchangeSuccess(now = Date.now()) {
  const wasOpen = now < state.openUntil || state.consecutiveFailures > 0;
  state.consecutiveFailures = 0;
  state.openUntil = 0;
  if (wasOpen) {
    recoveryMessage = "exchange circuit recovered";
  }
}

export function onExchangeFailure(now = Date.now()) {
  const threshold = Number(process.env.EXCHANGE_FAILURE_THRESHOLD || 5);
  const coolDownSec = Number(process.env.EXCHANGE_CIRCUIT_COOLDOWN_SEC || 30);

  state.consecutiveFailures += 1;

  if (state.consecutiveFailures >= threshold) {
    state.openUntil = now + coolDownSec * 1000;
    return {
      opened: true as const,
      reason: `circuit opened after ${state.consecutiveFailures} failures for ${coolDownSec}s`,
    };
  }

  return {
    opened: false as const,
    reason: `failure count ${state.consecutiveFailures}/${threshold}`,
  };
}

export function getBreakerState(now = Date.now()) {
  return {
    consecutiveFailures: state.consecutiveFailures,
    isOpen: now < state.openUntil,
    openUntil: state.openUntil,
  };
}

export function consumeRecoveryMessage() {
  const value = recoveryMessage;
  recoveryMessage = null;
  return value;
}
