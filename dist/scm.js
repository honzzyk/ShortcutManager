var SC = {};;/*global SC*/
SC.Store = (function (SC, p) {
	"use strict";

	//multikeys regex
	var splitter = "..",
		multiple = ", ",
		regex = /.*\+(\[([0-9]..[0-9])\])/g;

	/**
	 * Shortcut record create
	 * @param {Object} store
	 * @param {string} shortcut
	 * @returns {Array.<HandlerRecord>}
	 */
	function getRecord(store, shortcut) {
		var data = store[shortcut];

		//record not exists, create it
		if (!data) {
			data = [];
			store[shortcut] = data;
		}
		//return
		return data;
	}

	/**
	 * find default handler
	 * @param {Array.<HandlerRecord>} handlers
	 * @returns {boolean} if there is default handler
	 */
	function hasDefault(handlers) {
		var i;

		for (i = 0; i < handlers.length; i++) {
			if (handlers[i].isDefault) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get handler.
	 * @param {Object} store
	 * @param {string} shortcut
	 * @returns {Array.<HandlerRecord>}
	 */
	function getHandlers(store, shortcut) {
		return store[shortcut] || null;
	}

	/**
	 * Removes shortcuts by name
	 * @param {object} store
	 * @param {object} context
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	function removeByShortcut(store, context, shortcut, handler) {
		var i,
			handlerRecord,
			record = getRecord(store, shortcut),
			length = record.length;

		//default manager, set record as empty
		if (context === SC.scdefault) {
			record.length = 0;
			return;

		}
		//iterate all
		for (i = length - 1; i >= 0; i--) {
			handlerRecord = record[i];
			//remove by context and handler
			if (handlerRecord.context === context && handlerRecord.handler === handler) {
				record.splice(i, 1);
			}
			//remove by context
			if (!handler && handlerRecord.context === context) {
				record.splice(i, 1);
			}
		}
	}

	/**
	 * @param {object} store
	 * @param {string} shortcut
	 */
	function deleteIfEmpty(store, shortcut) {
		var record = store[shortcut];

		if (record && record.length === 0) {
			delete store[shortcut];
		}
	}

	/**
	 * Removes all shortcuts by context
	 * @param {object} store
	 * @param {object} context
	 */
	function removeByContext(store, context) {
		var i,
			key,
			handlerRecords,
			isDefault = context === SC.scdefault;

		for (key in store) {
			if (store.hasOwnProperty(key)) {
				//get record
				handlerRecords = store[key];
				//iterate all record from end
				for (i = handlerRecords.length - 1; i >= 0; i--) {
					//check context or if default manager
					if (handlerRecords[i].context === context || isDefault) {
						handlerRecords.splice(i, 1);
					}
				}
				//delete from store if empty
				if (handlerRecords.length === 0) {
					delete store[key];
				}
			}
		}
	}

	/**
	 * Save shortcut
	 * @param {*} store
	 * @param {Array.<string>} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 */
	function saveShortcut(store, shortcut, context, handler, isDefault) {
		//noinspection JSUnresolvedVariable
		var handlers = getRecord(store, shortcut[0]),
			hasDefaultHandler = hasDefault(handlers),
			handlerRecord = new HandlerRecord(context, handler, /** @type {number}*/shortcut[1], /** @type {number}*/shortcut[2], isDefault);

		if (isDefault) {
			//has nor default handler
			if (!hasDefaultHandler) {
				//add to the start of handlers
				handlers.unshift(handlerRecord);
				return;
			}
			//error for default handler
			throw "ShortcutManager: Can not add another default handler for shortcut " + shortcut + ".";

		}
		//push next handler
		handlers.push(handlerRecord);
	}

	/**
	 * Remove shortcut
	 * @param {*} store
	 * @param {Array.<string>} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 */
	function removeShortcut(store, shortcut, context, handler) {
		//delete by shortcut
		if (shortcut[0] !== undefined && shortcut[0] !== null) {
			removeByShortcut(store, context, shortcut[0], handler);

		//delete by context
		} else {
			removeByContext(store, context);
		}
		deleteIfEmpty(store, shortcut[0]);
	}

	/**
	 * Resolve shortcuts
	 * @param {string} shortcut
	 * @return {Array.<Array.<string, number>>}
	 */
	function resolveShortcuts(shortcut) {
		var i,
			item,
			multipleShortcuts = resolveMultipleShortcut(shortcut),
			shortcuts = /** @type {Array.<Array.<string, number>>}*/[];

		//iterate multiple shortcuts
		for (i = 0; i < multipleShortcuts.length; i++) {
			//item
			item = multipleShortcuts[i];
			//variable shortcut
			if (item && item.match(regex)) {
				shortcuts = shortcuts.concat(resolveDynamicShortcuts(item));

			//normal shortcut
			} else {
				shortcuts = shortcuts.concat(resolveSingleShortcut(item));
			}
		}
		//shortcuts
		return shortcuts;
	}

	/**
	 * Resolve multiple shortcut
	 * @param {string} shortcut
	 * @return {Array.<string>}
	 */
	function resolveMultipleShortcut(shortcut) {
		return shortcut ? shortcut.split(multiple) : [null];
	}

	/**
	 * Resolve dynamic shortcuts
	 * @param {string} shortcut
	 * @return {Array.<Array.<string, number>>}
	 */
	function resolveDynamicShortcuts(shortcut) {
		var i,
			to,
			data,
			from,
			range,
			group,
			shortcuts = [];

		//get range from shortcut
		data = regex.exec(shortcut);
		group = data[1];
		range = data[2].split(splitter);
		//range
		from = parseInt(range[0], 10);
		to = parseInt(range[1], 10);
		//iterate range
		for (i = from; i <= to; i++) {
			shortcuts.push([shortcut.replace(group, i), i, from]);
		}
		//error
		if (shortcuts.length === 0) {
			throw "Regex shortcut do not match any handler.";
		}
		//return
		return shortcuts;
	}

	/**
	 * Resolve single shortcut
	 * @param {string} shortcut
	 * @return {Array}
	 */
	function resolveSingleShortcut(shortcut) {
		var shortcuts = [];

		//add shortcut
		shortcuts.push([shortcut || null, -1, -1]);
		//normal shortcut
		return shortcuts;
	}

	/**
	 * Handlers holder.
	 * @param {Object} context
	 * @param {function} handler
	 * @param {number} modifier
	 * @param {number} from
	 * @param {boolean} isDefault
	 * @constructor
	 */
	function HandlerRecord(context, handler, modifier, from, isDefault) {
		/** @type {boolean} */
		this.isDefault = isDefault || false;
		/** @type {number}*/
		this.from = from;
		/** @type {number}*/
		this.modifier = modifier;
		/** @type {Object} */
		this.context = context;
		/** @type {function} */
		this.handler = handler;
	}

	/**
	 * Creates new store.
	 * @constructor
	 */
	function Store() {
		/** @type {Object.<string, Array.<HandlerRecord>>} */
		this.store = {};
	}

	//shortcut
	p = Store.prototype;

	/**
	 * @public
	 * Save.
	 * @param {string} shortcut
	 * @param {Object} context
	 * @param {function} handler
	 * @param {boolean} isDefault
	 */
	p.save = function (shortcut, context, handler, isDefault) {
		var i,
			shortcuts = resolveShortcuts(shortcut);

		for (i = 0; i < shortcuts.length; i++) {
			saveShortcut(this.store, shortcuts[i], context, handler, isDefault);
		}
	};

	/**
	 * @public
	 * Get handler for given shortcut
	 * @param {string} shortcut
	 * @returns {Array.<HandlerRecord>}
	 */
	p.get = function (shortcut) {
		//noinspection JSUnresolvedVariable
		return getHandlers(this.store, shortcut);
	};

	/**
	 * @public
	 * @param {string} shortcut
	 * @returns {boolean} isExists
	 */
	p.exists = function (shortcut) {
		//noinspection JSUnresolvedVariable
		return Boolean(this.store[shortcut]);
	};

	/**
	 * @public
	 * Removes all handlers assigned to given context or removes only short
	 * @param {Object} context
	 * @param {string} shortcut
	 * @param {function} handler
	 */
	p.remove = function (context, shortcut, handler) {
		var i,
			shortcuts = resolveShortcuts(shortcut);

		for (i = 0; i < shortcuts.length; i++) {
			removeShortcut(this.store, shortcuts[i], context, handler);
		}
	};

	return Store;

}(SC));;/*global SC*/
SC.Normalizer = (function (SC, p) {
	"use strict";

	var plus = "+",
		multiple = ", ",
		//ordes of key (ctrl => alt => shift)
		orderMap = {
			ctrl: 0,
			alt: 1,
			shift: 2
		},
		//alias map for special keys
		aliasMap = {
			enter: "return"
		},
		//name keys
		specialKeys = {
			8: "backspace",
			9: "tab",
			13: "return",
			19: "pause",
			20: "capslock",
			27: "esc",
			32: "space",
			33: "pageup",
			34: "pagedown",
			35: "end",
			36: "home",
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			45: "insert",
			46: "delete",
			106: "*",
			111: "/",
			112: "f1",
			113: "f2",
			114: "f3",
			115: "f4",
			116: "f5",
			117: "f6",
			118: "f7",
			119: "f8",
			120: "f9",
			121: "f10",
			122: "f11",
			123: "f12",
			144: "numlock",
			145: "scrolllock",
			107: "+",
			109: "-",
			187: "+",
			188: ",",
			189: "-",
			190: ".",
			191: "/"
		},
		ignoreShift = {
			187: "+" // "+" is made with shift by nature (shift+"=")
		};

	/**
	 * Returns new order for given part.
	 * @param {string} part
	 * @returns {number} order
	 */
	function getOrder(part) {
		return orderMap[part];
	}

	/**
	 * if code is numpad number, then covert it to simple number char code
	 * @param {number} code
	 * @returns {number}
	 */
	function fixNumpadNumbers(code) {
		return code >= 96 && code <= 105 ? code - 48 : code;
	}

	/**
	 * Returns string from given code.
	 * @param {number} code
	 * @returns {string}
	 */
	function getStringFromCode(code) {
		var value = specialKeys[code];

		code = fixNumpadNumbers(code);
		return value ? value : String.fromCharCode(code).toLowerCase();
	}

	/**
	 * Some shortcuts are made with shift by nature
	 * @param {number} code
	 * @return {boolean}
	 */
	function shiftIgnoredForKey(code) {
		return Boolean(ignoreShift[code]);
	}

	/**
	 * Shortcut string builder.
	 * @constructor
	 */
	function Normalizer() {
	}

	p = Normalizer.prototype;

	/**
	 * Return normalized shortcut from event.
	 * @param {Event} event
	 * @returns {string}
	 */
	p.fromEvent = function (event) {
		var shortcut,
			shiftMakeSense = !shiftIgnoredForKey(event.keyCode);

		//determine shortcut
		shortcut = event.ctrlKey ? "ctrl+" : "";
		shortcut += event.altKey ? "alt+" : "";
		shortcut += event.shiftKey && shiftMakeSense ? "shift+" : "";
		//get string from key code
		shortcut += getStringFromCode(event.keyCode);

		return shortcut;
	};

	/**
	 * Returns normalized shortcut with right ctrl/alt/shift order.
	 * @param {string} shortcut
	 * @returns {string}
	 */
	p.normalize = function (shortcut) {
		var i,
			shortcuts;

		//no shortcut defined
		if (shortcut === undefined || shortcut === null) {
			return shortcut;
		}
		//split
		shortcuts = shortcut.split(multiple);
		//normalize one by one
		for (i = 0; i < shortcuts.length; i++) {
			shortcuts[i] = normalizeOne(shortcuts[i]);
		}
		//rejoin
		return shortcuts.join(multiple);
	};

	/**
	 * Normalize one
	 * @param {string} shortcut
	 * @return {string}
	 */
	function normalizeOne(shortcut) {
		var i,
			part,
			parts,
			order,
			result = [],
			others = [];

		// no splitting of exactly "+"
		if (shortcut === plus) {
			return plus;
		}
		//split by +
		parts = shortcut.toLowerCase().split(plus);
		// build new array with ctrl/alt/shift sorted
		for (i = 0; i < parts.length; i++) {
			order = getOrder(parts[i]);
			//not defined, add ti array
			if (order !== undefined) {
				result[order] = parts[i];
			} else {
				//normalize names
				part = normalizeNames(parts[i]);
				//push
				others.push(part);
			}
		}
		//add other parts of shortcut
		result = result.concat(others);
		//remove empty
		result = result.filter(function (val) {
			return val;
		});
		//rejoin
		return result.join(plus);
	}

	/**
	 * Normalize name
	 * @param {string} name
	 * @returns {string}
	 */
	function normalizeNames(name) {
		return aliasMap[name] || name;
	}

	return Normalizer;

}(SC));;/*global SC*/
SC.Manager = (function (SC, p) {
	"use strict";

	var store = new SC.Store(),
		normalizer = new SC.Normalizer(),
		debugMode = false;

	/**
	 * @type {Window}
	 * @public
	 */
	SC.scdefault = window;

	/**
	 * Manager
	 * @param {boolean} isStatic
	 * @constructor
	 */
	function Manager(isStatic) {
		/** @type {Object}*/
		this.context = SC.scdefault;
		/** @type {boolean}*/
		this.isStatic = isStatic || false;
	}

	p = Manager.prototype;

	/**
	 * @public
	 * Create new ShortcutManager
	 * @param {Object} context
	 * @returns {Manager}
	 */
	p.create = function (context) {
		return new SC.Manager().in(context);
	};

	/**
	 * @public
	 * Set context
	 * @param {Object} context
	 * @returns {Manager}
	 */
	p.in = function (context) {
		//noinspection JSUnresolvedVariable
		if (this.isStatic) {
			throw "ShortcutManager: Can not change context on static method. Use ShortcutManager.create() with right context.";
		}
		//set new context
		this.context = context;
		//and return it
		return this;
	};

	/**
	 * @public
	 * Register new shortcut
	 * @param {string} shortcut
	 * @param {function} handler
	 * @param {boolean=} isDefault indicates default handler (can be overridden)
	 */
	p.on = function (shortcut, handler, isDefault) {
		var normalized = normalizer.normalize(shortcut);

		//save data into store
		store.save(normalized, this.context, handler, isDefault);
		debug("register " + shortcut);
	};

	/**
	 * @public
	 * Normalize shortcut to string from KeyboardEvent
	 * @param {string|KeyboardEvent} shortcut
	 * @returns {string}
	 */
	p.normalize = function (shortcut){
		//shortcut is object, try get shortcut from event
		if (typeof shortcut === "object") {
			return normalizer.fromEvent(shortcut);
		}
		//normalize from string
		return normalizer.normalize(shortcut);
	};

	/**
	 * @public
	 * Removes handlers by context, shortcut or by handler
	 * @param {string=} shortcut
	 * @param {function=} handler
	 */
	p.remove = function (shortcut, handler) {
		var normalized = normalizer.normalize(shortcut);

		store.remove(this.context, normalized, handler);
		debug("remove " + shortcut);
	};

	/**
	 * @public
	 * Handle by key event
	 * @param {Event} event
	 * @returns {boolean} isHandled
	 */
	p.event = function (event) {
		var normalized = normalizer.fromEvent(event),
			handlerItem,
			handlers,
			handled,
			i;

		if (normalized) {
			//get handlers from store
			handlers = store.get(normalized);
			//handlers exists
			if (handlers && handlers.length) {
				//debug mode message
				debug("ShortcutManager: Trying to handle '" + normalized + "' shortcut,", "available handlers:");
				//iterate all handlers
				for (i = handlers.length - 1; i >= 0; i--) {
					//handler item
					handlerItem = handlers[i];
					//run handler on index
					handled = handlerItem.handler(normalized, handlerItem.modifier, handlerItem.from);
					//handled
					if (handled) {
						//debug mode message and handler
						debug("ShortcutManager: Handler with index '" + i + "' handled shortcut, handler: ");
						debug(handlerItem.handler);
						//stop handling
						return true;
					}
					//debug mode message for next
					debug("ShortcutManager: Handler with index '" + i + "' returned false...trying next");
				}
				//debug mode message and stop
				debug("ShortcutManager: There is no more handler to try, returning false");
			} else {
				//debug mode message for no handlers
				debug("ShortcutManager: There is no handler for '" + normalized + "' shortcut");
			}
		}
		return false;
	};

	/**
	 * @public
	 * @param {string|KeyboardEvent} shortcut
	 * @returns {boolean} isExists
	 */
	p.exists = function (shortcut) {
		var result;

		//shortcut is object, try get shortcut from event
		if (typeof shortcut === "object") {
			shortcut = normalizer.fromEvent(shortcut);
		}
		//shortcut is string, normalize it
		if (typeof shortcut === "string") {
			shortcut = normalizer.normalize(shortcut);
		}
		//check if exists
		result = store.exists(shortcut);

		//debug mode message for shortcut exists
		if (result) {
			debug("ShortcutManager: Shortcut '" + shortcut + "' is registered");
		} else {
			debug("ShortcutManager: Shortcut '" + shortcut + "' is not registered");
		}

		return result;
	};

	/**
	 * @public
	 * Destroy
	 */
	p.destroy = function () {
		this.remove();
	};

	/**
	 * @public
	 * Set debug mode on / off
	 * @param {boolean} state
	 */
	p.debugMode = function (state) {
		debugMode = state;
		console.info("ShortcutManager debug mode is set to " + (state ? "on" : "off"));
	};

	/**
	 * simple debugger, print output if debug is enabled
	 * @param {*} message
	 */
	function debug(message) {
		if (debugMode) {
			console.debug(message);
		}
	}

	return Manager;

}(SC));;/*global SC*/
var ShortcutManager = new SC.Manager(true); //eslint-disable-line