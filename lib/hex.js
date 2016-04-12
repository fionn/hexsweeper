function hexagon(context,cx,cy,radius,nStart,nEnd,clockwise) {
	if(typeof(clockwise)==='undefined') clockwise=true
	context.save()
	context.beginPath()
	context.moveTo(cx+radius*Math.cos(nStart*Math.PI/3),cy+radius*Math.sin(nStart*Math.PI/3))
	for(var i=nStart+1; i!=nEnd+1; i+=clockwise?1:-1) {
		context.lineTo(cx+radius*Math.cos(i*Math.PI/3),cy+radius*Math.sin(i*Math.PI/3))
	}
	context.restore()
}

var HexBoard=function HexBoard(canvas,properties) {
	var this_=this;
	this.mousedown=0;
	this.canvas=canvas;
	this.radius=6;
	this.current=false;
	O.prototype.constructor.call(this,properties);

	if(this.canvas.width>this.canvas.height)
		this.r=1/(Math.sqrt(3)*(2*this.radius+1))
	else
		this.r=1/(1.5*(2*this.radius+1)) 

	// call resize function on a throttled resize event
	window.addEventListener('throttledResize', function(ev) {this_.onResize(ev)});

	// Prevents right click showing context menu
	this.canvas.addEventListener('contextmenu',function(ev){ev.preventDefault()});

	//mouse events 
	this.canvas.addEventListener('mousemove',function(ev){this_.onMouseMove(ev)});
	this.canvas.addEventListener('mousedown',function(ev){
		this_.mousedown=ev.buttons
		switch(ev.buttons) {
			case 1: this_.onMouseLeftDown(ev); break;
			case 2: this_.onMouseRightDown(ev); break;
			case 4: this_.onMouseMidDown(ev); break;
		}
		this_.onMouseDown(ev);
		ev.preventDefault()
	});

	this.canvas.addEventListener('mouseup',function(ev){
		switch(this_.mousedown) {
			case 1: this_.onMouseLeftUp(ev); break;
			case 2: this_.onMouseRightUp(ev); break;
			case 4: this_.onMouseMidUp(ev); break;
		}
		this_.onMouseUp(ev);
		this_.mousedown=ev.buttons
		ev.preventDefault()
	});
}

HexBoard.prototype=Object.create(O.prototype,{
	constructor:{value:HexBoard},
	properties :{value:['radius']},
	onMouseDown     :{value:function(ev){}},
	onMouseUp       :{value:function(ev){}},
	onMouseLeftDown :{value:function(ev){}},
	onMouseLeftUp   :{value:function(ev){}},
	onMouseRightDown:{value:function(ev){}},
	onMouseRightUp  :{value:function(ev){}},
	onMouseMidUp    :{value:function(ev){}},
	onMouseMidDown  :{value:function(ev){}},
	onMouseMove     :{value:function(ev){}},
	onResize:{value:function(ev){}},

	inBounds:{value:function(a,b){ return (Math.abs(a+b)+Math.abs(a)+Math.abs(b))/2<=this.radius; }},
	toCoord:{value:function(a,b) {
		var x=this.r*1.5*a;
		var y=this.r*Math.sqrt(3)*(b+0.5*a);
		return [x,y]
	}},

	toContext:{value:function(a,b){
		var coords=this.toCoord(a,b)
		var x=coords[0]*this.min()+(this.canvas.width)/2
		var y=coords[1]*this.min()+(this.canvas.height)/2
		return [x,y]
	}},

	min:{value:function(){return Math.min(this.canvas.width,this.canvas.height)}},

	tileRadius:{value: function() {
		return this.min()*this.r;
	}},
	drawHexagon:{value:function(context,x,y) {
		var tileRadius=this.tileRadius();
		hexagon(context,x,y,tileRadius,0,6)
	}},

	drawTile:{value:function(context,a,b) {
		var abs=new HexVector(a,b).toAbsolute(this.canvas.width,this.canvas.height,this.r)
		this.drawHexagon(context,abs.x,abs.y);
		context.stroke();
	}},

	render:{value:function(context){
		context.save();
		context.fillStyle='rgba(0,0,0,0)';
		context.lineWidth=this.min()*this.r/10;
		context.shadowBlur=this.min()*this.r/5;
		for(var a=-this.radius;a<=this.radius;++a)
			for(var b=-this.radius;b<=this.radius;++b)
				if(this.inBounds(a,b)){
					var r=0.8;//(1-0.3*Math.random())
					var bcol='0,0,155'
					var col='rgba('+bcol+','+r+')'
					context.strokeStyle=col;
					context.shadowColor='rgb('+bcol+')';
					this.drawTile(context,a,b);
				}
		this.current=true;
		context.restore();
	}},
});


