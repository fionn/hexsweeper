var throttle = function(type, name, obj) {
		obj = obj || window;
		var running = false;
		var ratioX=window.innerWidth/window.outerWidth
		var ratioY=window.innerHeight/window.outerHeight
		var func = function(ev) {
				var newRatioX=window.innerWidth/window.outerWidth;
				var newRatioY=window.innerHeight/window.outerHeight;
				var diffX=Math.abs(ratioX-newRatioX)
				var diffY=Math.abs(ratioY-newRatioY)
				if(running || (diffX <0.01 && diffY<0.01)) return;
				ratioX=newRatioX
				ratioY=newRatioY
				running = true;
				 requestAnimationFrame(function() {
						obj.dispatchEvent(new CustomEvent('throttledResize',{'detail':ev} ));
						running = false;
				});
		};
		window.addEventListener('resize', func);
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
	getProperties:{value:function(changes){
		if(typeof(changes)==='undefined') changes={};
		var output={}
		for(var p in this.initial_properties) 
			output[p]=this[p]
		for(var p in changes)
			output[p]=changes[p]
		return output
	}},
	generateProperties:{value:function(P,useQuery){
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


