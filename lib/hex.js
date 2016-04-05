
var HexBoard=function HexBoard(canvas,properties) {
	var this_=this;
	this.canvas=canvas;
	this.radius=6;
	this.mouse=[0.0,0.0,'up']
	this.clicked={}
	O.prototype.constructor.call(this,properties);
	if(this.canvas.width>this.canvas.height)
		this.r=1/(Math.sqrt(3)*(2*this.radius+1))
	else
		this.r=1/(1.5*(2*this.radius+1))

	this.canvas.addEventListener('mousemove',function(ev){
		var min=this_.min()
		var x=2*(ev.layerX-this_.canvas.width/2)/min;
		var y=2*(ev.layerY-this_.canvas.height/2)/min;
		this_.mouse[0]=x;
		this_.mouse[1]=y;
	});
	this.canvas.addEventListener('contextmenu',function(ev){
		ev.preventDefault()
	});
	this.canvas.addEventListener('mousedown',function(ev){
		this_.mouse[2]=ev.buttons;
	});

	this.canvas.addEventListener('mouseup',function(ev){
		var mx=this_.toNearestHex(this_.mouse[0],this_.mouse[1])
		if(this_.inBounds(mx[0],mx[1])) {
			var id=mx[0]+','+mx[1]
			if(id in this_.clicked && this_.clicked[id]==this_.mouse[2]) {
				delete this_.clicked[id]
			} else {
				this_.clicked[id]=this_.mouse[2]
			}
		}
		this_.mouse[2]=ev.buttons;
		ev.preventDefault()
	});
}

HexBoard.prototype=Object.create(O.prototype,{
	constructor:{value:HexBoard},
	properties :{value:['radius']},

	toNearestHex:{value:function(x,y){
		var S=this.r*3, H=Math.sqrt(3)*this.r*2;
		var ta=Math.floor(x/S),tb=Math.floor(y/H);
		var tx=x-ta*S, ty=y-tb*H;
		tb-=0.5*(ta-Math.abs(ta)%2)
		if(ta%2==0) {
			if(tx>(S/3)*(1+2*Math.abs(1/2-ty/H)))
				ta++;
			else if(ty>H/2) 
				tb++
		}
		else {
			if(tx>(2*S/3)-(2*S/3)*Math.abs(1/2-ty/H)) {
				ta++
				if(ty<=H/2)
					tb--;
			}
		}
		return [ta,tb]
	}},

	inBounds:{value:function(a,b){ return (Math.abs(a+b)+Math.abs(a)+Math.abs(b))/2<=this.radius; }},
	toCoord:{value:function(a,b) {
		var x=this.r*1.5*a;
		var y=this.r*Math.sqrt(3)*(b+0.5*a);
		return [x,y]
	}},

	min:{value:function(){return Math.min(this.canvas.width,this.canvas.height)}},

	tileRadius:{value: function() {
		return this.min()*this.r;
	}},
	drawHexagon:{value:function(context,x,y) {
		var x=x*this.min()+this.canvas.width/2;
		var y=y*this.min()+this.canvas.height/2;
		var tileRadius=this.tileRadius();
		context.moveTo(x+tileRadius,y);
		context.beginPath();
		for(var i=0,a=0; i<6; ++i, a+=Math.PI/3) {
			context.lineTo(tileRadius*Math.cos(a)+x,tileRadius*Math.sin(a)+y);
		}
		context.closePath()
	}},
	drawTile:{value:function(context,a,b,ox,oy) {
		var coords=this.toCoord(a,b);
		var x=coords[0];
		var y=coords[1];
		this.drawHexagon(context,x,y);
		context.stroke();
	}},

	render:{value:function(context){
		context.save();

		for(var i in this.clicked) {
			var r=(0.5-0.25*Math.random())
			if(this.clicked[i]==1) {
				var bcol='0,255,0'
			} else if(this.clicked[i]==2) {
				var bcol='255,00,00'
			} else if(this.clicked[i]==4) {
				var bcol='255,255,00'
			}

			var col='rgba('+bcol+','+r+')'
			context.fillStyle=col;
			context.shadowColor='rgb('+bcol+')';
			var pos=i.split(',')
			this.drawTile(context,Number(pos[0]),Number(pos[1]));
			context.fill()
		}

		context.fillStyle='rgba(0,0,0,0)';
		context.lineWidth=this.min()*this.r/10;
		context.shadowBlur=this.min()*this.r/5;
		for(var a=-this.radius;a<=this.radius;++a)
			for(var b=-this.radius;b<=this.radius;++b)
				if(this.inBounds(a,b)){
					var r=(1-0.3*Math.random())
					var bcol='0,0,155'
					var col='rgba('+bcol+','+r+')'
					context.strokeStyle=col;
					context.shadowColor='rgb('+bcol+')';
					this.drawTile(context,a,b);
				}
		context.restore();
	}},
});


var HexMouse=function HexMouse(canvas,properties) {
	var this_=this;
	HexBoard.prototype.constructor.call(this,canvas,properties);
}

HexMouse.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:HexMouse},
	properties :{value:['radius']},

	render:{value:function(context){
		context.save();
		context.lineWidth=this.min()*this.r/10;
		context.shadowBlur=this.min()*this.r/5;
		if(this.mouse[2]==1) {
			context.strokeStyle='#0A0';
			context.shadowColor='#0F0';
		} else if(this.mouse[2]==2) {
			context.strokeStyle='#A00';
			context.shadowColor='#F00';
		} else if(this.mouse[2]==4) {
			context.strokeStyle='#AA0';
			context.shadowColor='#FFF';
		} else {
			context.strokeStyle='#00F';
			context.shadowColor='#00F';
		}
		var mx=this.toNearestHex(this.mouse[0],this.mouse[1])
		if(this.inBounds(mx[0],mx[1])) {
			this.drawTile(context,mx[0],mx[1],0.0,0.0)
		}
		context.restore();
	}},
});