var HexMouse=function HexMouse(canvas,properties) {
	this.mouse=new RelativeVector(-1,-1)

	this.style={strokeStyle:'#00F',shadowColor:'#BBF', lineWidth:0.005, shadowBlur: 0.01}
	this.leftStyle={strokeStyle:'#0A0',shadowColor:'#0F0'}
	this.rightStyle={strokeStyle:'#A00',shadowColor:'#F00'}
	this.midStyle={strokeStyle:'#AA0',shadowColor:'#FF0'}
	this.upStyle={strokeStyle:'#00F',shadowColor:'#BBF'}

	HexBoard.prototype.constructor.call(this,canvas,properties);
	this.updateStyle(this.style)
}

HexMouse.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:HexMouse},
	properties :{value:['radius','style','leftStyle','rightStyle','midStyle']},

	updateStyle:{value:function(style){ for(var s in style) this.style[s]=style[s]; }},

	onMouseLeftDown :{value:function(ev){this.updateStyle(this.leftStyle);}},
	onMouseRightDown:{value:function(ev){this.updateStyle(this.rightStyle);}},
	onMouseMidDown  :{value:function(ev){this.updateStyle(this.midStyle);}},
	onMouseUp       :{value:function(ev){this.updateStyle(this.upStyle);}},
	onMouseMove     :{value:function(ev){ 
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toRelative(this.canvas.width,this.canvas.height)
		this.current=false; 
	}},

	render:{value:function(context){
		context.save();
		for(var s in this.style)
			context[s]=this.style[s];
		context.lineWidth*=this.min()
		context.shadowBlur*=this.min();

		var hex=this.mouse.toHex(this.r)
		if(this.inBounds(hex.a,hex.b)) this.drawTile(context,hex.a,hex.b)
			
		context.restore();
		this.current=true;
	}},
});

var HexSelected=function HexSelected(canvas,properties) {
	this.clicked={}

	this.style={fillStyle:'rgba(0,0,0,0.5)'}
	this.leftStyle={fillStyle:'rgba(0,255,0,0.5)'}
	this.rightStyle={fillStyle:'rgba(255,0,0,0.5)'}
	this.midStyle={fillStyle:'rgba(255,255,0,0.5)'}
	this.noStyle={fillStyle:'rgba(0,0,0,0.5)'}

	HexBoard.prototype.constructor.call(this,canvas,properties);

	this.mouse=new RelativeVector(-1,-1).toHex(this.r)
	this.updateStyle(this.style)
}
HexSelected.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:HexSelected},
	properties :{value:['radius','style','noStyle','leftStyle','rightStyle','midStyle']},

	updateStyle:{value:function(style){ for(var s in style) this.style[s]=style[s]; }},

	onMouseLeftUp:{value:function(ev){
		if(this.inBounds(this.mouse.a,this.mouse.b))
			this.clicked[this.mouse]=this.clicked[this.mouse]!=this.leftStyle?this.leftStyle:this.noStyle
	}},
	onMouseRightUp:{value:function(ev){
		if(this.inBounds(this.mouse.a,this.mouse.b)) 
			this.clicked[this.mouse]=this.clicked[this.mouse]!=this.rightStyle?this.rightStyle:this.noStyle
	}},
	onMouseMidUp:{value:function(ev){
		if(this.inBounds(this.mouse.a,this.mouse.b)) 
			this.clicked[this.mouse]=this.clicked[this.mouse]!=this.midStyle?this.midStyle:this.noStyle
	}},

	onMouseUp:{value:function(ev){
		if(this.clicked[this.mouse]==this.noStyle)
			delete this.clicked[this.mouse]

		this.current=false;
	}},
	onMouseMove     :{value:function(ev){ 
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toHex(this.canvas.width,this.canvas.height,this.r)
		this.current=false; 
	}},

	render:{value:function(context){
		for(var i in this.clicked) {
			context.save()
			for(var s in this.clicked[i])
				context[s]=this.clicked[i][s];
			var [a,b]=i.split(',').map(Number)
			this.drawTile(context,a,b);
			context.fill()
			context.restore()
		}
		this.current=true;
	}},
});
