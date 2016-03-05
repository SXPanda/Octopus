/* Octopus.js core modules */
/* Octopus.js Copyright 2016, George Broadhurst */


var globals = {};
//short hand form of globals
var g = globals;
var Octopus  = {
	version : "0.0.1",
	modules : {},
	options : {
		width: 400,
		height: 400
	},
	core : {
		BaseClass : {
			options : {},
			start : function(args){},
			beforeUpdate : function(args){},
			update : function(args){},
			afterUpdate : function(args){}
		},
		createClass : function(className, classObject, extendClass, static){
			var extension = extendClass ? new extendClass() : Octopus.core.BaseClass;
			Octopus[className] = function(args) {
				var obj = $.extend(true, {class: className, id: Date.now() + Math.random(0, 1000)}, extension, classObject, {class: className});
				
				obj.start.apply(obj, arguments);
				
				return obj;
			};
			
			if (static)
			{
				var instance = Octopus[className]()
				globals[className] = instance;
				return instance;
			}
				
			else
				Octopus[className];
		}
	},
	classes : {
		
	},
	Instance : function(el, options){
		var timeOut = false;
		var controller = {
			objects : Octopus.objects,
			methods : Octopus.methods
		}
		
		controller.methods.initialize(el, options);
		
		return controller;
	},
	objects : {},
	methods : {
		initialize : function(el, options) {
		
			Octopus.options = $.extend(Octopus.options, options);
			Octopus.options.masterElement = el;
			Octopus.options.masterElement.trigger('beforeInitialise');
			Octopus.options.masterElement.css('width', Octopus.options.width).css('height', Octopus.options.height);
			var el = Octopus.options.masterElement;
			el[0].width = el.width();
			el[0].height = el.height();
			
			var circle = new Octopus.Circle(100, 100, 50, 'red', 'blue');
			Octopus.methods.startExecution();
		},
		loadClasses : function() {
			
		},
		onBeforeUpdate : function() {
			for (var i in globals) {
				globals[i].beforeUpdate();
			}
			for (var o in Octopus.objects) {
				Octopus.objects[o].beforeUpdate();
			}
		},
		onUpdate : function() {
			var c = Octopus.options.masterElement[0],
				ctx = c.getContext("2d");
			
			ctx.clearRect(0,0,c.width, c.height);
			
			var objects = Octopus.objects,
				obj = false;
			for (var o in objects)
			{
				obj = objects[o];
				obj.update();
				obj.render(ctx);
			}
		},
		onAfterUpdate : function() {
			
			var c = Octopus.options.masterElement[0],
				ctx = c.getContext("2d");
			for (var o in Octopus.objects) {
				Octopus.objects[o].afterUpdate(ctx);
			}
			for (var i in globals) {
				globals[i].afterUpdate();
			}
		},
		gameLoop : function() {
			Octopus.methods.onBeforeUpdate();
			Octopus.methods.onUpdate();
			Octopus.methods.onAfterUpdate();
		},
		addObject : function(obj) {
			Octopus.objects[Octopus.methods.nextObjId()] = obj;
		},
		nextObjId : function() {
			return Object.keys(octopus.objects).length;
		},
		pauseExecution : function() {
			clearInterval(timeOut);
		},
		startExecution : function() {
			timeOut = setInterval(Octopus.methods.gameLoop, 1000/60);
		}
	},
	extendMethods : function (methodName, methodFunction) {
		Octopus.methods[methodName] = methodFunction;
	}
};

var Time = Octopus.core.createClass('Time',{
	prevFrameTimestamp : false,
	frameTime : false,
	frame : 0,
	start : function(args){
		this.prevFrameTimestamp = Date.now();
	},
	beforeUpdate : function(args){
		this.frame ++;
		this.frameTime = (Date.now() - this.prevFrameTimestamp)/1000;
		this.prevFrameTimestamp = Date.now();
	},
	deltaTime : function() {
		return this.frameTime;
	}
}, false, true);


/* Frame cache is cleared at the end of each frame */
/* Persistent cache will stay until manually removed */
var Cache = Octopus.core.createClass('Cache', {
	frameCache : {
		
	},
	persistentCache : {
		
	},
	setValue : function(key, value, persistent) {
		if (persistent)
			this.persistentCache[key] = value;
		else
			this.frameCache[key] = value;
	}, 
	getValue : function(key, value, persistent) {
		if (!persistent)
			return this.frameCache[key];
		else
			return this.persistentCache[key];
	},
	afterUpdate : function() {
		this.clearCache();
	},
	clearCache : function() {
		this.frameCache = {};
	}
}, false, true);

