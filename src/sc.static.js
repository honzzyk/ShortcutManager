/*global SC*/
if (globalThis.ShortcutManager) {
	console.warn("ShortcutManager already exists on globalThis, redefining");
}
globalThis.ShortcutManager = new SC.Manager(true);
