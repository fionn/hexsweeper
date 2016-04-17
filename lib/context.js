var Context=function Context(context, properties) {
	if(typeof(context)==='undefined')
		context=document.createElement('canvas').getContext('2d')

	this.context=context;
	O.call(this,properties,true);
	this.abs=new AbsContext(context,this.getProperties(properties.abs));
	this.rel=new RelContext(context,this.getProperties(properties.rel));
	this.hex=new HexContext(context,this.getProperties(properties.hex));
}

Context.prototype=Object.create(O.prototype, {
	default_properties:{value:{
		rescale:1,
		width:window.innerWidth,
		height:window.innerHeight,
		fillStyle  :'rgba(0,0,0,0)',
		strokeStyle:'white',
		shadowColor:'white',
		hexRadius:'auto',
		radius:6,
	}},
	width:{
		get:function( ){return this.context.canvas.width;},
		set:function(v){return this.context.canvas.width=v;},
	},
	height:{
		get:function( ){return this.context.canvas.height;},
		set:function(v){return this.context.canvas.height=v;},
	},
	size  :{
		get:function( ){return [this.width,this.height];},
		set:function(v){this.context.canvas.width=v[0]; this.context.canvas.height=v[1]}
	},
	h:{get:function(){return this.hex; }},
	a:{get:function(){return this.abs; }},
	r:{get:function(){return this.rel; }},
	canvas:{get:function( ){return this.abs.canvas;},},

	clear :{value:function(){this.abs.clear();}},
});

