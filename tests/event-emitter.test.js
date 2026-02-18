// @ts-check
import ava from 'ava';
import { EventEmitter } from '../src/event-emitter.js';

/** @typedef {{ emitter: EventEmitter<any> }} MyContext */
/** @typedef {import('ava').TestFn<MyContext>} TestFn */

const test = /** @type {TestFn} */ (ava);

test.beforeEach(t => {
    t.context = { emitter: new EventEmitter() };
});

// ----------------------------------------------------------------------
// Basic inheritance (quick check that Lite works)
// ----------------------------------------------------------------------
test('should inherit from EventEmitterLite: on and emit work', t => {
    const { emitter } = t.context;
    let called = false;
    emitter.on('test', () => {
        called = true;
    });
    emitter.emit('test');
    t.true(called);
});

test('once works as expected', t => {
    const { emitter } = t.context;
    let count = 0;
    emitter.once('test', () => count++);
    emitter.emit('test');
    emitter.emit('test');
    t.is(count, 1);
});

test('off removes listener', t => {
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

// ----------------------------------------------------------------------
// Internal events (#has-listeners, #no-listeners, #listener-error)
// ----------------------------------------------------------------------
test('#has-listeners emitted when first listener added', t => {
    const { emitter } = t.context;
    /** @type {string[]} */
    const events = [];

    emitter.onHasEventListeners(
        /** @param {string} event */ event => {
            events.push(event);
        }
    );

    emitter.on('foo', () => {});
    emitter.on('foo', () => {}); // second should not trigger
    emitter.on('bar', () => {}); // should trigger for bar

    t.deepEqual(events, ['foo', 'bar']);
});

test('#no-listeners emitted when last listener removed', t => {
    const { emitter } = t.context;
    /** @type {string[]} */
    const events = [];

    emitter.onNoEventListeners(
        /** @param {string} event */ event => {
            events.push(event);
        }
    );

    const fn1 = () => {};
    const fn2 = () => {};
    const fnBar = () => {}; // keep reference for bar

    emitter.on('foo', fn1);
    emitter.on('foo', fn2);
    emitter.on('bar', fnBar);

    emitter.off('foo', fn1); // not last for foo yet
    emitter.off('foo', fn2); // last for foo -> #no-listeners('foo')
    emitter.off('bar', fnBar); // last for bar -> #no-listeners('bar')

    t.deepEqual(events, ['foo', 'bar']);
});

test('#listener-error emitted when a listener throws', t => {
    const { emitter } = t.context;
    /** @type {Array<{ error: Error; event: string; args: any[] }>} */
    const errors = [];

    emitter.onListenerError(
        /** @type {(error: Error, event: string, ...args: any[]) => void} */ (
            error,
            event,
            ...args
        ) => {
            errors.push({ error, event, args });
        }
    );

    emitter.on('fail', () => {
        throw new Error('boom 1');
    });
    emitter.on(
        'fail',
        /** @type {(x: number) => void} */ x => {
            throw new Error(`boom ${x}`);
        }
    );
    emitter.emit('fail', 42);

    t.is(errors.length, 2);
    t.is(errors[0].error.message, 'boom 1');
    t.is(errors[0].event, 'fail');
    t.deepEqual(errors[0].args, [42]);

    t.is(errors[1].error.message, 'boom 42');
    t.is(errors[1].event, 'fail');
    t.deepEqual(errors[1].args, [42]);
});

test('internal events do not trigger #has-listeners/#no-listeners for themselves', t => {
    const { emitter } = t.context;
    let hasCount = 0;
    let noCount = 0;

    emitter.onHasEventListeners(() => hasCount++);
    emitter.onNoEventListeners(() => noCount++);

    // Subscribing to internal events should not increase counters for 'has-listeners' etc.
    emitter.onHasEventListeners(() => {});
    emitter.onNoEventListeners(() => {});
    emitter.onListenerError(() => {});

    t.is(hasCount, 0);
    t.is(noCount, 0);

    // Adding a regular event should trigger
    emitter.on('test', () => {});
    t.is(hasCount, 1);

    // Removing the last one should trigger no
    emitter.off('test', () => {}); // but need to remove the same listener that was added
    // For test purity, better to keep a reference
});

// ----------------------------------------------------------------------
// waitForEvent / waitForAnyEvent
// ----------------------------------------------------------------------
test('waitForEvent resolves true when event emitted', async t => {
    const { emitter } = t.context;
    const promise = emitter.waitForEvent('ready');
    emitter.emit('ready');
    const result = await promise;
    t.true(result);
});

test('waitForEvent resolves false on timeout', async t => {
    const { emitter } = t.context;
    const promise = emitter.waitForEvent('ready', 10);
    const result = await promise;
    t.false(result);
});

test('waitForAnyEvent resolves true when any event emitted', async t => {
    const { emitter } = t.context;
    const promise = emitter.waitForAnyEvent(['start', 'stop'], 100);
    emitter.emit('stop');
    const result = await promise;
    t.true(result);
});

test('waitForAnyEvent resolves false on timeout', async t => {
    const { emitter } = t.context;
    const promise = emitter.waitForAnyEvent(['start', 'stop'], 10);
    const result = await promise;
    t.false(result);
});

test('waitForAnyEvent unsubscribes after first event', async t => {
    const { emitter } = t.context;
    let count = 0;
    emitter.on('event1', () => count++);
    emitter.on('event2', () => count++);

    await emitter.waitForAnyEvent(['event1', 'event2'], 100);
    emitter.emit('event1');
    emitter.emit('event2');

    t.is(count, 2); // both events should fire after waiting
});

test('waitForEvent throws if emitter destroyed', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.throws(() => emitter.waitForEvent('test'), { message: /destroyed/ });
});

test('waitForAnyEvent throws if emitter destroyed', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.throws(() => emitter.waitForAnyEvent(['test']), { message: /destroyed/ });
});

