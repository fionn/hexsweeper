var HexContext=function HexContext(context) {
	this.context=context;
	this.tileRadius=0.01;
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
	min:{get:function(){return Math.min(this.canvas.width,this.canvas.height)}},
	hexToRelative:{value:function(h){
		return {x:3*h.a*this.tileRadius,y:2*Math.sqrt(3)*this.tileRadius*(h.b+0.5*h.a)}
	}},
	hexToAbsolute:{value:function(h){
		var r=this.hexToRelative(h)
		console.log('r',r)
		return {x:r.x*this.min/2+this.canvas.width/2,y:r.y*this.min/2+this.canvas.height/2}
	}},
	absoluteToHex:{value:function(A){
		var r=this.absoluteToRelative(A)
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
		return {x:0,y:0}
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
		console.log('abs',a)
		this.hexagon(a.x,a.y,this.tileRadius,0,6)
		this.restore()
	}},
	toString: {value:function(){return '[object CanvasRenderingContextHex]'}},
});

