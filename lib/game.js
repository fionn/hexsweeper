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
				console.log(window.innerWidth,window.innerHeight);
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
	var this_=this;

	this.mouse_down_time=0
	this.interval=undefined;
	O.call(this,properties,true);
	this.renderer=new Renderer(this.initial_properties);
	document.addEventListener('contextmenu',function(ev){ev.preventDefault()});
	//mouse events 
	document.addEventListener('mousemove',function(ev){this_.onMouseMove(ev)});
	document.addEventListener('mousedown',function(ev){
		this_.mouse_down_time=new Date();
		this_.mouse_button=ev.buttons
		this_.onMouseDownBefore(ev);
		switch(ev.buttons) {
			case 1: this_.onMouseLeftDown(ev); break;
			case 2: this_.onMouseRightDown(ev); break;
			case 4: this_.onMouseMidDown(ev); break;
		}
		this_.onMouseDownAfter(ev);
		ev.preventDefault()
	});

	document.addEventListener('mouseup',function(ev){
		this_.onMouseUpBefore(ev);
		switch(this_.mousedown) {
			case 1: this_.onMouseLeftUp(ev); break;
			case 2: this_.onMouseRightUp(ev); break;
			case 4: this_.onMouseMidUp(ev); break;
		}
		this_.onMouseUpAfter(ev);
		ev.preventDefault()
		this_.mouse_button=ev.buttons
		this_.mouse_down_time=0
	});
}

Game.prototype=Object.create(O.prototype,{
	constructor       :{value:Game},
	default_properties:{value:{
		name:'defaultGameName',
		background:'black',
	}},
	start: {value: function() {
		var this_=this;
		window.dispatchEvent(new Event('throttledResize'));
		this.interval=window.setInterval(function(){this_.render()},1000/this.fps);
	}},
	render:{value:function() { this.renderer.render(); }},
	pause:{value:function(){window.clearInterval(this.interval);}},
	renderer:{value:undefined,writable:true},
	onMouseDownBefore:{value:function(ev){}},
	onMouseUpBefore  :{value:function(ev){}},
	onMouseDownAfter :{value:function(ev){}},
	onMouseUpAfter   :{value:function(ev){}},
	onMouseLeftDown  :{value:function(ev){}},
	onMouseLeftUp    :{value:function(ev){}},
	onMouseRightDown :{value:function(ev){}},
	onMouseRightUp   :{value:function(ev){}},
	onMouseMidUp     :{value:function(ev){}},
	onMouseMidDown   :{value:function(ev){}},
	onMouseMove      :{value:function(ev){}},
});


