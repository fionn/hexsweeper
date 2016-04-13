var Animation=function Animation(context,properties) {
	this.context=context;
	this.position=0;
	this.duration=100;
	this.origin=[0,0]
	O.prototype.constructor.call(this,properties);
}

Animation.prototype=Object.create(O.prototype,{
	constructor: {value: Animation},
	properties: {value: ['draw','duration','origin']},
	draw: {writable:true, value: function(context, i) {
		var fgcolour=([0/3,1/3,2/3].map(function(k){return Math.floor(Math.sin(2*Math.PI*(i+k))*127+128)}))
		var bgcolour=([2/3,0/3,1/3].map(function(k){return Math.floor(Math.sin(2*Math.PI*(i+k))*7+8)}))
		var shcolour=([1/3,2/3,0/3].map(function(k){return Math.floor(Math.sin(2*Math.PI*(i+k))*63+64)}))
		var m=Math.min(this.context.canvas.width,this.context.canvas.height)
		context.save();
			context.lineWidth=10;
			context.strokeStyle='rgb('+fgcolour.join()+')';
			context.fillStyle='rgb('+bgcolour.join()+')';
			context.shadowColor='rgb('+shcolour.join()+')';
			context.shadowBlur=50;
			context.beginPath();
			context.arc(this.origin[0]*m/2+this.context.canvas.width/2,this.origin[1]*m/2+this.context.canvas.height/2,40,0,2*Math.PI);
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
	this.context=new HexContext(this.canvas.getContext('2d'));
	this.onResize()
//	window.addEventListener('throttledResize',function(ev){this_.onResize(ev);});
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
	add   :{value: function(type,properties){this.children.push(new type(this.context,properties));}},
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
	this.rendering=false
	this.canvas=document.createElement('canvas');
	this.context=this.canvas.getContext('2d');
	document.body.appendChild(this.canvas);
	document.body.style.margin='0px';
	document.body.style.overflow='hidden';
	this.initial_size={width:this.canvas.width,height:this.canvas.height}
	O.call(this,properties)
	window.addEventListener('throttledResize',function(ev){this_.onResize(ev);});
	this.canvas.addEventListener('render',function(ev){this_.render();});
	this_.onResize()
}

Renderer.prototype=Object.create(O.prototype,{
	constructor:{value: Renderer},
	default_properties:{value:{
		layers:{},
		background:'black',
		fps   :60,
	}},

	zoom:{ get:function( ){ return [this.canvas.width/this.initial_size.width,this.canvas.height/this.initial_size.height] }},

	background:{
		get:function( ){return this.canvas.style.background;},
		set:function(v){this.canvas.style.background=v;}
	},
	
	newLayer: {value:function(name,level,isAnimationLayer) {
		return this.layers[name]=new Layer(this,{name:name,level:level,isAnimationLayer:isAnimationLayer});
	}},
	onResize: {value:function(ev){
		this.canvas.width=window.innerWidth
		this.canvas.height=window.innerHeight
		for(var l in this.layers) this.layers[l].current=false;
	}},
	clear :{value: function(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}},
	render: { value: function() {
		if(this.rendering) { return; }
		this.rendering=true
		this.clear();
		for(var i in this.layers) {
			this.layers[i].render()
			this.context.drawImage(this.layers[i].canvas,0,0);
		}
		this.rendering=false
	}},
	start: {value:function() {
		var this_=this;
		window.dispatchEvent(new Event('throttledResize'));
		this.interval=window.setInterval(function(){this_.canvas.dispatchEvent(new CustomEvent('render'))},1000/this.fps);
	}},
	pause: {value:function() {
		window.clearInterval(this.interval);
	}},
});


