
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_iframe_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
                // make sure an initial resize event is fired _after_ the iframe is loaded (which is asynchronous)
                // see https://github.com/sveltejs/svelte/issues/4233
                fn();
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    var default_sort$1 = function (item, needle) { return item - needle; };
    function binarySearch$1(array, search, fn) {
        if (fn === void 0) { fn = default_sort$1; }
        var low = 0;
        var high = array.length - 1;
        var sort = fn.length === 1
            ? function (item, needle) { return fn(item) - search; }
            : fn;
        while (low <= high) {
            var i = (high + low) >> 1;
            var d = sort(array[i], search);
            if (d < 0) {
                low = i + 1;
            }
            else if (d > 0) {
                high = i - 1;
            }
            else {
                return i;
            }
        }
        return -low - 1;
    }

    function pickRandom$1(array) {
        var i = ~~(Math.random() * array.length);
        return array[i];
    }

    // http://bost.ocks.org/mike/shuffle/
    function shuffle$2(array) {
        var m = array.length;
        // While there remain elements to shuffle…
        while (m > 0) {
            // Pick a remaining element…
            var i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            var t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    function queue$1(max) {
        if (max === void 0) { max = 4; }
        var items = []; // TODO
        var pending = 0;
        var closed = false;
        var fulfil_closed;
        function dequeue() {
            if (pending === 0 && items.length === 0) {
                if (fulfil_closed)
                    fulfil_closed();
            }
            if (pending >= max)
                return;
            if (items.length === 0)
                return;
            pending += 1;
            var _a = items.shift(), fn = _a.fn, fulfil = _a.fulfil, reject = _a.reject;
            var promise = fn();
            try {
                promise.then(fulfil, reject).then(function () {
                    pending -= 1;
                    dequeue();
                });
            }
            catch (err) {
                reject(err);
                pending -= 1;
                dequeue();
            }
            dequeue();
        }
        return {
            add: function (fn) {
                if (closed) {
                    throw new Error("Cannot add to a closed queue");
                }
                return new Promise(function (fulfil, reject) {
                    items.push({ fn: fn, fulfil: fulfil, reject: reject });
                    dequeue();
                });
            },
            close: function () {
                closed = true;
                return new Promise(function (fulfil, reject) {
                    if (pending === 0) {
                        fulfil();
                    }
                    else {
                        fulfil_closed = fulfil;
                    }
                });
            }
        };
    }

    function createSprite$1(width, height, fn) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        fn(ctx, canvas);
        return canvas;
    }

    function clamp$1(num, min, max) {
        return num < min ? min : num > max ? max : num;
    }

    function random$1(a, b) {
        if (b === undefined)
            return Math.random() * a;
        return a + Math.random() * (b - a);
    }

    function linear$1(domain, range) {
        var d0 = domain[0];
        var r0 = range[0];
        var m = (range[1] - r0) / (domain[1] - d0);
        return Object.assign(function (num) {
            return r0 + (num - d0) * m;
        }, {
            inverse: function () { return linear$1(range, domain); }
        });
    }

    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    function commas$1(num) {
        var parts = String(num).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    var yootils$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        binarySearch: binarySearch$1,
        clamp: clamp$1,
        commas: commas$1,
        createSprite: createSprite$1,
        linearScale: linear$1,
        pickRandom: pickRandom$1,
        queue: queue$1,
        random: random$1,
        shuffle: shuffle$2
    });

    /* node_modules/@sveltejs/pancake/components/Chart.svelte generated by Svelte v3.59.2 */
    const file$6 = "node_modules/@sveltejs/pancake/components/Chart.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let div_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "pancake-chart svelte-1gzh5rp");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[17].call(div));
    			toggle_class(div, "clip", /*clip*/ ctx[0]);
    			add_location(div, file$6, 78, 0, 1618);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[16](div);
    			div_resize_listener = add_iframe_resize_listener(div, /*div_elementresize_handler*/ ctx[17].bind(div));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousemove", /*handle_mousemove*/ ctx[6], false, false, false, false),
    					listen_dev(div, "mouseleave", /*handle_mouseleave*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*clip*/ 1) {
    				toggle_class(div, "clip", /*clip*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[16](null);
    			div_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const key = {};

    function getChartContext() {
    	return getContext(key);
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $y_scale_inverse;
    	let $x_scale_inverse;
    	let $width;
    	let $height;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chart', slots, ['default']);
    	let { x1 = 0 } = $$props;
    	let { y1 = 0 } = $$props;
    	let { x2 = 1 } = $$props;
    	let { y2 = 1 } = $$props;
    	let { clip = false } = $$props;
    	let chart;
    	const _x1 = writable();
    	const _y1 = writable();
    	const _x2 = writable();
    	const _y2 = writable();
    	const width = writable();
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(2, $width = value));
    	const height = writable();
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(3, $height = value));
    	const pointer = writable(null);

    	const handle_mousemove = e => {
    		const bcr = chart.getBoundingClientRect();
    		const left = e.clientX - bcr.left;
    		const top = e.clientY - bcr.top;
    		const x = $x_scale_inverse(100 * left / (bcr.right - bcr.left));
    		const y = $y_scale_inverse(100 * top / (bcr.bottom - bcr.top));
    		pointer.set({ x, y, left, top });
    	};

    	const handle_mouseleave = () => {
    		pointer.set(null);
    	};

    	const x_scale = derived([_x1, _x2], ([$x1, $x2]) => {
    		return linear$1([$x1, $x2], [0, 100]);
    	});

    	const y_scale = derived([_y1, _y2], ([$y1, $y2]) => {
    		return linear$1([$y1, $y2], [100, 0]);
    	});

    	const x_scale_inverse = derived(x_scale, $x_scale => $x_scale.inverse());
    	validate_store(x_scale_inverse, 'x_scale_inverse');
    	component_subscribe($$self, x_scale_inverse, value => $$invalidate(19, $x_scale_inverse = value));
    	const y_scale_inverse = derived(y_scale, $y_scale => $y_scale.inverse());
    	validate_store(y_scale_inverse, 'y_scale_inverse');
    	component_subscribe($$self, y_scale_inverse, value => $$invalidate(18, $y_scale_inverse = value));

    	setContext(key, {
    		x1: _x1,
    		y1: _y1,
    		x2: _x2,
    		y2: _y2,
    		x_scale,
    		y_scale,
    		x_scale_inverse,
    		y_scale_inverse,
    		pointer,
    		width,
    		height
    	});

    	const writable_props = ['x1', 'y1', 'x2', 'y2', 'clip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chart> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			chart = $$value;
    			$$invalidate(1, chart);
    		});
    	}

    	function div_elementresize_handler() {
    		$width = this.clientWidth;
    		width.set($width);
    		$height = this.clientHeight;
    		height.set($height);
    	}

    	$$self.$$set = $$props => {
    		if ('x1' in $$props) $$invalidate(10, x1 = $$props.x1);
    		if ('y1' in $$props) $$invalidate(11, y1 = $$props.y1);
    		if ('x2' in $$props) $$invalidate(12, x2 = $$props.x2);
    		if ('y2' in $$props) $$invalidate(13, y2 = $$props.y2);
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		key,
    		getChartContext,
    		setContext,
    		onDestroy,
    		writable,
    		derived,
    		yootils: yootils$1,
    		x1,
    		y1,
    		x2,
    		y2,
    		clip,
    		chart,
    		_x1,
    		_y1,
    		_x2,
    		_y2,
    		width,
    		height,
    		pointer,
    		handle_mousemove,
    		handle_mouseleave,
    		x_scale,
    		y_scale,
    		x_scale_inverse,
    		y_scale_inverse,
    		$y_scale_inverse,
    		$x_scale_inverse,
    		$width,
    		$height
    	});

    	$$self.$inject_state = $$props => {
    		if ('x1' in $$props) $$invalidate(10, x1 = $$props.x1);
    		if ('y1' in $$props) $$invalidate(11, y1 = $$props.y1);
    		if ('x2' in $$props) $$invalidate(12, x2 = $$props.x2);
    		if ('y2' in $$props) $$invalidate(13, y2 = $$props.y2);
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    		if ('chart' in $$props) $$invalidate(1, chart = $$props.chart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x1*/ 1024) {
    			_x1.set(x1);
    		}

    		if ($$self.$$.dirty & /*y1*/ 2048) {
    			_y1.set(y1);
    		}

    		if ($$self.$$.dirty & /*x2*/ 4096) {
    			_x2.set(x2);
    		}

    		if ($$self.$$.dirty & /*y2*/ 8192) {
    			_y2.set(y2);
    		}
    	};

    	return [
    		clip,
    		chart,
    		$width,
    		$height,
    		width,
    		height,
    		handle_mousemove,
    		handle_mouseleave,
    		x_scale_inverse,
    		y_scale_inverse,
    		x1,
    		y1,
    		x2,
    		y2,
    		$$scope,
    		slots,
    		div_binding,
    		div_elementresize_handler
    	];
    }

    class Chart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { x1: 10, y1: 11, x2: 12, y2: 13, clip: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chart",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get x1() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clip() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clip(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // adapted from https://github.com/d3/d3-array/blob/master/src/ticks.js
    // MIT License https://github.com/d3/d3-array/blob/master/LICENSE
    const e10 = Math.sqrt(50);
    const e5 = Math.sqrt(10);
    const e2 = Math.sqrt(2);

    function get_ticks(start, stop, count = 5) {
    	var reverse;
    	var i = -1;
    	var n;
    	var ticks;
    	var step;

    	if (start === stop && count > 0) return [start];

    	if (reverse = stop < start) {
    		[start, stop] = [stop, start];
    	}

    	if ((step = increment(start, stop, count)) === 0 || !isFinite(step)) {
    		return [];
    	}

    	if (step > 0) {
    		start = Math.ceil(start / step);
    		stop = Math.floor(stop / step);
    		ticks = new Array((n = Math.ceil(stop - start + 1)));
    		while (++i < n) ticks[i] = (start + i) * step;
    	} else {
    		start = Math.floor(start * step);
    		stop = Math.ceil(stop * step);
    		ticks = new Array((n = Math.ceil(start - stop + 1)));
    		while (++i < n) ticks[i] = (start - i) / step;
    	}

    	if (reverse) ticks.reverse();

    	return ticks;
    }

    function increment(start, stop, count) {
    	const step = (stop - start) / Math.max(0, count);
    	const power = Math.floor(Math.log(step) / Math.LN10);
    	const error = step / Math.pow(10, power);

    	return power >= 0
    		? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) *
    				Math.pow(10, power)
    		: -Math.pow(10, -power) /
    				(error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    /* node_modules/@sveltejs/pancake/components/Grid.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$5 = "node_modules/@sveltejs/pancake/components/Grid.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    const get_default_slot_changes$b = dirty => ({
    	value: dirty & /*_ticks*/ 2,
    	last: dirty & /*_ticks*/ 2
    });

    const get_default_slot_context$b = ctx => ({
    	value: /*tick*/ ctx[23],
    	first: /*i*/ ctx[25] === 0,
    	last: /*i*/ ctx[25] === /*_ticks*/ ctx[1].length - 1
    });

    // (31:1) {#each _ticks as tick, i}
    function create_each_block$3(ctx) {
    	let div;
    	let t;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context$b);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			attr_dev(div, "class", "pancake-grid-item svelte-1wq9bba");
    			attr_dev(div, "style", div_style_value = /*style*/ ctx[0](/*tick*/ ctx[23], /*i*/ ctx[25]));
    			add_location(div, file$5, 31, 2, 876);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, _ticks*/ 524290)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, get_default_slot_changes$b),
    						get_default_slot_context$b
    					);
    				}
    			}

    			if (!current || dirty & /*style, _ticks*/ 3 && div_style_value !== (div_style_value = /*style*/ ctx[0](/*tick*/ ctx[23], /*i*/ ctx[25]))) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(31:1) {#each _ticks as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let current;
    	let each_value = /*_ticks*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pancake-grid");
    			add_location(div, file$5, 29, 0, 820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*style, _ticks, $$scope*/ 524291) {
    				each_value = /*_ticks*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let orientation;
    	let _ticks;
    	let style;
    	let $x_scale;
    	let $y_scale;
    	let $x2;
    	let $x1;
    	let $y2;
    	let $y1;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Grid', slots, ['default']);
    	let { count = undefined } = $$props;
    	let { ticks = undefined } = $$props;
    	let { horizontal = false } = $$props;
    	let { vertical = false } = $$props;
    	const { x1, y1, x2, y2, x_scale, y_scale } = getChartContext();
    	validate_store(x1, 'x1');
    	component_subscribe($$self, x1, value => $$invalidate(16, $x1 = value));
    	validate_store(y1, 'y1');
    	component_subscribe($$self, y1, value => $$invalidate(18, $y1 = value));
    	validate_store(x2, 'x2');
    	component_subscribe($$self, x2, value => $$invalidate(15, $x2 = value));
    	validate_store(y2, 'y2');
    	component_subscribe($$self, y2, value => $$invalidate(17, $y2 = value));
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(13, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(14, $y_scale = value));
    	const VERTICAL = {};
    	const HORIZONTAL = {};
    	const writable_props = ['count', 'ticks', 'horizontal', 'vertical'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('count' in $$props) $$invalidate(8, count = $$props.count);
    		if ('ticks' in $$props) $$invalidate(9, ticks = $$props.ticks);
    		if ('horizontal' in $$props) $$invalidate(10, horizontal = $$props.horizontal);
    		if ('vertical' in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		get_ticks,
    		count,
    		ticks,
    		horizontal,
    		vertical,
    		x1,
    		y1,
    		x2,
    		y2,
    		x_scale,
    		y_scale,
    		VERTICAL,
    		HORIZONTAL,
    		orientation,
    		style,
    		_ticks,
    		$x_scale,
    		$y_scale,
    		$x2,
    		$x1,
    		$y2,
    		$y1
    	});

    	$$self.$inject_state = $$props => {
    		if ('count' in $$props) $$invalidate(8, count = $$props.count);
    		if ('ticks' in $$props) $$invalidate(9, ticks = $$props.ticks);
    		if ('horizontal' in $$props) $$invalidate(10, horizontal = $$props.horizontal);
    		if ('vertical' in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ('orientation' in $$props) $$invalidate(12, orientation = $$props.orientation);
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('_ticks' in $$props) $$invalidate(1, _ticks = $$props._ticks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*vertical*/ 2048) {
    			$$invalidate(12, orientation = vertical ? VERTICAL : HORIZONTAL);
    		}

    		if ($$self.$$.dirty & /*horizontal, vertical*/ 3072) {
    			if (horizontal && vertical) {
    				console.error(`<Grid> must specify either 'horizontal' or 'vertical' orientation`);
    			}
    		}

    		if ($$self.$$.dirty & /*ticks, orientation, $y1, $y2, count, $x1, $x2*/ 496384) {
    			$$invalidate(1, _ticks = ticks || (orientation === HORIZONTAL
    			? get_ticks($y1, $y2, count)
    			: get_ticks($x1, $x2, count)));
    		}

    		if ($$self.$$.dirty & /*orientation, $y_scale, $x_scale*/ 28672) {
    			$$invalidate(0, style = orientation === HORIZONTAL
    			? (n, i) => `width: 100%; height: 0; top: ${$y_scale(n, i)}%`
    			: (n, i) => `width: 0; height: 100%; left: ${$x_scale(n, i)}%`);
    		}
    	};

    	return [
    		style,
    		_ticks,
    		x1,
    		y1,
    		x2,
    		y2,
    		x_scale,
    		y_scale,
    		count,
    		ticks,
    		horizontal,
    		vertical,
    		orientation,
    		$x_scale,
    		$y_scale,
    		$x2,
    		$x1,
    		$y2,
    		$y1,
    		$$scope,
    		slots
    	];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			count: 8,
    			ticks: 9,
    			horizontal: 10,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get count() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontal() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontal(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Point.svelte generated by Svelte v3.59.2 */
    const file$4 = "node_modules/@sveltejs/pancake/components/Point.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "pancake-point svelte-11ba04d");
    			set_style(div, "left", /*$x_scale*/ ctx[2](/*x*/ ctx[0]) + "%");
    			set_style(div, "top", /*$y_scale*/ ctx[3](/*y*/ ctx[1]) + "%");
    			add_location(div, file$4, 9, 0, 152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$x_scale, x*/ 5) {
    				set_style(div, "left", /*$x_scale*/ ctx[2](/*x*/ ctx[0]) + "%");
    			}

    			if (!current || dirty & /*$y_scale, y*/ 10) {
    				set_style(div, "top", /*$y_scale*/ ctx[3](/*y*/ ctx[1]) + "%");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $x_scale;
    	let $y_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Point', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(2, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(3, $y_scale = value));
    	let { x } = $$props;
    	let { y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (x === undefined && !('x' in $$props || $$self.$$.bound[$$self.$$.props['x']])) {
    			console.warn("<Point> was created without expected prop 'x'");
    		}

    		if (y === undefined && !('y' in $$props || $$self.$$.bound[$$self.$$.props['y']])) {
    			console.warn("<Point> was created without expected prop 'y'");
    		}
    	});

    	const writable_props = ['x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Point> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x_scale,
    		y_scale,
    		x,
    		y,
    		$x_scale,
    		$y_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [x, y, $x_scale, $y_scale, x_scale, y_scale, $$scope, slots];
    }

    class Point extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { x: 0, y: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Point",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get x() {
    		throw new Error("<Point>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Point>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Point>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Point>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Box.svelte generated by Svelte v3.59.2 */
    const file$3 = "node_modules/@sveltejs/pancake/components/Box.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "pancake-box svelte-38xupb");
    			attr_dev(div, "style", /*style*/ ctx[0]);
    			add_location(div, file$3, 28, 0, 648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*style*/ 1) {
    				attr_dev(div, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, ['default']);
    	let { x1 = 0 } = $$props;
    	let { x2 = 1 } = $$props;
    	let { y1 = 0 } = $$props;
    	let { y2 = 1 } = $$props;
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(8, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(7, $y_scale = value));
    	let style;
    	const writable_props = ['x1', 'x2', 'y1', 'y2'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x1' in $$props) $$invalidate(3, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(4, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(5, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(6, y2 = $$props.y2);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x1,
    		x2,
    		y1,
    		y2,
    		x_scale,
    		y_scale,
    		style,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x1' in $$props) $$invalidate(3, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(4, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(5, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(6, y2 = $$props.y2);
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$x_scale, x1, x2, $y_scale, y1, y2*/ 504) {
    			{
    				const _x1 = $x_scale(x1);
    				const _x2 = $x_scale(x2);
    				const _y1 = $y_scale(y1);
    				const _y2 = $y_scale(y2);
    				const left = Math.min(_x1, _x2);
    				const right = Math.max(_x1, _x2);
    				const top = Math.min(_y1, _y2);
    				const bottom = Math.max(_y1, _y2);
    				const height = bottom - top;
    				$$invalidate(0, style = `left: ${left}%; bottom: ${100 - bottom}%; width: ${right - left}%; height: ${height}%;`);
    			}
    		}
    	};

    	return [style, x_scale, y_scale, x1, x2, y1, y2, $y_scale, $x_scale, $$scope, slots];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { x1: 3, x2: 4, y1: 5, y2: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get x1() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const default_x = d => d.x;
    const default_y = d => d.y;

    /* node_modules/@sveltejs/pancake/components/Bars.svelte generated by Svelte v3.59.2 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    const get_default_slot_changes$a = dirty => ({
    	value: dirty & /*data*/ 1,
    	last: dirty & /*data*/ 1
    });

    const get_default_slot_context$a = ctx => ({
    	value: /*d*/ ctx[6],
    	first: /*i*/ ctx[8] === 0,
    	last: /*i*/ ctx[8] === /*data*/ ctx[0].length - 1
    });

    // (12:1) <Box y1="{y(d, i) - height/2}" y2="{y(d, i) + height/2}" x1={0} x2="{x(d, i)}">
    function create_default_slot$5(ctx) {
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$a);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, data*/ 33)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$a),
    						get_default_slot_context$a
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(12:1) <Box y1=\\\"{y(d, i) - height/2}\\\" y2=\\\"{y(d, i) + height/2}\\\" x1={0} x2=\\\"{x(d, i)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#each data as d, i}
    function create_each_block$2(ctx) {
    	let box;
    	let current;

    	box = new Box({
    			props: {
    				y1: /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) - /*height*/ ctx[1] / 2,
    				y2: /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) + /*height*/ ctx[1] / 2,
    				x1: 0,
    				x2: /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]),
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const box_changes = {};
    			if (dirty & /*y, data, height*/ 11) box_changes.y1 = /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) - /*height*/ ctx[1] / 2;
    			if (dirty & /*y, data, height*/ 11) box_changes.y2 = /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) + /*height*/ ctx[1] / 2;
    			if (dirty & /*x, data*/ 5) box_changes.x2 = /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]);

    			if (dirty & /*$$scope, data*/ 33) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(11:0) {#each data as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y, data, height, x, $$scope*/ 47) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bars', slots, ['default']);
    	let { data } = $$props;
    	let { height = 1 } = $$props;
    	let { x = d => d.x } = $$props;
    	let { y = d => d.y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<Bars> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'height', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bars> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Box,
    		default_x,
    		default_y,
    		data,
    		height,
    		x,
    		y
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, height, x, y, slots, $$scope];
    }

    class Bars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { data: 0, height: 1, x: 2, y: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bars",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get data() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Columns.svelte generated by Svelte v3.59.2 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    const get_default_slot_changes$9 = dirty => ({
    	value: dirty & /*data*/ 1,
    	last: dirty & /*data*/ 1
    });

    const get_default_slot_context$9 = ctx => ({
    	value: /*d*/ ctx[6],
    	first: /*i*/ ctx[8] === 0,
    	last: /*i*/ ctx[8] === /*data*/ ctx[0].length - 1
    });

    // (12:1) <Box x1="{x(d, i) - width/2}" x2="{x(d, i) + width/2}" y1={0} y2="{y(d, i)}">
    function create_default_slot$4(ctx) {
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$9);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, data*/ 33)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$9),
    						get_default_slot_context$9
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(12:1) <Box x1=\\\"{x(d, i) - width/2}\\\" x2=\\\"{x(d, i) + width/2}\\\" y1={0} y2=\\\"{y(d, i)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#each data as d, i}
    function create_each_block$1(ctx) {
    	let box;
    	let current;

    	box = new Box({
    			props: {
    				x1: /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) - /*width*/ ctx[1] / 2,
    				x2: /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) + /*width*/ ctx[1] / 2,
    				y1: 0,
    				y2: /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]),
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const box_changes = {};
    			if (dirty & /*x, data, width*/ 7) box_changes.x1 = /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) - /*width*/ ctx[1] / 2;
    			if (dirty & /*x, data, width*/ 7) box_changes.x2 = /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) + /*width*/ ctx[1] / 2;
    			if (dirty & /*y, data*/ 9) box_changes.y2 = /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]);

    			if (dirty & /*$$scope, data*/ 33) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:0) {#each data as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*x, data, width, y, $$scope*/ 47) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Columns', slots, ['default']);
    	let { data } = $$props;
    	let { width = 1 } = $$props;
    	let { x = d => d.x } = $$props;
    	let { y = d => d.y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<Columns> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'width', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Columns> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Box,
    		default_x,
    		default_y,
    		data,
    		width,
    		x,
    		y
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, width, x, y, slots, $$scope];
    }

    class Columns extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { data: 0, width: 1, x: 2, y: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Columns",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get data() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Svg.svelte generated by Svelte v3.59.2 */

    const file$2 = "node_modules/@sveltejs/pancake/components/Svg.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "class", "svelte-4s4ihd");
    			toggle_class(svg, "clip", /*clip*/ ctx[0]);
    			add_location(svg, file$2, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*clip*/ 1) {
    				toggle_class(svg, "clip", /*clip*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, ['default']);
    	let { clip = false } = $$props;
    	const writable_props = ['clip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clip });

    	$$self.$inject_state = $$props => {
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [clip, $$scope, slots];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { clip: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get clip() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clip(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgPolygon.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$8 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$8 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$9(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$8);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 257)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$8),
    						get_default_slot_context$8
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let d;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgPolygon', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(7, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(6, $y_scale = value));
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<SvgPolygon> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgPolygon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		default_x,
    		default_y,
    		x_scale,
    		y_scale,
    		data,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $x_scale, x, $y_scale, y*/ 248) {
    			$$invalidate(0, d = `M${data.map((d, i) => `${$x_scale(x(d, i))},${$y_scale(y(d, i))}`).join('L')}`);
    		}
    	};

    	return [d, x_scale, y_scale, data, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgPolygon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { data: 3, x: 4, y: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgPolygon",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get data() {
    		throw new Error("<SvgPolygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgPolygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgPolygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgPolygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgPolygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgPolygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgArea.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$7 = dirty => ({ d: dirty & /*d*/ 128 });
    const get_default_slot_context$7 = ctx => ({ d: /*d*/ ctx[7] });

    // (17:0) <SvgPolygon data={points} let:d>
    function create_default_slot$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context$7);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 192)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, get_default_slot_changes$7),
    						get_default_slot_context$7
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(17:0) <SvgPolygon data={points} let:d>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svgpolygon;
    	let current;

    	svgpolygon = new SvgPolygon({
    			props: {
    				data: /*points*/ ctx[0],
    				$$slots: {
    					default: [create_default_slot$3, ({ d }) => ({ 7: d }), ({ d }) => d ? 128 : 0]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgpolygon.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgpolygon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svgpolygon_changes = {};
    			if (dirty & /*points*/ 1) svgpolygon_changes.data = /*points*/ ctx[0];

    			if (dirty & /*$$scope, d*/ 192) {
    				svgpolygon_changes.$$scope = { dirty, ctx };
    			}

    			svgpolygon.$set(svgpolygon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgpolygon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgpolygon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgpolygon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let points;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgArea', slots, ['default']);
    	let { data } = $$props;
    	let { floor = 0 } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<SvgArea> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'floor', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgArea> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('floor' in $$props) $$invalidate(2, floor = $$props.floor);
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SvgPolygon,
    		default_x,
    		default_y,
    		data,
    		floor,
    		x,
    		y,
    		points
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('floor' in $$props) $$invalidate(2, floor = $$props.floor);
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('points' in $$props) $$invalidate(0, points = $$props.points);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x, data, floor, y*/ 30) {
    			$$invalidate(0, points = [
    				{ x: x(data[0], 0), y: floor },
    				...data.map((d, i) => ({ x: x(d, i), y: y(d, i) })),
    				{
    					x: x(data[data.length - 1], data.length - 1),
    					y: floor
    				}
    			]);
    		}
    	};

    	return [points, data, floor, x, y, slots, $$scope];
    }

    class SvgArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { data: 1, floor: 2, x: 3, y: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgArea",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get data() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get floor() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set floor(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgLine.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$6 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$6 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$6);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 257)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$6),
    						get_default_slot_context$6
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let d;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgLine', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(7, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(6, $y_scale = value));
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<SvgLine> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgLine> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		default_x,
    		default_y,
    		x_scale,
    		y_scale,
    		data,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $x_scale, x, $y_scale, y*/ 248) {
    			$$invalidate(0, d = 'M' + data.map((d, i) => `${$x_scale(x(d, i))},${$y_scale(y(d, i))}`).join('L'));
    		}
    	};

    	return [d, x_scale, y_scale, data, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgLine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 3, x: 4, y: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgLine",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get data() {
    		throw new Error("<SvgLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgRect.svelte generated by Svelte v3.59.2 */

    const get_default_slot_changes$5 = dirty => ({
    	x: dirty & /*left, right*/ 12,
    	y: dirty & /*top, bottom*/ 3,
    	width: dirty & /*right, left*/ 12,
    	height: dirty & /*bottom, top*/ 3
    });

    const get_default_slot_context$5 = ctx => ({
    	x: Math.min(/*left*/ ctx[3], /*right*/ ctx[2]),
    	y: Math.min(/*top*/ ctx[1], /*bottom*/ ctx[0]),
    	width: Math.abs(/*right*/ ctx[2] - /*left*/ ctx[3]),
    	height: Math.abs(/*bottom*/ ctx[0] - /*top*/ ctx[1])
    });

    function create_fragment$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$5);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, left, right, top, bottom*/ 4111)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes$5),
    						get_default_slot_context$5
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let left;
    	let right;
    	let top;
    	let bottom;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgRect', slots, ['default']);
    	let { x1 = 0 } = $$props;
    	let { x2 = 1 } = $$props;
    	let { y1 = 0 } = $$props;
    	let { y2 = 1 } = $$props;
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(11, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(10, $y_scale = value));
    	const writable_props = ['x1', 'x2', 'y1', 'y2'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgRect> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x1' in $$props) $$invalidate(6, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(7, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(8, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(9, y2 = $$props.y2);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x1,
    		x2,
    		y1,
    		y2,
    		x_scale,
    		y_scale,
    		bottom,
    		top,
    		right,
    		left,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x1' in $$props) $$invalidate(6, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(7, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(8, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(9, y2 = $$props.y2);
    		if ('bottom' in $$props) $$invalidate(0, bottom = $$props.bottom);
    		if ('top' in $$props) $$invalidate(1, top = $$props.top);
    		if ('right' in $$props) $$invalidate(2, right = $$props.right);
    		if ('left' in $$props) $$invalidate(3, left = $$props.left);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$x_scale, x1*/ 2112) {
    			$$invalidate(3, left = $x_scale(x1));
    		}

    		if ($$self.$$.dirty & /*$x_scale, x2*/ 2176) {
    			$$invalidate(2, right = $x_scale(x2));
    		}

    		if ($$self.$$.dirty & /*$y_scale, y1*/ 1280) {
    			$$invalidate(1, top = $y_scale(y1));
    		}

    		if ($$self.$$.dirty & /*$y_scale, y2*/ 1536) {
    			$$invalidate(0, bottom = $y_scale(y2));
    		}
    	};

    	return [
    		bottom,
    		top,
    		right,
    		left,
    		x_scale,
    		y_scale,
    		x1,
    		x2,
    		y1,
    		y2,
    		$y_scale,
    		$x_scale,
    		$$scope,
    		slots
    	];
    }

    class SvgRect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { x1: 6, x2: 7, y1: 8, y2: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgRect",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get x1() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgScatterplot.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$4 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$4 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$4);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 257)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$4),
    						get_default_slot_context$4
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let d;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgScatterplot', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(7, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(6, $y_scale = value));
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<SvgScatterplot> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgScatterplot> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		default_x,
    		default_y,
    		x_scale,
    		y_scale,
    		data,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $x_scale, x, $y_scale, y*/ 248) {
    			$$invalidate(0, d = data.map((d, i) => {
    				const _x = $x_scale(x(d, i));
    				const _y = $y_scale(y(d, i));
    				return `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`;
    			}).join(' '));
    		}
    	};

    	return [d, x_scale, y_scale, data, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgScatterplot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 3, x: 4, y: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgScatterplot",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get data() {
    		throw new Error("<SvgScatterplot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgScatterplot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgScatterplot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgScatterplot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgScatterplot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgScatterplot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgPoint.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$3 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$3 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$3);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 129)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$3),
    						get_default_slot_context$3
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgPoint', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(6, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(5, $y_scale = value));
    	let { x } = $$props;
    	let { y } = $$props;
    	let d;

    	$$self.$$.on_mount.push(function () {
    		if (x === undefined && !('x' in $$props || $$self.$$.bound[$$self.$$.props['x']])) {
    			console.warn("<SvgPoint> was created without expected prop 'x'");
    		}

    		if (y === undefined && !('y' in $$props || $$self.$$.bound[$$self.$$.props['y']])) {
    			console.warn("<SvgPoint> was created without expected prop 'y'");
    		}
    	});

    	const writable_props = ['x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgPoint> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x_scale,
    		y_scale,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$x_scale, x, $y_scale, y*/ 120) {
    			{
    				const _x = $x_scale(x);
    				const _y = $y_scale(y);
    				$$invalidate(0, d = `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`);
    			}
    		}
    	};

    	return [d, x_scale, y_scale, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgPoint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { x: 3, y: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgPoint",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get x() {
    		throw new Error("<SvgPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let Node$2 = class Node {
    	constructor(x0, y0, x1, y1) {
    		this.x0 = x0;
    		this.y0 = y0;
    		this.x1 = x1;
    		this.y1 = y1;
    		this.xm = (x0 + x1) / 2;
    		this.ym = (y0 + y1) / 2;

    		this.empty = true;
    		this.leaf = null;
    		this.children = null;
    	}

    	add(p) {
    		const { x0, y0, x1, y1, xm, ym, leaf } = this;

    		if (this.empty) {
    			this.leaf = p;
    			this.empty = false;
    			return;
    		}

    		if (leaf) {
    			// discard coincident points
    			if (leaf.x === p.x && leaf.y === p.y) return;

    			// need to subdivide
    			this.children = {
    				nw: new Node(x0, y0, xm, ym),
    				ne: new Node(xm, y0, x1, ym),
    				sw: new Node(x0, ym, xm, y1),
    				se: new Node(xm, ym, x1, y1)
    			};

    			this.leaf = null;
    			this.add(leaf);
    		}

    		const child = p.x < xm
    			? p.y < ym ? this.children.nw : this.children.sw
    			: p.y < ym ? this.children.ne : this.children.se;

    		child.add(p);
    	}
    };

    function build_tree(data, x, y, x_scale, y_scale) {
    	const points = data.map((d, i) => ({
    		d,
    		x: x_scale(x(d, i)),
    		y: y_scale(y(d, i))
    	}));

    	let x0 = Infinity;
    	let y0 = Infinity;
    	let x1 = -Infinity;
    	let y1 = -Infinity;

    	for (let i = 0; i < points.length; i += 1) {
    		const p = points[i];

    		if (p.x < x0) x0 = p.x;
    		if (p.y < y0) y0 = p.y;
    		if (p.x > x1) x1 = p.x;
    		if (p.y > y1) y1 = p.y;
    	}

    	const root = new Node$2(x0, y0, x1, y1);

    	for (let i = 0; i < points.length; i += 1) {
    		const p = points[i];
    		if (isNaN(p.x) || isNaN(p.y)) continue;

    		root.add(p);
    	}

    	return root;
    }

    class Quadtree {
    	constructor(data) {
    		this.data = data;
    		this.x = null;
    		this.y = null;
    		this.x_scale = null;
    		this.y_scale = null;
    	}

    	update(x, y, x_scale, y_scale) {
    		this.root = null;
    		this.x = x;
    		this.y = y;
    		this.x_scale = x_scale;
    		this.y_scale = y_scale;
    	}

    	find(left, top, width, height, radius) {
    		if (!this.root) this.root = build_tree(this.data, this.x, this.y, this.x_scale, this.y_scale);

    		const queue = [this.root];

    		let node;
    		let closest;
    		let min_d_squared = Infinity;

    		const x_to_px = x => x * width / 100;
    		const y_to_px = y => y * height / 100;

    		while (node = queue.pop()) {
    			if (node.empty) continue;

    			const left0 = x_to_px(node.x0);
    			const left1 = x_to_px(node.x1);
    			const top0 = y_to_px(node.y0);
    			const top1 = y_to_px(node.y1);

    			const out_of_bounds = (
    				left < (Math.min(left0, left1) - radius) ||
    				left > (Math.max(left0, left1) + radius) ||
    				top < (Math.min(top0, top1) - radius) ||
    				top > (Math.max(top0, top1) + radius)
    			);

    			if (out_of_bounds) continue;

    			if (node.leaf) {
    				const dl = x_to_px(node.leaf.x) - left;
    				const dt = y_to_px(node.leaf.y) - top;

    				const d_squared = (dl * dl + dt * dt);

    				if (d_squared < min_d_squared) {
    					closest = node.leaf.d;
    					min_d_squared = d_squared;
    				}
    			} else {
    				queue.push(
    					node.children.nw,
    					node.children.ne,
    					node.children.sw,
    					node.children.se
    				);
    			}
    		}

    		return min_d_squared < (radius * radius)
    			? closest
    			: null;
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Quadtree.svelte generated by Svelte v3.59.2 */
    const get_default_slot_changes$2 = dirty => ({ closest: dirty & /*closest*/ 1 });
    const get_default_slot_context$2 = ctx => ({ closest: /*closest*/ ctx[0] });

    function create_fragment$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context$2);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, closest*/ 262145)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let quadtree;
    	let $height;
    	let $width;
    	let $pointer;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quadtree', slots, ['default']);
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;
    	let { radius = Infinity } = $$props;
    	let { closest = undefined } = $$props;
    	const { pointer, x_scale, y_scale, x_scale_inverse, y_scale_inverse, width, height } = getChartContext();
    	validate_store(pointer, 'pointer');
    	component_subscribe($$self, pointer, value => $$invalidate(15, $pointer = value));
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(17, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(16, $y_scale = value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(14, $width = value));
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(13, $height = value));
    	const dispatch = createEventDispatcher();

    	// track reference changes, to trigger updates sparingly
    	let prev_closest;

    	let next_closest;

    	$$self.$$.on_mount.push(function () {
    		if (data === undefined && !('data' in $$props || $$self.$$.bound[$$self.$$.props['data']])) {
    			console.warn("<Quadtree> was created without expected prop 'data'");
    		}
    	});

    	const writable_props = ['data', 'x', 'y', 'radius', 'closest'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Quadtree> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(6, data = $$props.data);
    		if ('x' in $$props) $$invalidate(7, x = $$props.x);
    		if ('y' in $$props) $$invalidate(8, y = $$props.y);
    		if ('radius' in $$props) $$invalidate(9, radius = $$props.radius);
    		if ('closest' in $$props) $$invalidate(0, closest = $$props.closest);
    		if ('$$scope' in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getChartContext,
    		Quadtree,
    		default_x,
    		default_y,
    		data,
    		x,
    		y,
    		radius,
    		closest,
    		pointer,
    		x_scale,
    		y_scale,
    		x_scale_inverse,
    		y_scale_inverse,
    		width,
    		height,
    		dispatch,
    		prev_closest,
    		next_closest,
    		quadtree,
    		$height,
    		$width,
    		$pointer,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(6, data = $$props.data);
    		if ('x' in $$props) $$invalidate(7, x = $$props.x);
    		if ('y' in $$props) $$invalidate(8, y = $$props.y);
    		if ('radius' in $$props) $$invalidate(9, radius = $$props.radius);
    		if ('closest' in $$props) $$invalidate(0, closest = $$props.closest);
    		if ('prev_closest' in $$props) $$invalidate(10, prev_closest = $$props.prev_closest);
    		if ('next_closest' in $$props) $$invalidate(11, next_closest = $$props.next_closest);
    		if ('quadtree' in $$props) $$invalidate(12, quadtree = $$props.quadtree);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 64) {
    			$$invalidate(12, quadtree = new Quadtree(data));
    		}

    		if ($$self.$$.dirty & /*quadtree, x, y, $x_scale, $y_scale*/ 201088) {
    			quadtree.update(x, y, $x_scale, $y_scale);
    		}

    		if ($$self.$$.dirty & /*$pointer, quadtree, $width, $height, radius*/ 61952) {
    			$$invalidate(11, next_closest = $pointer !== null
    			? quadtree.find($pointer.left, $pointer.top, $width, $height, radius)
    			: null);
    		}

    		if ($$self.$$.dirty & /*next_closest, prev_closest*/ 3072) {
    			if (next_closest !== prev_closest) {
    				$$invalidate(0, closest = $$invalidate(10, prev_closest = next_closest));
    			}
    		}
    	};

    	return [
    		closest,
    		pointer,
    		x_scale,
    		y_scale,
    		width,
    		height,
    		data,
    		x,
    		y,
    		radius,
    		prev_closest,
    		next_closest,
    		quadtree,
    		$height,
    		$width,
    		$pointer,
    		$y_scale,
    		$x_scale,
    		$$scope,
    		slots
    	];
    }

    class Quadtree_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			data: 6,
    			x: 7,
    			y: 8,
    			radius: 9,
    			closest: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quadtree_1",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get data() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closest() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closest(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function stacks (data, keys, i = (d, i) => i) {
    	if (typeof i === 'string') {
    		const key = i;
    		i = d => d[key];
    	}

    	const stacks = data.map(d => {
    		const stack = keys.map(key => ({
    			key,
    			value: d[key],
    			i: i(d),
    			start: null,
    			end: null
    		}));

    		let acc = 0;

    		stack.forEach(d => {
    			d.start = acc;
    			d.end = acc += d.value;
    		});

    		return stack;
    	});

    	return keys.map(key => ({
    		key,
    		values: stacks.map(s => {
    			return s.find(d => d.key === key);
    		})
    	}));
    }

    var Pancake = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Bars: Bars,
        Box: Box,
        Chart: Chart,
        Columns: Columns,
        Grid: Grid,
        Point: Point,
        Quadtree: Quadtree_1,
        Svg: Svg,
        SvgArea: SvgArea,
        SvgLine: SvgLine,
        SvgPoint: SvgPoint,
        SvgPolygon: SvgPolygon,
        SvgRect: SvgRect,
        SvgScatterplot: SvgScatterplot,
        stacks: stacks
    });

    function defaultSeparation$1(a, b) {
      return a.parent === b.parent ? 1 : 2;
    }

    function meanX(children) {
      return children.reduce(meanXReduce, 0) / children.length;
    }

    function meanXReduce(x, c) {
      return x + c.x;
    }

    function maxY(children) {
      return 1 + children.reduce(maxYReduce, 0);
    }

    function maxYReduce(y, c) {
      return Math.max(y, c.y);
    }

    function leafLeft(node) {
      var children;
      while (children = node.children) node = children[0];
      return node;
    }

    function leafRight(node) {
      var children;
      while (children = node.children) node = children[children.length - 1];
      return node;
    }

    function cluster() {
      var separation = defaultSeparation$1,
          dx = 1,
          dy = 1,
          nodeSize = false;

      function cluster(root) {
        var previousNode,
            x = 0;

        // First walk, computing the initial x & y values.
        root.eachAfter(function(node) {
          var children = node.children;
          if (children) {
            node.x = meanX(children);
            node.y = maxY(children);
          } else {
            node.x = previousNode ? x += separation(node, previousNode) : 0;
            node.y = 0;
            previousNode = node;
          }
        });

        var left = leafLeft(root),
            right = leafRight(root),
            x0 = left.x - separation(left, right) / 2,
            x1 = right.x + separation(right, left) / 2;

        // Second walk, normalizing x & y to the desired size.
        return root.eachAfter(nodeSize ? function(node) {
          node.x = (node.x - root.x) * dx;
          node.y = (root.y - node.y) * dy;
        } : function(node) {
          node.x = (node.x - x0) / (x1 - x0) * dx;
          node.y = (1 - (root.y ? node.y / root.y : 1)) * dy;
        });
      }

      cluster.separation = function(x) {
        return arguments.length ? (separation = x, cluster) : separation;
      };

      cluster.size = function(x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? null : [dx, dy]);
      };

      cluster.nodeSize = function(x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], cluster) : (nodeSize ? [dx, dy] : null);
      };

      return cluster;
    }

    function count(node) {
      var sum = 0,
          children = node.children,
          i = children && children.length;
      if (!i) sum = 1;
      else while (--i >= 0) sum += children[i].value;
      node.value = sum;
    }

    function node_count() {
      return this.eachAfter(count);
    }

    function node_each(callback, that) {
      let index = -1;
      for (const node of this) {
        callback.call(that, node, ++index, this);
      }
      return this;
    }

    function node_eachBefore(callback, that) {
      var node = this, nodes = [node], children, i, index = -1;
      while (node = nodes.pop()) {
        callback.call(that, node, ++index, this);
        if (children = node.children) {
          for (i = children.length - 1; i >= 0; --i) {
            nodes.push(children[i]);
          }
        }
      }
      return this;
    }

    function node_eachAfter(callback, that) {
      var node = this, nodes = [node], next = [], children, i, n, index = -1;
      while (node = nodes.pop()) {
        next.push(node);
        if (children = node.children) {
          for (i = 0, n = children.length; i < n; ++i) {
            nodes.push(children[i]);
          }
        }
      }
      while (node = next.pop()) {
        callback.call(that, node, ++index, this);
      }
      return this;
    }

    function node_find(callback, that) {
      let index = -1;
      for (const node of this) {
        if (callback.call(that, node, ++index, this)) {
          return node;
        }
      }
    }

    function node_sum(value) {
      return this.eachAfter(function(node) {
        var sum = +value(node.data) || 0,
            children = node.children,
            i = children && children.length;
        while (--i >= 0) sum += children[i].value;
        node.value = sum;
      });
    }

    function node_sort(compare) {
      return this.eachBefore(function(node) {
        if (node.children) {
          node.children.sort(compare);
        }
      });
    }

    function node_path(end) {
      var start = this,
          ancestor = leastCommonAncestor(start, end),
          nodes = [start];
      while (start !== ancestor) {
        start = start.parent;
        nodes.push(start);
      }
      var k = nodes.length;
      while (end !== ancestor) {
        nodes.splice(k, 0, end);
        end = end.parent;
      }
      return nodes;
    }

    function leastCommonAncestor(a, b) {
      if (a === b) return a;
      var aNodes = a.ancestors(),
          bNodes = b.ancestors(),
          c = null;
      a = aNodes.pop();
      b = bNodes.pop();
      while (a === b) {
        c = a;
        a = aNodes.pop();
        b = bNodes.pop();
      }
      return c;
    }

    function node_ancestors() {
      var node = this, nodes = [node];
      while (node = node.parent) {
        nodes.push(node);
      }
      return nodes;
    }

    function node_descendants() {
      return Array.from(this);
    }

    function node_leaves() {
      var leaves = [];
      this.eachBefore(function(node) {
        if (!node.children) {
          leaves.push(node);
        }
      });
      return leaves;
    }

    function node_links() {
      var root = this, links = [];
      root.each(function(node) {
        if (node !== root) { // Don’t include the root’s parent, if any.
          links.push({source: node.parent, target: node});
        }
      });
      return links;
    }

    function* node_iterator() {
      var node = this, current, next = [node], children, i, n;
      do {
        current = next.reverse(), next = [];
        while (node = current.pop()) {
          yield node;
          if (children = node.children) {
            for (i = 0, n = children.length; i < n; ++i) {
              next.push(children[i]);
            }
          }
        }
      } while (next.length);
    }

    function hierarchy(data, children) {
      if (data instanceof Map) {
        data = [undefined, data];
        if (children === undefined) children = mapChildren;
      } else if (children === undefined) {
        children = objectChildren;
      }

      var root = new Node$1(data),
          node,
          nodes = [root],
          child,
          childs,
          i,
          n;

      while (node = nodes.pop()) {
        if ((childs = children(node.data)) && (n = (childs = Array.from(childs)).length)) {
          node.children = childs;
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = childs[i] = new Node$1(childs[i]));
            child.parent = node;
            child.depth = node.depth + 1;
          }
        }
      }

      return root.eachBefore(computeHeight);
    }

    function node_copy() {
      return hierarchy(this).eachBefore(copyData);
    }

    function objectChildren(d) {
      return d.children;
    }

    function mapChildren(d) {
      return Array.isArray(d) ? d[1] : null;
    }

    function copyData(node) {
      if (node.data.value !== undefined) node.value = node.data.value;
      node.data = node.data.data;
    }

    function computeHeight(node) {
      var height = 0;
      do node.height = height;
      while ((node = node.parent) && (node.height < ++height));
    }

    function Node$1(data) {
      this.data = data;
      this.depth =
      this.height = 0;
      this.parent = null;
    }

    Node$1.prototype = hierarchy.prototype = {
      constructor: Node$1,
      count: node_count,
      each: node_each,
      eachAfter: node_eachAfter,
      eachBefore: node_eachBefore,
      find: node_find,
      sum: node_sum,
      sort: node_sort,
      path: node_path,
      ancestors: node_ancestors,
      descendants: node_descendants,
      leaves: node_leaves,
      links: node_links,
      copy: node_copy,
      [Symbol.iterator]: node_iterator
    };

    function optional(f) {
      return f == null ? null : required(f);
    }

    function required(f) {
      if (typeof f !== "function") throw new Error;
      return f;
    }

    function constantZero() {
      return 0;
    }

    function constant(x) {
      return function() {
        return x;
      };
    }

    // https://en.wikipedia.org/wiki/Linear_congruential_generator#Parameters_in_common_use
    const a = 1664525;
    const c = 1013904223;
    const m = 4294967296; // 2^32

    function lcg() {
      let s = 1;
      return () => (s = (a * s + c) % m) / m;
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function shuffle$1(array, random) {
      let m = array.length,
          t,
          i;

      while (m) {
        i = random() * m-- | 0;
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
    }

    function enclose(circles) {
      return packEncloseRandom(circles, lcg());
    }

    function packEncloseRandom(circles, random) {
      var i = 0, n = (circles = shuffle$1(Array.from(circles), random)).length, B = [], p, e;

      while (i < n) {
        p = circles[i];
        if (e && enclosesWeak(e, p)) ++i;
        else e = encloseBasis(B = extendBasis(B, p)), i = 0;
      }

      return e;
    }

    function extendBasis(B, p) {
      var i, j;

      if (enclosesWeakAll(p, B)) return [p];

      // If we get here then B must have at least one element.
      for (i = 0; i < B.length; ++i) {
        if (enclosesNot(p, B[i])
            && enclosesWeakAll(encloseBasis2(B[i], p), B)) {
          return [B[i], p];
        }
      }

      // If we get here then B must have at least two elements.
      for (i = 0; i < B.length - 1; ++i) {
        for (j = i + 1; j < B.length; ++j) {
          if (enclosesNot(encloseBasis2(B[i], B[j]), p)
              && enclosesNot(encloseBasis2(B[i], p), B[j])
              && enclosesNot(encloseBasis2(B[j], p), B[i])
              && enclosesWeakAll(encloseBasis3(B[i], B[j], p), B)) {
            return [B[i], B[j], p];
          }
        }
      }

      // If we get here then something is very wrong.
      throw new Error;
    }

    function enclosesNot(a, b) {
      var dr = a.r - b.r, dx = b.x - a.x, dy = b.y - a.y;
      return dr < 0 || dr * dr < dx * dx + dy * dy;
    }

    function enclosesWeak(a, b) {
      var dr = a.r - b.r + Math.max(a.r, b.r, 1) * 1e-9, dx = b.x - a.x, dy = b.y - a.y;
      return dr > 0 && dr * dr > dx * dx + dy * dy;
    }

    function enclosesWeakAll(a, B) {
      for (var i = 0; i < B.length; ++i) {
        if (!enclosesWeak(a, B[i])) {
          return false;
        }
      }
      return true;
    }

    function encloseBasis(B) {
      switch (B.length) {
        case 1: return encloseBasis1(B[0]);
        case 2: return encloseBasis2(B[0], B[1]);
        case 3: return encloseBasis3(B[0], B[1], B[2]);
      }
    }

    function encloseBasis1(a) {
      return {
        x: a.x,
        y: a.y,
        r: a.r
      };
    }

    function encloseBasis2(a, b) {
      var x1 = a.x, y1 = a.y, r1 = a.r,
          x2 = b.x, y2 = b.y, r2 = b.r,
          x21 = x2 - x1, y21 = y2 - y1, r21 = r2 - r1,
          l = Math.sqrt(x21 * x21 + y21 * y21);
      return {
        x: (x1 + x2 + x21 / l * r21) / 2,
        y: (y1 + y2 + y21 / l * r21) / 2,
        r: (l + r1 + r2) / 2
      };
    }

    function encloseBasis3(a, b, c) {
      var x1 = a.x, y1 = a.y, r1 = a.r,
          x2 = b.x, y2 = b.y, r2 = b.r,
          x3 = c.x, y3 = c.y, r3 = c.r,
          a2 = x1 - x2,
          a3 = x1 - x3,
          b2 = y1 - y2,
          b3 = y1 - y3,
          c2 = r2 - r1,
          c3 = r3 - r1,
          d1 = x1 * x1 + y1 * y1 - r1 * r1,
          d2 = d1 - x2 * x2 - y2 * y2 + r2 * r2,
          d3 = d1 - x3 * x3 - y3 * y3 + r3 * r3,
          ab = a3 * b2 - a2 * b3,
          xa = (b2 * d3 - b3 * d2) / (ab * 2) - x1,
          xb = (b3 * c2 - b2 * c3) / ab,
          ya = (a3 * d2 - a2 * d3) / (ab * 2) - y1,
          yb = (a2 * c3 - a3 * c2) / ab,
          A = xb * xb + yb * yb - 1,
          B = 2 * (r1 + xa * xb + ya * yb),
          C = xa * xa + ya * ya - r1 * r1,
          r = -(Math.abs(A) > 1e-6 ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B);
      return {
        x: x1 + xa + xb * r,
        y: y1 + ya + yb * r,
        r: r
      };
    }

    function place(b, a, c) {
      var dx = b.x - a.x, x, a2,
          dy = b.y - a.y, y, b2,
          d2 = dx * dx + dy * dy;
      if (d2) {
        a2 = a.r + c.r, a2 *= a2;
        b2 = b.r + c.r, b2 *= b2;
        if (a2 > b2) {
          x = (d2 + b2 - a2) / (2 * d2);
          y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
          c.x = b.x - x * dx - y * dy;
          c.y = b.y - x * dy + y * dx;
        } else {
          x = (d2 + a2 - b2) / (2 * d2);
          y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
          c.x = a.x + x * dx - y * dy;
          c.y = a.y + x * dy + y * dx;
        }
      } else {
        c.x = a.x + c.r;
        c.y = a.y;
      }
    }

    function intersects(a, b) {
      var dr = a.r + b.r - 1e-6, dx = b.x - a.x, dy = b.y - a.y;
      return dr > 0 && dr * dr > dx * dx + dy * dy;
    }

    function score(node) {
      var a = node._,
          b = node.next._,
          ab = a.r + b.r,
          dx = (a.x * b.r + b.x * a.r) / ab,
          dy = (a.y * b.r + b.y * a.r) / ab;
      return dx * dx + dy * dy;
    }

    function Node(circle) {
      this._ = circle;
      this.next = null;
      this.previous = null;
    }

    function packSiblingsRandom(circles, random) {
      if (!(n = (circles = array(circles)).length)) return 0;

      var a, b, c, n, aa, ca, i, j, k, sj, sk;

      // Place the first circle.
      a = circles[0], a.x = 0, a.y = 0;
      if (!(n > 1)) return a.r;

      // Place the second circle.
      b = circles[1], a.x = -b.r, b.x = a.r, b.y = 0;
      if (!(n > 2)) return a.r + b.r;

      // Place the third circle.
      place(b, a, c = circles[2]);

      // Initialize the front-chain using the first three circles a, b and c.
      a = new Node(a), b = new Node(b), c = new Node(c);
      a.next = c.previous = b;
      b.next = a.previous = c;
      c.next = b.previous = a;

      // Attempt to place each remaining circle…
      pack: for (i = 3; i < n; ++i) {
        place(a._, b._, c = circles[i]), c = new Node(c);

        // Find the closest intersecting circle on the front-chain, if any.
        // “Closeness” is determined by linear distance along the front-chain.
        // “Ahead” or “behind” is likewise determined by linear distance.
        j = b.next, k = a.previous, sj = b._.r, sk = a._.r;
        do {
          if (sj <= sk) {
            if (intersects(j._, c._)) {
              b = j, a.next = b, b.previous = a, --i;
              continue pack;
            }
            sj += j._.r, j = j.next;
          } else {
            if (intersects(k._, c._)) {
              a = k, a.next = b, b.previous = a, --i;
              continue pack;
            }
            sk += k._.r, k = k.previous;
          }
        } while (j !== k.next);

        // Success! Insert the new circle c between a and b.
        c.previous = a, c.next = b, a.next = b.previous = b = c;

        // Compute the new closest circle pair to the centroid.
        aa = score(a);
        while ((c = c.next) !== b) {
          if ((ca = score(c)) < aa) {
            a = c, aa = ca;
          }
        }
        b = a.next;
      }

      // Compute the enclosing circle of the front chain.
      a = [b._], c = b; while ((c = c.next) !== b) a.push(c._); c = packEncloseRandom(a, random);

      // Translate the circles to put the enclosing circle around the origin.
      for (i = 0; i < n; ++i) a = circles[i], a.x -= c.x, a.y -= c.y;

      return c.r;
    }

    function siblings(circles) {
      packSiblingsRandom(circles, lcg());
      return circles;
    }

    function defaultRadius(d) {
      return Math.sqrt(d.value);
    }

    function index$1() {
      var radius = null,
          dx = 1,
          dy = 1,
          padding = constantZero;

      function pack(root) {
        const random = lcg();
        root.x = dx / 2, root.y = dy / 2;
        if (radius) {
          root.eachBefore(radiusLeaf(radius))
              .eachAfter(packChildrenRandom(padding, 0.5, random))
              .eachBefore(translateChild(1));
        } else {
          root.eachBefore(radiusLeaf(defaultRadius))
              .eachAfter(packChildrenRandom(constantZero, 1, random))
              .eachAfter(packChildrenRandom(padding, root.r / Math.min(dx, dy), random))
              .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
        }
        return root;
      }

      pack.radius = function(x) {
        return arguments.length ? (radius = optional(x), pack) : radius;
      };

      pack.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
      };

      pack.padding = function(x) {
        return arguments.length ? (padding = typeof x === "function" ? x : constant(+x), pack) : padding;
      };

      return pack;
    }

    function radiusLeaf(radius) {
      return function(node) {
        if (!node.children) {
          node.r = Math.max(0, +radius(node) || 0);
        }
      };
    }

    function packChildrenRandom(padding, k, random) {
      return function(node) {
        if (children = node.children) {
          var children,
              i,
              n = children.length,
              r = padding(node) * k || 0,
              e;

          if (r) for (i = 0; i < n; ++i) children[i].r += r;
          e = packSiblingsRandom(children, random);
          if (r) for (i = 0; i < n; ++i) children[i].r -= r;
          node.r = e + r;
        }
      };
    }

    function translateChild(k) {
      return function(node) {
        var parent = node.parent;
        node.r *= k;
        if (parent) {
          node.x = parent.x + k * node.x;
          node.y = parent.y + k * node.y;
        }
      };
    }

    function roundNode(node) {
      node.x0 = Math.round(node.x0);
      node.y0 = Math.round(node.y0);
      node.x1 = Math.round(node.x1);
      node.y1 = Math.round(node.y1);
    }

    function treemapDice(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          node,
          i = -1,
          n = nodes.length,
          k = parent.value && (x1 - x0) / parent.value;

      while (++i < n) {
        node = nodes[i], node.y0 = y0, node.y1 = y1;
        node.x0 = x0, node.x1 = x0 += node.value * k;
      }
    }

    function partition() {
      var dx = 1,
          dy = 1,
          padding = 0,
          round = false;

      function partition(root) {
        var n = root.height + 1;
        root.x0 =
        root.y0 = padding;
        root.x1 = dx;
        root.y1 = dy / n;
        root.eachBefore(positionNode(dy, n));
        if (round) root.eachBefore(roundNode);
        return root;
      }

      function positionNode(dy, n) {
        return function(node) {
          if (node.children) {
            treemapDice(node, node.x0, dy * (node.depth + 1) / n, node.x1, dy * (node.depth + 2) / n);
          }
          var x0 = node.x0,
              y0 = node.y0,
              x1 = node.x1 - padding,
              y1 = node.y1 - padding;
          if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
          if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
          node.x0 = x0;
          node.y0 = y0;
          node.x1 = x1;
          node.y1 = y1;
        };
      }

      partition.round = function(x) {
        return arguments.length ? (round = !!x, partition) : round;
      };

      partition.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
      };

      partition.padding = function(x) {
        return arguments.length ? (padding = +x, partition) : padding;
      };

      return partition;
    }

    var preroot = {depth: -1},
        ambiguous = {},
        imputed = {};

    function defaultId(d) {
      return d.id;
    }

    function defaultParentId(d) {
      return d.parentId;
    }

    function stratify() {
      var id = defaultId,
          parentId = defaultParentId,
          path;

      function stratify(data) {
        var nodes = Array.from(data),
            currentId = id,
            currentParentId = parentId,
            n,
            d,
            i,
            root,
            parent,
            node,
            nodeId,
            nodeKey,
            nodeByKey = new Map;

        if (path != null) {
          const I = nodes.map((d, i) => normalize(path(d, i, data)));
          const P = I.map(parentof);
          const S = new Set(I).add("");
          for (const i of P) {
            if (!S.has(i)) {
              S.add(i);
              I.push(i);
              P.push(parentof(i));
              nodes.push(imputed);
            }
          }
          currentId = (_, i) => I[i];
          currentParentId = (_, i) => P[i];
        }

        for (i = 0, n = nodes.length; i < n; ++i) {
          d = nodes[i], node = nodes[i] = new Node$1(d);
          if ((nodeId = currentId(d, i, data)) != null && (nodeId += "")) {
            nodeKey = node.id = nodeId;
            nodeByKey.set(nodeKey, nodeByKey.has(nodeKey) ? ambiguous : node);
          }
          if ((nodeId = currentParentId(d, i, data)) != null && (nodeId += "")) {
            node.parent = nodeId;
          }
        }

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          if (nodeId = node.parent) {
            parent = nodeByKey.get(nodeId);
            if (!parent) throw new Error("missing: " + nodeId);
            if (parent === ambiguous) throw new Error("ambiguous: " + nodeId);
            if (parent.children) parent.children.push(node);
            else parent.children = [node];
            node.parent = parent;
          } else {
            if (root) throw new Error("multiple roots");
            root = node;
          }
        }

        if (!root) throw new Error("no root");

        // When imputing internal nodes, only introduce roots if needed.
        // Then replace the imputed marker data with null.
        if (path != null) {
          while (root.data === imputed && root.children.length === 1) {
            root = root.children[0], --n;
          }
          for (let i = nodes.length - 1; i >= 0; --i) {
            node = nodes[i];
            if (node.data !== imputed) break;
            node.data = null;
          }
        }

        root.parent = preroot;
        root.eachBefore(function(node) { node.depth = node.parent.depth + 1; --n; }).eachBefore(computeHeight);
        root.parent = null;
        if (n > 0) throw new Error("cycle");

        return root;
      }

      stratify.id = function(x) {
        return arguments.length ? (id = optional(x), stratify) : id;
      };

      stratify.parentId = function(x) {
        return arguments.length ? (parentId = optional(x), stratify) : parentId;
      };

      stratify.path = function(x) {
        return arguments.length ? (path = optional(x), stratify) : path;
      };

      return stratify;
    }

    // To normalize a path, we coerce to a string, strip the trailing slash if any
    // (as long as the trailing slash is not immediately preceded by another slash),
    // and add leading slash if missing.
    function normalize(path) {
      path = `${path}`;
      let i = path.length;
      if (slash(path, i - 1) && !slash(path, i - 2)) path = path.slice(0, -1);
      return path[0] === "/" ? path : `/${path}`;
    }

    // Walk backwards to find the first slash that is not the leading slash, e.g.:
    // "/foo/bar" ⇥ "/foo", "/foo" ⇥ "/", "/" ↦ "". (The root is special-cased
    // because the id of the root must be a truthy value.)
    function parentof(path) {
      let i = path.length;
      if (i < 2) return "";
      while (--i > 1) if (slash(path, i)) break;
      return path.slice(0, i);
    }

    // Slashes can be escaped; to determine whether a slash is a path delimiter, we
    // count the number of preceding backslashes escaping the forward slash: an odd
    // number indicates an escaped forward slash.
    function slash(path, i) {
      if (path[i] === "/") {
        let k = 0;
        while (i > 0 && path[--i] === "\\") ++k;
        if ((k & 1) === 0) return true;
      }
      return false;
    }

    function defaultSeparation(a, b) {
      return a.parent === b.parent ? 1 : 2;
    }

    // function radialSeparation(a, b) {
    //   return (a.parent === b.parent ? 1 : 2) / a.depth;
    // }

    // This function is used to traverse the left contour of a subtree (or
    // subforest). It returns the successor of v on this contour. This successor is
    // either given by the leftmost child of v or by the thread of v. The function
    // returns null if and only if v is on the highest level of its subtree.
    function nextLeft(v) {
      var children = v.children;
      return children ? children[0] : v.t;
    }

    // This function works analogously to nextLeft.
    function nextRight(v) {
      var children = v.children;
      return children ? children[children.length - 1] : v.t;
    }

    // Shifts the current subtree rooted at w+. This is done by increasing
    // prelim(w+) and mod(w+) by shift.
    function moveSubtree(wm, wp, shift) {
      var change = shift / (wp.i - wm.i);
      wp.c -= change;
      wp.s += shift;
      wm.c += change;
      wp.z += shift;
      wp.m += shift;
    }

    // All other shifts, applied to the smaller subtrees between w- and w+, are
    // performed by this function. To prepare the shifts, we have to adjust
    // change(w+), shift(w+), and change(w-).
    function executeShifts(v) {
      var shift = 0,
          change = 0,
          children = v.children,
          i = children.length,
          w;
      while (--i >= 0) {
        w = children[i];
        w.z += shift;
        w.m += shift;
        shift += w.s + (change += w.c);
      }
    }

    // If vi-’s ancestor is a sibling of v, returns vi-’s ancestor. Otherwise,
    // returns the specified (default) ancestor.
    function nextAncestor(vim, v, ancestor) {
      return vim.a.parent === v.parent ? vim.a : ancestor;
    }

    function TreeNode(node, i) {
      this._ = node;
      this.parent = null;
      this.children = null;
      this.A = null; // default ancestor
      this.a = this; // ancestor
      this.z = 0; // prelim
      this.m = 0; // mod
      this.c = 0; // change
      this.s = 0; // shift
      this.t = null; // thread
      this.i = i; // number
    }

    TreeNode.prototype = Object.create(Node$1.prototype);

    function treeRoot(root) {
      var tree = new TreeNode(root, 0),
          node,
          nodes = [tree],
          child,
          children,
          i,
          n;

      while (node = nodes.pop()) {
        if (children = node._.children) {
          node.children = new Array(n = children.length);
          for (i = n - 1; i >= 0; --i) {
            nodes.push(child = node.children[i] = new TreeNode(children[i], i));
            child.parent = node;
          }
        }
      }

      (tree.parent = new TreeNode(null, 0)).children = [tree];
      return tree;
    }

    // Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
    function tree() {
      var separation = defaultSeparation,
          dx = 1,
          dy = 1,
          nodeSize = null;

      function tree(root) {
        var t = treeRoot(root);

        // Compute the layout using Buchheim et al.’s algorithm.
        t.eachAfter(firstWalk), t.parent.m = -t.z;
        t.eachBefore(secondWalk);

        // If a fixed node size is specified, scale x and y.
        if (nodeSize) root.eachBefore(sizeNode);

        // If a fixed tree size is specified, scale x and y based on the extent.
        // Compute the left-most, right-most, and depth-most nodes for extents.
        else {
          var left = root,
              right = root,
              bottom = root;
          root.eachBefore(function(node) {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
            if (node.depth > bottom.depth) bottom = node;
          });
          var s = left === right ? 1 : separation(left, right) / 2,
              tx = s - left.x,
              kx = dx / (right.x + s + tx),
              ky = dy / (bottom.depth || 1);
          root.eachBefore(function(node) {
            node.x = (node.x + tx) * kx;
            node.y = node.depth * ky;
          });
        }

        return root;
      }

      // Computes a preliminary x-coordinate for v. Before that, FIRST WALK is
      // applied recursively to the children of v, as well as the function
      // APPORTION. After spacing out the children by calling EXECUTE SHIFTS, the
      // node v is placed to the midpoint of its outermost children.
      function firstWalk(v) {
        var children = v.children,
            siblings = v.parent.children,
            w = v.i ? siblings[v.i - 1] : null;
        if (children) {
          executeShifts(v);
          var midpoint = (children[0].z + children[children.length - 1].z) / 2;
          if (w) {
            v.z = w.z + separation(v._, w._);
            v.m = v.z - midpoint;
          } else {
            v.z = midpoint;
          }
        } else if (w) {
          v.z = w.z + separation(v._, w._);
        }
        v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
      }

      // Computes all real x-coordinates by summing up the modifiers recursively.
      function secondWalk(v) {
        v._.x = v.z + v.parent.m;
        v.m += v.parent.m;
      }

      // The core of the algorithm. Here, a new subtree is combined with the
      // previous subtrees. Threads are used to traverse the inside and outside
      // contours of the left and right subtree up to the highest common level. The
      // vertices used for the traversals are vi+, vi-, vo-, and vo+, where the
      // superscript o means outside and i means inside, the subscript - means left
      // subtree and + means right subtree. For summing up the modifiers along the
      // contour, we use respective variables si+, si-, so-, and so+. Whenever two
      // nodes of the inside contours conflict, we compute the left one of the
      // greatest uncommon ancestors using the function ANCESTOR and call MOVE
      // SUBTREE to shift the subtree and prepare the shifts of smaller subtrees.
      // Finally, we add a new thread (if necessary).
      function apportion(v, w, ancestor) {
        if (w) {
          var vip = v,
              vop = v,
              vim = w,
              vom = vip.parent.children[0],
              sip = vip.m,
              sop = vop.m,
              sim = vim.m,
              som = vom.m,
              shift;
          while (vim = nextRight(vim), vip = nextLeft(vip), vim && vip) {
            vom = nextLeft(vom);
            vop = nextRight(vop);
            vop.a = v;
            shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
            if (shift > 0) {
              moveSubtree(nextAncestor(vim, v, ancestor), v, shift);
              sip += shift;
              sop += shift;
            }
            sim += vim.m;
            sip += vip.m;
            som += vom.m;
            sop += vop.m;
          }
          if (vim && !nextRight(vop)) {
            vop.t = vim;
            vop.m += sim - sop;
          }
          if (vip && !nextLeft(vom)) {
            vom.t = vip;
            vom.m += sip - som;
            ancestor = v;
          }
        }
        return ancestor;
      }

      function sizeNode(node) {
        node.x *= dx;
        node.y = node.depth * dy;
      }

      tree.separation = function(x) {
        return arguments.length ? (separation = x, tree) : separation;
      };

      tree.size = function(x) {
        return arguments.length ? (nodeSize = false, dx = +x[0], dy = +x[1], tree) : (nodeSize ? null : [dx, dy]);
      };

      tree.nodeSize = function(x) {
        return arguments.length ? (nodeSize = true, dx = +x[0], dy = +x[1], tree) : (nodeSize ? [dx, dy] : null);
      };

      return tree;
    }

    function treemapSlice(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          node,
          i = -1,
          n = nodes.length,
          k = parent.value && (y1 - y0) / parent.value;

      while (++i < n) {
        node = nodes[i], node.x0 = x0, node.x1 = x1;
        node.y0 = y0, node.y1 = y0 += node.value * k;
      }
    }

    var phi = (1 + Math.sqrt(5)) / 2;

    function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
      var rows = [],
          nodes = parent.children,
          row,
          nodeValue,
          i0 = 0,
          i1 = 0,
          n = nodes.length,
          dx, dy,
          value = parent.value,
          sumValue,
          minValue,
          maxValue,
          newRatio,
          minRatio,
          alpha,
          beta;

      while (i0 < n) {
        dx = x1 - x0, dy = y1 - y0;

        // Find the next non-empty node.
        do sumValue = nodes[i1++].value; while (!sumValue && i1 < n);
        minValue = maxValue = sumValue;
        alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
        beta = sumValue * sumValue * alpha;
        minRatio = Math.max(maxValue / beta, beta / minValue);

        // Keep adding nodes while the aspect ratio maintains or improves.
        for (; i1 < n; ++i1) {
          sumValue += nodeValue = nodes[i1].value;
          if (nodeValue < minValue) minValue = nodeValue;
          if (nodeValue > maxValue) maxValue = nodeValue;
          beta = sumValue * sumValue * alpha;
          newRatio = Math.max(maxValue / beta, beta / minValue);
          if (newRatio > minRatio) { sumValue -= nodeValue; break; }
          minRatio = newRatio;
        }

        // Position and record the row orientation.
        rows.push(row = {value: sumValue, dice: dx < dy, children: nodes.slice(i0, i1)});
        if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += dy * sumValue / value : y1);
        else treemapSlice(row, x0, y0, value ? x0 += dx * sumValue / value : x1, y1);
        value -= sumValue, i0 = i1;
      }

      return rows;
    }

    var squarify = (function custom(ratio) {

      function squarify(parent, x0, y0, x1, y1) {
        squarifyRatio(ratio, parent, x0, y0, x1, y1);
      }

      squarify.ratio = function(x) {
        return custom((x = +x) > 1 ? x : 1);
      };

      return squarify;
    })(phi);

    function index() {
      var tile = squarify,
          round = false,
          dx = 1,
          dy = 1,
          paddingStack = [0],
          paddingInner = constantZero,
          paddingTop = constantZero,
          paddingRight = constantZero,
          paddingBottom = constantZero,
          paddingLeft = constantZero;

      function treemap(root) {
        root.x0 =
        root.y0 = 0;
        root.x1 = dx;
        root.y1 = dy;
        root.eachBefore(positionNode);
        paddingStack = [0];
        if (round) root.eachBefore(roundNode);
        return root;
      }

      function positionNode(node) {
        var p = paddingStack[node.depth],
            x0 = node.x0 + p,
            y0 = node.y0 + p,
            x1 = node.x1 - p,
            y1 = node.y1 - p;
        if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
        if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
        node.x0 = x0;
        node.y0 = y0;
        node.x1 = x1;
        node.y1 = y1;
        if (node.children) {
          p = paddingStack[node.depth + 1] = paddingInner(node) / 2;
          x0 += paddingLeft(node) - p;
          y0 += paddingTop(node) - p;
          x1 -= paddingRight(node) - p;
          y1 -= paddingBottom(node) - p;
          if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
          if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
          tile(node, x0, y0, x1, y1);
        }
      }

      treemap.round = function(x) {
        return arguments.length ? (round = !!x, treemap) : round;
      };

      treemap.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], treemap) : [dx, dy];
      };

      treemap.tile = function(x) {
        return arguments.length ? (tile = required(x), treemap) : tile;
      };

      treemap.padding = function(x) {
        return arguments.length ? treemap.paddingInner(x).paddingOuter(x) : treemap.paddingInner();
      };

      treemap.paddingInner = function(x) {
        return arguments.length ? (paddingInner = typeof x === "function" ? x : constant(+x), treemap) : paddingInner;
      };

      treemap.paddingOuter = function(x) {
        return arguments.length ? treemap.paddingTop(x).paddingRight(x).paddingBottom(x).paddingLeft(x) : treemap.paddingTop();
      };

      treemap.paddingTop = function(x) {
        return arguments.length ? (paddingTop = typeof x === "function" ? x : constant(+x), treemap) : paddingTop;
      };

      treemap.paddingRight = function(x) {
        return arguments.length ? (paddingRight = typeof x === "function" ? x : constant(+x), treemap) : paddingRight;
      };

      treemap.paddingBottom = function(x) {
        return arguments.length ? (paddingBottom = typeof x === "function" ? x : constant(+x), treemap) : paddingBottom;
      };

      treemap.paddingLeft = function(x) {
        return arguments.length ? (paddingLeft = typeof x === "function" ? x : constant(+x), treemap) : paddingLeft;
      };

      return treemap;
    }

    function binary(parent, x0, y0, x1, y1) {
      var nodes = parent.children,
          i, n = nodes.length,
          sum, sums = new Array(n + 1);

      for (sums[0] = sum = i = 0; i < n; ++i) {
        sums[i + 1] = sum += nodes[i].value;
      }

      partition(0, n, parent.value, x0, y0, x1, y1);

      function partition(i, j, value, x0, y0, x1, y1) {
        if (i >= j - 1) {
          var node = nodes[i];
          node.x0 = x0, node.y0 = y0;
          node.x1 = x1, node.y1 = y1;
          return;
        }

        var valueOffset = sums[i],
            valueTarget = (value / 2) + valueOffset,
            k = i + 1,
            hi = j - 1;

        while (k < hi) {
          var mid = k + hi >>> 1;
          if (sums[mid] < valueTarget) k = mid + 1;
          else hi = mid;
        }

        if ((valueTarget - sums[k - 1]) < (sums[k] - valueTarget) && i + 1 < k) --k;

        var valueLeft = sums[k] - valueOffset,
            valueRight = value - valueLeft;

        if ((x1 - x0) > (y1 - y0)) {
          var xk = value ? (x0 * valueRight + x1 * valueLeft) / value : x1;
          partition(i, k, valueLeft, x0, y0, xk, y1);
          partition(k, j, valueRight, xk, y0, x1, y1);
        } else {
          var yk = value ? (y0 * valueRight + y1 * valueLeft) / value : y1;
          partition(i, k, valueLeft, x0, y0, x1, yk);
          partition(k, j, valueRight, x0, yk, x1, y1);
        }
      }
    }

    function sliceDice(parent, x0, y0, x1, y1) {
      (parent.depth & 1 ? treemapSlice : treemapDice)(parent, x0, y0, x1, y1);
    }

    var resquarify = (function custom(ratio) {

      function resquarify(parent, x0, y0, x1, y1) {
        if ((rows = parent._squarify) && (rows.ratio === ratio)) {
          var rows,
              row,
              nodes,
              i,
              j = -1,
              n,
              m = rows.length,
              value = parent.value;

          while (++j < m) {
            row = rows[j], nodes = row.children;
            for (i = row.value = 0, n = nodes.length; i < n; ++i) row.value += nodes[i].value;
            if (row.dice) treemapDice(row, x0, y0, x1, value ? y0 += (y1 - y0) * row.value / value : y1);
            else treemapSlice(row, x0, y0, value ? x0 += (x1 - x0) * row.value / value : x1, y1);
            value -= row.value;
          }
        } else {
          parent._squarify = rows = squarifyRatio(ratio, parent, x0, y0, x1, y1);
          rows.ratio = ratio;
        }
      }

      resquarify.ratio = function(x) {
        return custom((x = +x) > 1 ? x : 1);
      };

      return resquarify;
    })(phi);

    var d3 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Node: Node$1,
        cluster: cluster,
        hierarchy: hierarchy,
        pack: index$1,
        packEnclose: enclose,
        packSiblings: siblings,
        partition: partition,
        stratify: stratify,
        tree: tree,
        treemap: index,
        treemapBinary: binary,
        treemapDice: treemapDice,
        treemapResquarify: resquarify,
        treemapSlice: treemapSlice,
        treemapSliceDice: sliceDice,
        treemapSquarify: squarify
    });

    /*
    Adapted from https://github.com/mattdesl
    Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
    */
    function backInOut(t) {
        const s = 1.70158 * 1.525;
        if ((t *= 2) < 1)
            return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    }
    function backIn(t) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    }
    function backOut(t) {
        const s = 1.70158;
        return --t * t * ((s + 1) * t + s) + 1;
    }
    function bounceOut(t) {
        const a = 4.0 / 11.0;
        const b = 8.0 / 11.0;
        const c = 9.0 / 10.0;
        const ca = 4356.0 / 361.0;
        const cb = 35442.0 / 1805.0;
        const cc = 16061.0 / 1805.0;
        const t2 = t * t;
        return t < a
            ? 7.5625 * t2
            : t < b
                ? 9.075 * t2 - 9.9 * t + 3.4
                : t < c
                    ? ca * t2 - cb * t + cc
                    : 10.8 * t * t - 20.52 * t + 10.72;
    }
    function bounceInOut(t) {
        return t < 0.5
            ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
            : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
    }
    function bounceIn(t) {
        return 1.0 - bounceOut(1.0 - t);
    }
    function circInOut(t) {
        if ((t *= 2) < 1)
            return -0.5 * (Math.sqrt(1 - t * t) - 1);
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    }
    function circIn(t) {
        return 1.0 - Math.sqrt(1.0 - t * t);
    }
    function circOut(t) {
        return Math.sqrt(1 - --t * t);
    }
    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicIn(t) {
        return t * t * t;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function elasticInOut(t) {
        return t < 0.5
            ? 0.5 *
                Math.sin(((+13.0 * Math.PI) / 2) * 2.0 * t) *
                Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
            : 0.5 *
                Math.sin(((-13.0 * Math.PI) / 2) * (2.0 * t - 1.0 + 1.0)) *
                Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) +
                1.0;
    }
    function elasticIn(t) {
        return Math.sin((13.0 * t * Math.PI) / 2) * Math.pow(2.0, 10.0 * (t - 1.0));
    }
    function elasticOut(t) {
        return (Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0);
    }
    function expoInOut(t) {
        return t === 0.0 || t === 1.0
            ? t
            : t < 0.5
                ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0)
                : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
    }
    function expoIn(t) {
        return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
    }
    function expoOut(t) {
        return t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
    }
    function quadInOut(t) {
        t /= 0.5;
        if (t < 1)
            return 0.5 * t * t;
        t--;
        return -0.5 * (t * (t - 2) - 1);
    }
    function quadIn(t) {
        return t * t;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }
    function quartInOut(t) {
        return t < 0.5
            ? +8.0 * Math.pow(t, 4.0)
            : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
    }
    function quartIn(t) {
        return Math.pow(t, 4.0);
    }
    function quartOut(t) {
        return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
    }
    function quintInOut(t) {
        if ((t *= 2) < 1)
            return 0.5 * t * t * t * t * t;
        return 0.5 * ((t -= 2) * t * t * t * t + 2);
    }
    function quintIn(t) {
        return t * t * t * t * t;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }
    function sineInOut(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    }
    function sineIn(t) {
        const v = Math.cos(t * Math.PI * 0.5);
        if (Math.abs(v) < 1e-14)
            return 1;
        else
            return 1 - v;
    }
    function sineOut(t) {
        return Math.sin((t * Math.PI) / 2);
    }

    var eases = /*#__PURE__*/Object.freeze({
        __proto__: null,
        backIn: backIn,
        backInOut: backInOut,
        backOut: backOut,
        bounceIn: bounceIn,
        bounceInOut: bounceInOut,
        bounceOut: bounceOut,
        circIn: circIn,
        circInOut: circInOut,
        circOut: circOut,
        cubicIn: cubicIn,
        cubicInOut: cubicInOut,
        cubicOut: cubicOut,
        elasticIn: elasticIn,
        elasticInOut: elasticInOut,
        elasticOut: elasticOut,
        expoIn: expoIn,
        expoInOut: expoInOut,
        expoOut: expoOut,
        linear: identity,
        quadIn: quadIn,
        quadInOut: quadInOut,
        quadOut: quadOut,
        quartIn: quartIn,
        quartInOut: quartInOut,
        quartOut: quartOut,
        quintIn: quintIn,
        quintInOut: quintInOut,
        quintOut: quintOut,
        sineIn: sineIn,
        sineInOut: sineInOut,
        sineOut: sineOut
    });

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /**
     * @template T
     * @typedef {(item: T, needle?: number) => number} Comparator<T=any>
     */

    /** @type {Comparator<any>} */
    const default_sort = (item, needle) => item - needle;

    /**
     * @template T
     * @param {T[]} array
     * @param {number} search
     * @param {Comparator<T>} [fn]
     */
    function binarySearch(array, search, fn = default_sort) {
    	let low = 0;
    	let high = array.length - 1;

    	/** @type {Comparator<T>} */
    	const sort =
    		fn.length === 1
    			? /** @type {Comparator<T>} */ ((item, needle) => fn(item) - search)
    			: fn;

    	while (low <= high) {
    		const i = (high + low) >> 1;

    		const d = sort(array[i], search);

    		if (d < 0) {
    			low = i + 1;
    		} else if (d > 0) {
    			high = i - 1;
    		} else {
    			return i;
    		}
    	}

    	return -low - 1;
    }

    /** @param {any[]} array */
    function pickRandom(array) {
    	const i = ~~(Math.random() * array.length);
    	return array[i];
    }

    // http://bost.ocks.org/mike/shuffle/

    /** @param {any[]} array */
    function shuffle(array) {
    	let m = array.length;

    	// While there remain elements to shuffle…
    	while (m > 0) {
    		// Pick a remaining element…
    		const i = Math.floor(Math.random() * m--);

    		// And swap it with the current element.
    		const t = array[m];
    		array[m] = array[i];
    		array[i] = t;
    	}

    	return array;
    }

    /**
     * @typedef {{
     *   fulfil: (value?: any) => void;
     *   reject: (error?: Error) => void;
     *   promise: Promise<any>;
     * }} Deferred
     *
     * @typedef {{
     *   fn: () => Promise<any>;
     *   fulfil: (value: any) => void;
     *   reject: (error: Error) => void;
     * }} Item
     */

    /**
     * Create a queue for running promise-returning functions in sequence, with concurrency=`max`
     * @param {number} max
     */
    function queue(max = 4) {
    	/** @type {Item[]} */
    	const items = []; // TODO

    	let pending = 0;

    	let closed = false;

    	/** @type {(value: any) => void} */
    	let fulfil_closed;

    	function dequeue() {
    		if (pending === 0 && items.length === 0) {
    			if (fulfil_closed) fulfil_closed();
    		}

    		if (pending >= max) return;
    		if (items.length === 0) return;

    		pending += 1;

    		const { fn, fulfil, reject } = items.shift();
    		const promise = fn();

    		try {
    			promise.then(fulfil, reject).then(() => {
    				pending -= 1;
    				dequeue();
    			});
    		} catch (err) {
    			reject(err);
    			pending -= 1;
    			dequeue();
    		}

    		dequeue();
    	}

    	return {
    		/** @param {() => Promise<any>} fn */
    		add(fn) {
    			if (closed) {
    				throw new Error(`Cannot add to a closed queue`);
    			}

    			return new Promise((fulfil, reject) => {
    				items.push({ fn, fulfil, reject });
    				dequeue();
    			});
    		},

    		close() {
    			closed = true;

    			return new Promise((fulfil, reject) => {
    				if (pending === 0) {
    					fulfil();
    				} else {
    					fulfil_closed = fulfil;
    				}
    			});
    		},
    	};
    }

    /**
     * Wait for `ms` milliseconds
     * @param {number} ms
     */
    function sleep(ms) {
    	return new Promise((fulfil) => {
    		setTimeout(fulfil, ms);
    	});
    }

    /**
     * Generate a sprite using the canvas API
     * @param {number} width
     * @param {number} height
     * @param {(ctx: CanvasRenderingContext2D, w: number, h: number) => void} fn
     */
    function createSprite(width, height, fn) {
    	const canvas = document.createElement('canvas');
    	canvas.width = width;
    	canvas.height = height;
    	const ctx = canvas.getContext('2d');

    	fn(ctx, canvas.width, canvas.height);

    	return canvas;
    }

    /**
     * Clamp `num` to the range `[min, max]`
     * @param {number} num
     * @param {number} min
     * @param {number} max
     */
    function clamp(num, min, max) {
    	return num < min ? min : num > max ? max : num;
    }

    /**
     * Generate a random number between `a` and `b`, or between 0 and `a` if `b` is unspecified
     * @param {number} a
     * @param {number} [b]
     */
    function random(a, b) {
    	if (b === undefined) return Math.random() * a;
    	return a + Math.random() * (b - a);
    }

    /*

    Adapted from http://davidbau.com/encode/seedrandom.js

    LICENSE (MIT)
    -------------

    Copyright 2014 David Bau.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    */

    const width = 256; // width: each RC4 output is 0 <= x < 256
    const chunks = 6; // chunks: at least six RC4 outputs for each double
    const digits = 52; // digits: there are 52 significant digits in a double

    //
    // The following constants are related to IEEE 754 limits.
    //
    const startdenom = Math.pow(width, chunks);
    const significance = Math.pow(2, digits);
    const overflow = significance * 2;
    const mask = width - 1;

    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    class ARC4 {
    	/** @param {number[]} key */
    	constructor(key) {
    		this.i = 0;
    		this.j = 0;

    		/** @type {number[]} */
    		this.S = [];

    		// Set up S using the standard key scheduling algorithm.
    		for (let i = 0; i < width; i += 1) {
    			this.S[i] = i;
    		}

    		const len = key.length;
    		let t;
    		let j = 0;

    		for (let i = 0; i < width; i += 1) {
    			this.S[i] = this.S[(j = mask & (j + key[i % len] + (t = this.S[i])))];
    			this.S[j] = t;
    		}

    		// For robust unpredictability, the function call below automatically
    		// discards an initial batch of values.  This is called RC4-drop[256].
    		// See http://google.com/search?q=rsa+fluhrer+response&btnI
    		this.g(width);
    	}

    	/** @param {number} count */
    	g(count) {
    		const s = this.S;
    		let r = 0;

    		while (count--) {
    			const t = s[(this.i = mask & (this.i + 1))];
    			r =
    				r * width +
    				s[
    					mask &
    						((s[this.i] = s[(this.j = mask & (this.j + t))]) + (s[this.j] = t))
    				];
    		}

    		return r;
    	}
    }

    /**
     * Create a seeded random number generator that returns a random number between `a` and `b`, or between 0 and `a` if `b` is unspecified
     * @param {string} seed
     */
    function seedRandom(seed) {
    	if (!seed) seed = '\0';

    	/** @type {number[]} */
    	const key = [];

    	/** @type {number} */
    	let smear;

    	for (let i = 0; i < seed.length; i += 1) {
    		key[mask & i] = mask & ((smear ^= key[mask & i] * 19) + seed.charCodeAt(i));
    	}

    	// Use the seed to initialize an ARC4 generator.
    	const arc4 = new ARC4(key);

    	function prng() {
    		let n = arc4.g(chunks); // Start with a numerator n < 2 ^ 48
    		let d = startdenom; //   and denominator d = 2 ^ 48.
    		let x = 0; //   and no 'extra last byte'.

    		while (n < significance) {
    			// Fill up all significant digits by
    			n = (n + x) * width; //   shifting numerator and
    			d *= width; //   denominator and generating a
    			x = arc4.g(1); //   new least-significant-byte.
    		}

    		while (n >= overflow) {
    			// To avoid rounding up, before adding
    			n /= 2; //   last byte, shift everything
    			d /= 2; //   right using integer math until
    			x >>>= 1; //   we have exactly the desired bits.
    		}

    		return (n + x) / d; // Form the number within [0, 1).
    	}

    	/**
    	 * Generate a random number between `a` and `b`, or between 0 and `a` if `b` is unspecified
    	 * @param {number} a
    	 * @param {number} [b]
    	 */
    	function random(a, b) {
    		if (b === undefined) return prng() * a;
    		return a + prng() * (b - a);
    	}

    	return random;
    }

    /**
     * Generates a `scale` function that maps from `domain` to `range`.
     * `scale.inverse()` returns a function that maps from `range` to `domain`
     * @param {[number, number]} domain
     * @param {[number, number]} range
     */
    function linear(domain, range) {
    	const d0 = domain[0];
    	const r0 = range[0];
    	const m = (range[1] - r0) / (domain[1] - d0);

    	/** @param {number} num */
    	function scale(num) {
    		return r0 + (num - d0) * m;
    	}

    	scale.inverse = () => linear(range, domain);

    	return scale;
    }

    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript

    /**
     * Format a number with comma separators
     * @param {number} num
     */
    function commas(num) {
    	const parts = String(num).split('.');
    	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    	return parts.join('.');
    }

    /**
     * Pad a number or string
     * @param {string | number} input
     * @param {number} [length]
     * @param {string} [char]
     */
    function padLeft(input, length = 2, char = '0') {
    	let output = String(input);
    	while (output.length < length) output = char + output;
    	return output;
    }

    // array

    var yootils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        binarySearch: binarySearch,
        clamp: clamp,
        commas: commas,
        createSprite: createSprite,
        linearScale: linear,
        padLeft: padLeft,
        pickRandom: pickRandom,
        queue: queue,
        random: random,
        seedRandom: seedRandom,
        shuffle: shuffle,
        sleep: sleep
    });

    /* src/TreemapNode.svelte generated by Svelte v3.59.2 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    const get_default_slot_changes_1 = dirty => ({ node: dirty & /*node*/ 1 });
    const get_default_slot_context_1 = ctx => ({ node: /*node*/ ctx[0] });
    const get_default_slot_changes$1 = dirty => ({ node: dirty & /*node*/ 1 });
    const get_default_slot_context$1 = ctx => ({ node: /*node*/ ctx[0] });

    // (8:0) <Pancake.Box x1={node.x0} x2={node.x1} y1={node.y1} y2={node.y0}>
    function create_default_slot_1$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, node*/ 5)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(8:0) <Pancake.Box x1={node.x0} x2={node.x1} y1={node.y1} y2={node.y0}>",
    		ctx
    	});

    	return block;
    }

    // (13:1) <svelte:self node={child} let:node>
    function create_default_slot$2(ctx) {
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context_1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, node*/ 5)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, get_default_slot_changes_1),
    						get_default_slot_context_1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(13:1) <svelte:self node={child} let:node>",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#each (node.children || []) as child}
    function create_each_block(ctx) {
    	let treemapnode;
    	let current;

    	treemapnode = new TreemapNode({
    			props: {
    				node: /*child*/ ctx[3],
    				$$slots: {
    					default: [
    						create_default_slot$2,
    						({ node }) => ({ 0: node }),
    						({ node }) => node ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(treemapnode.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(treemapnode, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const treemapnode_changes = {};
    			if (dirty & /*node*/ 1) treemapnode_changes.node = /*child*/ ctx[3];

    			if (dirty & /*$$scope, node*/ 5) {
    				treemapnode_changes.$$scope = { dirty, ctx };
    			}

    			treemapnode.$set(treemapnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treemapnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treemapnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(treemapnode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(12:0) {#each (node.children || []) as child}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let pancake_box;
    	let t;
    	let each_1_anchor;
    	let current;

    	pancake_box = new Box({
    			props: {
    				x1: /*node*/ ctx[0].x0,
    				x2: /*node*/ ctx[0].x1,
    				y1: /*node*/ ctx[0].y1,
    				y2: /*node*/ ctx[0].y0,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = /*node*/ ctx[0].children || [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			create_component(pancake_box.$$.fragment);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(pancake_box, target, anchor);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pancake_box_changes = {};
    			if (dirty & /*node*/ 1) pancake_box_changes.x1 = /*node*/ ctx[0].x0;
    			if (dirty & /*node*/ 1) pancake_box_changes.x2 = /*node*/ ctx[0].x1;
    			if (dirty & /*node*/ 1) pancake_box_changes.y1 = /*node*/ ctx[0].y1;
    			if (dirty & /*node*/ 1) pancake_box_changes.y2 = /*node*/ ctx[0].y0;

    			if (dirty & /*$$scope, node*/ 5) {
    				pancake_box_changes.$$scope = { dirty, ctx };
    			}

    			pancake_box.$set(pancake_box_changes);

    			if (dirty & /*node, $$scope*/ 5) {
    				each_value = /*node*/ ctx[0].children || [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pancake_box.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pancake_box.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pancake_box, detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TreemapNode', slots, ['default']);
    	let { node } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (node === undefined && !('node' in $$props || $$self.$$.bound[$$self.$$.props['node']])) {
    			console.warn("<TreemapNode> was created without expected prop 'node'");
    		}
    	});

    	const writable_props = ['node'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TreemapNode> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('node' in $$props) $$invalidate(0, node = $$props.node);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Pancake, getContext, node });

    	$$self.$inject_state = $$props => {
    		if ('node' in $$props) $$invalidate(0, node = $$props.node);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [node, slots, $$scope];
    }

    class TreemapNode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { node: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TreemapNode",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get node() {
    		throw new Error("<TreemapNode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set node(value) {
    		throw new Error("<TreemapNode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Treemap.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Treemap.svelte";
    const get_default_slot_changes = dirty => ({ node: dirty & /*node*/ 8 });
    const get_default_slot_context = ctx => ({ node: /*node*/ ctx[3] });

    // (8:1) <TreemapNode node={root} let:node>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, node*/ 12)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(8:1) <TreemapNode node={root} let:node>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let pancake_treemap;
    	let treemapnode;
    	let current;

    	treemapnode = new TreemapNode({
    			props: {
    				node: /*root*/ ctx[0],
    				$$slots: {
    					default: [
    						create_default_slot$1,
    						({ node }) => ({ 3: node }),
    						({ node }) => node ? 8 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			pancake_treemap = element("pancake-treemap");
    			create_component(treemapnode.$$.fragment);
    			set_custom_element_data(pancake_treemap, "class", "svelte-omgzip");
    			add_location(pancake_treemap, file$1, 6, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pancake_treemap, anchor);
    			mount_component(treemapnode, pancake_treemap, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const treemapnode_changes = {};
    			if (dirty & /*root*/ 1) treemapnode_changes.node = /*root*/ ctx[0];

    			if (dirty & /*$$scope, node*/ 12) {
    				treemapnode_changes.$$scope = { dirty, ctx };
    			}

    			treemapnode.$set(treemapnode_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treemapnode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treemapnode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pancake_treemap);
    			destroy_component(treemapnode);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Treemap', slots, ['default']);
    	let { root } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (root === undefined && !('root' in $$props || $$self.$$.bound[$$self.$$.props['root']])) {
    			console.warn("<Treemap> was created without expected prop 'root'");
    		}
    	});

    	const writable_props = ['root'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Treemap> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ TreemapNode, root });

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(0, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [root, slots, $$scope];
    }

    class Treemap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { root: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Treemap",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get root() {
    		throw new Error("<Treemap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Treemap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var data = {
    	name: 'flare',
    	children: [
    		{
    			name: 'analytics',
    			children: [
    				{
    					name: 'cluster',
    					children: [
    						{ name: 'AgglomerativeCluster', value: 3938 },
    						{ name: 'CommunityStructure', value: 3812 },
    						{ name: 'HierarchicalCluster', value: 6714 },
    						{ name: 'MergeEdge', value: 743 }
    					]
    				},
    				{
    					name: 'graph',
    					children: [
    						{ name: 'BetweennessCentrality', value: 3534 },
    						{ name: 'LinkDistance', value: 5731 },
    						{ name: 'MaxFlowMinCut', value: 7840 },
    						{ name: 'ShortestPaths', value: 5914 },
    						{ name: 'SpanningTree', value: 3416 }
    					]
    				},
    				{
    					name: 'optimization',
    					children: [{ name: 'AspectRatioBanker', value: 7074 }]
    				}
    			]
    		},
    		{
    			name: 'animate',
    			children: [
    				{ name: 'Easing', value: 17010 },
    				{ name: 'FunctionSequence', value: 5842 },
    				{
    					name: 'interpolate',
    					children: [
    						{ name: 'ArrayInterpolator', value: 1983 },
    						{ name: 'ColorInterpolator', value: 2047 },
    						{ name: 'DateInterpolator', value: 1375 },
    						{ name: 'Interpolator', value: 8746 },
    						{ name: 'MatrixInterpolator', value: 2202 },
    						{ name: 'NumberInterpolator', value: 1382 },
    						{ name: 'ObjectInterpolator', value: 1629 },
    						{ name: 'PointInterpolator', value: 1675 },
    						{ name: 'RectangleInterpolator', value: 2042 }
    					]
    				},
    				{ name: 'ISchedulable', value: 1041 },
    				{ name: 'Parallel', value: 5176 },
    				{ name: 'Pause', value: 449 },
    				{ name: 'Scheduler', value: 5593 },
    				{ name: 'Sequence', value: 5534 },
    				{ name: 'Transition', value: 9201 },
    				{ name: 'Transitioner', value: 19975 },
    				{ name: 'TransitionEvent', value: 1116 },
    				{ name: 'Tween', value: 6006 }
    			]
    		},
    		{
    			name: 'data',
    			children: [
    				{
    					name: 'converters',
    					children: [
    						{ name: 'Converters', value: 721 },
    						{ name: 'DelimitedTextConverter', value: 4294 },
    						{ name: 'GraphMLConverter', value: 9800 },
    						{ name: 'IDataConverter', value: 1314 },
    						{ name: 'JSONConverter', value: 2220 }
    					]
    				},
    				{ name: 'DataField', value: 1759 },
    				{ name: 'DataSchema', value: 2165 },
    				{ name: 'DataSet', value: 586 },
    				{ name: 'DataSource', value: 3331 },
    				{ name: 'DataTable', value: 772 },
    				{ name: 'DataUtil', value: 3322 }
    			]
    		},
    		{
    			name: 'display',
    			children: [
    				{ name: 'DirtySprite', value: 8833 },
    				{ name: 'LineSprite', value: 1732 },
    				{ name: 'RectSprite', value: 3623 },
    				{ name: 'TextSprite', value: 10066 }
    			]
    		},
    		{
    			name: 'flex',
    			children: [{ name: 'FlareVis', value: 4116 }]
    		},
    		{
    			name: 'physics',
    			children: [
    				{ name: 'DragForce', value: 1082 },
    				{ name: 'GravityForce', value: 1336 },
    				{ name: 'IForce', value: 319 },
    				{ name: 'NBodyForce', value: 10498 },
    				{ name: 'Particle', value: 2822 },
    				{ name: 'Simulation', value: 9983 },
    				{ name: 'Spring', value: 2213 },
    				{ name: 'SpringForce', value: 1681 }
    			]
    		},
    		{
    			name: 'query',
    			children: [
    				{ name: 'AggregateExpression', value: 1616 },
    				{ name: 'And', value: 1027 },
    				{ name: 'Arithmetic', value: 3891 },
    				{ name: 'Average', value: 891 },
    				{ name: 'BinaryExpression', value: 2893 },
    				{ name: 'Comparison', value: 5103 },
    				{ name: 'CompositeExpression', value: 3677 },
    				{ name: 'Count', value: 781 },
    				{ name: 'DateUtil', value: 4141 },
    				{ name: 'Distinct', value: 933 },
    				{ name: 'Expression', value: 5130 },
    				{ name: 'ExpressionIterator', value: 3617 },
    				{ name: 'Fn', value: 3240 },
    				{ name: 'If', value: 2732 },
    				{ name: 'IsA', value: 2039 },
    				{ name: 'Literal', value: 1214 },
    				{ name: 'Match', value: 3748 },
    				{ name: 'Maximum', value: 843 },
    				{
    					name: 'methods',
    					children: [
    						{ name: 'add', value: 593 },
    						{ name: 'and', value: 330 },
    						{ name: 'average', value: 287 },
    						{ name: 'count', value: 277 },
    						{ name: 'distinct', value: 292 },
    						{ name: 'div', value: 595 },
    						{ name: 'eq', value: 594 },
    						{ name: 'fn', value: 460 },
    						{ name: 'gt', value: 603 },
    						{ name: 'gte', value: 625 },
    						{ name: 'iff', value: 748 },
    						{ name: 'isa', value: 461 },
    						{ name: 'lt', value: 597 },
    						{ name: 'lte', value: 619 },
    						{ name: 'max', value: 283 },
    						{ name: 'min', value: 283 },
    						{ name: 'mod', value: 591 },
    						{ name: 'mul', value: 603 },
    						{ name: 'neq', value: 599 },
    						{ name: 'not', value: 386 },
    						{ name: 'or', value: 323 },
    						{ name: 'orderby', value: 307 },
    						{ name: 'range', value: 772 },
    						{ name: 'select', value: 296 },
    						{ name: 'stddev', value: 363 },
    						{ name: 'sub', value: 600 },
    						{ name: 'sum', value: 280 },
    						{ name: 'update', value: 307 },
    						{ name: 'variance', value: 335 },
    						{ name: 'where', value: 299 },
    						{ name: 'xor', value: 354 },
    						{ name: '_', value: 264 }
    					]
    				},
    				{ name: 'Minimum', value: 843 },
    				{ name: 'Not', value: 1554 },
    				{ name: 'Or', value: 970 },
    				{ name: 'Query', value: 13896 },
    				{ name: 'Range', value: 1594 },
    				{ name: 'StringUtil', value: 4130 },
    				{ name: 'Sum', value: 791 },
    				{ name: 'Variable', value: 1124 },
    				{ name: 'Variance', value: 1876 },
    				{ name: 'Xor', value: 1101 }
    			]
    		},
    		{
    			name: 'scale',
    			children: [
    				{ name: 'IScaleMap', value: 2105 },
    				{ name: 'LinearScale', value: 1316 },
    				{ name: 'LogScale', value: 3151 },
    				{ name: 'OrdinalScale', value: 3770 },
    				{ name: 'QuantileScale', value: 2435 },
    				{ name: 'QuantitativeScale', value: 4839 },
    				{ name: 'RootScale', value: 1756 },
    				{ name: 'Scale', value: 4268 },
    				{ name: 'ScaleType', value: 1821 },
    				{ name: 'TimeScale', value: 5833 }
    			]
    		},
    		{
    			name: 'util',
    			children: [
    				{ name: 'Arrays', value: 8258 },
    				{ name: 'Colors', value: 10001 },
    				{ name: 'Dates', value: 8217 },
    				{ name: 'Displays', value: 12555 },
    				{ name: 'Filter', value: 2324 },
    				{ name: 'Geometry', value: 10993 },
    				{
    					name: 'heap',
    					children: [
    						{ name: 'FibonacciHeap', value: 9354 },
    						{ name: 'HeapNode', value: 1233 }
    					]
    				},
    				{ name: 'IEvaluable', value: 335 },
    				{ name: 'IPredicate', value: 383 },
    				{ name: 'IValueProxy', value: 874 },
    				{
    					name: 'math',
    					children: [
    						{ name: 'DenseMatrix', value: 3165 },
    						{ name: 'IMatrix', value: 2815 },
    						{ name: 'SparseMatrix', value: 3366 }
    					]
    				},
    				{ name: 'Maths', value: 17705 },
    				{ name: 'Orientation', value: 1486 },
    				{
    					name: 'palette',
    					children: [
    						{ name: 'ColorPalette', value: 6367 },
    						{ name: 'Palette', value: 1229 },
    						{ name: 'ShapePalette', value: 2059 },
    						{ name: 'SizePalette', value: 2291 }
    					]
    				},
    				{ name: 'Property', value: 5559 },
    				{ name: 'Shapes', value: 19118 },
    				{ name: 'Sort', value: 6887 },
    				{ name: 'Stats', value: 6557 },
    				{ name: 'Strings', value: 22026 }
    			]
    		},
    		{
    			name: 'vis',
    			children: [
    				{
    					name: 'axis',
    					children: [
    						{ name: 'Axes', value: 1302 },
    						{ name: 'Axis', value: 24593 },
    						{ name: 'AxisGridLine', value: 652 },
    						{ name: 'AxisLabel', value: 636 },
    						{ name: 'CartesianAxes', value: 6703 }
    					]
    				},
    				{
    					name: 'controls',
    					children: [
    						{ name: 'AnchorControl', value: 2138 },
    						{ name: 'ClickControl', value: 3824 },
    						{ name: 'Control', value: 1353 },
    						{ name: 'ControlList', value: 4665 },
    						{ name: 'DragControl', value: 2649 },
    						{ name: 'ExpandControl', value: 2832 },
    						{ name: 'HoverControl', value: 4896 },
    						{ name: 'IControl', value: 763 },
    						{ name: 'PanZoomControl', value: 5222 },
    						{ name: 'SelectionControl', value: 7862 },
    						{ name: 'TooltipControl', value: 8435 }
    					]
    				},
    				{
    					name: 'data',
    					children: [
    						{ name: 'Data', value: 20544 },
    						{ name: 'DataList', value: 19788 },
    						{ name: 'DataSprite', value: 10349 },
    						{ name: 'EdgeSprite', value: 3301 },
    						{ name: 'NodeSprite', value: 19382 },
    						{
    							name: 'render',
    							children: [
    								{ name: 'ArrowType', value: 698 },
    								{ name: 'EdgeRenderer', value: 5569 },
    								{ name: 'IRenderer', value: 353 },
    								{ name: 'ShapeRenderer', value: 2247 }
    							]
    						},
    						{ name: 'ScaleBinding', value: 11275 },
    						{ name: 'Tree', value: 7147 },
    						{ name: 'TreeBuilder', value: 9930 }
    					]
    				},
    				{
    					name: 'events',
    					children: [
    						{ name: 'DataEvent', value: 2313 },
    						{ name: 'SelectionEvent', value: 1880 },
    						{ name: 'TooltipEvent', value: 1701 },
    						{ name: 'VisualizationEvent', value: 1117 }
    					]
    				},
    				{
    					name: 'legend',
    					children: [
    						{ name: 'Legend', value: 20859 },
    						{ name: 'LegendItem', value: 4614 },
    						{ name: 'LegendRange', value: 10530 }
    					]
    				},
    				{
    					name: 'operator',
    					children: [
    						{
    							name: 'distortion',
    							children: [
    								{ name: 'BifocalDistortion', value: 4461 },
    								{ name: 'Distortion', value: 6314 },
    								{ name: 'FisheyeDistortion', value: 3444 }
    							]
    						},
    						{
    							name: 'encoder',
    							children: [
    								{ name: 'ColorEncoder', value: 3179 },
    								{ name: 'Encoder', value: 4060 },
    								{ name: 'PropertyEncoder', value: 4138 },
    								{ name: 'ShapeEncoder', value: 1690 },
    								{ name: 'SizeEncoder', value: 1830 }
    							]
    						},
    						{
    							name: 'filter',
    							children: [
    								{ name: 'FisheyeTreeFilter', value: 5219 },
    								{ name: 'GraphDistanceFilter', value: 3165 },
    								{ name: 'VisibilityFilter', value: 3509 }
    							]
    						},
    						{ name: 'IOperator', value: 1286 },
    						{
    							name: 'label',
    							children: [
    								{ name: 'Labeler', value: 9956 },
    								{ name: 'RadialLabeler', value: 3899 },
    								{ name: 'StackedAreaLabeler', value: 3202 }
    							]
    						},
    						{
    							name: 'layout',
    							children: [
    								{ name: 'AxisLayout', value: 6725 },
    								{ name: 'BundledEdgeRouter', value: 3727 },
    								{ name: 'CircleLayout', value: 9317 },
    								{ name: 'CirclePackingLayout', value: 12003 },
    								{ name: 'DendrogramLayout', value: 4853 },
    								{ name: 'ForceDirectedLayout', value: 8411 },
    								{ name: 'IcicleTreeLayout', value: 4864 },
    								{ name: 'IndentedTreeLayout', value: 3174 },
    								{ name: 'Layout', value: 7881 },
    								{ name: 'NodeLinkTreeLayout', value: 12870 },
    								{ name: 'PieLayout', value: 2728 },
    								{ name: 'RadialTreeLayout', value: 12348 },
    								{ name: 'RandomLayout', value: 870 },
    								{ name: 'StackedAreaLayout', value: 9121 },
    								{ name: 'TreeMapLayout', value: 9191 }
    							]
    						},
    						{ name: 'Operator', value: 2490 },
    						{ name: 'OperatorList', value: 5248 },
    						{ name: 'OperatorSequence', value: 4190 },
    						{ name: 'OperatorSwitch', value: 2581 },
    						{ name: 'SortOperator', value: 2023 }
    					]
    				},
    				{ name: 'Visualization', value: 16540 }
    			]
    		}
    	]
    };

    /* src/App.svelte generated by Svelte v3.59.2 */
    const file = "src/App.svelte";

    // (68:3) {#if is_visible(node, selected)}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let strong;
    	let t0_value = /*node*/ ctx[11].data.name + "";
    	let t0;
    	let t1;
    	let span;
    	let t2_value = commas(/*node*/ ctx[11].value) + "";
    	let t2;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[8](/*node*/ ctx[11]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			strong = element("strong");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(strong, "class", "svelte-z5r2z6");
    			add_location(strong, file, 73, 6, 1629);
    			attr_dev(span, "class", "svelte-z5r2z6");
    			add_location(span, file, 74, 6, 1669);
    			attr_dev(div0, "class", "contents svelte-z5r2z6");
    			add_location(div0, file, 72, 5, 1600);
    			attr_dev(div1, "class", "node svelte-z5r2z6");
    			toggle_class(div1, "leaf", !/*node*/ ctx[11].children);
    			add_location(div1, file, 68, 4, 1468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, strong);
    			append_dev(strong, t0);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*node*/ 2048) && t0_value !== (t0_value = /*node*/ ctx[11].data.name + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*node*/ 2048) && t2_value !== (t2_value = commas(/*node*/ ctx[11].value) + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*node*/ 2048) {
    				toggle_class(div1, "leaf", !/*node*/ ctx[11].children);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 400 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 400 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(68:3) {#if is_visible(node, selected)}",
    		ctx
    	});

    	return block;
    }

    // (67:2) <Treemap {root} let:node>
    function create_default_slot_1(ctx) {
    	let show_if = /*is_visible*/ ctx[6](/*node*/ ctx[11], /*selected*/ ctx[0]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*node, selected*/ 2049) show_if = /*is_visible*/ ctx[6](/*node*/ ctx[11], /*selected*/ ctx[0]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*node, selected*/ 2049) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(67:2) <Treemap {root} let:node>",
    		ctx
    	});

    	return block;
    }

    // (66:1) <Pancake.Chart x1={$extents.x1} x2={$extents.x2} y1={$extents.y1} y2={$extents.y2}>
    function create_default_slot(ctx) {
    	let treemap_1;
    	let current;

    	treemap_1 = new Treemap({
    			props: {
    				root: /*root*/ ctx[2],
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ node }) => ({ 11: node }),
    						({ node }) => node ? 2048 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(treemap_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(treemap_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const treemap_1_changes = {};

    			if (dirty & /*$$scope, node, selected*/ 6145) {
    				treemap_1_changes.$$scope = { dirty, ctx };
    			}

    			treemap_1.$set(treemap_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treemap_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treemap_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(treemap_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(66:1) <Pancake.Chart x1={$extents.x1} x2={$extents.x2} y1={$extents.y1} y2={$extents.y2}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let button;
    	let t0_value = /*breadcrumbs*/ ctx[4](/*selected*/ ctx[0]) + "";
    	let t0;
    	let button_disabled_value;
    	let t1;
    	let div;
    	let pancake_chart;
    	let t2;
    	let p;
    	let t3;
    	let a;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;

    	pancake_chart = new Chart({
    			props: {
    				x1: /*$extents*/ ctx[1].x1,
    				x2: /*$extents*/ ctx[1].x2,
    				y1: /*$extents*/ ctx[1].y1,
    				y2: /*$extents*/ ctx[1].y2,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");
    			create_component(pancake_chart.$$.fragment);
    			t2 = space();
    			p = element("p");
    			t3 = text("Based on ");
    			a = element("a");
    			a.textContent = "Zoomable Treemap by Mike Bostock";
    			t5 = text(".");
    			attr_dev(button, "class", "breadcrumbs svelte-z5r2z6");
    			button.disabled = button_disabled_value = !/*selected*/ ctx[0].parent;
    			add_location(button, file, 60, 0, 1154);
    			attr_dev(div, "class", "chart svelte-z5r2z6");
    			add_location(div, file, 64, 0, 1295);
    			attr_dev(a, "href", "https://observablehq.com/@d3/zoomable-treemap");
    			add_location(a, file, 82, 12, 1794);
    			add_location(p, file, 82, 0, 1782);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(pancake_chart, div, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t3);
    			append_dev(p, a);
    			append_dev(p, t5);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*selected*/ 1) && t0_value !== (t0_value = /*breadcrumbs*/ ctx[4](/*selected*/ ctx[0]) + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*selected*/ 1 && button_disabled_value !== (button_disabled_value = !/*selected*/ ctx[0].parent)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			const pancake_chart_changes = {};
    			if (dirty & /*$extents*/ 2) pancake_chart_changes.x1 = /*$extents*/ ctx[1].x1;
    			if (dirty & /*$extents*/ 2) pancake_chart_changes.x2 = /*$extents*/ ctx[1].x2;
    			if (dirty & /*$extents*/ 2) pancake_chart_changes.y1 = /*$extents*/ ctx[1].y1;
    			if (dirty & /*$extents*/ 2) pancake_chart_changes.y2 = /*$extents*/ ctx[1].y2;

    			if (dirty & /*$$scope, selected*/ 4097) {
    				pancake_chart_changes.$$scope = { dirty, ctx };
    			}

    			pancake_chart.$set(pancake_chart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pancake_chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pancake_chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(pancake_chart);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $extents;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const treemap = index();
    	const hierarchy$1 = hierarchy(data).sum(d => d.value).sort((a, b) => b.value - a.value);
    	const root = treemap(hierarchy$1);
    	let selected = root;

    	const select = node => {
    		while (node.parent && node.parent !== selected) {
    			node = node.parent;
    		}

    		if (node && node.children) $$invalidate(0, selected = node);
    	};

    	const breadcrumbs = node => {
    		const crumbs = [];

    		while (node) {
    			crumbs.unshift(node.data.name);
    			node = node.parent;
    		}

    		return crumbs.join('/');
    	};

    	const extents = tweened(undefined, { easing: cubicOut, duration: 600 });
    	validate_store(extents, 'extents');
    	component_subscribe($$self, extents, value => $$invalidate(1, $extents = value));

    	const is_visible = (a, b) => {
    		while (b) {
    			if (a.parent === b) return true;
    			b = b.parent;
    		}

    		return false;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, selected = selected.parent);
    	const click_handler_1 = node => select(node);

    	$$self.$capture_state = () => ({
    		Pancake,
    		d3,
    		tweened,
    		eases,
    		fade,
    		yootils,
    		Treemap,
    		data,
    		treemap,
    		hierarchy: hierarchy$1,
    		root,
    		selected,
    		select,
    		breadcrumbs,
    		extents,
    		is_visible,
    		$extents
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected*/ 1) {
    			set_store_value(
    				extents,
    				$extents = {
    					x1: selected.x0,
    					x2: selected.x1,
    					y1: selected.y1,
    					y2: selected.y0
    				},
    				$extents
    			);
    		}
    	};

    	return [
    		selected,
    		$extents,
    		root,
    		select,
    		breadcrumbs,
    		extents,
    		is_visible,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
