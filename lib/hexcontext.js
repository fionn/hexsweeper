var AbsContext=function AbsContext(context, properties) {
	if(typeof(context)==='undefined')
		context=document.createElement('canvas').getContext('2d')
	this.context=context;
	O.call(this,properties);
}

var HexContext=function HexContext(context, properties) {
	var __hexRadius=0.1;
	if(typeof(context)==='undefined') {
		context=document.createElement('canvas').getContext('2d')
	}
	this.context=context;
	O.call(this,properties);
}

var RelContext=function RelContext(context, properties) {
	if(typeof(context)==='undefined')
		context=document.createElement('canvas').getContext('2d')
	this.context=context;
	O.call(this,properties);
}

function giveContextPrototype(class_) {
	function DescriptorFactory(f) {
		return function() {return f.apply(this.context,arguments)}
	}
	var tmp_ctx=document.createElement('canvas').getContext('2d')
	var keys=Object.keys(tmp_ctx.__proto__)
	for(var i in keys) {
		var key=keys[i];
		var descriptor=Object.getOwnPropertyDescriptor(tmp_ctx.__proto__,key)
		var customDescriptor={}
		for(var d in descriptor) {
			if(typeof(descriptor[d])==='function')
				customDescriptor[d]=DescriptorFactory(descriptor[d])
			else
				customDescriptor[d]=descriptor[d]
		}	
		Object.defineProperty(class_.prototype,key,customDescriptor)
	}
	delete tmp_ctx
	delete keys
}

AbsContext.prototype=Object.create(O.prototype);
RelContext.prototype=Object.create(O.prototype);
HexContext.prototype=Object.create(O.prototype);

giveContextPrototype(AbsContext);
giveContextPrototype(HexContext);
giveContextPrototype(RelContext);

Object.defineProperties(HexContext.prototype,{
	default_properties:{value:{
		rescale:1,
		radius: 6,
		hexRadius: 'auto',
		width:window.innerWidth,
		height:window.innerHeight,
		lineWidth:0.1,
		fillStyle  :'rgba(0,0,0,0)',
		strokeStyle:'white',
		shadowColor:'white',
		shadowBlur :0,
	}},

	hexRadius:{
		get:function( ){return this.__hexRadius},
		set:function(v){
			if(v=='auto') {
				this.__hexRadius=1/(Math.sqrt(3)*(2*this.radius+1))
			} else {
				this.__hexRadius=v
			}
		}
	},

	shadowBlur:{
		get:function( ){return this.context.shadowBlur/(this.hexRadius*this.min);},
		set:function(v){return this.context.shadowBlur=v*this.hexRadius*this.min;},
	},

	lineWidth:{
		get:function( ){return this.context.lineWidth/(this.hexRadius*this.min);},
		set:function(v){return this.context.lineWidth=Math.max(1,v*this.hexRadius*this.min);},
	},

	width:{
		get:function( ){return this.canvas.width;},
		set:function(v){return this.canvas.width=v;},
	},
	height:{
		get:function( ){return this.canvas.height;},
		set:function(v){return this.canvas.height=v;},
	},
	size  :{
		get:function( ){return [this.width,this.height];},
		set:function(v){this.width=v[0]; this.height=v[1];},
	},

	min  :{get:function( ){return Math.min.apply(this,this.size)*this.rescale;}},

	toHex:{value:function(a,b){return {a:a,b:b,toString:function(){return 'a:'+this.a+',b:'+this.b;}}}},
	toAbs:{value:function(h){
		var x=1.5*h.a*this.hexRadius*this.min+this.width/2;
		var y=Math.sqrt(3)*this.hexRadius*this.min*(h.b+0.5*h.a)+this.height/2
		return AbsContext.prototype.toAbs(x,y)
	}},
	toRel:{value:function(h){
		var X=3*h.a*this.hexRadius*this.min;
		var Y=2*Math.sqrt(3)*this.hexRadius*this.min*(h.b+0.5*h.a)
		return RelContext.prototype.toRel(X,Y)
	}},
	hexagon:{value:function(h,radius,start,stop,rotate,turnClockwise){
		if(typeof(h)==='undefined') h=this.toHex(0,0);
		if(typeof(radius)==='undefined') radius=1
		var a=this.toAbs(h)
		var R=radius*this.hexRadius*this.min;
		AbsContext.prototype.hexagon.call(this,a,R,start,stop,rotate,turnClockwise);
	}},
	strokeHexagon:{value:function(){this.hexagon.apply(this,arguments); this.stroke()}},
	fillHexagon  :{value:function(){this.hexagon.apply(this,arguments); this.fill()}},
	imageHexagon :{value:function(h){
		if(typeof(h)==='undefined') h=this.toHex(0,0);
		var a=this.toAbs(h);
		if(typeof(this.__imageHexagon)==='undefined') {
			var ctx=new HexContext(undefined,{
				lineWidth:this.lineWidth,
				shadowBlur:0,
				strokeStyle:this.strokeStyle,
				width :2*this.hexRadius*this.min,
				height:2*this.hexRadius*this.min,
				hexRadius:0.5,
				rescale :1,
			});
			ctx.strokeHexagon()
			this.__imageHexagon=ctx;
		}
		this.drawImage(this.__imageHexagon.canvas,a.x-this.__imageHexagon.width/2,a.y-this.__imageHexagon.height/2)
	}},


	clear:{value:function(){this.clearRect(0,0,this.canvas.width,this.canvas.height);}},
});

