# @supercat1337/event-emitter 🐈⚡

A modern, feature-rich EventEmitter implementation for JavaScript and TypeScript with advanced capabilities and industry-leading type safety.

---

## Features

- ✅ **Dual Implementation** – Choose between lightweight `EventEmitterLite` or full-featured `EventEmitter`.
- ✅ **First-class TypeScript** – Deep generic support for event names and argument validation.
- ✅ **Promise-based Waiting** – Native `waitForEvent` and `waitForAnyEvent` with built-in timeout support.
- ✅ **Lifecycle Tracking** – Monitor when events gain or lose listeners (`onHasEventListeners`, `onNoEventListeners`).
- ✅ **Centralized Error Handling** – Intercept and handle listener errors globally via `onListenerError`.
- ✅ **Memory-Efficient** – Automatic cleanup of unused event keys and dedicated `destroy()` lifecycle.
- ✅ **Immutable Emission** – Listener arrays are snapshotted during emission, making it safe to modify listeners inside callbacks.
- ✅ **Modern ES2022+** – Leverages native private fields and optimized logic.

---

## Installation

```bash
npm install @supercat1337/event-emitter
```

---

## Quick Start

### Using the full-featured `EventEmitter`

```typescript
import { EventEmitter } from '@supercat1337/event-emitter';

// Define your event types
type AppEvents = 'user:created' | 'user:deleted' | 'notification:sent';

const emitter = new EventEmitter<AppEvents>();

// Subscribe with an auto-generated unsubscribe function
const unsubscribe = emitter.on('user:created', (userData) => {
    console.log('User created:', userData);
});

// Emit events
emitter.emit('user:created', { id: 1, name: 'John' });

// Clean up
unsubscribe();
```

### Using the lightweight `EventEmitterLite`

For performance-critical paths where you only need core `on`/`off`/`emit` logic:

```javascript
import { EventEmitterLite } from '@supercat1337/event-emitter';

const lite = new EventEmitterLite();
lite.on('data', (msg) => console.log(msg));
lite.emit('data', 'Hello, World!');
```

---

## API Reference

### Core Classes

#### `EventEmitterLite<Events>`
The core implementation focused on performance. Use this when you don't need async waiting or lifecycle hooks.

#### `EventEmitter<Events>`
Extends `EventEmitterLite` with the full suite of advanced features: async promises, tracking hooks, and instance destruction.

### Common Properties

| Property      | Type      | Description                                                                                |
|---------------|-----------|--------------------------------------------------------------------------------------------|
| `logErrors`   | `boolean` | If `true`, errors in listeners are logged to the console. (Default: `true`)<br>Even when `false`, errors can still be caught via `onListenerError`. |
| `isDestroyed` | `boolean` | (`EventEmitter` only) Returns `true` if the instance has been destroyed.                   |

### Common Methods

| Method                          | Description                                                                           |
|---------------------------------|---------------------------------------------------------------------------------------|
| `on(event, listener)`           | Subscribes to an event. Returns an `unsubscribe()` function.                          |
| `once(event, listener)`         | Subscribes for a single invocation, then auto-removes.                                |
| `off(event, listener)`          | Removes a specific listener. Alias for `removeListener`.                              |
| `emit(event, ...args)`          | Triggers all listeners for the event with provided arguments.                         |
| `removeListener(event, listener)` | Same as `off`.                                                                        |

### Advanced Methods (`EventEmitter` only)

| Method                                          | Description                                                                                                 |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `waitForEvent(event, [maxWaitMs])`              | Returns a `Promise<boolean>`. Resolves `true` when the event fires. If `maxWaitMs` is reached, resolves `false`. |
| `waitForAnyEvent(events, [maxWaitMs])`          | Waits for the first occurring event from an array of event names.                                           |
| `clear()`                                        | Removes all listeners from all events.                                                                      |
| `clearEventListeners(event)`                     | Removes all listeners for a specific event.                                                                 |
| `destroy()`                                      | Completely wipes the instance. Clears all listeners and prevents further emissions.                          |
| `onHasEventListeners(callback)`                  | Invoked when any event gains its **first** listener. Receives the event name.                               |
| `onNoEventListeners(callback)`                   | Invoked when any event loses its **last** listener. Receives the event name.                                |
| `onListenerError(callback)`                      | Invoked when any listener throws an error. Receives `(error, eventName, ...args)`.                          |

#### Example: lifecycle tracking

```javascript
emitter.onHasEventListeners((event) => {
    console.log(`First listener added for ${event}`);
});

emitter.onNoEventListeners((event) => {
    console.log(`Last listener removed for ${event}`);
});

emitter.on('foo', () => {}); // logs: First listener added for foo
emitter.off('foo', () => {}); // logs: Last listener removed for foo
```

#### Example: error handling

```javascript
emitter.onListenerError((error, event, ...args) => {
    console.error(`Error in ${event}:`, error);
    myLoggingService.report(error);
});

emitter.on('crash', () => { throw new Error('boom'); });
emitter.emit('crash'); // error is caught, passed to the callback, and (if logErrors=true) also logged.
```

---

## TypeScript Usage

### 1. Simple string union
Good for events that don't pass complex data.

```typescript
type MyEvents = 'start' | 'stop' | 'tick';
const emitter = new EventEmitter<MyEvents>();
emitter.emit('start'); // OK
emitter.emit('unknown'); // Type error
```

### 2. Full type safety (recommended)
Define a record mapping event names to argument tuples. This gives you autocompletion and argument validation.

```typescript
type MyEvents = {
    'user:updated': [id: number, name: string];
    'ping': []; // no arguments
};

const emitter = new EventEmitter<MyEvents>();

// Listener gets correct argument types
emitter.on('user:updated', (id, name) => {
    console.log(id, name);
});

// Emit is type-checked
emitter.emit('user:updated', 1, 'Alice'); // ✅
emitter.emit('user:updated', '1');        // ❌ Type error
```

### 3. Using `keyof` with a separate type map
If you prefer to keep event names as a union but still want argument types, combine a union with a mapped type:

```typescript
type EventNames = 'start' | 'stop' | 'tick';
type EventMap = {
    [K in EventNames]: K extends 'tick' ? [counter: number] : [];
};

const emitter = new EventEmitter<EventMap>();
emitter.on('tick', (counter) => console.log(counter)); // counter is number
```

---

## Error Handling

By default, all listener errors are caught to prevent the emitter from crashing.  
- If `logErrors` is `true` (default), errors are printed to `console.error`.  
- Even with `logErrors: false`, you can still intercept errors globally using `onListenerError` for custom logging or reporting.

---

## Performance Notes

- **Snapshotted iteration**: Listener arrays are copied before emission. If a listener calls `off()` on itself during emission, the current cycle continues safely without skipping elements.
- **Zero dependencies**: Ultra-small bundle size.
- **Memory management**: Event keys are deleted from the internal store when the last listener is removed, reducing memory usage over time.

---

## Browser Support

| Feature    | Support         |
|------------|-----------------|
| ES2022+    | Modern browsers |
| TypeScript | 4.0+            |
| Node.js    | 14+             |

---

## License

MIT © [supercat1337](https://github.com/supercat1337)