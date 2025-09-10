//@ts-check

//import test from "ava";
import { EventEmitter } from "./../src/index.js";
import test from "./../node_modules/ava/entrypoints/main.mjs";

test("on(), emit()", (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    ev.on("foo", () => {
        t.pass();
    });

    ev.emit("bar");
    ev.emit("foo");
});

test("once(), emit()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    ev.once("foo", () => {
        foo++;
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("removeListener()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);
    ev.removeListener("foo", action);

    ev.emit("foo");
    ev.emit("foo");

    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("Call unsubscriber", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    let unsubscriber = ev.on("foo", action);

    ev.emit("foo");
    unsubscriber();

    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("on(), emit() with error", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;

    /**
     *
     * @param {number} bar
     */
    function func(bar) {
        if (bar % 2) {
            throw new Error("Custom error");
        } else {
            foo++;
        }
    }

    ev.on("foo", () => {
        func(foo);
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent()", async (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 10);

    await ev.waitForEvent("foo");
    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent() with timeout  and no event", async (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 200);

    await ev.waitForEvent("foo", 50);
    if (foo == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForEvent() with timeout", async (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;
    let action = () => {
        foo++;
    };

    ev.on("foo", action);

    setTimeout(() => {
        ev.emit("foo");
    }, 50);

    await ev.waitForEvent("foo", 200);
    if (foo == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent()", async (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 10);

    await ev.waitForAnyEvent(["foo", "bar"]);

    setTimeout(() => {
        ev.emit("bar");
    }, 10);

    await ev.waitForAnyEvent(["foo", "bar"]);

    if (foo == 1 && bar == 1) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent() with timeout and no event", async (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 50);

    setTimeout(() => {
        ev.emit("bar");
    }, 300);

    await ev.waitForAnyEvent(["foo", "bar"], 100);

    if (foo == 1 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("waitForAnyEvent() with timeout", async (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;
    let bar = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.on("bar", () => {
        bar++;
    });

    setTimeout(() => {
        ev.emit("foo");
    }, 200);

    await ev.waitForAnyEvent(["foo", "bar"], 50);

    if (foo == 0 && bar == 0) {
        t.pass();
    } else {
        t.fail();
    }
});

test("clearEventListeners()", (t) => {
    /** @type {EventEmitter<"foo"|"bar">} */
    let ev = new EventEmitter();
    let foo = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.emit("foo");

    ev.clearEventListeners("foo");
    ev.clearEventListeners("bar");

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    t.is(foo, 1);
});

test("destroy()", (t) => {
    /** @type {EventEmitter<"foo">} */
    let ev = new EventEmitter();
    let foo = 0;

    ev.on("foo", () => {
        foo++;
    });

    ev.onHasEventListeners(() => {
        foo++;
    });

    ev.onNoEventListeners(() => {
        foo++;
    });

    ev.destroy();

    t.throws(() => {
        ev.on("foo", () => {});
    });

    ev.emit("foo");
    ev.emit("foo");
    ev.emit("foo");

    t.is(foo, 0);
});
