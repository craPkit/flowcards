# flowcard

enable "scenario-based programming" in your JS application.

You can compare flowcards to [XState](https://github.com/davidkpiano/xstate).<br/>
They both enable ways to describe & model reactive systems<br/>
and can serve as a layer above your UI-component structure.<br/>
State-transitions can be more than a bunch of switch-statements in your reducer.<br/>

## Why flowcard?

finite-state machines and statecharts (XState), provide a way<br/>
for specifying the behavior of the system per object / component.<br/>
For example, take a look at a [traffic-light machine](https://github.com/davidkpiano/xstate#finite-state-machines).<br>
The behaviour is described in an intra-object (within object) fashion.

With flowcard, you define behaviours in an inter-object way.
You know this from [user-flows](https://miro.medium.com/max/1548/1*JGL_2ffE9foLaDbjp5g92g.png).<br/>
A series of steps, a user needs to take to reach a goal.<br/>
What happens, if you are able to define behaviours in your code like user-flows?<br/>
flowcard enables you to do so. read more or get started

## Packages

- [🌀 `@flowcard/core`](https://github.com/ThomasDeutsch/flowcards/tree/master/packages/core) - core library (typed, tested & dependency-free)
- [⚛️ `@flowcard/react`](https://github.com/ThomasDeutsch/flowcards/tree/master/packages/react) - React hooks and utilities
- ❇️ fork this repository and add support for your favorite framework.

## Quick Start

```
npm install @flowcard/core
```

```javascript
import { scenarios, request, wait } from @flowcards/core;

const delayed = (data, ms) => new Promise(r => setTimeout(() => r(data), ms));

function* sender() {
    yield request('event1', 'well done!'); // request an event
    yield request('event2', delayed('you are making progress', 2000)); // async request
}

function* receiver() {
    let message = yield wait('event1'); // wait for event
    console.log(message);
    message = yield wait('event2'); // wait for async event
    console.log(message);
}

scenarios(enable => {
    enable(sender);
    enable(receiver);
});
```
