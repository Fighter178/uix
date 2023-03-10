# UIX 
UIX is a UI framework that has a variety of features. Some notable ones are:
1. Components, based on WebComponents
2. State management system
3. A readable brace syntax
4. Runs natively in the browser
5. Small, the minified Javascript is just 14.3 kB. 
UIX was heavily inspired by a few frameworks, namely Svelte and Vue.
UIX contains a .ts file, .js and .min.js file in it's bundle. This is to provide CDN compatibility. It is heavily recommended that you use either just the minified javascript, or use a bundler with dead code elimination.
## Things to know/keep in mind
- You do not have to use a module bundler, you can use the CDN (https://cdn.jsdelivr.net/gh/Fighter178/uix/uix.min.js), and import it like an ES6 module in a script tag. Like this: 
    ```html
        <script type="module">
            // Supports brace syntax, directives, and inbuilt components.
            import "https://cdn.jsdelivr.net/gh/Fighter178/uix/uix.min.js"; 
            // OR:
            // Supports all things via import.
            import {CreateComponent, Store /* etc */} from "https://cdn.jsdelivr.net/gh/Fighter178/uix/uix.min.js";
        </script>
   ```
   Note, you can also use the NPM url (https://cdn.jsdelivr.net/npm/@fighter178/uix@latest/uix.min.js).
- Typescript is heavily recommended, but not required.
- See the github repo: [here](https://github.com/Fighter178/uix)
- **A user must have JavaScript enabled for UIX to function _at all_.**, unless someone wants to write a server side renderer, which I won't because I have no experience writing something like that. But if you want to, then by all means, do it.
- UIX is still in beta. Expect some major and breaking changes. 

## Docs
For guides, scroll down.
### CreateComponent function
This function creates a web component that can be used within your HTML. This will always extend `HTMLElement`. This function takes to parameters: `component` and `options`.
UIX components do support the `<slot>` element, so you can include the HTML defined in the body of the element, in the shadow itself.
#### Parameters
 
   - `component`: A function that returns the HTML for the  component. It accepts the following arguments:
     - `attributes`: A object, with the keys being the name of the attribute, and the value the value of the attribute
     - `shadow`: The element's shadow root. This will always be defined, even if the shadow root is closed.
     - `functions`: An object with many helper functions. This contains: `onInit`, `createState`, `setState`, `getState`, `render`, and `getThis`. The `onInit` function takes a function, and calls it when the component is initialized, not on subsequent renders. The `createState` function takes two arguments, the name of the state, and an initial value. `getState` takes the name of the state, and returns a store with the value. If the state does not exist, it returns a store-like object. The second argument to the `getState` function will be the value of this store-like object. The `updateState` takes the name of the state, and a new value. You can also just get the state and override the value there. The `getThis` function gets the `this` context for the component. Useful for defining methods for the component. The `render` function calls the `component` function again, so as to get the new value. Any `onInit` functions will not be called. 
    - Options: A object for options for the component.

       |         Name         |       Type       | Default |                                         Description                                         |
       | :------------------: | :--------------: | :-------: | :-----------------------------------------------------------------------------------------: |
       |    renderOnChange    |     Boolean      |  False  |                         Renders the component on its change event.                          |
       |    renderOnInput     |     Boolean      |  False  |                          Renders the component on its input event.                          |
       |      useFrames       |     Boolean      |  True   |                        Uses frames to be able to restore old states.                        |
       |      shadowMode      | "open"\|"closed" |  open   |                           Determines the component's shadow mode.                           |
       |         name         |      String      |  null   |         Overwrites the default name, must be a valid web components name.          |
       |  connectedCallback   |     Function     |  null   |  Function to run on the component's connectedCallback. The `this` context is the component.   |
       | disconnectedCallback |     Function     |  null   | Function to run on the component's disconnectedCallback. The `this` context is the component. |

       The default naming scheme for component names is: uix-[name-of-func]
### Stores
Stores are UIX's state management system. A store contains a value, and can be subscribed to, allowing for code to be ran when a value changes.
A store is a javascript class, so use the `new` keyword to initialize them. 
#### Properties & Methods
- value: The value the store contains, when set, notifies subscribers.
- subscribe: Function that takes a callback, with the arguments being: 
  - when: Either `"beforeChange`" or `"afterChange"`, these are self-explanatory.
  - value: Value of the store at the current time.
- unsubscribe: Function that takes a callback, and filters through the subscribers, removing the callback from the array of subscribers, meaning the callback is no longer triggered when the value changes.
### Directives
UIX has a directive system somewhat inspired by Vue.
You can use directives by adding the '@' sign just before the attribute name, however this can be changed.
#### Using a directive
You use a directive just like any other HTML attribute, however to set one programmatically, you must use the `setDirective` function to do so.
##### Listening for click events:
```html
<button @click="alert('You clicked me!')">Click me!</button>
```
However, directives are most useful in components, as with the `evaluateDirectives` function, you can set the `this` context for the directive. Using this, you can set the `this` context to the component itself.
Here is a basic example:
app.ts
```ts
import { CreateComponent, ComponentFunction, evaluateDirectives, type ComponentInstance } from "uix";
// Simple function to turn a number to an array with the length of that number.
const range = (to:number,val:any=null)=>{
    const res = [];
    for(let i=0;i<to;i++) {
        res.push(val);
    };
    return res;
}
const button:ComponentFunction = ({onClick=''},shadow,{getThis})=>{
    const self:appComponent = getThis();
    self.handleClick = ()=>{
        // This is very weak sandboxing. Don't use in production. 
        new Function('window','eval', 'Function', 'document', String(onClick)).call(null, range(4, null));
    };
    setTimeout(()=>{
        // We put this code in a setTimeout so the directives are evaluated after the render. Also this is not in an onInit call, so the directives are re-evaluated after each render.
        evaluateDirectives(Array.from(shadow.children), self);
    });
    return `<button @click='this.handleClick()'>
    <slot>Button</slot>
    </button>`;
};
CreateComponent(button);
interface appComponent extends ComponentInstance {
    // This must be an optional parameter, otherwise you get an error.
    handleClick?:()=>void
}
```
And then in your HTML,
```html
<uix-button onClick="alert('Click'!)"></uix-button>
```
**Note: all directives are processed as Javascript, without sanitization. This does not include custom directives.**
#### Creating a custom directive
You can create your own directives by using the `createCustomDirective` function.
Returns: A promise with void. It will reject if an error occurred.
Parameters: 
- `name`: Name for your directive. This should <u>not</u> be prefixed with the prefix.
- `callback`: The callback for your directive. This is ran each time the directive is encountered, either by `evaluateDirectives` or on page load. It takes to arguments:
  - `directiveValue`: This is the value of the directive. It is a string.
  - `element`: The element the directive is on. It is a `HTMLElement` or `ComponentInstance`. 
Note, for you directive to be registered and executed, it must be registered **before** the `DOMContentLoaded` event. If you must define it after, you have few options. One of those is to use `renderPage` or `silentRenderPage` to rerender the entire page again, but this causes major performance hits. Another option is to use `evaluateDirectives` after you define your directive. Like so: 
   - ```ts
        import {evaluateDirectives, createCustomDirective} from "uix";
        // simulating your directive taking a long time to be registered. 
        setTimeout(()=>{
            createCustomDirective("hide", (value, element)=>{
                element.style.display =  "none";
            });
            // Evaluate the body of the page. If you know where your directive is, use that element (or fill the array with the elements if there are multiple. Doing specific elements improves performance.).
            evaluateDirectives(Array.from(document.body.children));
        },5000);
     ```

Please note: Until you call `evaluateDirectives` on a late creation, your directive will **not** be ran on _any_ element. This is why it is a good idea to define them as soon as you can.
#### Setting the directive prefix
You can use the `setDirectivePrefix` function to set the directive prefix for **all** directives. This must be called **before** the `DOMContentLoaded` event, otherwise you will need to evaluate the directives again.
Usage: 
```ts
import {setDirectivePrefix} from "uix";
setDirectivePrefix("*") // Now, you can use *click instead of @click.
```
This might be useful if you are using UIX with other frameworks that use the `@` for the directive prefix, and they interfere. 
You must define a prefix, or the function will throw an error. This is to make it clear when you are using directives and when you are not.
## Guides
Here are the guides for UIX.
### Components 
UIX has a powerful component system based on Web Components. 
Things to keep in mind: 
1. All components use a shadow root.
2. By default, the name of the component is as follows: uix-[name of function, lowercased], so you would use it like so: <uix-[func name]>. You can change this.
3. You do not need to define the options parameter.
#### Creating a simple component
welcome.ts
```ts
import {type ComponentFunction, CreateComponent} from "uix"
const welcome:ComponentFunction = ()=>{
    return `<h1>Welcome to UIX!</h1>`
}
createComponent(welcome);
```
index.html
```html
<uix-welcome></uix-welcome>
```
#### Creating a dynamic component
You can easily create dynamic components like this.

dynamic.ts
```ts
import {type ComponentFunction, CreateComponent} from "uix";
const dynamic:ComponentFunction = ({name="User"})=>{
    return `<p>Hello ${name}!</p>`
}
createComponent(dynamic);
```
index.html
```html
<p>Empty:</p>
<!-- Note, you can use the self-closing syntax, if no <slot> elements are involved. -->
<uix-dynamic />
<p>With name:</p>
<uix-dynamic name="UIX" />
```
Would give the result:

Empty:
Hello User!
With name:
Hello UIX!
#### Customizing the Name
You can customize the nam of a component using the options parameter.
user.ts
```ts
import {CreateComponent} from "uix";
const user = ({user="User"})=>{
    return `<h1>Hello ${user}!</h1>`;
};
CreateComponent(user, {name:"my-user"});
```
index.html
```html
<my-user user="UIX"></my-user>
```
This allows you to write a component in a single line, like this:
user.ts
```ts
import {CreateComponent} from "uix";
CreateComponent(({user="UIX"})=>`<h1>Hello ${user}!</h1>`, {name:"my-user"});
```
#### A full, reactive component
You can also create reactive components with UIX, utilizing its state API.
reactive.ts
```ts
import {ComponentFunction, evaluateDirectives, CreateComponent, ComponentInstance } from "../../uix";
// To prevent infinite loops.
let clicked = false;
const reactive: ComponentFunction = (attributes, shadow, {getThis,render, setState, createState, getState, onInit}) => {
    // This is because the .call method on a function works weirdly. I haven't figured out a solution for it yet, so the this context is undefined.
    const self = getThis();
	const handleAddClick = () => {
		if (clicked) return;
		clicked = true;
        const state:Array<number> = getState("data").value
        const val = state.at(-1)||0
	    setState("data", [...state, val+1]);
		setTimeout(()=>{
			clicked = false;
		});
	};
    //@ts-ignore I know I should declare this, but for the example, I won't.
    self.handleAddClick = handleAddClick
	const handleRemove = ()=>{
		if (clicked) return; 
        clicked = true;
        getState("data").value.pop();
        // We must call render here, because pop doesn't register an update. A store registers an update on a new definition. 
        render();
        setTimeout(()=>{
            clicked = false;
        });
	}
    //@ts-ignore Same as before
    self.handleRemove = handleRemove
    // This code allows directives to work within a component. Similar code would allow for brace syntax, but that isn't needed because template literals exist.
	setTimeout(()=>{
        //@ts-ignore
        evaluateDirectives(Array.from(shadow.children), self);
    });
    onInit(()=>{
        createState("data", []);
		getState("data").subscribe((w,v)=>{
			render();
		});
    });
	return /* html */ `
		<h1>Reactive Component</h1>
		<button @click="this.handleAddClick()">Add Value</button>
		<button @click='this.handleRemove()'>Remove Last</button>
		<ul>
			${getState("data", 0).value.map((value: number)=>/* html */`<li>${value}</li>`)}
            <!-- The above will throw a warning/error. It has no effect on the app itself -->
		</ul>
	`.replaceAll(',','');
    // The replaceAll is called due to a bug in UIX. It will be fixed soon.
};
CreateComponent(reactive);
```
This is an odd component, but it does use UIX's state API, to allow each component to have its own, separate state.
Let's analyze what this component does:
1. It initializes a component with the following required functions: `getThis`, `render`, `createState`, `getState`, and `onInit`. Most of these should be self-explanatory. For reference, see the docs.
2. Sets up directives, and uses them. 
3. Subscribes to the state changes and renders when needed.

Here are some takeaways:
1. For any data that needs to be independent, use the state API, as that keeps the state separate.
2. This is much more concise than normal webComponents. Try implementing this in normal webComponents, and see how much more work and code is required, and how much less readable the code is.
#### Builtin Components
UIX has a few builtin components. Here they are: 
1. uix-if
2. uix-ready
##### UIX-IF component
You can use it like this: 
```html
<uix-if exp="js-to-evaluate-here">
    <p>HTML you want to conditionally render..</p>
</uix-if>
```
If the expression is an instance of a store, then with the `w` attribute defined, it will automatically subscribe to the store, and each time it changes, it will re-evaluate and rerender accordingly.
**The exp attribute is ran as Javascript, with access to the global scope. It is NOT sanitized.**
##### The UIX-READY component
It renders HTML when the document is ready. (on DOMContentLoaded event).

Any of the builtin components have a `render` method, and when called, will re-evaluate their respective conditions.

That's about all the most basic things that you will need when creating your app, for components. Now, we will talk about the brace syntax and directives.

### Brace Syntax
UIX provides a brace syntax, similar to Svelte. 
Assuming you've imported UIX in your HTML, it will work in normal HTML, except for components, but template literals exist.
Please note, that an element (or any of its parents) must have the `data-brace` attribute. This is for performance reasons.
#### Element Braces
Here is a basic example:
```html
<p data-brace>What is 1+2? Its {1+2}!</p>
```
This renders: What is 1+2? Its 3!
on the screen.
<s>Sadly, this is not reactive. You must use JS/TS to update the element if the value has changed</s> - As of 0.0.5, if the value is a store, it will become reactive, like so: 

```ts
window.myStore = new Store(0)
setTimeout(()=>{
    myStore.value = 5
},1000)
```
```html
<div data-brace>
   {myStore}
</div>
```
This renders: 0
Then, after a second: 5

Just be sure not to remove the subscriber that watches for the changes, and to **not** use the Store's `clear` method

**All code within braces is executed as javascript, in the global (window) context, with no sanitation provided. This applies to attribute braces too.**
If the code does not return a value, `undefined` is rendered.
#### Attribute Braces
Similar to element braces, this returns the code from the braces within attributes.
Like so: 
```html
<script>
    let style = "color:red";
    // On some browsers (especially IE, and some Opera versions), you may need to do this:
    window.style = style;
</script>
<p style="{style}">This text is red!</p>
```
Or, the more concise syntax (assuming the script exists here too)
```html
<p style={style}>This text is also red!</p>
```
Believe it or not, this actually works, not in IE though, for some reason.

### Directives
Directives are the more concise way to write inline attributes on an HTML element.
Here is a basic example:
```html
<button @click="alert('You clicked me!')">Click me!</button>
```
There are a bunch of useful directives, like the `@bind` directive(s), which enable 2-way data binding, and using the `@read` directive to read the value reactively:
```html
<script>
    import {Store} from "uix";
    // I told you why we need to define window.
    window.myTextValue = new Store("Starter Text");
</script>
<input type="text" @bind="myTextValue">
<!-- The <pre> element is there to keep the line breaks -->
<pre>
    <p @read="myTextValue"></p>
</pre>
```
Things to keep in mind: 
1. **The text of a directive is ran as JS**
2. A directive does not exist for _every_ event. 
3. The only bind directives are: `@bind` and `@bind:checked`.

### State & Stores
UIX provides a state management system, called Stores, which store a value. Each Store has methods like `subscribe`, `unsubscribe`, etc. You can use one like this: 
```ts
import {Store} from "uix";
// Type declarations are not required. It will default to 'any'.
const myStore:Store<number> = new Store(0);
```
In this case, the initial value is 0.
You can access the value like so, and write to it: 
```ts
myStore.value // 0
myStore.value++
myStore.value // 1
```
You can subscribe to changes to the store like so: 
```ts
// Subscribe to afterChange
myStore.subscribe((when, value)=>{
    if (when !== "afterChange") return;
    console.log(value);
});
// Subscribe to beforeChange
myStore.subscribe((when, value)=>{
    if (when !== "beforeChange") return;
    console.log(value);
});
// However, since we are subscribing to both events, with the same result on each, we can do this:
myStore.subscribe((_,value)=>{
    console.log(value);
});
```
You can unsubscribe to the store, if you have the callback:
```ts
import {Store} from "uix";
const myStore:Store<string> = new Store("");
const sub = (when:"beforeChange"|"afterChange",value:string)=>{
    console.log(when,value);
};
myStore.subscribe(sub);
setTimeout(()=>{
    myStore.unsubscribe(sub);
}, 1000);
```
This subscribes to a Store, then, after one second, unsubscribes. If any changes occurred before it was unsubscribed, it will be logged to the console.
**Stores only notify subscribers when their value changes, not if the value of an object within them changes, eg, an Array.pop was called, if the store held an Array.**


That is a basic overview of UIX. The most useful tool you can have for UIX is a modern code editor, like VS code, and a decent knowledge of Typescript.
Notes: 
Since UIX is based around webComponents, you can use it with any framework you like. So, if you so choose, you can not use the brace syntax provided by UIX, and use the one provided by Svelte or Vue. Just don't define `data-brace` on any element.