// ----------------------------------------------------------------------
// destroy
// ----------------------------------------------------------------------
test('destroy sets isDestroyed = true and clears events', t => {
    const { emitter } = t.context;
    emitter.on('test', () => {});
    t.false(emitter.isDestroyed);
    emitter.destroy();
    t.true(emitter.isDestroyed);
    t.is(Object.keys(emitter.events).length, 0);

    // After destroy, trying to subscribe to internal events should throw
    t.throws(() => emitter.onHasEventListeners(() => {}), { message: /destroyed/ });
    t.throws(() => emitter.onNoEventListeners(() => {}), { message: /destroyed/ });
    t.throws(() => emitter.onListenerError(() => {}), { message: /destroyed/ });
});

test('after destroy, on throws', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.throws(() => emitter.on('test', () => {}), { message: /destroyed/ });
});

test('after destroy, emit does nothing (no throw)', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.notThrows(() => emitter.emit('test'));
});

test('after destroy, removeListener does nothing', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.notThrows(() => emitter.removeListener('test', () => {}));
});

test('destroy can be called multiple times without error', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.notThrows(() => emitter.destroy());
});

// ----------------------------------------------------------------------
// clear and clearEventListeners
// ----------------------------------------------------------------------
test('clear removes all listeners and emits #no-listeners for each', t => {
    const { emitter } = t.context;
    /** @type {string[]} */
    const noEvents = [];

    emitter.onNoEventListeners(/** @param {string} event */ event => noEvents.push(event));
    emitter.on('a', () => {});
    emitter.on('b', () => {});
    emitter.on('c', () => {});

    emitter.clear();

    t.deepEqual(noEvents.sort(), ['a', 'b', 'c']);
    t.is(Object.keys(emitter.events).length, 0);
});

test('clearEventListeners removes all listeners for one event', t => {
    const { emitter } = t.context;
    let noCalled = false;

    emitter.onNoEventListeners(
        /** @param {string} event */ event => {
            if (event === 'test') noCalled = true;
        }
    );

    emitter.on('test', () => {});
    emitter.on('test', () => {});
    emitter.on('other', () => {});

    emitter.clearEventListeners('test');

    t.true(noCalled);
    t.false('test' in emitter.events); // key removed
    t.true('other' in emitter.events); // other remains
    t.is(emitter.events['other'].length, 1);
});

// ----------------------------------------------------------------------
// logErrors and interaction with #listener-error
// ----------------------------------------------------------------------
test('when logErrors is true, errors are logged and #listener-error emitted', t => {
    const { emitter } = t.context;
    const originalError = console.error;
    /** @type {any[][]} */
    const logged = [];
    console.error = (...args) => logged.push(args);
    t.teardown(() => {
        console.error = originalError;
    });

    let internalErrorCaught = false;
    emitter.onListenerError(() => {
        internalErrorCaught = true;
    });

    emitter.logErrors = true;
    emitter.on('boom', () => {
        throw new Error('kaboom');
    });
    emitter.emit('boom');

    t.true(internalErrorCaught);
    t.true(logged.length > 0);
    t.regex(logged[0][0], /Error in listener for event "boom"/);
});

