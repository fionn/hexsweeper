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

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj)
		if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
	return copy;
}

var O=function O(properties,useQuery) { 
	if(typeof(properties)==='undefined') properties={}
	if(typeof(useQuery)==='undefined') useQuery=false;
	this.generateProperties(properties, useQuery);
}

O.isDefined=function isDefined(v) { return typeof(v)!=='undefined'; }
O.prototype=Object.create(Object.prototype,{
	constructor: {value: O},
	default_properties: {value:{}},
	generateProperties:{value:function(P,useQuery){
		if(P['PRINTER']) {console.log(P); }
		properties={}
		var this_=this;
		while(this_.default_properties) {
			for(var p in this_.default_properties)
				if(!(p in properties))
					properties[p]=clone(this_.default_properties[p]);
			this_=this_.__proto__;
		}
		for(var p in properties)
			if(p in P)
				properties[p]=clone(P[p])
		if(useQuery) {
			var query = window.location.search.substring(1);
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=').map(decodeURIComponent);
				if(pair[0] in properties) {
					switch(typeof(properties[pair[0]])) {
						case 'number': pair[1]=Number(pair[1]); break;
						case 'boolean': pair[1]=Boolean(pair[1]); break;
						default: break;
					}
					properties[pair[0]]=pair[1]
				}
			}
		}
		for(var p in properties)
			this[p]=properties[p];

		this.initial_properties=properties;
	}},
	toString: {value: function() {return this.constructor.name}},
	handleQuery:{value:function(variable,default_) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) == variable)
				return decodeURIComponent(pair[1]);
		}
		return default_
	}},
});

var Game=function Game(properties) {
	O.call(this,properties,true);
	this.renderer=new Renderer(this.initial_properties);
}

Game.prototype=Object.create(O.prototype,{
	constructor       :{value:Game},
	default_properties:{value:{
		name:'defaultGameName',
		background:'black',
	}},
	start: {value: function(fps) {
		this.renderer.start(fps);
	}},

	renderer:{value:undefined,writable:true},
});


