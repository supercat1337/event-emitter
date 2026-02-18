// @ts-check
import { EventEmitterLite } from './event-emitter-lite.js';

/**
 * @template {string | Record<string, any[]>} [Events=string]
 * @extends {EventEmitterLite<Events>}
 */
export class EventEmitter extends EventEmitterLite {
    /** @type {Object.<"#has-listeners"|"#no-listeners"|"#listener-error", Function[]>} */
    #internalEvents = {
        '#has-listeners': [],
        '#no-listeners': [],
        '#listener-error': [],
    };

    #isDestroyed = false;
    #isReportingError = false; // Used to prevent infinite loop

    /**
     * Is the event emitter destroyed?
     * @type {boolean}
     */
    get isDestroyed() {
        return this.#isDestroyed;
    }

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    on(event, listener) {
        if (this.#isDestroyed) throw new Error('EventEmitter is destroyed');

        // Сheck if this is the first listener
        const isFirst = !this.events[event] || this.events[event].length === 0;

        const unsubscriber = super.on(event, listener);

        if (isFirst) {
            this.#emitInternal('#has-listeners', event);
        }

        return unsubscriber;
    }

    /**
     * Remove an event listener from an event
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        if (typeof listener !== 'function') return;
        if (this.#isDestroyed || !this.events[event]) return;

        super.removeListener(event, listener);

        // If this is the last listener
        if (!this.events[event]) {
            this.#emitInternal('#no-listeners', event);
        }
    }

    /**
     * Internal method to add a listener to an internal event
     * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    #onInternalEvent(event, listener) {
        this.#internalEvents[event].push(listener);

        let that = this;

        let unsubscriber = function () {
            that.#removeInternalListener(event, listener);
        };
        return unsubscriber;
    }

    /**
     * Internal method to remove a listener from an internal event
     * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
     * @param {Function} listener
     */
    #removeInternalListener(event, listener) {
        const listeners = this.#internalEvents[event];
        if (!listeners) return;

        // Check if the listener is in the array
        const idx = listeners.indexOf(listener);
        if (idx > -1) listeners.splice(idx, 1);
    }

    /**
     * emit is used to trigger an event
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {...any} args
     */
    emit(event, ...args) {
        if (this.#isDestroyed) {
            return;
        }

        if (typeof this.events[event] !== 'object') return;

        const listeners = [...this.events[event]];
        var length = listeners.length;

        for (var i = 0; i < length; i++) {
            try {
                listeners[i].apply(this, args);
            } catch (e) {
                this.#emitInternal('#listener-error', e, event, ...args);
                if (this.logErrors) {
                    console.error(`Error in listener for event "${String(event)}":`, e);
                }
            }
        }
    }

    /**
     * Internal function to emit an event
     * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
     * @param {...any} args
     */
    #emitInternal(event, ...args) {
        const listeners = this.#internalEvents[event];
        if (!listeners || listeners.length === 0) return;

        // Copy the array to avoid mutation
        const queue = listeners.slice();

        for (const fn of queue) {
            try {
                fn.apply(this, args);
            } catch (e) {
                if (event === '#listener-error' || this.#isReportingError) {
                    if (this.logErrors) {
                        console.error('Critical error in internal listener:', e);
                    }
                    continue;
                }

                this.#isReportingError = true;
                try {
                    this.#emitInternal('#listener-error', e, event, ...args);
                } finally {
                    this.#isReportingError = false;
                }
            }
        }
    }

    /**
     * Wait for a specific event to be emitted.
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event - The event to wait for.
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, waits indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if event emitted, false on timeout.
     */
    waitForEvent(event, max_wait_ms = 0) {
        return this.waitForAnyEvent([event], max_wait_ms);
    }

    /**
     * Wait for any of the specified events to be emitted.
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K[]} events - Array of event names.
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms.
     * @returns {Promise<boolean>} - Resolves with true if any event emitted, false on timeout.
     */
    waitForAnyEvent(events, max_wait_ms = 0) {
        if (this.#isDestroyed) throw new Error('EventEmitter is destroyed');

        return new Promise(resolve => {
            /** @type {NodeJS.Timeout} */
            let timeout;
            /** @type {Function[]} */
            const unsubscribers = [];

            const cleanup = () => {
                if (timeout) clearTimeout(timeout);
                unsubscribers.forEach(u => u());
            };

            const onEvent = () => {
                cleanup();
                resolve(true);
            };

            const uniqueEvents = [...new Set(events)];
            uniqueEvents.forEach(event => {
                unsubscribers.push(this.on(event, onEvent));
            });

            if (max_wait_ms > 0) {
                timeout = setTimeout(() => {
                    cleanup();
                    resolve(false);
                }, max_wait_ms);
            }
        });
    }

    /**
     * Clear all events
     */
    clear() {
        if (this.#isDestroyed) return;

        /** @type {(Events extends string ? Events : keyof Events)[]} */
        // @ts-ignore
        const eventNames = Object.keys(this.events);

        eventNames.forEach(event => {
            this.clearEventListeners(event);
        });
    }

    /**
     * Destroys the event emitter, clearing all events and listeners.
     */
    destroy() {
        if (this.#isDestroyed) return;
        this.clear();
        this.#isDestroyed = true;
        this.#internalEvents = {
            '#has-listeners': [],
            '#no-listeners': [],
            '#listener-error': [],
        };
        this.events = Object.create(null);
    }

    /**
     * Clears all listeners for a specified event.
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     */
    clearEventListeners(event) {
        if (this.#isDestroyed) return;

        const listeners = this.events[event];
        if (listeners && listeners.length > 0) {
            delete this.events[event];
            this.#emitInternal('#no-listeners', event);
        }
    }

    /**
     * onHasEventListeners() is used to subscribe to the "#has-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 0 to 1.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onHasEventListeners(callback) {
        if (this.#isDestroyed) {
            throw new Error('EventEmitter is destroyed');
        }
        return this.#onInternalEvent('#has-listeners', callback);
    }

    /**
     * onNoEventListeners() is used to subscribe to the "#no-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 1 to 0.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onNoEventListeners(callback) {
        if (this.#isDestroyed) {
            throw new Error('EventEmitter is destroyed');
        }
        return this.#onInternalEvent('#no-listeners', callback);
    }

    /**
     * onListenerError() is used to subscribe to the "#listener-error" event. This event is emitted when any listener throws an error.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onListenerError(callback) {
        if (this.#isDestroyed) {
            throw new Error('EventEmitter is destroyed');
        }
        return this.#onInternalEvent('#listener-error', callback);
    }
}
