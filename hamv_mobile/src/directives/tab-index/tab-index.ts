import { Directive, Input, HostListener } from '@angular/core';

@Directive({
    selector: '[myTabIndex]'
})
export class TabIndexDirective {
    @Input('myTabIndex') myTabindex: string;

    constructor(
    ) { }

    @HostListener('keydown', ['$event']) onInputChange(e) {
        var code = e.keyCode || e.which;

        if (code === 13) {
            let next: HTMLElement = this.getMyNextFocusableElement(e.srcElement);

            if (next) {
                e.preventDefault();
                next.focus && next.focus();
            }
        }
    }

    private getMyNextFocusableElement(elem: HTMLElement): HTMLElement {
        let tabindex: number = Number.parseInt(this.myTabindex || '0');
        let next: HTMLElement = MyUtils.getNextFocusableElement(elem, 'myTabIndex', tabindex);
        return next;
    }
}

class MyUtils {

    private static FOCUSABLES = ['input', 'select', 'textarea', 'button', 'object', 'area', 'a'];
    private static FOCUSABLES_SELECTOR = MyUtils.FOCUSABLES.join(',');

    public static getNextFocusableElement(elem: HTMLElement, attrName: string, tabindex: number): HTMLElement {
        let form = MyUtils.getFormElement(elem);
        let next = null;

        tabindex++;
        next = MyUtils.getElement(form, attrName, tabindex);

        while (next) {
            next = MyUtils.getFocusableElement(next);

            if (next) {
                return next;
            }

            tabindex++;
            next = MyUtils.getElement(form, attrName, tabindex);
        }

        return null;
    }

    private static getFormElement(elem: HTMLElement): HTMLElement {
        let form: HTMLFormElement = elem ? (<HTMLInputElement>elem).form : null;
        return form;
    }

    private static getElement(form: HTMLElement, attrName: string, tabindex: number): HTMLElement {
        let selector = `[${attrName}="${tabindex}"]`;
        let elem = form ? <HTMLElement>form.querySelector(selector) : null;
        return elem;
    }

    private static getFocusableElement(elem: HTMLElement): HTMLElement {
        let tagName = elem.tagName.toLowerCase();
        let focusable = MyUtils.FOCUSABLES.some(
            tagFocusable => tagFocusable === tagName
        );

        if (!focusable) {
            elem = <HTMLElement>elem.querySelector(MyUtils.FOCUSABLES_SELECTOR);
            focusable = !!elem;
        }

        if (focusable) {
            //TODO: verify if elem is disabled, readonly, hidden, etc...
            // in which case focusable must be changed to false
        }

        if (focusable) {
            return elem;
        }
    }
}