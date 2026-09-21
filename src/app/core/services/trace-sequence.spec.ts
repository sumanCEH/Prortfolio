import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TRACE_CYCLE_MS,
  TRACE_SERVICES,
  TRAVEL_MS,
  TraceState,
  runTraceSequence,
  traceFrames,
} from './trace-sequence';

describe('trace sequence', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lights the services in order and ends with the response', () => {
    const frames = traceFrames();
    const steps = frames.map((f) => f.state.step);
    expect(steps[0]).toBe(-1);
    expect(steps.at(-1)).toBe(TRACE_SERVICES + 1);
    // Every service is reached exactly once with the packet already sitting on its row.
    for (let k = 1; k <= TRACE_SERVICES; k++) {
      const arrivals = frames.filter((f) => f.state.step === k && f.state.pos === k);
      expect(arrivals.length).toBe(1);
    }
  });

  it('never moves the packet backwards during a request', () => {
    const positions = traceFrames().map((f) => f.state.pos);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('lets the packet travel for the full transition time between rows', () => {
    const frames = traceFrames();
    const leave = frames.find((f) => f.state.pos === 2 && f.state.step === 1)!;
    const arrive = frames.find((f) => f.state.pos === 2 && f.state.step === 2)!;
    expect(arrive.at - leave.at).toBe(TRAVEL_MS);
  });

  it('emits on schedule, loops, and stops cleanly', () => {
    const seen: TraceState[] = [];
    const stop = runTraceSequence((s) => seen.push(s));

    vi.advanceTimersByTime(1);
    expect(seen.at(-1)).toEqual({ step: -1, pos: 0 });

    vi.advanceTimersByTime(TRACE_CYCLE_MS - 1);
    expect(seen.some((s) => s.step === TRACE_SERVICES + 1)).toBe(true);

    // A second cycle starts on its own.
    const before = seen.length;
    vi.advanceTimersByTime(TRACE_CYCLE_MS);
    expect(seen.length).toBeGreaterThan(before);

    stop();
    const afterStop = seen.length;
    vi.advanceTimersByTime(TRACE_CYCLE_MS * 2);
    expect(seen.length).toBe(afterStop);
    expect(vi.getTimerCount()).toBe(0);
  });
});
