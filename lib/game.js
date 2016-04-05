var throttle = function(type, name, obj) {
		obj = obj || window;
		var running = false;
		var func = function(ev) {
				if (running) { return; }
				running = true;
				 requestAnimationFrame(function() {
						obj.dispatchEvent(new CustomEvent(name,{'detail':ev} ));
						running = false;
				});
		};
		obj.addEventListener(type, func);
};
throttle('resize', 'throttledResize');


var O=function O(properties) { this.changeProperties(properties); }
O.isDefined=function isDefined(v) { return typeof(v)!=='undefined'; }
O.prototype=Object.create(Object.prototype,{
	constructor: {value: O},
	properties: {value:[]},
	propertyExists: {value: function(p){ return this.properties.indexOf(p)>=0; }},
	changeProperties: {value: function(properties) {
		if(O.isDefined(properties))
			for(var p in properties)
				if(!O.isDefined(properties[p]))
					continue
				else if(this.propertyExists(p))
					this[p]=properties[p]
				else
					console.error('Unexpected property in argument to '+this.toString()+'.changeProperties: "'+p+'"\nValid arguments are ')
	}},
	toString: {value: function() {return this.constructor.name}}
});

var Game=function Game(properties) {
	this.name='defaultName';
	this.renderer=new Renderer();
	
	this.__proto__.__proto__.constructor.call(this,properties);
}

Game.prototype=Object.create(O.prototype,{
	constructor: {value: Game},
	properties: {value: ['name','background']},
	background: {set: function(v) { this.renderer.canvas.style.background=v; }},
	start: {value: function(fps) {
		this.renderer.start(fps);
	}},
});


