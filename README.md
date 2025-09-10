# @supercat1337/event-emitter 🐈⚡

A modern, feature-rich EventEmitter implementation for JavaScript and TypeScript with advanced capabilities and excellent type safety.

## Features

-   ✅ **Full TypeScript support** with generics and complete type definitions
-   🎯 **Promise-based event waiting** with timeout support
-   📊 **Listener lifecycle tracking** - know when events gain/lose listeners
-   🛡️ **Memory safe** - automatic cleanup and unsubscribe functions
-   ⚡ **High performance** - optimized for frequent events
-   🔒 **Immutable patterns** - listener arrays are copied during emission
-   🚀 **Modern ES2022+** - private fields, arrow functions, and more

## Installation

```bash
npm install @supercat1337/event-emitter
```

## Quick Start

```javascript
import { EventEmitter } from '@supercat1337/event-emitter';

// Define your event types
type AppEvents = 'user:created' | 'user:deleted' | 'notification:sent';

const emitter = new EventEmitter<AppEvents>();

// Subscribe to events
const unsubscribe = emitter.on('user:created', (userData) => {
    console.log('User created:', userData);
});

// Emit events
emitter.emit('user:created', { id: 1, name: 'John' });

// Unsubscribe when done
unsubscribe();
```

## API Reference

### Core Methods

#### `on(event, listener)`

Subscribe to an event. Returns an unsubscribe function.

```javascript
const unsubscribe = emitter.on("user:created", (data) => {
    console.log(data);
});

// Later...
unsubscribe();
```

#### `off(event, listener)`

Remove a specific listener from an event.

```javascript
function listener(data) {
    /* ... */
}
emitter.on("user:created", listener);
emitter.off("user:created", listener);
```

#### `emit(event, ...args)`

Emit an event with optional arguments.

```javascript
emitter.emit("user:created", { id: 1, name: "Alice" });
```

#### `once(event, listener)`

Add a one-time listener that auto-removes after execution.

```javascript
emitter.once("app:ready", () => {
    console.log("App is ready!");
});
```

### Advanced Methods

#### `waitForEvent(event, [maxWaitMs])`

Wait for an event using Promises.

```javascript
// Wait indefinitely
const result = await emitter.waitForEvent("data:loaded");

// Wait with timeout (returns false if timeout reached)
const success = await emitter.waitForEvent("data:loaded", 5000);
```

#### `waitForAnyEvent(events, [maxWaitMs])`

Wait for any of multiple events.

```javascript
const events = ['success', 'error', 'timeout'] as const;
const result = await emitter.waitForAnyEvent(events, 3000);
```

#### `onHasEventListeners(callback)`

Get notified when any event gains its first listener.

```javascript
emitter.onHasEventListeners((eventName) => {
    console.log(`Event ${eventName} now has listeners!`);
});
```

#### `onNoEventListeners(callback)`

Get notified when any event loses its last listener.

```javascript
emitter.onNoEventListeners((eventName) => {
    console.log(`Event ${eventName} has no more listeners!`);
});
```

### Lifecycle Management

#### `destroy()`

Completely destroy the emitter and clean up all resources.

```javascript
emitter.destroy();
console.log(emitter.isDestroyed); // true
```

#### `clear()`

Remove all listeners while keeping the emitter functional.

```javascript
emitter.clear();
```

#### `clearEventListeners(event)`

Remove all listeners for a specific event.

```javascript
emitter.clearEventListeners("user:created");
```

## TypeScript Usage

```typescript
import { EventEmitter } from "@supercat1337/event-emitter";

// Define your event types
type MyEvents =
    | "user:created"
    | "user:updated"
    | { type: "user:deleted"; payload: { id: string; reason: string } };

const emitter = new EventEmitter<MyEvents>();

// Full type safety!
emitter.emit("user:created", { id: 1, name: "John" }); // ✅ Correct
emitter.emit("user:created", "invalid"); // ❌ Type error
```

## Error Handling

All listener errors are caught and logged to console, preventing emitter crashes:

```javascript
emitter.on("data:received", () => {
    throw new Error("Something went wrong!");
});

// Error is caught and logged, emitter continues working
emitter.emit("data:received");
```

## Performance Notes

-   🔄 Listener arrays are copied before iteration to allow safe modification during emission
-   ⚡ Event existence checks are optimized with direct property access
-   🗑️ Automatic cleanup prevents memory leaks
-   📏 No external dependencies

## Browser Support

| Feature    | Support         |
| ---------- | --------------- |
| ES2022+    | Modern browsers |
| TypeScript | 4.0+            |
| Node.js    | 14+             |

## License

MIT License - feel free to use in commercial projects.

## Contributing

Contributions welcome! Please ensure:

-   ✅ All tests pass
-   ✅ TypeScript types are maintained
-   ✅ New features include tests
-   ✅ Code follows existing style

---

**Made with ❤️ by [supercat1337](https://github.com/supercat1337)**
