var Animation=function Animation(canvas,properties) {
	this.canvas=canvas;
	this.position=0;
	this.duration=100;
	this.origin=[0.5,0.5]
	this.__proto__.__proto__.constructor.call(this,properties);
}

Animation.prototype=Object.create(O.prototype,{
	constructor: {value: Animation},
	properties: {value: ['draw','duration','origin']},
	draw: {writable:true, value: function(context, i) {
		var fgcolour=([0/3,1/3,2/3].map(function(k){return Math.floor(Math.sin(2*Math.PI*(i+k))*127+128)}))
		var bgcolour=([2/3,0/3,1/3].map(function(k){return Math.floor(Math.sin(2*Math.PI*(i+k))*7+8)}))
		var shcolour=([1/3,2/3,0/3].map(function(k){return Math.floor(Math.sin(2*Math.PI*(i+k))*63+64)}))
		context.save();
			context.lineWidth=10;
			context.strokeStyle='rgb('+fgcolour.join()+')';
			context.fillStyle='rgb('+bgcolour.join()+')';
			context.shadowColor='rgb('+shcolour.join()+')';
			context.shadowBlur=50;
			context.beginPath();
			context.arc(this.origin[0]*this.canvas.width,this.origin[1]*this.canvas.height,40,0,2*Math.PI);
			context.stroke();
			context.fill();
		context.restore();
	}},
	render: { value: function(context) {
		this.draw(context,this.position/this.duration);
		this.position=(this.position+1)%this.duration;
	}},
});

var Layer=function Layer(renderer, properties) {
	this.name='defaultLayerName';
	this.level=0;
	this.isAnimationLayer=false;
	this.__proto__.__proto__.constructor.call(this,properties);

	var this_=this;
	this.current=false;
	this.children=[];
	this.renderer=renderer;
	this.canvas=document.createElement('canvas');
	this.context=this.canvas.getContext('2d');
	window.addEventListener('throttledResize',function(ev){this_.onResize(ev);});
}

Layer.prototype=Object.create(O.prototype,{
	constructor:{value: Renderer},
	properties :{value: ['name','level','isAnimationLayer']},
	childrenCurrent:{value: function() {
		for(var i in this.children)
			if(!this.children[i].current) return false
		return true
	}},
	render:{value: function(){
		if(!this.current || !this.childrenCurrent() || this.isAnimationLayer) {
			this.clear();
			this.draw();
			this.current=true;
		}
	}},
	add   :{value: function(type,properties){this.children.push(new type(this.renderer.canvas,properties));}},
	draw  :{value: function(){
		for(var i in this.children) {
			var keep_element=this.children[i].render(this.context);
			if(O.isDefined(keep_element) && !keep_element) {
				this.children.splice(i,1)
			}
		}
	}},
	clear :{value: function(){
		this.canvas.width=this.canvas.width;
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}},
	onResize:{value: function(ev) { 
		this.canvas.width=this.renderer.canvas.width;
		this.canvas.height=this.renderer.canvas.height;
	}},
});

var Renderer=function Renderer(properties) {
	var this_=this;
	this.layers={};
	this.__proto__.__proto__.constructor.call(this,properties);
	this.canvas=document.createElement('canvas');
	this.context=this.canvas.getContext('2d');
	document.body.appendChild(this.canvas);
	document.body.style.margin='0px';
	document.body.style.overflow='hidden';
	window.addEventListener('throttledResize',function(ev){this_.onResize(ev);});
}

Renderer.prototype=Object.create(O.prototype,{
	constructor:{value: Renderer},
	properties :{value: ['layers']},
	newLayer: {value:function(name,level,isAnimationLayer) {
		return this.layers[name]=new Layer(this,{name:name,level:level,isAnimationLayer:isAnimationLayer});
	}},
	onResize: {value:function(ev){
		this.canvas.width=window.innerWidth;
		this.canvas.height=window.innerHeight;
		for(var l in this.layers) this.layers[l].current=false;
	}},
	clear :{value: function(){
		this.canvas.width=this.canvas.width;
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}},
	render: { value: function() {
		for(var i in this.layers) {
			if(this.layers[i].needs_redraw) {
				this.layers[i].clear();
				this.layers[i].render();
				this.layers[i].current=false;
			}
		}
		this.clear();
		for(var i in this.layers) {
			this.layers[i].render()
			this.context.drawImage(this.layers[i].canvas,0,0);
		}
	}},
	start: {value:function(fps) {
		var this_=this;
		if(typeof(fps)==='undefined') fps=60
		window.dispatchEvent(new Event('throttledResize'));
		this.interval=window.setInterval(function(){this_.render();},1000/fps);
	}},
	pause: {value:function() {
		window.clearInterval(this.interval);
	}},
});


