/*
	JOBAD v3
	Development version
	built: Sat, 20 Apr 2013 17:58:09 +0200
*/

var JOBAD = (function(){
/*
	JOBAD 3 Core Functions
	JOBAD.core.js
*/

var JOBAD = 
(function(){

/* 
	JOBAD 3 Main Function
	Creates a new JOBAD instance on a specefied DOM element.  
	@param element Element to link this element to. May be a DOM Element or a jQuery Object. 
	@param config Configuration for this JOBAD Instance. 

*/

var JOBAD = function(element){

	if(!(this instanceof JOBAD)){
		return new JOBAD(element);	
	}

	var me = this; //Kept in functions

	//The element the current JOBAD instance works on. 
	this.element = element;
	if(JOBAD.refs._.isElement(this.element)){
		this.element = JOBAD.refs.$(this.element);
	}
	if(!(this.element instanceof JOBAD.refs.$)){
		JOBAD.error("Can't create JOBADInstance: Not a DOM Element. ");
	}

	/* modules */
	var InstanceModules = {};
	var disabledModules = [];

	this.modules = {};

	/*
		loads a JOBAD module if not yet loaded. 
		@param module Name of module to load. 
		@param options Array of options to pass to the module. 
		@param ignoredeps Boolean. Ignore dependencies? (Default: false). 
		@returns boolean
	*/
	this.modules.load = function(module, options, ignoredeps){
		if(me.modules.loaded(module)){
			return;	
		}

		var ignoredeps = (typeof ignoredeps == 'boolean')?ignoredeps:false;
	
		if(ignoredeps){
			if(!JOBAD.modules.available(module)){
				JOBAD.error('Error loading module '+module);			
			}
			InstanceModules[module] = new JOBAD.modules.loadedModule(module, options, me);
			return true;
		} else {
			var deps = JOBAD.modules.getDependencyList(module);
		        if(!deps){
				JOBAD.console.warn("Unresolved dependencies for module '"+module+"'. "); //Module not found (has no dependecnies)
				return false;	
			}
			for(var i=0;i<deps.length;i++){
				me.modules.load(deps[i], options, true);
			}
			return true;
		}
		

	 };

	/*
		Checks if a module is loaded. 
		@param module Name of the module to check. 
		@returns boolean
	*/
	this.modules.loaded = function(module){
		return InstanceModules.hasOwnProperty(module);
	}

	/*
		Deactivates a module
		@param module Module to be deactivated. 
	*/
	this.modules.deactivate = function(module){
		if(me.modules.isActive(module)){
			JOBAD.warn("Module '"+module+"' is already deactivated. ");
			return;
		}
		disabledModules.push(module);
	}

	/*
		Activates a module
		@param module Module to be activated. 
	*/
	this.modules.activate = function(module){
		if(me.modules.isActive(module)){
			JOBAD.warn("Module '"+module+"' is already activated. ");
			return;	
		}
		disabledModules = JOBAD.refs._.without(disabledModules, module);
	};
	
	/*
		Checks if a module is active. 
		@param module Module to check. 
	*/
	this.modules.isActive = function(module){
		return (JOBAD.refs._.indexOf(disabledModules, module)==-1); 
	};
	
	/*
		Iterate over all active modules with callback. 
		if cb returns false, abort. 
		@param callback Function to call. 
		@returns Array of results. 
	*/
	this.modules.iterate = function(callback){
		var res = [];
		for(var key in InstanceModules){
			if(InstanceModules.hasOwnProperty(key)){
				if(me.modules.isActive(key)){
					var cb = callback(InstanceModules[key]);
					if(!cb){
						return res;					
					} else {
						res.push(cb);					
					}
				}			
			}		
		}
		return res;
	};
	
	/*
		Iterate over all active modules with callback. Abort once some callback returns false. 
		@param callback Function to call. 
		@returns true if no callback returns false, otherwise false. 
	*/
	this.modules.iterateAnd = function(callback){
		for(var key in InstanceModules){
			if(InstanceModules.hasOwnProperty(key)){
				if(me.modules.isActive(key)){
					var cb = callback(InstanceModules[key]);
					if(!cb){
						return false;					
					}
				}			
			}		
		}
		return true;
	};
	
	/* Event namespace */
	this.Event = {};

	/* Setup core function */
	/* Setup on an Element */

	var enabled = false;

	/*
		Enables or disables this JOBAD instance. 
		@returns boolean indicating if the status was changed.  
	*/
	this.Setup = function(){
		if(enabled){
			return me.Setup.disable();
		} else {
			return me.Setup.enable();
		}
	}

	/*
		Enables this JOBAD instance 
		@returns boolean indicating success. 
	*/
	this.Setup.enable = function(){
		if(enabled){
			return false;
		}

		var root = me.element;

		for(var key in me.Event){
			JOBAD.Events[key].Setup.enable.call(me, root);
		}

		return true;
	}

	/*
		Disables this JOBAD instance. 
		@returns boolean indicating success. 
	*/
	this.Setup.disable = function(){
		if(!enabled){
			return false;
		}		
		var root = me.element;

		for(var key in JOBAD.Events){
			if(JOBAD.Events.hasOwnProperty(key) && !JOBAD.isEventDisabled(key)){
				JOBAD.Events[key].Setup.disable.call(me, root);
			}	
		}

		return true;
	}


	//Setup the events
	for(var key in JOBAD.Events){
		if(JOBAD.Events.hasOwnProperty(key) && !JOBAD.isEventDisabled(key)){

			me.Event[key] = JOBAD.util.bindEverything(JOBAD.Events[key].namespace, me);
			
			if(typeof JOBAD.Events[key].Setup.init == "function"){
				JOBAD.Events[key].Setup.init.call(me, me);
			} else if(typeof JOBAD.Events[key].Setup.init == "object"){
				for(var name in JOBAD.Events[key].Setup.init){
					if(JOBAD.Events[key].Setup.init.hasOwnProperty(name)){
						if(me.hasOwnProperty(name)){
							JOBAD.console.warn("Setup: Event '"+key+"' tried to override '"+name+"'")
						} else {
							me[name] = JOBAD.util.bindEverything(JOBAD.Events[key].Setup.init[name], me);
						}
					}
				}
			}


		}	
	}
};

/* JOBAD Version */
JOBAD.version = "3.0.0";

/* JOBAD Global config */
JOBAD.config = 
{
	    'debug': true, //Debugging enabled? (Logs etc)
	    'cleanModuleNamespace': false,//if set to true this.loadedModule instances will not allow additional functions
	    'disabledEvents': [] //globally disabled Events
};

/* Available JOBAD Events */
JOBAD.Events = {};

/*
	Checks if an Event is disabled by the configuration. 
	@param evtname Name of the event that is disabled. 
*/
JOBAD.isEventDisabled = function(evtname){
	return (JOBAD.config.disabledEvents.indexOf(evtname) != -1);
};

/*
	JOBAD.console: Mimics  or wraps the native console object if available and debugging is enabled. 
*/
if(!_.isUndefined(console)){//Console available
	
	JOBAD.console = 
	{
		"log": function(msg){
			if(JOBAD.config.debug){
				console.log(msg);
			}
		},
		"warn": function(msg){
			if(JOBAD.config.debug){
				console.warn(msg);
			}		
		},
		"error": function(msg){
			if(JOBAD.config.debug){
				console.error(msg);
			}		
		}
	}
} else {
	JOBAD.console = 
	{
		"log": function(){},
		"warn": function(){},
		"error": function(){}	
	}
}


/*
	JOBAD.error: Produces an error message
*/
JOBAD.error = function(msg){
	JOBAD.console.error(msg);
	throw new Error(msg);
}

/*
	Module Registration
*/
JOBAD.modules = {};

var moduleList = {};
var moduleStorage = {};

/* 
	Registers a new JOBAD module with JOBAD. 
	@param ModuleObject The ModuleObject to register. 
	@returns boolean if successfull
*/
JOBAD.modules.register = function(ModuleObject){
	var moduleObject = JOBAD.modules.createProperModuleObject(ModuleObject);
	if(!moduleObject){
		return false;	
	}
	var identifier = moduleObject.info.identifier;
	if(JOBAD.modules.available(identifier)){
		return false;	
	} else {
		moduleList[identifier] = moduleObject;
		moduleStorage[identifier] = {};
		return true;
	}
};

/* 
	Creates a proper Module Object. 
	@param ModuleObject The ModuleObject to register. 
	@returns proper Module Object (adding omitted properties etc. Otherwise false. 
*/
JOBAD.modules.createProperModuleObject = function(ModuleObject){
	if(!JOBAD.refs._.isObject(ModuleObject)){
		return false;
	}
	var properObject = 
	{
		"globalinit": function(){},
		"init": function(){}
	};
	
	for(var key in properObject){
		if(properObject.hasOwnProperty(key) && 	ModuleObject.hasOwnProperty(key)){
			var obj = ModuleObject[key];
			if(typeof obj != 'function'){
				return false;			
			}
			properObject[key] = ModuleObject[key];
		}
	}

	if(ModuleObject.hasOwnProperty("info")){
		var info = ModuleObject.info;
		properObject.info = {
			'version': '',
			'dependencies': []	
		};
		
		if(info.hasOwnProperty('version')){
			if(typeof info['version'] != 'string'){
				return false;			
			}
			properObject.info['version'] = info['version'];
		}

		if(info.hasOwnProperty('hasCleanNamespace')){
			if(info['hasCleanNamespace'] == false){
				properObject.info.hasCleanNamespace = false;
			} else {
				properObject.info.hasCleanNamespace = true;
			}
		} else {
			properObject.info.hasCleanNamespace = true;			
		}

		if(info.hasOwnProperty('dependencies')){
			var arr = info['dependencies'];
			if(!JOBAD.refs._.isArray(arr)){
				return false;			
			}
			properObject.info['dependencies'] = arr;
		}

		try{
			JOBAD.refs._.map(['identifier', 'title', 'author', 'description'], function(key){
				if(info.hasOwnProperty(key)){
					var infoAttr = info[key];
					if(typeof infoAttr != 'string'){
						throw ""; //return false;
					}
					properObject.info[key] = infoAttr;
				} else {
					throw ""; //return false;
				}
			});
		} catch(e){
			return false;		
		}


		/* properties which are allowed (clean) */		
		var CleanProperties = 
		[
			'info',
			'globalinit',
			'init'
		];

		properObject.namespace = {};

		for(var key in ModuleObject){
			if(ModuleObject.hasOwnProperty(key) && CleanProperties.indexOf(key) == -1 && !JOBAD.Events.hasOwnProperty(key)){
				if(properObject.info.hasCleanNamespace){
					JOBAD.console.warn("Warning: Module '"+properObject.info.identifier+"' says its namespace is clean, but property '"+key+"' found. Check ModuleObject.info.hasCleanNamespace. ");	
				} else {
					properObject.namespace[key] = ModuleObject[key];
				}
			}
		}

		for(var key in JOBAD.Events){
			if(ModuleObject.hasOwnProperty(key)){
				properObject[key] = ModuleObject[key];
			}
		}
		
		
		
		return properObject;

	} else {
		return false;	
	}

};

/* 
	Checks if a module is available. 
	@param name The Name to check. 
	@param checkDeps Optional. Should dependencies be checked? (Will result in an endless loop if circular dependencies exist.) Default false. 
	@returns boolean.
*/
JOBAD.modules.available = function(name, checkDeps){
	var checkDeps = (typeof checkDeps == 'boolean')?checkDeps:false;
	var selfAvailable = moduleList.hasOwnProperty(name);
	if(checkDeps && selfAvailable){
		var deps = moduleList[name].info.dependencies;
		for(var i=0;i<deps.length;i++){
			if(!JOBAD.modules.available(deps[i], true)){
				return false;			
			}
		}
		return true;
	} else {
		return selfAvailable;
	}
};

/* 
	Returns an array of dependencies of name including name in such an order, thet they can all be loaded without unresolved dependencies. 
	@param name The Name to check. 
	@returns array of strings or false if some module is not available. 
*/
JOBAD.modules.getDependencyList = function(name){
	if(!JOBAD.modules.available(name, true)){
		return false;	
	}
	var depArray = [name];
	var deps = moduleList[name].info.dependencies;

        for(var i=deps.length-1;i>=0;i--){
		depArray = JOBAD.refs._.union(depArray, JOBAD.modules.getDependencyList(deps[i]));
	}
	return depArray;
};

/*
	Loads a module, assuming the dependencies are already available. 
	@param name Module to loads
	@param args Arguments to pass to the module. 
	@returns new JOBAD.modules.loadedModule instance. 
*/
JOBAD.modules.loadedModule = function(name, args, JOBADInstance){

	if(!JOBAD.modules.available(name)){
		JOBAD.error("Module is not available and cant be loaded. ");	
	}

	/*
		Storage shared accross all module instances. 
	*/
	this.globalStore = 
	{
		"get": function(prop){
			return  moduleStorage[name][prop+"_"];		
		},
		"set": function(prop, val){
			moduleStorage[name][prop+"_"] = val;
		},
		"delete": function(prop){
			delete moduleStorage[name][prop+"_"];
		}
	}
	
	var storage = {};
	/*
		Storage contained per instance of the module.  
	*/
	this.localStore = 
	{
		"get": function(prop){
			return  storage[prop];		
		},
		"set": function(prop, val){
			storage[prop] = val;
		},
		"delete": function(prop){
			delete storage[name];
		}
	}

	var ServiceObject = moduleList[name];
	/*
		Information about this module. 
	*/
	this.info = function(){
		return ServiceObject.info;
	}

	/*
		gets the JOBAD instance bound to this module object
	*/
	this.getJOBAD = function(){
		return JOBADInstance;	
	};


	//Initilisation

	if(!moduleStorage[name]["init"]){
		moduleStorage[name]["init"] = true;
		ServiceObject.globalinit.apply(undefined, []);
	}

	var params = [JOBADInstance];
	
	for(var i=0;i<args.length;i++){
		params.push(args[i]);	
	}


	if(JOBAD.config.cleanModuleNamespace){
		if(!ServiceObject.info.hasCleanNamespace){
			JOBAD.console.warn("Warning: Module '"+name+"' may have unclean namespace, but JOBAD.config.cleanModuleNamespace is true. ");		
		}
	} else {
		var orgClone = JOBAD.refs._.clone(ServiceObject.namespace);

		for(var key in orgClone){
			if(!JOBAD.Events.hasOwnProperty(key) && orgClone.hasOwnProperty(key)){
				this[key] = orgClone[key];
			}
		}
	}

	for(var key in JOBAD.Events){
		if(ServiceObject.hasOwnProperty(key)){
			this[key] = ServiceObject[key];
		} else {
			this[key] = JOBAD.Events[key]["default"];
		}
	}

	ServiceObject.init.apply(this, params);		
};

/* various utility functions */
JOBAD.util = {};

/*
	Binds every function within an object recursively. 
	@param obj Object to bind. 
	@param thisObj 'this' inside functions. 
*/
JOBAD.util.bindEverything = function(obj, thisObj){
	if(JOBAD.refs._.isObject(obj) && typeof obj != 'function' ){
		var ret = {};
		for(var key in obj){
			ret[key] = JOBAD.util.bindEverything(obj[key], thisObj);
		}
		return ret;
	} else if(typeof obj == 'function'){
		return JOBAD.refs._.bind(obj, thisObj);
	} else {
		return JOBAD.refs._.clone(obj);
	}
	
}


/*
	JOBAD Dependencies namespace. 
*/
JOBAD.refs = {};
JOBAD.refs.$ = jQuery;
JOBAD.refs._ = _; 

JOBAD.noConflict = function(){
	return {
		"_": JOBAD.noConflict._(),
		"$": JOBAD.noConflict.$()	
	}
}; //No conflict mode

/*
	sets jQuery in noConflict mode. 
	@returns jQuery.noConflict()
*/
JOBAD.noConflict.$ = function(){
	
	JOBAD.refs.$ = JOBAD.refs.$.noConflict();
	return JOBAD.refs.$;
}

/*
	sets Underscore in noConflict mode. 
	@returns _.noConflict()
*/
JOBAD.noConflict._ = function(){
	JOBAD.refs._ = JOBAD.refs._.noConflict();
	return JOBAD.refs._;
}

return JOBAD;
})();

/*
	JOBAD 3 UI Functions
	JOBAD.ui.js
	
	requires: 
		JOBAD.core.js
*/

(function(JOBAD){

	//Mouse coordinates
	var mouseCoords = [0, 0];


	JOBAD.refs.$(document).on("mousemove.JOBADListener", function(e){
		mouseCoords = [e.pageX-JOBAD.refs.$(window).scrollLeft(), e.pageY-JOBAD.refs.$(window).scrollTop()];
	});

	//UI Namespace. 
	JOBAD.UI = {}

	//Hover UI. 
	JOBAD.UI.hover = {}

	JOBAD.UI.hover.config = {
		"offsetX": 10, //offset from the mouse in X and Y
		"offsetY": 10,
		"hoverDelay": 1000 //Delay for showing tooltip after hovering. (in milliseconds)	
	}
	
	var hoverActive = false;
	var hoverElement = undefined;

	/*
		Activates the hover ui which follows the mouse. 
		@param html HTML to use as content
		@return true. 
	*/
	JOBAD.UI.hover.enable = function(html){
		hoverActive = true;
		hoverElement = JOBAD.refs.$("<div class='JOBAD JOBAD_Hover'>").html(html);
		hoverElement.appendTo(JOBAD.refs.$("body"));

		JOBAD.refs.$(document).on("mousemove.JOBAD.UI.hover", function(){
			JOBAD.UI.hover.refresh();
		});

		JOBAD.UI.hover.refresh();
		
		return true; 
	}

	/*
		Deactivates the hover UI if active. 
		@param element jQuery element to use as hover
		@return booelan boolean indicating of the UI has been deactived. 
	*/
	JOBAD.UI.hover.disable = function(){
		if(!hoverActive){
			return false;		
		}

		hoverActive = false;
		JOBAD.refs.$(document).off("mousemove.JOBAD.UI.hover");
		hoverElement.remove();
	}
	/*
		Refreshes the position of the hover element if active. 
		@return nothing. 
	*/
	JOBAD.UI.hover.refresh = function(){
		if(hoverActive){
			hoverElement
			.css("top", Math.min(mouseCoords[1]+JOBAD.UI.hover.config.offsetY, window.innerHeight-hoverElement.outerHeight(true)))
			.css("left", Math.min(mouseCoords[0]+JOBAD.UI.hover.config.offsetX, window.innerWidth-hoverElement.outerWidth(true)))
		}
	}

	//Context Menu UI
	JOBAD.UI.ContextMenu = {}
	
	JOBAD.UI.ContextMenu.config = {
		'margin': 20, //margin from page borders
		'width': 250 //menu width
	};
	
	/*
		Registers a context menu on an element. 
		@param element jQuery element to register on. 
		@param demandFunction Function to call to get menu. 
		@param onEnable Optional. Will be called before the context menu is enabled. 
		@param onDisable Optional. Will be called after the context menu has been disabled. 
		@return the jquery element. 
	*/
	JOBAD.UI.ContextMenu.enable = function(element, demandFunction, onEnable, onDisable){
		if(typeof demandFunction != 'function'){
			JOBAD.error('JOBAD.UI.ContextMenu.enable: demandFunction is not a function'); //die
			return element;
		}
		
		if(typeof onEnable != 'function'){
			onEnable = function(element){}; //Default
		}
		if(typeof onDisable != 'function'){
			onDisable = function(element){}; //Default
		}

		element.on('contextmenu.JOBAD.UI.ContextMenu', function(e){
			if(e.ctrlKey){
				return true;
			}
			var targetElement = JOBAD.refs.$(e.target);
			var elementOrg = JOBAD.refs.$(e.target);
			var result = false;
			while(true){
				result = demandFunction(targetElement, elementOrg);
				if(result || element.is(this)){
					break;				
				}
				targetElement = targetElement.parent();
			}
			
			if(!result){
				return true; //Allow the browser to handle stuff			
			}
			
			JOBAD.refs.$(document).trigger('JOBADContextMenuUnbind'); //close all other menus

			onEnable(element);

			var menuBuild = JOBAD.UI.ContextMenu.buildMenuList(result, targetElement, elementOrg)
			.menu()
			.css({
				'width': JOBAD.UI.ContextMenu.config.width,
				'position': 'fixed'
			})
			.on('contextmenu', function(){
				return false;			
			})
			.on('mousedown', function(e){
				e.stopPropagation();//prevent closemenu from triggering
			})
			.appendTo(JOBAD.refs.$("body"));
			
			

			menuBuild
			.css("top", Math.min(mouseCoords[1], window.innerHeight-menuBuild.outerHeight(true)-JOBAD.UI.ContextMenu.config.margin))
			.css("left", Math.min(mouseCoords[0], window.innerWidth-menuBuild.outerWidth(true)-JOBAD.UI.ContextMenu.config.margin))
			var closeHandler = function(e){
				menuBuild
				.remove();
				onDisable(element);
			};

			JOBAD.refs.$(document).on('JOBADContextMenuUnbind', function(){
					closeHandler();
					JOBAD.refs.$(document).unbind('mousedown.UI.ContextMenu.Unbind JOBADContextMenuUnbind');
			});

			JOBAD.refs.$(document).on('mousedown.UI.ContextMenu.Unbind', function(){
				JOBAD.refs.$(document).trigger('JOBADContextMenuUnbind');
			});
	
			
			return false;
			
		});

		return element;

	};

	/*
		Disables the Context Menu. 
		@param element jQuery element to remove the context menu from. 
		@return the jquery element. 
	*/
	JOBAD.UI.ContextMenu.disable = function(element){
		element.off('contextmenu.JOBAD.UI.ContextMenu'); //remove listener
		return element;
	};

	/*
		Builds the menu html element
		@param items The menu to build. 
		@param element The element the context menu has been requested on. 
		@param elementOrg The element the context menu call originates from. 
		@returns the menu element. 
	*/
	JOBAD.UI.ContextMenu.buildMenuList = function(items, element, elementOrg){
		var $ul = JOBAD.refs.$("<ul class='JOBAD JOBAD_Contextmenu'>");
		for(var i=0;i<items.length;i++){
			var item = items[i];
			var $a = JOBAD.refs.$("<a href='#'>");
			$li = JOBAD.refs.$("<li>")
			.appendTo($ul)
			.append($a);
			$a
			.text(item[0])
			.on('click', function(e){
				return false; //Don't follow link. 
			});
			(function(){
				if(typeof item[1] == 'function'){
					var callback = item[1];

					$a.on('click', function(e){
						JOBAD.refs.$(document).trigger('JOBADContextMenuUnbind');
						callback(element, elementOrg);
					});		
				} else {
					
					$li.append(JOBAD.UI.ContextMenu.buildMenuList(item[1], element, elementOrg));
				}
			})()
					
		}
		return $ul;
	};


	//Sidebar UI
	JOBAD.UI.Sidebar = {}; 

	JOBAD.UI.Sidebar.config = 
	{
		"width": 100 //Sidebar Width
	};

	/*
		Wraps an element to create a sidebar UI. 
		@param element The element to wrap. 
		@returns the original element, now wrapped. 
	*/
	JOBAD.UI.Sidebar.wrap = function(element){
		var org = $(element);

		var orgWrapper = JOBAD.refs.$("<div>").css({"overflow": "hidden"});

		var sideBarElement = JOBAD.refs.$("<div class='JOBAD JOBAD_Sidebar JOBAD_Sidebar_Container'>").css({
			"width": JOBAD.UI.Sidebar.config.width
		});

		var container = JOBAD.refs.$("<div class='JOBAD JOBAD_Sidebar JOBAD_Sidebar_Wrapper'>");
	
		org.wrap(orgWrapper);

		orgWrapper = org.parent();

		orgWrapper.wrap(container);
	
		container = orgWrapper.parent();

		container.prepend(sideBarElement);


		org.data("JOBAD.UI.Sidebar.active", true);
		return org;
	};

	/*
		Unwraps an element, destroying the sidebar. 
		@param The element which has a sidebar. 
		@returns the original element unwrapped. 
	*/
	JOBAD.UI.Sidebar.unwrap = function(element){
		var org = JOBAD.refs.$(element);
		org
		.unwrap()
		.parent()
		.find("div")
		.first().remove();

		org.removeData("JOBAD.UI.Sidebar.active");

		return org.unwrap();
	};

	/*
		Adds a new notification to the sidebar. (It must already exist)
		@param sidebar The element which has a sidebar. 
		@param element The element to bind the notification to. 
		@returns an empty new notification element. 
	*/
	JOBAD.UI.Sidebar.addNotification = function(sidebar, element){
		var sbar = JOBAD.refs.$(sidebar);
		var child = JOBAD.refs.$(element);
		var offset = child.offset().top - sbar.offset().top; //offset
		sbar = sbar.parent().parent().find("div").first();
	
		var newGuy =  JOBAD.refs.$("<div class='JOBAD JOBAD_Sidebar JOBAD_Sidebar_Notification'>").css({"top": offset}).appendTo(sbar);


		var callback = function(){
			var offset = child.offset().top - sbar.offset().top; //offset
			newGuy.css({"top": offset});
		
		};
	

		JOBAD.refs.$(window).on("resize.JOBAD.UI.Sidebar", callback);

		return newGuy.data("JOBAD.UI.Sidebar.ResizeHook", callback);
	};

	/*
		Forces a sidebar notification position update. 
		@returns nothing. 
	*/
	JOBAD.UI.Sidebar.forceNotificationUpdate = function(){
		JOBAD.refs.$(window).trigger("resize.JOBAD.UI.Sidebar");
	};

	/*
		Removes a notification
		@param notification The notification element. 
		@returns nothing. 
	*/
	JOBAD.UI.Sidebar.removeNotification = function(notification){
		var callback = notification.data("JOBAD.UI.Sidebar.ResizeHook");
		JOBAD.refs.$(window).off("resize.JOBAD.UI.Sidebar", callback);
		notification.remove();
	};


	//highlighting
	/*
		highlights an element
	*/
	JOBAD.UI.highlight = function(element){
		var element = JOBAD.refs.$(element);
		var col;
		if(typeof element.data("JOBAD.UI.highlight.orgColor") == 'string'){
			col = element.data("JOBAD.UI.highlight.orgColor");
		} else {
			col = element.css("backgroundColor");
		}
		
		element
		.stop().data("JOBAD.UI.highlight.orgColor", col)
		.animate({ backgroundColor: "#FFFF9C"}, 1000);	
	};
	/*
		unhighlights an element.	
	*/		
	JOBAD.UI.unhighlight = function(element){
		var element = JOBAD.refs.$(element);
		element
		.stop()
		.animate({
			backgroundColor: element.data("JOBAD.UI.highlight.orgColor"),
			finish: function(){
				element.removeData("JOBAD.UI.highlight.orgColor");
			}
		}, 1000);
			
	};

})(JOBAD);

/*
	JOBAD 3 Event Functions
	JOBAD.event.js
	
	requires:
		JOBAD.core.js
		JOBAD.ui.js
*/

(function(){

/* left click */
JOBAD.Events.leftClick = 
{
	'default': function(){
		return false;
	},
	'Setup': {
		'enable': function(root){
			var me = this;
			root.delegate("*", 'click.JOBAD.leftClick', function(event){
				var element = JOBAD.refs.$(event.target); //The base element.  
				switch (event.which) {
					case 1:
						/* left mouse button => left click */
						me.Event.leftClick.trigger(element);
						event.stopPropagation(); //Not for the parent. 
						break;
					default:
						/* nothing */
				}
			});
		},
		'disable': function(root){
			root.undelegate("*", 'click.JOBAD.leftClick');	
		}
	},
	'namespace': 
	{
		
		'getResult': function(target){
			return this.modules.iterateAnd(function(module){
				module.leftClick.call(module, target, module.getJOBAD());
				return true;
			});
		},
		'trigger': function(target){
			return this.Event.leftClick.getResult(target);
		}
	}
};

/* context menu entries */
JOBAD.Events.contextMenuEntries = 
{
	'default': function(){
		return [];
	},
	'Setup': {
		'enable': function(root){
			var me = this;
			JOBAD.UI.ContextMenu.enable(root, function(target){
				return me.Event.contextMenuEntries.getResult(target);
			});
		},
		'disable': function(root){
			JOBAD.UI.ContextMenu.disable(root);
		}
	},
	'namespace': 
	{
		'getResult': function(target){
			var res = [];
			var mods = this.modules.iterate(function(module){
				var entries = module.contextMenuEntries.call(module, target, module.getJOBAD());
				return (JOBAD.refs._.isArray(entries))?entries:JOBAD.util.generateMenuList(entries);
			});
			for(var i=0;i<mods.length;i++){
				var mod = mods[i];
				for(var j=0;j<mod.length;j++){
					res.push(mod[j]);
				}
			}
			if(res.length == 0){
				return false;		
			} else {
				return res;		
			}
		}
	}
}


/*
	Generates a list menu representation from an object representation. 
	@param menu Menu to generate. 
	@returns the new representation. 
*/
JOBAD.util.generateMenuList = function(menu){
	if(typeof menu == 'undefined'){
		return [];
	}
	var res = [];
	for(var key in menu){
		if(menu.hasOwnProperty(key)){
			var val = menu[key];
			if(typeof val == 'function'){
				res.push([key, val]);		
			} else {
				res.push([key, JOBAD.util.generateMenuList(val)]);
			}
		}
	}
	return res;
};

/* hover Text */
JOBAD.Events.hoverText = 
{
	'default': function(){
		return false;	
	},
	'Setup': {
		'init': function(){
			this.Event.hoverText.activeHoverElement = undefined; //the currently active element. 
		},
		'enable': function(root){
			
			var me = this;
			var trigger = function(event){
				var res = me.Event.hoverText.trigger(JOBAD.refs.$(this));
				if(res){//something happened here: dont trigger on parent
					event.stopPropagation();
				} else if(!JOBAD.refs.$(this).is(root)){ //I have nothing => trigger the parent
					JOBAD.refs.$(this).parent().trigger('mouseenter.JOBAD.hoverText', event); //Trigger parent if i'm not root. 	
				}
				return false;
			};


			var untrigger = function(event){
				return me.Event.hoverText.untrigger(JOBAD.refs.$(this));	
			};

			root
			.delegate("*", 'mouseenter.JOBAD.hoverText', trigger)
			.delegate("*", 'mouseleave.JOBAD.hoverText', untrigger);

		},
		'disable': function(root){
			if(typeof this.Event.hoverText.activeHoverElement != 'undefined')
			{
				me.Event.hoverText.untrigger(); //remove active Hover menu
			}
		
			root
			.undelegate("*", 'mouseenter.JOBAD.hoverText')
			.undelegate("*", 'mouseleave.JOBAD.hoverText');
		}
	},
	'namespace': {
		'getResult': function(target){
			var res = false;
			this.modules.iterate(function(module){
				var hoverText = module.hoverText.call(module, target, module.getJOBAD()); //call apply and stuff here
				if(typeof hoverText != 'undefined' && typeof res == "boolean"){//trigger all hover handlers ; display only the first one. 
					if(typeof hoverText == "string"){
						res = JOBAD.refs.$("<p>").text(hoverText)			
					} else if(typeof hoverText != "boolean"){
						try{
							res = JOBAD.refs.$(hoverText);
						} catch(e){
							JOBAD.error("Module '"+module.info().identifier+"' returned invalid HOVER result. ");
						}
					} else if(hoverText === true){
						res = true;
					}
				}
				return true;
			});
			return res;
		},
		'trigger': function(source){
			if(source.data('JOBAD.hover.Active')){
				return false;		
			}

			var EventResult = this.Event.hoverText.getResult(source); //try to do the event
		
			if(typeof EventResult == 'boolean'){
				return EventResult;		
			}

			if(this.Event.hoverText.activeHoverElement instanceof JOBAD.refs.$)//something already active
			{
				if(this.Event.hoverText.activeHoverElement.is(source)){
					return true; //done and die			
				}
				this.Event.hoverText.untrigger(this.Event.hoverText.activeHoverElement);	
			}

			this.Event.hoverText.activeHoverElement = source;

			source.data('JOBAD.hover.Active', true);
			var tid = window.setTimeout(function(){
				source.removeData('JOBAD.hover.timerId');
				JOBAD.UI.hover.enable(EventResult.html());
			}, JOBAD.UI.hover.config.hoverDelay);

			source.data('JOBAD.hover.timerId', tid);//save timeout id
			return true;
						
		},
		'untrigger': function(source){
			if(typeof source == 'undefined'){
				if(this.Event.hoverText.activeHoverElement instanceof JOBAD.refs.$){
					source = this.Event.hoverText.activeHoverElement;
				} else {
					return false;			
				}
			}		

			if(!source.data('JOBAD.hover.Active')){
				return false;		
			}

		

			if(typeof source.data('JOBAD.hover.timerId') == 'number'){
				window.clearTimeout(source.data('JOBAD.hover.timerId'));
				source.removeData('JOBAD.hover.timerId');		
			}

			source.removeData('JOBAD.hover.Active');

			this.Event.hoverText.activeHoverElement = undefined;

			JOBAD.UI.hover.disable();

			if(!source.is(this.element)){
				this.Event.hoverText.trigger(source.parent());//we are in the parent now
				return false;
			}

			return true;
		}
	}
}


/* sidebar: onSideBarUpdate Event */
JOBAD.Events.onSideBarUpdate = 
{
	'default': function(){
		//Does nothing
	},
	'Setup': {
		'init': {
			/* Sidebar namespace */
			'Sidebar': {
				/*
					Redraws the sidebar. 
				*/
				'redraw': function(){
					if(typeof this.Sidebar.Elements == 'undefined'){
						this.Sidebar.Elements = {};
					}
					if(JOBAD.refs._.keys(this.Sidebar.Elements).length == 0){
						if(this.element.data("JOBAD.UI.Sidebar.active")){
							JOBAD.UI.Sidebar.unwrap(this.element);
						}	
					} else {
						if(!this.element.data("JOBAD.UI.Sidebar.active")){
							JOBAD.UI.Sidebar.wrap(this.element);
						}
						for(var id in this.Sidebar.Elements){
							var element = this.Sidebar.Elements[id];
							if(!element.data("JOBAD.Events.Sidebar.id")){
								this.Sidebar.Elements[id] = JOBAD.UI.Sidebar.addNotification(this.element, this.Sidebar.Elements[id]);
							}
						}
					}
					JOBAD.UI.Sidebar.forceNotificationUpdate();
					this.Event.onSideBarUpdate.trigger();
				},
				/*
					Registers a new notification. 
					@param element Element to register notification on. 
					@param config
							config.icon:		Icon to display [UNIMPLEMENTED]
							config.text:		Text
							config.trace:		Trace the original element on hover?
							config.click:	Callback on click
					@return jQuery element used as identification. 
							
				*/
				'registerNotification': function(element, config){
					if(typeof this.Sidebar.Elements == 'undefined'){
						this.Sidebar.Elements = {};
					}
					var element = JOBAD.refs.$(element);
					var id = (new Date()).getTime().toString();
					this.Sidebar.Elements[id] = element;			
					this.Sidebar.redraw();
					var sidebar_element = this.Sidebar.Elements[id].data("JOBAD.Events.Sidebar.id", id);

					sidebar_element.data("JOBAD.Events.Sidebar.element", element)					
	
					var config = (typeof config == 'undefined')?{}:config;
					
					if(config.hasOwnProperty("text")){
						sidebar_element.text(config.text);
					}
					

					if(config.trace){
						//highlight the element
						sidebar_element.hover(
						function(){
							JOBAD.UI.highlight(element);
						},
						function(){
							JOBAD.UI.unhighlight(element);
						});
					}

					if(typeof config.click == "function"){
						sidebar_element.click(config.click);
					}

					return sidebar_element;
				}, 
				/*
					removes a notification. 
					@param	item	Notification to remove. 
				*/
				'removeNotification': function(item){
					if(item instanceof JOBAD.refs.$){
						var id = item.data("JOBAD.Events.Sidebar.id");
						JOBAD.UI.Sidebar.removeNotification(item);
						delete this.Sidebar.Elements[id];
						this.Sidebar.redraw();
					} else {
						JOBAD.error("JOBAD Sidebar Error: Tried to remove invalid Element. ");
					}
				}	
			}
		},
		'enable': function(root){
			this.Sidebar.Elements = {};
			this.Event.onSideBarUpdate.enabled = true;
			
		},
		'disable': function(root){
			this.Event.onSideBarUpdate.enabled = undefined;
		}
	},
	'namespace': 
	{
		
		'getResult': function(){
			if(this.Event.onSideBarUpdate.enabled){
				this.modules.iterateAnd(function(module){
					module.onSideBarUpdate.call(module, module.getJOBAD());
					return true;
				});
			}
		},
		'trigger': function(){
			this.Event.onSideBarUpdate.getResult();
		}
	}
};


})();

/*
	JOBAD Core build configuration
*/
JOBAD.config.debug = false;

return JOBAD;
})();
