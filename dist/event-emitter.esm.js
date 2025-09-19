// @ts-check
/** @module EventEmitter */

/**
 * @template {string} T
 */
class EventEmitter {
    /**
     * Object that holds events and their listeners
     * @type {Object.<string, Function[]>}
     */
    events = {};

    /** @type {Object.<"#has-listeners"|"#no-listeners"|"#listener-error", Function[]>} */
    #internalEvents = {
        "#has-listeners": [],
        "#no-listeners": [],
        "#listener-error": [],
    };

    #isDestroyed = false;

    /**
     * logErrors indicates whether errors thrown by listeners should be logged to the console.
     * @type {boolean}
     */
    logErrors = true;

    /**
     * Is the event emitter destroyed?
     * @type {boolean}
     */
    get isDestroyed() {
        return this.#isDestroyed;
    }

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    on(event, listener) {
        if (this.#isDestroyed) {
            throw new Error("EventEmitter is destroyed");
        }

        if (typeof this.events[event] !== "object") {
            this.events[event] = [];
        }

        this.events[event].push(listener);

        let that = this;

        let unsubscriber = function () {
            that.removeListener(event, listener);
        };

        if (this.events[event].length == 1) {
            this.#emitInternal("#has-listeners", event);
        }

        return unsubscriber;
    }

    /**
     * Internal method to add a listener to an internal event
     * @param {"#has-listeners"|"#no-listeners"|"#listener-error"} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    #onInternalEvent(event, listener) {
        if (typeof this.#internalEvents[event] !== "object") {
            return;
        }
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
        var idx;

        if (typeof this.#internalEvents[event] === "object") {
            idx = this.#internalEvents[event].indexOf(listener);

            if (idx > -1) {
                this.#internalEvents[event].splice(idx, 1);
            }
        }
    }

    /**
     * off is an alias for removeListener
     * @param {T} event
     * @param {Function} listener
     */
    off(event, listener) {
        return this.removeListener(event, listener);
    }

    /**
     * Remove an event listener from an event
     * @param {T} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        if (this.#isDestroyed) {
            return;
        }
        var idx;

        if (!this.events[event]) return;
        idx = this.events[event].indexOf(listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);

            if (this.events[event].length == 0) {
                this.#emitInternal("#no-listeners", event);
            }
        }
    }

    /**
     * emit is used to trigger an event
     * @param {T} event
     */
    emit(event) {
        if (this.#isDestroyed) {
            return;
        }

        if (typeof this.events[event] !== "object") return;

        var i,
            listeners,
            length,
            args = [].slice.call(arguments, 1);

        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            try {
                listeners[i].apply(this, args);
            } catch (e) {
                this.#emitInternal("#listener-error", e, event, ...args);
                if (this.logErrors) {
                    console.error(`Error in listener for event "${event}":`, e);
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
        if (this.#isDestroyed) {
            return;
        }

        if (typeof this.#internalEvents[event] !== "object") return;

        var i, listeners, length;

        listeners = this.#internalEvents[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            try {
                listeners[i].apply(this, args);
            } catch (e) {
                this.#emitInternal("#listener-error", e, event, ...args);
                if (this.logErrors) {
                    console.error(
                        `Error in listener for internal event "${event}":`,
                        e
                    );
                }
            }
        }
    }

    /**
     * Add a one-time listener
     * @param {T} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event, listener) {
        return this.on(event, function g() {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    }

    /**
     * Wait for an event to be emitted
     * @param {T} event
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if the event was emitted, false if the time ran out.
     */
    waitForEvent(event, max_wait_ms = 0) {
        if (this.#isDestroyed) {
            throw new Error("EventEmitter is destroyed");
        }

        return new Promise((resolve) => {
            let timeout;

            let unsubscriber = this.on(event, () => {
                if (max_wait_ms > 0) {
                    clearTimeout(timeout);
                }

                unsubscriber();
                resolve(true);
            });

            if (max_wait_ms > 0) {
                timeout = setTimeout(() => {
                    unsubscriber();
                    resolve(false);
                }, max_wait_ms);
            }
        });
    }

    /**
     * Wait for any of the specified events to be emitted
     * @param {T[]} events - Array of event names to wait for
     * @param {number} [max_wait_ms=0] - Maximum time to wait in ms. If 0, the function will wait indefinitely.
     * @returns {Promise<boolean>} - Resolves with true if any event was emitted, false if the time ran out.
     */
    waitForAnyEvent(events, max_wait_ms = 0) {
        if (this.#isDestroyed) {
            throw new Error("EventEmitter is destroyed");
        }

        return new Promise((resolve) => {
            let timeout;

            /** @type {Function[]} */
            let unsubscribers = [];

            const main_unsubscriber = () => {
                if (max_wait_ms > 0) {
                    clearTimeout(timeout);
                }

                unsubscribers.forEach((unsubscriber) => {
                    unsubscriber();
                });

                resolve(true);
            };

            events.forEach((event) => {
                unsubscribers.push(this.on(event, main_unsubscriber));
            });

            if (max_wait_ms > 0) {
                timeout = setTimeout(() => {
                    main_unsubscriber();
                    resolve(false);
                }, max_wait_ms);
            }
        });
    }

    /**
     * Clear all events
     */
    clear() {
        this.events = {};
    }

    /**
     * Destroys the event emitter, clearing all events and listeners.
     * @alias clear
     */
    destroy() {
        if (this.#isDestroyed) {
            return;
        }

        this.#isDestroyed = true;
        this.#internalEvents = {
            "#has-listeners": [],
            "#no-listeners": [],
            "#listener-error": [],
        };
        this.events = {};
    }

    /**
     * Clears all listeners for a specified event.
     * @param {T} event - The event for which to clear all listeners.
     */
    clearEventListeners(event) {
        let listeners = this.events[event] || [];
        let listenersCount = listeners.length;

        if (listenersCount > 0) {
            this.events[event] = [];
            this.#emitInternal("#no-listeners", event);
        }
    }

    /**
     * onHasEventListeners() is used to subscribe to the "#has-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 0 to 1.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onHasEventListeners(callback) {
        if (this.#isDestroyed) {
            throw new Error("EventEmitter is destroyed");
        }
        return this.#onInternalEvent("#has-listeners", callback);
    }

    /**
     * onNoEventListeners() is used to subscribe to the "#no-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 1 to 0.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onNoEventListeners(callback) {
        if (this.#isDestroyed) {
            throw new Error("EventEmitter is destroyed");
        }
        return this.#onInternalEvent("#no-listeners", callback);
    }

    /**
     * onListenerError() is used to subscribe to the "#listener-error" event. This event is emitted when any listener throws an error.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onListenerError(callback) {
        if (this.#isDestroyed) {
            throw new Error("EventEmitter is destroyed");
        }
        return this.#onInternalEvent("#listener-error", callback);
    }
}

export { EventEmitter };
