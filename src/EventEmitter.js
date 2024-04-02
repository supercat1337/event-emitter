// @ts-check
/** @module EventEmitter */

class EventEmitter {
    /** @type {Object.<string, Function[]>} */
    events = {};

    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @param {string} event
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

        return unsubscriber;
    }
    /**
     * Remove an event listener from an event
     * @param {string} event
     * @param {Function} listener
     */
    removeListener(event, listener) {
        var idx;

        if (typeof this.events[event] === 'object') {
            idx = this.events[event].indexOf(listener);

            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }

    }
    /**
     * emit is used to trigger an event
     * @param {string} event
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
     * @param {string} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once(event, listener) {
        return this.on(event, function g() {
            this.removeListener(event, g);
            listener.apply(this, arguments);
        });
    }
}

export { EventEmitter };
