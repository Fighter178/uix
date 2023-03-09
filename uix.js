/**
 * @copyright 2023 Jonathon Woolston
 * @file uix.js
 * @description UIX, a browser-native UI framework.
 * @author Fighter178 (Jonathon Woolston)
 */
/** */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Store_value, _Store_subscribers;
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (searchValue, replaceValue) {
        if (typeof searchValue !== 'string' || searchValue === '') {
            return this.toString();
        }
        const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSearchValue, 'g');
        return this.replace(regex, replaceValue);
    };
}
export const $ = (selector, all = false, from = document) => {
    if (!all)
        return from.querySelector(selector);
    else
        return from.querySelectorAll(selector);
};
export const renderPage = () => {
    documentReady.value = false;
    renderBraces();
    evaluateDirectives();
    evaluateBraceAttributes();
    documentReady.value = true;
};
export const silentRerenderPage = () => {
    renderBraces();
    evaluateDirectives();
    evaluateBraceAttributes();
};
const attributesToObject = (attributes) => {
    let obj = {};
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        obj[attr.name] = attr.value;
    }
    ;
    return obj;
};
export const CreateComponent = (component, options) => {
    var _ComponentInstance_shadow, _ComponentInstance_renderListeners, _ComponentInstance_state, _ComponentInstance_initFuncs;
    const componentName = (options === null || options === void 0 ? void 0 : options.name) || "uix-" + component.name;
    const useFrames = (options === null || options === void 0 ? void 0 : options.useFrames) || true;
    class ComponentInstance extends HTMLElement {
        constructor() {
            super();
            _ComponentInstance_shadow.set(this, void 0);
            _ComponentInstance_renderListeners.set(this, void 0);
            _ComponentInstance_state.set(this, void 0);
            _ComponentInstance_initFuncs.set(this, void 0);
            componentPlugins.forEach(plugin => {
                plugin(this);
            });
            __classPrivateFieldSet(this, _ComponentInstance_state, {}, "f");
            this.frames = [];
            this.renderCount = 0;
            __classPrivateFieldSet(this, _ComponentInstance_renderListeners, [], "f");
            __classPrivateFieldSet(this, _ComponentInstance_initFuncs, [], "f");
            this.parent = this.parentElement || document.body;
            const shadow = this.attachShadow({
                mode: (options === null || options === void 0 ? void 0 : options.shadowMode) || "open"
            });
            __classPrivateFieldSet(this, _ComponentInstance_shadow, shadow, "f");
            if (useFrames) {
                this.frames.push({ html: this.innerHTML, attributes: this.attributes, shadowHTML: __classPrivateFieldGet(this, _ComponentInstance_shadow, "f").innerHTML });
            }
            ;
            const attrs = attributesToObject(this.attributes);
            // Run the component function and extract the html
            //@ts-ignore
            const html = component.call(this, attrs, __classPrivateFieldGet(this, _ComponentInstance_shadow, "f"), { render: this.render.bind(this), createState: this.createState.bind(this), getState: this.getState.bind(this), onInit: this.onInit.bind(this), setState: this.setState.bind(this), getThis: this.getThis.bind(this) });
            // this.js = js;
            if (html)
                __classPrivateFieldGet(this, _ComponentInstance_shadow, "f").innerHTML = html;
            else
                __classPrivateFieldGet(this, _ComponentInstance_shadow, "f").innerHTML = this.innerHTML;
            if (options) {
                if (options.renderOnChange) {
                    this.addEventListener("change", (e) => { this.render(); });
                }
                ;
                if (options.renderOnInput) {
                    this.addEventListener("input", (e) => { this.render(); });
                }
                ;
            }
            ;
            setTimeout(() => {
                __classPrivateFieldGet(this, _ComponentInstance_initFuncs, "f").forEach(func => {
                    // The this context is already bound, so a .call is unnecessary.
                    func();
                });
            });
        }
        ;
        connectedCallback() {
            if (options === null || options === void 0 ? void 0 : options.connectedCallback)
                options.connectedCallback(this);
            setTimeout(() => {
                this.render();
            });
        }
        ;
        disconnectedCallback() {
            if (options === null || options === void 0 ? void 0 : options.disconnectedCallback)
                options.disconnectedCallback(this);
        }
        ;
        /**
         * Allows a component to be given a unique state context. This code will be ran within the component's constructor. The this context of the function is the componentInstance.
         * This basically creates a store, where within the component function, you can do this.[name you gave] and access the store. This must be called within the component initialization, or it wont work. (eg. not after a render call)
         */
        createState(name, value) {
            __classPrivateFieldGet(this, _ComponentInstance_state, "f")[name] = new Store(value);
        }
        setState(name, value) {
            __classPrivateFieldGet(this, _ComponentInstance_state, "f")[name].value = value;
        }
        /**
         * Retrieves a specific state created by @link createState
         * @param name The name of the state to retrieve
         * @returns The state's store.
         */
        getState(name, fallbackValue) {
            // Most of this code is trying for errors. This prevents an error occurring if someone used createState in an onInit call.
            // You could write it like this: return this.#state[name].value||fallbackValue, but this does not catch errors.  
            let error = false;
            try {
                const rtv = __classPrivateFieldGet(this, _ComponentInstance_state, "f")[name].value;
                if (rtv === undefined) {
                    error = true;
                    console.log(rtv);
                    console.error("UIX: State undefined. Did you define it? A store-like object will be returned. Use fallbackValue parameter to set it\'s value.");
                    return {
                        value: fallbackValue || null,
                        subscribe(clb) { },
                        unsubscribe(clb) { },
                    };
                }
                ;
                return __classPrivateFieldGet(this, _ComponentInstance_state, "f")[name];
            }
            catch (e) {
                if (!error) {
                    console.warn(`UIX (internal error): ${e}\n\nA store-like object will be returned.\nA common fix is to wrap a getState call like this (if in a template literal, remove semicolons): (()=>{try{getState('name-of-state').[property]}catch{return "fallback value here"}})();\n\nYou can easily provide a fallback value by passing it as the second argument to the getState function. This will be the value of the store-like object that will be returned.\nThis is a common error, as it mostly happens when you define a state after the component has already been rendered at least once.`);
                }
                return {
                    value: fallbackValue || 0,
                    subscribe(clb) { console.warn("UIX: You subscribed to a store-like object. You can check if an object is store-like by checking its storeLike property. This is null when it is a real Store."); },
                    unsubscribe(clb) { console.warn("UIX: You subscribed to a store-like object. You can check if an object is store-like by checking its storeLike property. This is null when it is a real Store."); },
                    storeLike: true
                };
            }
        }
        /**
         * Runs a function only when the component is initialized, eg. within the constructor.
         */
        onInit(func) {
            __classPrivateFieldGet(this, _ComponentInstance_initFuncs, "f").push(func.bind(this));
        }
        ;
        /** This function is needed because on some versions of Firefox, when you use .call on a function (.call is used internally within UIX, so you almost always need this function), the 'this' context isn't transferred. On modern versions though, it should be fine. */
        getThis() {
            return this;
        }
        ;
        /**
         * The render function for the component. Does three things:
         * 1. Calls the component function again
         * 2. (deprecated, not used) Runs the JS for the component
         * 3. Runs any plugins that need to be called on a component render.
         */
        render() {
            try {
                __classPrivateFieldGet(this, _ComponentInstance_renderListeners, "f").forEach(listener => {
                    listener();
                });
            }
            catch (e) {
                throw new Error(`UIX: Failed to alert onRender subscribers, so the component will NOT be rendered. The most common cause of this error is that you are storing a component\'s render function in a variable or passing it to another function. Do not do this. You should instead find the element with something like document.querySelector or $. Then call render on that. Error that caused the issue:\n\n${e}`);
            }
            const attrs = attributesToObject(this.attributes);
            //@ts-ignore
            const html = component.call(this, attrs, __classPrivateFieldGet(this, _ComponentInstance_shadow, "f"), { render: this.render.bind(this), createState: this.createState.bind(this), getState: this.getState.bind(this), onInit: this.onInit.bind(this), setState: this.setState.bind(this), getThis: this.getThis.bind(this) });
            if (useFrames) {
                this.frames.push({ html: this.innerHTML, attributes: this.attributes, shadowHTML: __classPrivateFieldGet(this, _ComponentInstance_shadow, "f").innerHTML });
            }
            ;
            // Deprecated
            // if (typeof js === "string") {
            //     new Function(`${js}`).call(this, this, this.#shadow);
            // } else if (js instanceof Function) {
            //     js(this, this.#shadow);
            // }
            componentRenderPlugins.forEach(plugin => {
                plugin(this, options);
            });
            if (html)
                __classPrivateFieldGet(this, _ComponentInstance_shadow, "f").innerHTML = html;
            else
                __classPrivateFieldGet(this, _ComponentInstance_shadow, "f").innerHTML = this.innerHTML;
            this.renderCount++;
            const renderEvent = new CustomEvent("render", {
                bubbles: false,
                cancelable: false,
                detail: {
                    component: this
                }
            });
            this.dispatchEvent(renderEvent);
        }
        onRender(func) {
            __classPrivateFieldGet(this, _ComponentInstance_renderListeners, "f").push(func);
        }
    }
    _ComponentInstance_shadow = new WeakMap(), _ComponentInstance_renderListeners = new WeakMap(), _ComponentInstance_state = new WeakMap(), _ComponentInstance_initFuncs = new WeakMap();
    ;
    customElements.define(componentName, ComponentInstance);
};
;
;
// An extremely basic plugin system.
const componentPlugins = [];
const componentRenderPlugins = [];
const loadPlugins = [];
/**
 * A way to easily use plugins.
 * @param {Function} pluginFunction A string which contains the JS to run when the plugin is fired
 * @param {String} on A string indicating on which event to run the plugin
 */
