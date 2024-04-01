class EventEmitter {
  /** @type {Object.<string, TListener[]>} */
  events = {};
  /**
   * @param {string} event
   * @param {TListener} listener
   * @returns {Unsubscriber}
   */
  on(event, listener) {
    if (typeof this.events[event] !== "object") {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    let that = this;
    let unsubscriber = function() {
      that.removeListener(event, listener);
    };
    return unsubscriber;
  }
  /**
   * @param {string} event
   * @param {TListener} listener
   */
  removeListener(event, listener) {
    var idx;
    if (typeof this.events[event] === "object") {
      idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }
  /**
   * @param {string} event
   */
  emit(event) {
    if (typeof this.events[event] !== "object")
      return;
    var i, listeners, length, args = [].slice.call(arguments, 1);
    listeners = this.events[event].slice();
    length = listeners.length;
    for (i = 0; i < length; i++) {
      try {
        listeners[i].apply(this, args);
      } catch (e) {
        console.error(event, args);
        console.error(e);
      }
    }
  }
  /**
   * @param {string} event
   * @param {TListener} listener
   * @returns {Unsubscriber}
   */
  once(event, listener) {
    return this.on(event, function g() {
      this.removeListener(event, g);
      listener.apply(this, arguments);
    });
  }
}
export { EventEmitter };
