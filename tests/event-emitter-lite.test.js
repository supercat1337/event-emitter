// @ts-check

import ava from 'ava';
import { EventEmitterLite } from '../src/event-emitter-lite.js'; 

/** @typedef {{ emitter: EventEmitterLite }} MyContext */
/** @typedef {import('ava').TestFn<MyContext>} TestFn */

const test = /** @type {TestFn} */ (ava);

test.beforeEach(t => {
    t.context.emitter = new EventEmitterLite();
});

test('on() should add listener and emit should call it', t => {
    const { emitter } = t.context;
    let called = false;
    emitter.on('test', () => {
        called = true;
    });
    emitter.emit('test');
    t.true(called);
});

test('emit() should pass arguments to listener', t => {
    const { emitter } = t.context;
    emitter.on(
        'test',
        /**  @param {number} a @param {string} b */ (a, b) => {
            t.is(a, 1);
            t.is(b, 'two');
        }
    );
    emitter.emit('test', 1, 'two');
});

test('once() should call listener only once', t => {
    const { emitter } = t.context;
    let count = 0;
    emitter.once('test', () => count++);
    emitter.emit('test');
    emitter.emit('test');
    t.is(count, 1);
});

test('once() should be removable via off() with original listener', t => {
    const { emitter } = t.context;
    let count = 0;
    function listener() {
        count++;
    }
    emitter.once('test', listener);
    emitter.off('test', listener); // remove listener
    emitter.emit('test');
    t.is(count, 0);
});

test('off() alias for removeListener should remove listener', t => {
    const { emitter } = t.context;
    let called = false;
    const fn = () => {
        called = true;
    };
    emitter.on('test', fn);
    emitter.off('test', fn);
    emitter.emit('test');
    t.false(called);
});

test('removeListener() should remove listener added via on()', t => {
    const { emitter } = t.context;
    let called = false;
    const fn = () => {
        called = true;
    };
    emitter.on('test', fn);
    emitter.removeListener('test', fn);
    emitter.emit('test');
    t.false(called);
});

test('unsubscriber returned by on() should remove listener', t => {
    const { emitter } = t.context;
    let called = false;
    const unsub = emitter.on('test', () => {
        called = true;
    });
    unsub();
    emitter.emit('test');
    t.false(called);
});

test('removeListener() should do nothing if listener not found', t => {
    const { emitter } = t.context;
    t.notThrows(() => {
        emitter.removeListener('test', () => {});
    });
});

test('emit() with no listeners should do nothing', t => {
    const { emitter } = t.context;
    t.notThrows(() => {
        emitter.emit('test');
    });
});

test('multiple listeners should all be called', t => {
    const { emitter } = t.context;
    let count = 0;
    const inc = () => count++;
    emitter.on('test', inc);
    emitter.on('test', inc);
    emitter.emit('test');
    t.is(count, 2);
});

test('listeners should be called in order of addition', t => {
    const { emitter } = t.context;
    /** @type {number[]} */
    const order = [];
    emitter.on('test', () => order.push(1));
    emitter.on('test', () => order.push(2));
    emitter.emit('test');
    t.deepEqual(order, [1, 2]);
});

test('removing listener during emit does not affect current iteration', t => {
    const { emitter } = t.context;
    let called = 0;
    const fn1 = () => {
        called++;
        emitter.removeListener('test', fn2); // remove fn2
    };
    const fn2 = () => {
        called++;
    };
    emitter.on('test', fn1);
    emitter.on('test', fn2);
    emitter.emit('test');
    t.is(called, 2); // fn2 called twice
});

test('adding listener during emit does not affect current iteration', t => {
    const { emitter } = t.context;
    let called = 0;
    const fn1 = () => {
        emitter.on('test', () => called++);
    };
    emitter.on('test', fn1);
    emitter.emit('test');
    t.is(called, 0); // fn1 not called
});

test('logErrors: true should log to console', t => {
    const { emitter } = t.context;
    const originalError = console.error;
    let logged = false;
    console.error = (...args) => {
        logged = true;
    };
    t.teardown(() => {
        console.error = originalError;
    });

    emitter.logErrors = true;
    emitter.on('test', () => {
        throw new Error('boom');
    });
    t.notThrows(() => emitter.emit('test'));
    t.true(logged);
});

test('logErrors: false should not log', t => {
    const { emitter } = t.context;
    const originalError = console.error;
    let logged = false;
    console.error = (...args) => {
        logged = true;
    };
    t.teardown(() => {
        console.error = originalError;
    });

    emitter.logErrors = false;
    emitter.on('test', () => {
        throw new Error('boom');
    });
    t.notThrows(() => emitter.emit('test'));
    t.false(logged);
});

test('error in one listener does not prevent others', t => {
    const { emitter } = t.context;
    let called = false;
    emitter.on('test', () => {
        throw new Error('err');
    });
    emitter.on('test', () => {
        called = true;
    });
    t.notThrows(() => emitter.emit('test'));
    t.true(called);
});

test('this context in listener should be the emitter', t => {
    const { emitter } = t.context;
    emitter.on('test', function () {
        // @ts-ignore
        t.is(this, emitter);
    });
    emitter.emit('test');
});

test('event key is removed from events object when last listener removed', t => {
    const { emitter } = t.context;
    const fn = () => {};
    emitter.on('test', fn);
    t.true('test' in emitter.events); // or Object.prototype.hasOwnProperty.call(emitter.events, 'test')
    emitter.removeListener('test', fn);
    t.false('test' in emitter.events);
});

test('off with non-function listener should not throw', t => {
    const { emitter } = t.context;
    t.notThrows(() => {
        // @ts-expect-error
        emitter.off('test', 'not a function');
    });
});

test('same listener added twice should be called twice', t => {
    const { emitter } = t.context;
    let count = 0;
    function fn() {
        count++;
    }
    emitter.on('test', fn);
    emitter.on('test', fn);
    emitter.emit('test');
    t.is(count, 2);
    emitter.off('test', fn);
    emitter.emit('test');
    t.is(count, 3);
});

test('once listener should be removable via off with original', t => {
    const { emitter } = t.context;
    let called = false;
    function listener() {
        called = true;
    }
    emitter.once('test', listener);
    emitter.off('test', listener);
    emitter.emit('test');
    t.false(called);
});
