/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

 // Tutorial script by Tom Krcha (Twitter: @tomkrcha)

(function () {
    "use strict";

    var PLUGIN_ID = require("./package.json").name,
        MENU_ID = "tutorial",
        MENU_LABEL = "$$$/JavaScripts/Generator/Tutorial/Menu=Tutorial";
    
    var _generator = null,
        _currentDocumentId = null,
        _config = null;

    /*********** INIT ***********/

    function init(generator, config) {
        _generator = generator;
        _config = config;

        console.log("initializing generator getting started tutorial with config %j", _config);
        
        _generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(
            function () {
                console.log("Menu created", MENU_ID);
            }, function () {
                console.error("Menu creation failed", MENU_ID);
            }
        );
        _generator.onPhotoshopEvent("generatorMenuChanged", handleGeneratorMenuClicked);

        function initLater() {
            // Flip foreground color
            var flipColorsExtendScript = "var color = app.foregroundColor; color.rgb.red = 255 - color.rgb.red; color.rgb.green = 255 - color.rgb.green; color.rgb.blue = 255 - color.rgb.blue; app.foregroundColor = color;";
            sendJavascript(flipColorsExtendScript);

            _generator.onPhotoshopEvent("currentDocumentChanged", handleCurrentDocumentChanged);
            _generator.onPhotoshopEvent("imageChanged", handleImageChanged);
            _generator.onPhotoshopEvent("toolChanged", handleToolChanged);
            requestEntireDocument();
            
        }
        
        process.nextTick(initLater);



    }

    /*********** EVENTS ***********/

    function handleCurrentDocumentChanged(id) {
        console.log("handleCurrentDocumentChanged: "+id)
        setCurrentDocumentId(id);
    }

    function handleImageChanged(document) {
        console.log("Image " + document.id + " was changed:");//, stringify(document));
    }

    function handleToolChanged(document){
        console.log("Tool changed " + document.id + " was changed:");//, stringify(document));
    }

    function handleGeneratorMenuClicked(event) {
        // Ignore changes to other menus
        var menu = event.generatorMenuChanged;
        if (!menu || menu.name !== MENU_ID) {
            return;
        }

        var startingMenuState = _generator.getMenuState(menu.name);
        console.log("Menu event %s, starting state %s", stringify(event), stringify(startingMenuState));
    }

    /*********** CALLS ***********/

    function requestEntireDocument(documentId) {
        if (!documentId) {
            console.log("Determining the current document ID");
        }
        
        _generator.getDocumentInfo(documentId).then(
            function (document) {
                console.log("Received complete document:", stringify(document));
            },
            function (err) {
                console.error("[Tutorial] Error in getDocumentInfo:", err);
            }
        ).done();
    }

    function updateMenuState(enabled) {
        console.log("Setting menu state to", enabled);
        _generator.toggleMenu(MENU_ID, true, enabled);
    }

    /*********** HELPERS ***********/


    function sendJavascript(str){
        _generator.evaluateJSXString(str).then(
            function(result){
                console.log(result);
            },
            function(err){
                console.log(err);
            });
    }

    function setCurrentDocumentId(id) {
        if (_currentDocumentId === id) {
            return;
        }
        console.log("Current document ID:", id);
        _currentDocumentId = id;
    }

    function stringify(object) {
        try {
            return JSON.stringify(object, null, "    ");
        } catch (e) {
            console.error(e);
        }
        return String(object);
    }

    exports.init = init;

    // Unit test function exports
    exports._setConfig = function (config) { _config = config; };
    
}());