Object.defineProperties(RelContext.prototype,{
	default_properties:{value:{
		rescale: 10,
		radius: 6,
		hexRadius: 'auto',
		width:window.innerWidth,
		height:window.innerHeight,
		lineWidth:0.1,
		fillStyle  :'rgba(0,0,0,0)',
		strokeStyle:'white',
		shadowColor:'white',
		shadowBlur :0,
	}},
	min  :{get:function( ){return Math.min.apply(this,this.size)*this.rescale}},
	shadowBlur:{
		get:function( ){return this.context.shadowBlur/(this.hexRadius*this.min);},
		set:function(v){return this.context.shadowBlur=v*this.hexRadius*this.min;},
	},
	lineWidth:{
		get:function( ){return this.context.lineWidth/(this.hexRadius*this.min);},
		set:function(v){return this.context.lineWidth=Math.max(1,v*this.hexRadius*this.min);},
	},
	hexRadius:{
		get:function( ){return this.__hexRadius},
		set:function(v){
			if(v=='auto') {
				this.__hexRadius=1/(Math.sqrt(3)*(2*this.radius+1))
			} else {
				this.__hexRadius=v
			}
		}
	},

	width:{
		get:function( ){return this.canvas.width;},
		set:function(v){return this.canvas.width=v;},
	},
	height:{
		get:function( ){return this.canvas.height;},
		set:function(v){return this.canvas.height=v;},
	},
	size  :{
		get:function( ){return [this.width,this.height];},
		set:function(v){this.context.canvas.width=v[0]; this.context.canvas.height=v[1];},
			
	},
	toRel:{value:function(X,Y){return {X:X,Y:Y,toString:function(){return 'X:'+this.X+',Y:'+this.Y;}}}},
	toAbs:{value:function(r){
		var x=r.X*this.min/2+this.width/2;	
		var y=r.Y*this.min/2+this.height/2;	
		return AbsContext.prototype.toAbs(x,y);
	}},
	toHex:{value:function(r, radius){return AbsContext.prototype.toHex(this.toAbs(r), this.rescale, radius)}},
	clear:{value:function(){this.clearRect(0,0,this.canvas.width,this.canvas.height);}},
	hexagon:{value:function(r,radius,start,stop,rotate,turnClockwise){
		if(typeof(r)==='undefined') r=this.toRel(0,0);
		if(typeof(radius)==='undefined') radius=0.1;
		var a=this.toAbs(r)
		var R=radius*this.min;
		AbsContext.prototype.hexagon.call(this,a,R,start,stop,rotate,turnClockwise);
	}},
	strokeHexagon:{value:function(){this.hexagon.apply(this,arguments); this.stroke()}},
	fillHexagon  :{value:function(){this.hexagon.apply(this,arguments); this.fill()}},

});

