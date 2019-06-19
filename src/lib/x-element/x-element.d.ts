// Type definitions for x-element
// Definitions by: Nimiq <www.nimiq.com>

export default class XElement {
    public static readonly tagName: string;
    public static readonly elementMap: Map<HTMLElement, XElement>;

    public static createElement(attributes: Array<[string, string]>): XElement;
    public static camelize(input: string): string;
    public static get(node: HTMLElement): XElement | undefined;

    constructor(element: HTMLElement);

    public readonly attributes: { [name: string]: string };
    public readonly properties: { [name: string]: any };
    public readonly name: string;
    public readonly $el: HTMLElement;

    public destroy(): void;
    public setProperty(name: string, value: any): boolean;
    public setProperties(properties: { [name: string]: any }, reset: boolean): boolean;
    public addEventListener(type: string, callback: Function): void;
    public removeEventListener(type: string, callback: Function): void;
    public listenOnce(type: string, callback: Function, $el?: HTMLElement): void;
    public animate(className: string, $el?: HTMLElement, afterStartCallback?: Function, beforeEndCallback?: Function): Promise<void>;
    public stopAnimate(className: string, $el: HTMLElement): void;

    protected onCreate(): void;
    protected styles(): string[];
    protected children(): XElement[];
    protected attribute(name: string): string;
    protected $(selector: string): HTMLElement | null;
    protected $$(selector: string): NodeList;
    protected clear(): void;
    protected fire(type: string, detail: any, bubbles?: boolean): void;
    protected addStyle(styleClass: string): void;
    protected removeStyle(styleClass: string): void;
}

