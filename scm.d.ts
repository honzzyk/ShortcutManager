declare module SC {
	interface IShortcutContext {

	}

	type THandler = (normalizedShortcut: string, modifier: number, from: number, originalEvent: KeyboardEvent) => boolean;

	class Manager {
		context: IShortcutContext;

		constructor(isStatic: boolean);

		create(context: Object, layer?: Window | Document | Element | string): SC.Manager;

		on(shortcut: string, handler: THandler, isDefault?: boolean): void;

		activate(): void;

		deactivate(): void;

		remove(shortcut?: string, handler?: THandler): void;

		debugMode(state: boolean): void;

		event(keyboardEvent: KeyboardEvent): boolean;

		exists(keyboardEvent: string | KeyboardEvent): boolean;

		destroy(): void;
	}
}
// shortcut manager class type shortcut
declare type ShortcutManager = SC.Manager;
// global variable
declare var ShortcutManager: ShortcutManager;
