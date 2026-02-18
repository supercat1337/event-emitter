/**
 * @template {string | Record<string, any[]>} [Events=string]
 * @extends {EventEmitterLite<Events>}
 */
export class EventEmitter<Events extends string | Record<string, any[]> = string> extends EventEmitterLite<Events> {
    /**
     * Is the event emitter destroyed?
     * @type {boolean}
     */
    get isDestroyed(): boolean;
    /**
     * Wait for a specific event to be emitted.
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event - The event to wait for.
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, waits indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if event emitted, false on timeout.
     */
    waitForEvent<K extends Events extends string ? Events : keyof Events>(event: K, max_wait_ms?: number): Promise<boolean>;
    /**
     * Wait for any of the specified events to be emitted.
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K[]} events - Array of event names.
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms.
     * @returns {Promise<boolean>} - Resolves with true if any event emitted, false on timeout.
     */
    waitForAnyEvent<K extends Events extends string ? Events : keyof Events>(events: K[], max_wait_ms?: number): Promise<boolean>;
    /**
     * Clear all events
     */
    clear(): void;
    /**
     * Destroys the event emitter, clearing all events and listeners.
     */
    destroy(): void;
    /**
     * Clears all listeners for a specified event.
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     */
    clearEventListeners<K extends Events extends string ? Events : keyof Events>(event: K): void;
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
import { EventEmitterLite } from './event-emitter-lite.js';
