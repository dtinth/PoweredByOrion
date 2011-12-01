/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2011 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*global examples orion:true window*/
/*jslint browser:true devel:true*/

window.onload = (function(){
	
	var editorDomNode = document.getElementById("editor");
	var loadingDomNode = document.getElementById("load");

	var textViewFactory = function() {
		return new orion.textview.TextView({
			parent: editorDomNode,
			stylesheet: [ "orion.css", "editor.css"],
			tabSize: 4
		});
	};
	
	// Canned highlighters for js, java, and css. Grammar-based highlighter for html
	var syntaxHighlighter = {
		styler: null, 
		
		highlight: function(fileName, editor) {
			if (this.styler) {
				this.styler.destroy();
				this.styler = null;
			}
			if (!fileName) {
				fileName = "";
			}
			var splits = fileName.split(".");
			var extension = splits.pop().toLowerCase();
			var textView = editor.getTextView();
			var annotationModel = editor.getAnnotationModel();
			switch(extension) {
				case "js":
				case "java":
				case "css":
				this.styler = new examples.textview.TextStyler(textView, extension, annotationModel);
				break;
				case "html":
				this.styler = new orion.editor.TextMateStyler(textView, orion.editor.HtmlGrammar.grammar);
				break;
				default:
				this.styler = new examples.textview.TextStyler(textView, "js", annotationModel);
				break;
			}
		}
	};
	
	var annotationFactory = new orion.editor.AnnotationFactory();
	
	var keyBindingFactory = function(editor, keyModeStack, undoStack, contentAssist) {
		
		// Create keybindings for generic editing
		var genericBindings = new orion.editor.TextActions(editor, undoStack);
		keyModeStack.push(genericBindings);
		
		// create keybindings for source editing
		var codeBindings = new orion.editor.SourceCodeActions(editor, undoStack, contentAssist);
		keyModeStack.push(codeBindings);
		
	};
	
	var dirtyIndicator = "";
	var status = "";
	
	var editor = new orion.editor.Editor({
		textViewFactory: textViewFactory,
		undoStackFactory: new orion.editor.UndoFactory(),
		lineNumberRulerFactory: new orion.editor.LineNumberRulerFactory(),
		keyBindingFactory: keyBindingFactory,
		domNode: editorDomNode,
		statusReporter: statusReporter
	});
	
	function statusReporter(message, isError) {
	}
	
	window.save = function() {
		editor.setInput(null, null, null, true);
	};
	
	window.getDirty = function() {
		return ~~editor.getDirty();
	};
	
	editor.addEventListener("DirtyChanged", function(evt) {
		if (window.pbo) {
			window.pbo.setDirtyFlag();
		}
	});
	
	editor.addEventListener("Modified", function(evt) {
		if (window.pbo) {
			window.pbo.textChanged();
		}
	});
	
	window.setText = function(text) {
		editor.setText(text);
	};
	
	window.getText = function() {
		return editor.getText();
	};
	
	window.initEditor = function(initialContent, contentName) {
		editor.installTextView();
		editor.setInput(contentName, null, initialContent);
		syntaxHighlighter.highlight(contentName, editor);
		editor.highlightAnnotations();
	};
	
	if (window.pbo) {
		var initText = window.pbo.getInitialText();
		window.initEditor(initText, window.pbo.getInitialFilename());
	} else {
		window.initEditor('alert("x");', '');
	}
	
	setTimeout(function check() { // work around a nasty webview bug
		var tv = editor.getTextView();
		if (!tv._clientDiv) {
			tv._createContent();
			setTimeout(check, 50);
		} else {
			loadingDomNode.style.display = 'none';
		}
	}, 50);

});
