# Example Modules

## test.color.click

```js
/*
	example1.js - An example module for JOBAD. 
	A Testing module, colors <p>s in the color given as first parameter. 
*/

JOBAD.modules.register({
	info:{
		'identifier':	'test.color.click',
		'title':	'Test Module: Colors Click',
		'author':	'Tom Wiesing',
		'description':	'A Testing module, colors <p>s in the color given as first parameter. ',
		'hasCleanNamespace': false
	},
	init: function(JOBADInstance, color){
		this.localStore.set("color", color); //Store the color setting
	},
	leftClick: function(target, JOBADInstance){
		if(target.is("p")){
			this.colorize(target); //Color the target
		}
	},
	colorize: function(target){
		target.css("color", this.localStore.get("color")); //get the color setting and apply it. 
	}
});
```
## test.p

```js
/*
	example2.js - An example module for JOBAD. 
	Provides a context menu entry which checks if the clicked element is a <p>. 
*/

JOBAD.modules.register({
	info:{
		'identifier':	'test.p',
		'title':	'Test Module: Paragraphs',
		'author':	'Tom Wiesing',
		'description':	'Provides a context menu entry which checks if the clicked element is a <p>. ',
	},
	contextMenuEntries: function(target){
		if(target.is('#nomenu,#nomenu *')){ //no menu for these elements
			return false;
		}
		return [
			["Am I a <p> ?", function(element){
				if(element.is("p")){
					alert("I am a <p> element. ");
				} else {
					alert("No I'm not. ");
				}
			}]
		];
	}
});
```

## test.color.menu

```js
/*
	example3.js - An example module for JOBAD. 
	Test the menu and adds several items. 
*/

JOBAD.modules.register({
	info:{
		'identifier':	'test.color.menu',
		'title':	'Test Module: Colors',
		'author':	'Tom Wiesing',
		'description':	'Test the menu and adds several items. ',
	},
	contextMenuEntries: function(target){
		if(target.is('#nomenu,#nomenu *')){
			return false;
		}
		return {"Colors": 
				{
					"Make me orange": function(element){element.css("color", "orange");}, 
					"Highlight my background": function(element){
						element
						.stop().css("background-color", "#FFFF9C")
						.animate({ backgroundColor: "#FFFFFF"}, 1500);
					},
					"Revert": function(element){element.stop().css('color', '');}
				}
			};
	}
});
```

## test.color.hover

```js
/*
	example4.js - An example module for JOBAD. 
	Counts the words in a paragraph and shows a tooltip. 
*/

JOBAD.modules.register({
	info:{
		'identifier':	'test.color.hover',
		'title':	'Test Module: Colors Hover',
		'author':	'Tom Wiesing',
		'description':	'Counts the words in a p element. ',
	},
	hoverText: function(target){
		if(target.is("p")){
			var wordCount = (target.text().split(" ").length+1).toString()
			return "I am a p element which contains "+wordCount+" words. ";
		}
	}
});
```