var InputController = Octopus.core.createClass('InputController',{
	staticKeys : {
		'left' : 37,
		'right' : 39,
		'up' : 38,
		'down' : 40
	},
	keys: {},
	inputs : {
		'left' : 37,
		'right' : 39,
		'up' : 38,
		'down' : 40
	},
	axis : {
		'horizontal' : {positive : 'right', negative : 'left'},
		'vertical' : {positive : 'up', negative : 'down'}
	},
	start : function() {
		var controller = this;
		window.addEventListener("keydown", function(e) {
			controller.keys[e.keyCode] = true;
			console.log(e.keyCode);
		});
		window.addEventListener("keyup", function(e) {
			controller.keys[e.keyCode] = false;
		});
	},
	getInput : function(key) {
		var keyCode = this.inputs[key];
		return this.getKeyState(keyCode);
	},
	getKeyState : function(keyCode) {
		return this.keys[keyCode];
	},
	getAxis : function(axis) {
		var axisData = this.axis[axis];
		
		if (!axisData)
			return 0;
		
		var positive = this.getInput(axisData.positive),
			negative = this.getInput(axisData.negative);
			
		if (positive && negative)
			return 0;
		else if (positive)
			return 1;
		else if (negative)
			return -1;
		else
			return 0;		
	},
	registerInput(inputName, keyString) {
		var keyCode = this.getKeyCode(keyString);
		
		if (keyCode !== false)
			this.inputs[inputName] = keyCode;
	},
	registerAxis(axisName, positiveKey, negativeKey) {
		var positiveKeyCode = this.getKeyCode(positiveKey),
			negativeKeyCode = this.getKeyCode(negativeKey),
			axis = {};
			
		if (positiveKeyCode !== false && negativeKeyCode !== false)
		{
			axis.positive = positiveKey;
			this.registerInput(positiveKey, positiveKey);
			axis.negative = negativeKey;
			this.registerInput(negativeKey, negativeKey);
			this.axis[axisName] = axis;
		}
	},
	getKeyCode(keyString) {
		if (this.staticKeys[keyString])
			return this.staticKeys[keyString];
		else if (keyString.length == 1)
			return keyString.toUpperCase().charCodeAt(0);
		else
			console.log('unrecognised key: ' + keyString);
		return false;
	}
}, false, true);

Octopus.core.createClass('Object',{
	position : {x : 0, y: 0},
	updatePosition : function (x, y) {
		this.position.x = x;
		this.position.y = y;
	},
	translate : function (x, y) {
		this.position.x += x;
		this.position.y -= y;
	},
	render : function(ctx) {
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2* Math.PI);
		ctx.strokeStyle = 'black';
		ctx.fillStyle = 'white';
		ctx.stroke();
		ctx.fill();
	},
});

Octopus.core.createClass('Circle',{
	fillColor : false,
	strokeColor : false,
	radius : 0,
	start : function(x, y, r, fill, stroke) {
		this.fillColor = fill;
		this.strokeColor = stroke;	
		this.position = {x : x, y : y};
		this.radius = r;
		//this.render();
	},
	render : function(ctx) {
			
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2* Math.PI);
		ctx.strokeStyle = this.strokeColor;
		ctx.fillStyle = this.fillColor;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
}, Octopus.Object);

Octopus.core.createClass('Rect',{
	fillColor : false,
	strokeColor : false,
	width : 0,
	height: 0,
	start : function(x, y, w, h, fill, stroke) {
		this.fillColor = fill;
		this.strokeColor = stroke;	
		this.position = {x : x, y : y};
		this.width = w;
		this.height = h;
		//this.render();
	},
	render : function(ctx) {
			
		ctx.beginPath();
		ctx.rect(this.position.x, this.position.y, this.width, this.height);
		ctx.strokeStyle = this.strokeColor;
		ctx.fillStyle = this.fillColor;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
}, Octopus.Object);

Math.clamp = function(val, min, max) {
	if (val < min)
		return min;
	if (val > max)
		return max;
	return val;
}