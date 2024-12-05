// @ts-check
/** @module EventEmitter */

/**
 * @template {string} T
 */
class EventEmitter {
    /** @type {Object.<string, Function[]>} */
    events = {};

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {T|"#has-listeners"|"#no-listeners"} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    on(event, listener) {

        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);

        let that = this;

        let unsubscriber = function () {
            that.removeListener(event, listener);
        };

        if (!/^(#has-listeners|#no-listeners)$/.test(event) && this.events[event].length == 1) { 
            this.emit("#has-listeners", event);
        }

        return unsubscriber;
    }
    /**
     * Remove an event listener from an event
     * @param {T|"#has-listeners"|"#no-listeners"} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        var idx;

        if (typeof this.events[event] === 'object') {
            idx = this.events[event].indexOf(listener);

            if (idx > -1) {
                this.events[event].splice(idx, 1);

                if (!/^(#has-listeners|#no-listeners)$/.test(event) && this.events[event].length == 0) {
                    this.emit("#no-listeners", event);
                }
            }
        }

    }
    /**
     * emit is used to trigger an event
     * @param {T|"#has-listeners"|"#no-listeners"} event
     */
    emit(event) {
        if (typeof this.events[event] !== 'object') return;

        var i, listeners, length, args = [].slice.call(arguments, 1);

        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {

            try {
                listeners[i].apply(this, args);
            }
            catch (e) {
                console.error(event, args);
                console.error(e);
            }

        }
    }

    /**
     * Add a one-time listener
     * @param {T|"#has-listeners"|"#no-listeners"} event
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
        this.clear();
    }

    /**
     * Clears all listeners for a specified event.
     * @param {T|"#has-listeners"|"#no-listeners"} event - The event for which to clear all listeners.
     */
    clearEventListeners(event) {
        let listeners = this.events[event] || [];
        let listenersCount = listeners.length;

        if (listenersCount > 0) {
            this.events[event] = [];
            this.emit("#no-listeners", event);
        }
    }

    /**
     * onHasEventListeners() is used to subscribe to the "#has-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 0 to 1.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onHasEventListeners(callback) {
        return this.on("#has-listeners", callback);
    }

    /**
     * onNoEventListeners() is used to subscribe to the "#no-listeners" event. This event is emitted when the number of listeners for any event (except "#has-listeners" and "#no-listeners") goes from 1 to 0.
     * @param {Function} callback
     * @returns {()=>void}
     */
    onNoEventListeners(callback) {
        return this.on("#no-listeners", callback);
    }
}

export { EventEmitter };
