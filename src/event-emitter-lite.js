// @ts-check

export const ORIGINAL = Symbol('original');

/**
 * @template {string | Record<string, any[]>} [Events=string]
 */
export class EventEmitterLite {
    /**
     * @type {Object.<Events extends string ? Events : keyof Events, Function[]>}
     */
    events = Object.create(null);

    /**
     * logErrors indicates whether errors thrown by listeners should be logged to the console.
     * @type {boolean}
     */
    logErrors = true;

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {() => void}
     */
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];

        this.events[event].push(listener);
        let unsubscriber = () => this.removeListener(event, listener);
        return unsubscriber;
    }

    /**
     * Add a one-time listener
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event, listener) {
        const wrapper = (/** @type {...any} */ ...args) => {
            this.removeListener(event, wrapper);
            listener.apply(this, args);
        };
        wrapper[ORIGINAL] = listener;
        return this.on(event, wrapper);
    }

    /**
     * off is an alias for removeListener
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    off(event, listener) {
        return this.removeListener(event, listener);
    }

    /**
     * Remove an event listener from an event
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        if (typeof listener !== 'function') return;

        const listeners = this.events[event];
        if (!listeners) return;

        // @ts-ignore
        const idx = listeners.findIndex(l => l === listener || l[ORIGINAL] === listener);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) delete this.events[event];
        }
    }

    /**
     * emit is used to trigger an event
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {...any} args
     */
    emit(event, ...args) {
        const listeners = this.events[event];
        if (!listeners) return;

        const queue = (this.events[event] || []).slice();
        var length = queue.length;

        for (let i = 0; i < length; i++) {
            try {
                queue[i].apply(this, args);
            } catch (e) {
                if (this.logErrors) {
                    console.error(`Error in listener for event "${String(event)}":`, e);
                }
            }
        }
    }
}
