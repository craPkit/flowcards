# Guide: From Requirements To Code

In this guide, we will take a look at a [TodoMVC](https://codesandbox.io/s/todomvc-final-qnfjr) application written with flowcards & React.<br/>
It is targeted towards JavaScript/TypeScript Developers.<br/>

Goals for this guide
- tell a story about "the Why" 
- show how requirements can have a place in your code ⭐
- show first flowcards basics
<br/>

## Begin With the End in Mind

The end always comes down to a simple question: Is the software working as desined / expected?<br/>
Answering this question is only possible if we agree on a goal: The requirements we want to fulfill.<br/>

### Friends

Requirements are your friend, since they enable you to track the status of your work  
towards fulfilling an actual business need. They give your code *purpose*.<br/>
With these friends out of sight we tend to lose track of this purpose, so it is essential to have them around -  
particularly in a professional, even more so in an enterprise setting.<br/>
We usually find requirements on both *ends* - planning and testing - but what about the code itself?<br/>
They *shape* our code, but requirements themselves don't have their own place here.<br/>
Not a great way to treat your friend, is it?<br/>

### The Lost "Why"

I think that the absence of our *friends* from our code leads to<br/> 
a systemic problem in software development, which becomes obvious when you want to make changes to a bigger codebase:<br/>
You find yourself asking questions like "Why do we need this part?" or "Why is this if/else here?"<br/>
Requirements would help you to understand. They are the **reason why** someone wrote that code.<br/>
But they are usually buried -   
in a git commit, referencing some obscure technical issue  
that hopefully references the business rule  
*that hopefully* satisfies the original requirement  
\- so you start digging.<br/>

### My Vision Of The Future 

I hereby offer a tool for helping you reconnect development, planning and testing;<br/>
for creating a common ground, where we share the same language and<br/> 
make software development a bit more welcoming to our *friends*.<br/>
<br/>

# TodoMVC

The TodoMVC application is your starting point, because you [probably know what to expect](https://github.com/tastejs/todomvc/blob/master/app-spec.md#functionality).<br/>
The main goal of this guide is to demonstrate our ability to embed requirements directly in our code.<br/>

For this example we will use the React framework.<br>
React takes *state* and turns it into a UI-representation. You can think of it as a function: `ReactApp(state) => UI`.<br/>
**flowcards** is a tool for defining state as a list of scenarios we want to enable.<br/>
With it, you end up with: `ReactApp(flowcards(scenarios)) => UI`.<br/>
This guide is not about React. We will instead focus on the `flowcards(scenarios)` bit.<br/>

I would encourage you to make small changes to the sample app and see how they work out.<br/>

### From Specification To Behaviour
In the provided specification, we can find functional requirements. We take those requirements to define "scenarios" or "flows". Every scenario will enable a behaviour.<br/>
Looking at our code, we can see that every scenario has a direct connection to one of the requirements.<br/>

### A First Look 

Open the [TodoMVC](https://codesandbox.io/s/todomvc-final-qnfjr) application and go to line 100.<br/>
In the App root component, you can find the `useScenarios` function.<br/>
The behaviours we want to enable are listed here.<br/>
You can disable a behaviours by uncommenting them.<br/>
For example, disable the "toggleCompleteAllTodos" behaviour and see what happens.<br/>

```ts
  const sc = useScenarios((enable, state) => {
    const todosRef = state("s_todos", []);
    enable(newTodoCanBeAdded, [todosRef]);
    if (todosRef.current.length > 0) {
      enable(toggleCompleteForAllTodos, [todosRef]);
      enable(itemCanBeCompleted, [todosRef]);
      enable(itemCanBeDeleted, [todosRef]);
      enable(itemCanBeEdited, [todosRef]);
      if (someCompleted(todosRef.current)) {
        enable(completedItemsCanBeCleared, [todosRef]);
      }
    }
  });
```

Some behaviours are only enabled if we have some todos in our list.<br/>
Not only for performance reasons, but also to show dependencies.<br/>
For example: You don't want to enable a "count goals" behaviour, if the soccer game hasn't even started.<br/>

There are two functions that can be used.<br/>
The `state` function: This is nothing more than an event-cache.<br/>
It will listen for the `s_totos` event and update itself with the new payload.<br/>
And the `enable` function.<br/>

### From Generators to BThreads

The enable function can take 3 arguments. The first is a generator function.<br/>
Let's take a look at the first generator function `newTodoCanBeAdded`:
```ts
function* newTodoCanBeAdded(todos: StateRef<Todo[]>) {
  while (true) {
    const title = yield wait("inputOnEnter", (title: string) => title.trim().length > 0);
    yield request("s_todos", [...todos.current, newTodo(title)]);
  }
}
```
If you want to learn more about generators [here is a good introduction](https://medium.com/dailyjs/a-simple-guide-to-understanding-javascript-es6-generators-d1c350551950).
But all you need to know at this point is that a generator will pause (and "return" a value) at every `yied` statement.<br/>

`enable` will use the generator function to create something called a BThread.<br/>
It creates a wrapper around the generator and enables a very simple api for BThread-to-BThread communication:<br/>
At every `yield` a BThread can place a bid (or multiple bids). There are 4 types of bids:
- request  (requesting an event and only continue if the request has been granted)
- wait (waiting for an event)
- block (blocking an event, no request or wait can continue for this event)
- intercept (continue this BThread only - instead of other BThreads waiting for this event)

This api is based on [Behavioral Programming Principles](http://www.wisdom.weizmann.ac.il/~bprogram/more.html).<br/>

The `newTodoCanBeAdded` generator shows that the BThread will place two bids.<br/>
1. `yield wait("inputOnEnter", (title: string) => title.trim().length > 0);`<br/>
   = wait for the inputOnEnter event. Only accept this event if the payload length is > 0.
2. `yield request("s_todos", [...todos.current, newTodo(title)]);`<br/>
   = request to set the new s_todos state.