Object.defineProperties(AbsContext.prototype,{
	default_properties:{value:{
		fillStyle  :'rgba(0,0,0,0)',
		strokeStyle:'white',
		shadowColor:'white',
		shadowBlur :0,
	}},
	min  :{get:function( ){return Math.min.apply(this,this.size)}},
	hexRadius:{
		get:function( ){return this.__hexRadius},
		set:function(v){
			if(v=='auto') {
				this.__hexRadius=1/(Math.sqrt(3)*(2*this.radius+1))
			} else {
				this.__hexRadius=v
			}
		}
	},

	width:{
		get:function( ){return this.canvas.width;},
		set:function(v){return this.canvas.width=v;},
	},
	height:{
		get:function( ){return this.canvas.height;},
		set:function(v){return this.canvas.height=v;},
	},
	size  :{
		get:function( ){return [this.width,this.height];},
		set:function(v){this.width=v[0]; this.height=v[1];},
	},
	toAbs:{value:function(x,y){return {x:x,y:y,toString:function(){return 'x:'+this.x+',y:'+this.y;}}}},
	toRel:{value:function(a,rescale){
		var X=(2*a.x-this.width)/(this.min*rescale)
		var Y=(2*a.y-this.height)/(this.min*rescale)
		return RelContext.prototype.toRel(X,Y)
	}},
	toHex:{value:function(a,rescale,radius){
		var S=radius*3, H=Math.sqrt(3)*radius*2;
		var X=(2*a.x-this.width)/(this.min*rescale), Y=(2*a.y-this.height)/(this.min*rescale)
		var a=Math.floor(X/S), b=Math.floor(Y/H)
		var x=X-a*S, y=Y-b*H;
		b-=0.5*(a-Math.abs(a)%2)
		if(a%2==0) {
			if(x>(S/3)*(1+2*Math.abs(1/2-y/H)))
				a++;
			else if(y>H/2) 
				b++
		}
		else {
			if(x>(2*S/3)-(2*S/3)*Math.abs(1/2-y/H)) {
				a++
				if(y<=H/2)
					b--;
			}
		}
		return HexContext.prototype.toHex(a,b)
	}},
	clear:{value:function(){this.clearRect(0,0,this.canvas.width,this.canvas.height);}},
	hexagon:{value:function(a,radius,start,stop,rotate,turnClockwise){
		if(typeof(a            )==='undefined') a=this.toAbs(0,0)
		if(typeof(turnClockwise)==='undefined') turnClockwise=true
		if(typeof(rotate       )==='undefined') rotate=0
		if(typeof(start        )==='undefined') start=0
		if(typeof(stop         )==='undefined') stop=6

		function getPos(i){return [a.x+radius*Math.cos(i*Math.PI/3+rotate),a.y+radius*Math.sin(i*Math.PI/3+rotate)]};
				
		// if we are drawing the full hexagon, no need to keep drawing extra lines
		if(stop>=6+start) { start=0; stop=6; }

		this.save()
		this.beginPath()
		this.moveTo.apply(this,getPos(start))
		for(var i=start+1; i!=stop+1; i+=turnClockwise?1:-1)
			this.lineTo.apply(this,getPos(i));
		if(stop>=6+start) { this.closePath() }
		this.restore()
	}},
	strokeHexagon:{value:function(){this.hexagon.apply(this,arguments); this.stroke()}},
	fillHexagon  :{value:function(){this.hexagon.apply(this,arguments); this.fill()}},
});
