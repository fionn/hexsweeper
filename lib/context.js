var HexContext=function HexContext(context) {
	this.__lineWidth=0.01;
	this.__shadowBlur=0.01;
	this.context=context;
	this.tileRadius=0.01;
	this.radius=6;
}

function DescriptorFactory(f) {
	return function() {
		return f.apply(this.context,arguments)
	}
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
	Object.defineProperty(HexContext.prototype,key,customDescriptor)
}

delete tmp_ctx
delete keys

Object.defineProperties(HexContext.prototype,{
	setupGrid:{value:function(v){
		this.radius=v
		if(this.canvas.width>this.canvas.height)
			this.tileRadius=1/(Math.sqrt(3)*(2*v+1))
		else
			this.tileRadius=1/(1.5*(2*v+1))
	}},
	lineWidth:{
		get:function() {return this.__lineWidth},
		set:function(v){this.context.lineWidth=v*this.min; this.__lineWidth=v;}
	},
	shadowBlur:{
		get:function() {return this.__shadowBlur},
		set:function(v){this.context.shadowBlur=v*this.min; this.__shadowBlur=v;}
	},
	min:{get:function(){return Math.min(this.canvas.width,this.canvas.height)}},
	hexToRelative:{value:function(h){
		return {x:3*h.a*this.tileRadius,y:2*Math.sqrt(3)*this.tileRadius*(h.b+0.5*h.a)}
	}},
	relativeToHex:{value:function(r){
		var S=this.tileRadius*3, H=Math.sqrt(3)*this.tileRadius*2;
		var a=Math.floor(r.x/S), b=Math.floor(r.y/H)
		var x=r.x-a*S, y=r.y-b*H;
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
		return {a:a,b:b}

	}},
	hexToAbsolute:{value:function(h){
		var r=this.hexToRelative(h)
		return this.relativeToAbsolute(r)
	}},
	relativeToAbsolute:{value:function(r){
		return {x:r.x*this.min/2+this.canvas.width/2,y:r.y*this.min/2+this.canvas.height/2}
	}},
	absoluteToRelative:{value:function(a){
		return {x:(2*a.x-this.canvas.width)/this.min, y:(2*a.y-this.canvas.height)/this.min}
	}},
	absoluteToHex:{value:function(A){
		var r=this.absoluteToRelative(A)
		return this.relativeToHex(r)
	}},
	hexagon:{value:function(cx,cy,radius,nStart,nEnd,clockwise) {
		if(typeof(clockwise)==='undefined') clockwise=true
		if(nStart>nEnd) clockwise=!clockwise
		this.save()
		this.beginPath()
		this.moveTo(cx+radius*Math.cos(nStart*Math.PI/3),cy+radius*Math.sin(nStart*Math.PI/3))
		for(var i=nStart+1; i!=nEnd+1; i+=clockwise?1:-1) {
			this.lineTo(cx+radius*Math.cos(i*Math.PI/3),cy+radius*Math.sin(i*Math.PI/3))
		}
		this.restore()
	}},
	strokeHexagon:{value:function(){this.hexagon.apply(this,arguments); this.stroke()}},
	fillHexagon  :{value:function(){this.hexagon.apply(this,arguments); this.fill()}},
	tile:{value:function(h) {
		var a=this.hexToAbsolute(h)
		this.hexagon(a.x,a.y,this.tileRadius*this.min,0,6)
	}},
	strokeTile:{value:function(h){this.tile(h); this.stroke()}},
	fillTile  :{value:function(h){this.tile(h); this.fill()}},
	imageTile :{value:function(h){
		var a=this.hexToAbsolute(h);
		if(typeof(this.__imageHexagon)==='undefined') {
			this.__imageHexagon=document.createElement('canvas')
			this.__imageHexagon.width=2*this.tileRadius*this.min;
			this.__imageHexagon.height=2*this.tileRadius*this.min;
			var ctx=new HexContext(this.__imageHexagon.getContext('2d'))
			ctx.tileRadius=0.5
			ctx.context.lineWidth=this.context.lineWidth
			ctx.context.shadowBlur=this.context.shadowBlur
			ctx.strokeStyle=this.strokeStyle
			ctx.strokeTile({a:0,b:0})
		}
		this.drawImage(this.__imageHexagon,a.x-this.__imageHexagon.width/2,a.y-this.__imageHexagon.height/2)
	}},

	strokeGrid:{value:function(){
		var tmp=document.createElement('canvas')
		tmp.width=this.canvas.width;
		tmp.height=this.canvas.height;
		var ctx=new HexContext(tmp.getContext('2d'))
		ctx.tileRadius=this.tileRadius;
			ctx.context.lineWidth=this.context.lineWidth
			ctx.context.shadowBlur=this.context.shadowBlur
			ctx.strokeStyle=this.strokeStyle

		for(var i=1; i<=this.radius; i++) {
			for(var j=0;j+i<=this.radius;j++)
				if((Math.abs(i+j)+Math.abs(i)+Math.abs(j))/2<=this.radius)
					ctx.imageTile({a:i,b:j})
		}
		function display(x,y,A) {
			var r=Math.sqrt(x*x+y*y)
			var a=Math.asin(x/r)
			var Y=r*Math.cos(a+A)
			var X=r*Math.sin(a+A)
			return [X,Y]
		}

		var c=display(this.canvas.width/2,this.canvas.height/2,Math.PI/3)
		this.save()
		for(var i=0; i<6; i++) {
			this.drawImage(tmp,0,0)
			this.translate(c[0],c[1])
			this.rotate(Math.PI/3)
		}
		this.restore()
		this.strokeTile({a:0,b:0})

		this.context.translate(+this.canvas.width/2,+this.canvas.height/2)
	}},

	toString: {value:function(){return '[object CanvasRenderingContextHex]'}},
});

