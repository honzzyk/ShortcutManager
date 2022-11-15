# ShortcutManager

### Info
Manager for shortcuts in web application. Is used for registering shortcuts on your web application. You can handle
more states, like more shortcuts based on current context and so on. It is a minimalistic library (< 8kB min file)
and is really simple to use it.

### How to install

Download and install [NodeJs](https://nodejs.org/en/)

Run command `npm install`

### Test status on CodeShip
![CodeShip status](https://codeship.com/projects/2f6e5400-446e-0134-4e35-4ed1b3e90ffc/status?branch=master "CodeShip status")

[CodeShip Continuous integration project](https://codeship.com/projects/168461)

### Methods

#### .create(context, layer)

It's method for creating new shortcut manager with given `context` and `layer`. Context can be any object or any function.
Layer is not required and it is used for creating modal layers of shortcuts. More information in section "SCM Layers"
It is use for manipulation with handlers. More information in section "How to use it"

#### .on(shortcut, handler, isDefault)

Register given `shortcut` and `handler` for shortcut. Shortcut format is describe in section "Shortcut formats".
Parameter `isDefault` is used for determining default shortcut. Default shortcut is called and move to end of stack.
There can be only one default handler for given shortcut.

#### .activate()

Method is used for activating layer for current shortcut manager. If SCM is created without layer, activating main layer instead.
More information in section "SCM Layers" and  in section "How to use it"

#### .deactivate()

Method is used for deactivating layer for current shortcut manager. If SCM is created without layer, it throw error because it is not permitted.
More information in section "SCM Layers" and  in section "How to use it"

#### .normalize(shortcut)

This method takes string `shortcut` and return it's normalized state (Lower cased, right order and so on).

#### .remove(shortcut, handler)

Remove `handler` for given `shortcut`.

#### .event(event)

Sending a dom `event` into manger trigger routine about determining which handler can be called.

#### .exists(shortcut)

This method return boolean if there is some handler for given `shortcut`.

#### .debugMode(state)

You can turn on debug mode that is used for consoling some information about events.


### Shortcut formats

##### Single shortcuts
- "Ctrl+B"
- "Ctrl+Space"
- "Alt+Ctrl+B"
- "Alt+SHIFT+Ctrl+B"
- "+"
- "Ctrl+Enter"
- "Ctrl+Return"

##### Dynamic shortcuts
- "Ctrl+[0..9]"
- "Ctrl+Alt+[0..9]"

##### Multiple shortcuts
- "Ctrl+C, Ctrl+D"
- "Ctrl+C, Ctrl+Shift+[0..9]"

### SCM Layers

SCM layers are created for handling shortcuts in modal windows or for another contexts. You can create more shortcut managers and
for modal you create manager with another layer.
If you open modal window or context window, you can call `activate()` method on SCM in window that switch current active layer for modal window. You can bind shortcuts here and another shortcuts in another layer will not be handled.
After closing modal window or context window, you can call `deactivate()` method on SCM in window and return to main layer.

### How to use it

You can use this library in global way. There is global variable `ShortcutManager`.

#### Example 1 - simple use

```javascript
ShortcutManager.on("Ctrl+B", function () {
    console.log("You handler Ctrl+B");
});
//domEvent = event from keydown handler
ShortcutManager.event(domEvent);
ShortcutManager.exists("Ctrl+B");
```

#### Example 2 - Layers

```javascript
var modal = new Window(), //for example only - will be whatever
    scmMain = ShortcutManager.create(window),
    scmModal = ShortcutManager.create(modal, "my-modal-window");

//will be handle by "scmMain"
ShortcutManager.event(domEvent);

scmModal.activate();

//will be handle by "scmModal"
ShortcutManager.event(domEvent);

scmModal.deactivate();

//will be handle by "scmMain"
ShortcutManager.event(domEvent);

//you can also call activate on main and force reset all opened layers
scmMain.activate();

```

# Licence

MIT License

Copyright (c) 2022 Radek Sedlák\
Copyright (c) 2015 Petr Jelínek, Stanislav Hacker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The Software shall be used for Good, not Evil.
