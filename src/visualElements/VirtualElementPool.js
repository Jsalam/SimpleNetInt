class VirtualElementPool {
    static VirtualElement = class {
        constructor() {
            this.native = this.createNativeElement();
            this.textContent = '';
            this.style = {};
            this.nextTextContent = '';
            this.nextStyle = {};
        }

        createNativeElement() {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = '0px';
            el.style.top = '0px';
            el.style.transform = 'translateX(-999px, -999px)';
            el.style.pointerEvents = 'none';
            return el;
        }
    }

    static capacity = 500;
    static allElements = [];
    static activeElements = new Map();
    static freeElements = [];

    static get containerEl() {
        return document.querySelector('#model');
    }

    static updateScheduled = false;

    /**
     * Apply DOM diffing
     */
    static commitUpdate() {
        this.updateScheduled = false;
        for (const ve of this.allElements) {
            for (let prop of Object.keys(ve.nextStyle)) {
                if (ve.nextStyle[prop] !== ve.style[prop]) {
                    ve.native.style[prop] = ve.nextStyle[prop];
                }
            }
            for (let prop of Object.keys(ve.style)) {
                if (!ve.nextStyle.hasOwnProperty(prop)) {
                    ve.native.style[prop] = '';
                }
            }
            ve.style = ve.nextStyle;

            if (ve.nextTextContent !== ve.textContent) {
                ve.native.textContent = ve.textContent = ve.nextTextContent;
            }

            if (!ve.native.parentElement) {
                this.containerEl?.append(ve.native);
            }

            ve.nextStyle = {};
            ve.nextTextContent = '';
        }
    }

    static scheduleUpdate() {
        if (!this.updateScheduled) {
            this.updateScheduled = true;
            queueMicrotask(() => {
                this.commitUpdate();
            });
        }
    }

    static getOwnElements(client) {
        if (!this.activeElements.has(client)) {
            this.activeElements.set(client, new Map());
        }
        return this.activeElements.get(client);
    }

    static createElement() {
        const ve = new VirtualElementPool.VirtualElement();
        VirtualElementPool.allElements.push(ve);
        return ve;
    }

    static evictElement(client, key) {
        // Preferentially evict an element that matches the client type and requested key
        for (const [owner, ownElements] of this.activeElements) {
            if (Object.getPrototypeOf(owner) === Object.getPrototypeOf(client) && ownElements.has(key)) {
                const element = ownElements.get(key);
                ownElements.delete(key);
                return element;
            }
        }
        // If no such element is available, evict the first active element
        for (const [owner, ownElements] of this.activeElements) {
            if (ownElements.size > 0) {
                const [firstKey, firstElement] = ownElements.entries().next().value;
                ownElements.delete(firstKey);
                return firstElement;
            }
        }
    }

    static allocateElement(client, key) {
        if (this.freeElements.length > 0) {
            return this.freeElements.pop();
        }
        if (this.allElements.length < this.capacity) {
            return this.createElement();
        }
        return this.evictElement(client, key);
    }

    static show(client, key, textContent, style) {
        const ownElements = this.getOwnElements(client);
        if (!ownElements.has(key)) {
            const ve = this.allocateElement(client, key);
            ownElements.set(key, ve);
        }
        const ve = ownElements.get(key);
        ve.nextTextContent = textContent;
        ve.nextStyle = style;
        VirtualElementPool.scheduleUpdate();
    }

    static hide(client, key) {
        const ownElements = this.getOwnElements(client);
        if (ownElements.has(key)) {
            const ve = ownElements.get(key);
            // Move it out of screen
            ve.nextStyle = {...ve.style, transform: 'translate(-999px, -999px)'};
            ve.nextTextContent = '';
            VirtualElementPool.scheduleUpdate();
            ownElements.delete(key);
            this.freeElements.push(ve);
        }
    }

    static clear() {
        for (const [owner, ownElements] of this.activeElements) {
            for (const [key, element] of ownElements) {
                element.native.remove();
            }
        }
        this.activeElements.clear();
    }
}