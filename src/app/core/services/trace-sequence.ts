/**
 * Timeline for the phone version of the hero's "request trace": one request travelling through
 * five services, then the response, on a loop. No canvas; the component turns each state into
 * CSS classes and a custom property, and CSS transitions do the motion.
 *
 * `step`: -1 idle, 0 request sent, 1..5 the service the request has reached, 6 response back.
 * `pos`:  which service row the glowing packet is at (0 = above the first row).
 */
export interface TraceState {
  step: number;
  pos: number;
}

export const TRACE_SERVICES = 5;
/** How long the packet takes to travel between two rows; the CSS transition uses the same value. */
export const TRAVEL_MS = 800;
const HOLD_MS = 180;
const IDLE_MS = 700;
const SENT_MS = 300;
const REST_MS = 2600;

/** Every state change in one cycle, with the time (ms from the start of the cycle) it happens at. */
export function traceFrames(): { at: number; state: TraceState }[] {
  const frames: { at: number; state: TraceState }[] = [{ at: 0, state: { step: -1, pos: 0 } }];
  let t = IDLE_MS;
  frames.push({ at: t, state: { step: 0, pos: 0 } });
  t += SENT_MS;
  for (let k = 1; k <= TRACE_SERVICES; k++) {
    frames.push({ at: t, state: { step: k - 1, pos: k } }); // packet leaves for row k
    t += TRAVEL_MS;
    frames.push({ at: t, state: { step: k, pos: k } }); // ...arrives; the row lights up
    t += HOLD_MS;
  }
  frames.push({ at: t, state: { step: TRACE_SERVICES + 1, pos: TRACE_SERVICES } }); // response
  return frames;
}

export const TRACE_CYCLE_MS = traceFrames().at(-1)!.at + REST_MS;

/** Runs the timeline on a loop and returns a function that stops it. */
export function runTraceSequence(emit: (state: TraceState) => void): () => void {
  const frames = traceFrames();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;

  const later = (ms: number, fn: () => void) => {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!stopped) fn();
    }, ms);
    timers.add(id);
  };

  const cycle = () => {
    for (const f of frames) later(f.at, () => emit(f.state));
    later(TRACE_CYCLE_MS, cycle);
  };
  cycle();

  return () => {
    stopped = true;
    timers.forEach(clearTimeout);
    timers.clear();
  };
}
