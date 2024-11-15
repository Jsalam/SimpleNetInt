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

    static capacity = 100;
    static allElements = [];
    static activeElements = new Map();
    static freeElements = new Map();

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

    static getActiveElementsByType(type) {
        if (!this.activeElements.has(type)) {
            this.activeElements.set(type, new Map());
        }
        return this.activeElements.get(type);
    }

    static getFreeElementsByType(type) {
        if (!this.freeElements.has(type)) {
            this.freeElements.set(type, []);
        }
        return this.freeElements.get(type);
    }

    static createElement() {
        const ve = new VirtualElementPool.VirtualElement();
        VirtualElementPool.allElements.push(ve);
        return ve;
    }

    static allocateElement(type) {
        const freeElements = this.getFreeElementsByType(type);
        if (freeElements.length > 0) {
            return freeElements.pop();
        }
        const activeElements = this.getActiveElementsByType(type);
        if (activeElements.size < this.capacity) {
            return this.createElement();
        }
        const [firstClient, firstElement] = activeElements.entries().next().value;
        activeElements.delete(firstClient);
        return firstElement;
    }

    static getElementFor(client, type) {
        const activeElements = this.getActiveElementsByType(type);
        if (activeElements.has(client)) {
            return activeElements.get(client);
        }
        const ve = this.allocateElement(type);
        activeElements.set(client, ve);
        return ve;
    }

    static show(client, type, textContent, style) {
        const ve = this.getElementFor(client, type);
        ve.nextTextContent = textContent;
        ve.nextStyle = style;
        VirtualElementPool.scheduleUpdate();
    }

    static hide(client, type) {
        const activeElements = this.getActiveElementsByType(type);
        if (activeElements.has(client)) {
            const ve = activeElements.get(client);
            // Move it out of screen
            ve.nextStyle = {...ve.style, transform: 'translate(-999px, -999px)'};
            ve.nextTextContent = '';
            VirtualElementPool.scheduleUpdate();
            activeElements.delete(client);
            this.getFreeElementsByType(type).push(ve);
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