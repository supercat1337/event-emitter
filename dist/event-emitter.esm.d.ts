/** @module EventEmitter */
/**
 * @template {string} T
 */
export class EventEmitter<T extends string> {
    /** @type {Object.<string, Function[]>} */
    events: {
        [x: string]: Function[];
    };
    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    on(event: T, listener: Function): () => void;
    /**
     * Remove an event listener from an event
     * @param {T} event
     * @param {Function} listener
     */
    removeListener(event: T, listener: Function): void;
    /**
     * emit is used to trigger an event
     * @param {T} event
     */
    emit(event: T, ...args: any[]): void;
    /**
     * Add a one-time listener
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event: T, listener: Function): () => void;
    /**
     * Wait for an event to be emitted
     * @param {T} event
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if the event was emitted, false if the time ran out.
     */
    waitForEvent(event: T, max_wait_ms?: number): Promise<boolean>;
    /**
     * Wait for any of the specified events to be emitted
     * @param {T[]} events - Array of event names to wait for
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if any event was emitted, false if the time ran out.
     */
    waitForAnyEvent(events: T[], max_wait_ms?: number): Promise<boolean>;
}
//# sourceMappingURL=event-emitter.esm.d.ts.map