export const UsePlugin = (pluginFunction, on) => {
    if (on === "componentCreate") {
        componentPlugins.push(pluginFunction);
    }
    else if (on === "componentRender") {
        componentRenderPlugins.push(pluginFunction);
    }
    else if (on === "load") {
        loadPlugins.push(pluginFunction);
    }
    ;
};
document.addEventListener("load", (e) => {
    loadPlugins.forEach(loadPlugin => {
        loadPlugin();
    });
});
export class Store {
    constructor(v) {
        _Store_value.set(this, void 0);
        _Store_subscribers.set(this, void 0);
        __classPrivateFieldSet(this, _Store_value, v, "f");
        __classPrivateFieldSet(this, _Store_subscribers, [], "f");
    }
    get value() {
        return __classPrivateFieldGet(this, _Store_value, "f");
    }
    set value(nv) {
        __classPrivateFieldGet(this, _Store_subscribers, "f").forEach((sub) => {
            sub("beforeChange", __classPrivateFieldGet(this, _Store_value, "f"));
        });
        __classPrivateFieldSet(this, _Store_value, nv, "f");
        __classPrivateFieldGet(this, _Store_subscribers, "f").forEach((sub) => {
            sub("afterChange", nv);
        });
    }
    subscribe(func) {
        __classPrivateFieldGet(this, _Store_subscribers, "f").push(func);
    }
    unsubscribe(func) {
        if (typeof func === "number") {
            __classPrivateFieldSet(this, _Store_subscribers, __classPrivateFieldGet(this, _Store_subscribers, "f").filter((v, i) => i !== func), "f");
        }
        else {
            if (!__classPrivateFieldGet(this, _Store_subscribers, "f").includes(func))
                console.error("UIX: Failed to unsubscribe because the function is not in the subscribers array.");
            __classPrivateFieldSet(this, _Store_subscribers, __classPrivateFieldGet(this, _Store_subscribers, "f").filter((v) => v !== func), "f");
        }
    }
    clear() {
        __classPrivateFieldSet(this, _Store_subscribers, [], "f");
    }
}
_Store_value = new WeakMap(), _Store_subscribers = new WeakMap();
// UIX Components
class UIX_IF extends HTMLElement {
    constructor() {
        super();
        const exp = new Function(`return ${this.getAttribute("exp")}`)();
        if (exp == null)
            throw new Error("UIX: No exp attribute on an uix-if element.");
        this.exp = String(exp);
        this.showing = false;
        this.style.display = "none";
        if (this.getAttribute("observe") == "true") {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type == "attributes") {
                        if (!this.hasAttribute("exp"))
                            throw new Error("UIX: No exp attribute on an uix-if element.");
                        //@ts-ignore
                        this.exp = new Function(`return ${this.getAttribute("exp")}`)();
                        this.render();
                        silentRerenderPage();
                    }
                    ;
                });
            });
            observer.observe(this, {
                attributes: true
            });
        }
        this.render();
    }
    ;
    render() {
        const eval_exp = new Function(`return ${this.getAttribute("exp")}`)();
        const value = eval_exp instanceof Store ? eval_exp.value : eval_exp;
        if (value) {
            this.showing = true;
            this.style.display = "block";
        }
        else {
            this.showing = false;
            this.style.display = "none";
        }
    }
    ;
}
customElements.define("uix-if", UIX_IF);
export const documentReady = new Store(false);
class UIX_READY extends HTMLElement {
    constructor() {
        super();
        this.style.display = "none";
        this.showing = documentReady.value;
        const subscriber = (when, _) => {
            if (when !== "afterChange" || this.showing)
                return;
            // Ensure it only runs once, should be redundant but just in case.
            documentReady.unsubscribe(subscriber);
            this.showing = true;
            this.style.display = "block";
        };
        documentReady.subscribe(subscriber);
    }
    ;
}
;
customElements.define("uix-ready", UIX_READY);
class UIX_SCRIPT extends HTMLElement {
    constructor() {
        super();
        this.style.display = "none";
    }
    connectedCallback() {
        setTimeout(() => {
            this.execute();
        });
    }
    execute() {
        const script = this.textContent;
        if (!script)
            throw new Error("UIX: Empty script");
        const functions = [
            $,
            renderPage,
            renderBraces,
            CreateComponent,
            UsePlugin,
            evaluateBraceAttributes,
            evaluateDirectives,
            silentRerenderPage,
            setDirectivePrefix
        ];
        let functionNames = [];
        functions.forEach(func => {
            functionNames.push(func.name);
        });
        //@ts-ignore
        const scriptFunction = new Function(functionNames, script).call(this, ...functions);
    }
}
customElements.define("uix-script", UIX_SCRIPT);
// Brace Syntax
const skipElements = [
    "script",
    "style",
    "html",
    "head",
    "meta",
];
export const renderBraces = () => {
    //@ts-ignore
    document.querySelectorAll("[data-brace]").forEach((elem) => {
        if (!elem.textContent)
            return;
        if (elem.hasAttribute("data-brace-skip"))
            return;
        const nodeName = elem.nodeName.toLocaleLowerCase();
        if (skipElements.includes(nodeName))
            return;
        const regex = /{([^]*?)}/g;
        if (!regex.test(elem.textContent))
            return;
        //@ts-ignore
        elem.setAttribute("uix-html", elem.innerHTML);
        //@ts-ignore
        elem.innerHTML = elem.innerHTML.replace(regex, (_, p1) => {
            try {
                const expressionResult = new Function(`return ${p1}`).call(window);
                if (expressionResult instanceof Store) {
                    renderBraceElement(elem);
                    return "";
                }
                return expressionResult !== null ? expressionResult : "";
            }
            catch (e) {
                console.error(`UIX (brace error): ${e}`);
            }
        });
    });
};
export const renderBraceElement = (elem) => {
    if (elem.hasAttribute("data-brace-skip"))
        return;
    const nodeName = elem.nodeName.toLocaleLowerCase();
    if (skipElements.includes(nodeName))
        return;
    const regex = /{([^]*?)}/g;
    if (!regex.test(elem.textContent || ""))
        return;
    //@ts-ignore
    elem.setAttribute("uix-html", elem.innerHTML);
    //@ts-ignore
    elem.innerHTML = elem.innerHTML.replace(regex, (_, p1) => {
        try {
            const expressionResult = new Function(`return ${p1}`).call(window);
            if (expressionResult instanceof Store && !elem.getAttribute("data-brace-reactive")) {
                expressionResult.subscribe((w, v) => {
                    renderBraceElement(elem);
                });
                elem.setAttribute("data-brace-reactive", "true");
            }
            ;
            return expressionResult !== null ? expressionResult : "";
        }
        catch (e) {
            console.error(`UIX (brace error): ${e}`);
        }
    });
};
let directivePrefix = "@";
export const setDirectivePrefix = (prefix) => {
    directivePrefix = prefix;
};
// Brace attributes
const evaluateBraceAttributes = () => {
    const elements = document.querySelectorAll("*");
    for (const element of elements) {
        for (const attribute of element.attributes) {
            // Ignore directives
            //if (attribute.name.includes(directivePrefix)) continue;
            if (attribute.value.includes("{") && attribute.value.includes("}")) {
                let insideBraces = false;
                let braceExpression = "";
                let newValue = "";
                for (let i = 0; i < attribute.value.length; i++) {
                    if (attribute.value[i] === "{") {
                        insideBraces = true;
                        braceExpression = "";
                        continue;
                    }
                    if (attribute.value[i] === "}") {
                        insideBraces = false;
                        try {
                            const evaluated = new Function(`return ${braceExpression};`)();
                            newValue += evaluated;
                        }
                        catch (e) {
                            console.error(e);
                        }
                        braceExpression = "";
                        continue;
                    }
                    if (insideBraces) {
                        braceExpression += attribute.value[i];
                    }
                    else {
                        newValue += attribute.value[i];
                    }
                }
                element.setAttribute(attribute.name, newValue);
            }
        }
    }
};
const customDirectives = [];
const customDirectiveNames = [];
export const evaluateDirectives = (components, context = window) => {
    const eventDirectives = [
        "click",
        "keydown",
        "keypress",
        "keyup",
        "ready",
        "load",
        "render",
        "change",
        "input"
    ];
    const stateDirectives = [
        "bind",
        "bind:checked",
        "readhtml",
        "read"
    ];
    const layoutDirectives = [
        "repeat",
        "if"
    ];
    const directives = [...eventDirectives, ...stateDirectives, ...layoutDirectives];
    const elements = components ? [...components] : document.querySelectorAll("*");
    //@ts-ignore
    elements.forEach((elem) => {
        const attrLength = elem.attributes.length;
        for (let i = 0; i < attrLength; i++) {
            const attribute = elem.attributes[i];
            const name = attribute.name.toLocaleLowerCase();
            if (!name.includes(directivePrefix))
                continue;
            if (name.split("@")[1] == "") {
                console.error(`UIX: Invalid or empty directive on a(n) <${elem.nodeName.toLocaleLowerCase()}> element.`);
                continue;
            }
            if (!directives.includes(name.replace(directivePrefix, "")) && !customDirectiveNames.includes(name.replace(directivePrefix, ""))) {
                console.error(`UIX: Directive: ${name} on <${elem.nodeName.toLocaleLowerCase()}> is not a valid directive. Valid directives are: ${directives.join(", ")}.`);
                continue;
            }
            const directiveName = name.split(directivePrefix)[1];
            const directiveFunction = new Function('e', `${attribute.value}`).bind(context);
            if (eventDirectives.includes(directiveName)) {
                elem.addEventListener(directiveName, (e) => {
                    if (directiveName == "ready") {
                        console.warn("The @ready directive is deprecated.");
                    }
                    else
                        directiveFunction(e);
                });
            }
            else if (stateDirectives.includes(directiveName)) {
                //@ts-ignore
                const element = elem;
                const directiveValue = new Function(`return ${attribute.value}`).call(context);
                switch (directiveName) {
                    case "bind":
                        const bindSubscriber = (when, value) => {
                            if (when !== "afterChange")
                                return;
                            //@ts-ignore
                            element.value = value;
                        };
                        if (directiveValue instanceof Store) {
                            directiveValue.subscribe(bindSubscriber);
                            setTimeout(() => {
                                //@ts-ignore
                                element.value = directiveValue.value;
                                //@ts-ignore
                                directiveValue.value = element.value;
                            });
                        }
                        element.addEventListener("input", (e) => {
                            if (directiveValue instanceof Store) {
                                directiveValue.unsubscribe(bindSubscriber);
                                directiveValue.value = element.value;
                                directiveValue.subscribe(bindSubscriber);
                            }
                            else {
                                //@ts-ignore
                                window[directiveValue] = element.value;
                                element.value = directiveValue;
                            }
                        });
                        break;
                    case "bind:checked":
                        const checkBindSubscriber = (when, value) => {
                            if (when !== "afterChange")
                                return;
                            //@ts-ignore
                            element.value = value;
                        };
                        if (directiveValue instanceof Store) {
                            directiveValue.subscribe(checkBindSubscriber);
                            setTimeout(() => {
                                //@ts-ignore
                                element.checked = directiveValue.value;
                                //@ts-ignore
                                directiveValue.value = element.value;
                            });
                        }
                        element.addEventListener("click", (e) => {
                            if (directiveValue instanceof Store) {
                                directiveValue.unsubscribe(checkBindSubscriber);
                                directiveValue.value = element.checked;
                                directiveValue.subscribe(checkBindSubscriber);
                            }
                            else {
                                //@ts-ignore
                                window[directiveValue] = element.checked;
                                element.value = directiveValue;
                            }
                        });
                        break;
                    case "readhtml":
                        const readHTML = (_, value) => {
                            elem.innerHTML = value;
                        };
                        if (directiveValue instanceof Store) {
                            directiveValue.subscribe(readHTML);
                        }
                        else {
                            throw new Error("UIX: To use the get directive, it must be a store.");
                        }
                        break;
                    case "read":
                        const readSubscriber = (_, value) => {
                            elem.textContent = value;
                        };
                        if (directiveValue instanceof Store) {
                            directiveValue.subscribe(readSubscriber);
                        }
                        else {
                            throw new Error("UIX: To use the get directive, it must be a store.");
                        }
                        break;
                    default:
                        throw new Error(`UIX: Directive: ${directiveName} is not valid or an error occurred.`);
                        break;
                }
            }
            else if (layoutDirectives.includes(directiveName)) {
                switch (directiveName) {
                    case "repeat":
                        const directiveValue = new Function(`return ${attribute.value}`).call(context);
                        const html = elem.innerHTML;
                        elem.setAttribute("uix-plain-html-repeat", html);
                        elem.innerHTML = "";
                        for (let i = 0; i < directiveValue; i++) {
                            elem.innerHTML += html.replaceAll("[i]", i.toString()).replaceAll("[i1]", (i + 1).toString());
                        }
                        ;
                        break;
                    case "if":
                        const directiveIfValue = new Function(`return ${attribute.value}`).call(context);
                        if (directiveIfValue instanceof Store) {
                            directiveIfValue.subscribe((_, value) => {
                                elem.style.display = value ? "block" : "none";
                            });
                            elem.style.display = directiveIfValue.value ? "block" : "none";
                        }
                        else {
                            const observer = new MutationObserver((mutations) => {
                                mutations.forEach(mutation => {
                                    if (mutation.type === "attributes" && mutation.target === elem && mutation.attributeName === "@if") {
                                        elem.style.display = new Function(`return ${elem.getAttribute("@if")}`).call(context) ? "block" : "none";
                                    }
                                    ;
                                });
                            });
                            observer.observe(elem, {
                                attributes: true
                            });
                        }
                    default:
                        break;
                }
            }
            else if (customDirectiveNames.includes(directiveName)) {
                const index = customDirectiveNames.indexOf(directiveName);
                const directiveObj = customDirectives[index];
                if (directiveObj.name !== directiveName)
                    throw new Error("UIX: Directive mismatch.");
                const directiveValue = attribute.value;
                directiveObj.callback(directiveValue, elem);
            }
        }
        ;
    });
};
export const createCustomDirective = (name, callback) => {
    return new Promise((resolve, reject) => {
        try {
            customDirectiveNames.push(name);
            customDirectives.push({
                name: name,
                callback: callback
            });
            resolve(null);
        }
        catch (e) {
            reject(e);
        }
        ;
    });
};
export const setDirective = (element, directive, value) => {
    //@ts-ignore
    element.attributes[directive] = value;
};
document.addEventListener("DOMContentLoaded", renderPage);
