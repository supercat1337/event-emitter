export const ORIGINAL: unique symbol;
/**
 * @template {string | Record<string, any[]>} [Events=string]
 */
export class EventEmitterLite<Events extends string | Record<string, any[]> = string> {
    /**
     * @type {Object.<Events extends string ? Events : keyof Events, Function[]>}
     */
    events: any;
    /**
     * logErrors indicates whether errors thrown by listeners should be logged to the console.
     * @type {boolean}
     */
    logErrors: boolean;
    /**
     * on is used to add a callback function that's going to be executed when the event is triggered
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {() => void}
     */
    on<K extends Events extends string ? Events : keyof Events>(event: K, listener: Function): () => void;
    /**
     * Add a one-time listener
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     * @returns {()=>void}
     */
    once<K extends Events extends string ? Events : keyof Events>(event: K, listener: Function): () => void;
    /**
     * off is an alias for removeListener
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    off<K extends Events extends string ? Events : keyof Events>(event: K, listener: Function): void;
    /**
     * Remove an event listener from an event
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {Function} listener
     */
    removeListener<K extends Events extends string ? Events : keyof Events>(event: K, listener: Function): void;
    /**
     * emit is used to trigger an event
     * @template {Events extends string ? Events : keyof Events} K
     * @param {K} event
     * @param {...any} args
     */
    emit<K extends Events extends string ? Events : keyof Events>(event: K, ...args: any[]): void;
}