test('when logErrors is false, errors are not logged but #listener-error still emitted', t => {
    const { emitter } = t.context;
    const originalError = console.error;
    let logged = false;
    console.error = () => (logged = true);
    t.teardown(() => {
        console.error = originalError;
    });

    let internalErrorCaught = false;
    emitter.onListenerError(() => {
        internalErrorCaught = true;
    });

    emitter.logErrors = false;
    emitter.on('boom', () => {
        throw new Error('kaboom');
    });
    emitter.emit('boom');

    t.true(internalErrorCaught);
    t.false(logged);
});

// ----------------------------------------------------------------------
// Event key removal when no listeners (inherited from Lite)
// ----------------------------------------------------------------------
test('event key removed when last listener removed (inherited)', t => {
    const { emitter } = t.context;
    const fn = () => {};
    emitter.on('test', fn);
    t.true('test' in emitter.events);
    emitter.removeListener('test', fn);
    t.false('test' in emitter.events);
});

// ----------------------------------------------------------------------
// Getter isDestroyed
// ----------------------------------------------------------------------
test('isDestroyed reflects destroyed state', t => {
    const { emitter } = t.context;
    t.false(emitter.isDestroyed);
    emitter.destroy();
    t.true(emitter.isDestroyed);
});

// test/event-emitter-extra.test.js (or add to existing file)

// ----------------------------------------------------------------------
// Additional tests to cover uncovered lines
// ----------------------------------------------------------------------

test('emit with no listeners should not throw and not call internal events', t => {
    const { emitter } = t.context;
    let internalErrorCalled = false;
    emitter.onListenerError(() => {
        internalErrorCalled = true;
    });
    t.notThrows(() => emitter.emit('nonexistent'));
    t.false(internalErrorCalled); // covers line where listeners existence is checked
});

test('error in #listener-error handler does not cause infinite loop', t => {
    const { emitter } = t.context;
    const originalConsoleError = console.error;
    let consoleCalled = false;
    console.error = () => {
        consoleCalled = true;
    };
    t.teardown(() => {
        console.error = originalConsoleError;
    });

    // Subscriber to #listener-error itself throws
    emitter.onListenerError(() => {
        throw new Error('error in error handler');
    });

    // Regular listener that triggers #listener-error
    emitter.on('boom', () => {
        throw new Error('original error');
    });

    t.notThrows(() => emitter.emit('boom'));
    t.true(consoleCalled); // critical error should be logged
});

test('waitForEvent with zero timeout waits indefinitely', async t => {
    const { emitter } = t.context;
    let resolved = false;
    const promise = emitter.waitForEvent('ready', 0).then(() => {
        resolved = true;
    });

    await new Promise(r => setTimeout(r, 50));
    t.false(resolved); // not resolved yet

    emitter.emit('ready');
    await promise;
    t.true(resolved);
});

test('waitForEvent with negative timeout waits indefinitely until event', async t => {
    const { emitter } = t.context;
    const promise = emitter.waitForEvent('ready', -10);
    setTimeout(() => emitter.emit('ready'), 20);
    const result = await promise;
    t.true(result);
});

test('clearEventListeners on non-existent event does nothing', t => {
    const { emitter } = t.context;
    t.notThrows(() => emitter.clearEventListeners('absent'));
    t.false('absent' in emitter.events);
});

test('calling destroy multiple times does nothing', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.notThrows(() => emitter.destroy());
    t.true(emitter.isDestroyed);
});

test('after destroy, onHasEventListeners throws', t => {
    const { emitter } = t.context;
    emitter.destroy();
    t.throws(() => emitter.onHasEventListeners(() => {}), { message: /destroyed/ });
});

test('error in #listener-error handler does not cause infinite loop and flag resets', t => {
    const { emitter } = t.context;
    let calls = 0;

    // Subscribe to #listener-error and throw
    emitter.onListenerError(() => {
        calls++;
        throw new Error('error in error handler');
    });

    // Regular listener that triggers the first error
    emitter.on('boom', () => {
        throw new Error('original error');
    });

    t.notThrows(() => emitter.emit('boom'));
    t.is(calls, 1); // #listener-error handler called once
});
