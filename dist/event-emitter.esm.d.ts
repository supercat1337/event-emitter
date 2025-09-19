/** @module EventEmitter */
/**
 * @template {string} T
 */
export class EventEmitter<T extends string> {
    /**
     * Object that holds events and their listeners
     * @type {Object.<string, Function[]>}
     */
    events: {
        [x: string]: Function[];
    };
    /**
     * logErrors indicates whether errors thrown by listeners should be logged to the console.
     * @type {boolean}
     */
    logErrors: boolean;
    /**
     * Is the event emitter destroyed?
     * @type {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    on(event: T, listener: Function): () => void;
    /**
     * off is an alias for removeListener
     * @param {T} event
     * @param {Function} listener
     */
    off(event: T, listener: Function): void;
    /**
     * Remove an event listener from an event
     * @param {T} event
     * @param {Function} listener
     */
    removeListener(event: T, listener: Function): void;
    /**
     * emit is used to trigger an event
     * @param {T} event
     * @param {...any} args
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
    /**
     * Clear all events
     */
    clear(): void;
    /**
     * Destroys the event emitter, clearing all events and listeners.
     * @alias clear
     */
    destroy(): void;
    /**
     * Clears all listeners for a specified event.
     * @param {T} event - The event for which to clear all listeners.
     */
    clearEventListeners(event: T): void;
    /**
     * onHasEventListeners() is used to subscribe to the "#has-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 0 to 1.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onHasEventListeners(callback: Function): () => void;
    /**
     * onNoEventListeners() is used to subscribe to the "#no-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 1 to 0.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onNoEventListeners(callback: Function): () => void;
    /**
     * onListenerError() is used to subscribe to the "#listener-error" event. This event is emitted when any listener throws an error.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onListenerError(callback: Function): () => void;
    #private;
}
//# sourceMappingURL=event-emitter.esm.d.ts.map