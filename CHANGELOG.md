# UIX Changelog
## v0.0.1
Created UIX. 
Includes Components, directives, and Stores
## v0.0.2
Updated docs, improved performance. No major breaking changes.
## v0.0.3 
Added a new directive: `@repeat`. Repeats the element's html the number of times the directive says, eg: 
```html
<div @repeat='2'><p>I appear twice!</p></div>
```
## v0.0.4 
Added a polyfill for the `String.replaceAll` method.
## v0.0.5
Made brace syntax reactive. Now, if the value is an instance of a Store, and it's value changes, the UI reflects that. The store however, must be defined in the global scope.