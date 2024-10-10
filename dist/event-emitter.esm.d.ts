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
}
//# sourceMappingURL=event-emitter.esm.d.ts.map