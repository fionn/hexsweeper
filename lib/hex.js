var HexBoard=function HexBoard(context,properties) {
	var this_=this;
	this.mousedown=0;
	this.context=context;
	this.radius=6;
	this.current=false;
	O.prototype.constructor.call(this,properties);
	context.setupGrid(this.radius)

	// call resize function on a throttled resize event
	window.addEventListener('throttledResize', function(ev) {this_.onResize(ev)});

	// Prevents right click showing context menu
	document.addEventListener('contextmenu',function(ev){ev.preventDefault()});

	//mouse events 
	document.addEventListener('mousemove',function(ev){this_.onMouseMove(ev)});
	document.addEventListener('mousedown',function(ev){
		this_.mousedown=ev.buttons
		switch(ev.buttons) {
			case 1: this_.onMouseLeftDown(ev); break;
			case 2: this_.onMouseRightDown(ev); break;
			case 4: this_.onMouseMidDown(ev); break;
		}
		this_.onMouseDown(ev);
		ev.preventDefault()
	});

	document.addEventListener('mouseup',function(ev){
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

	render:{value:function(context){
		this.context.save();
		this.context.fillStyle='rgba(0,0,0,0)';
		this.context.lineWidth=this.context.tileRadius/20;
		this.context.strokeStyle='rgba(0,0,255,1.0)'
		this.context.strokeGrid()
		this.current=true;
		this.context.restore();
	}},
});


var HexMouse=function HexMouse(context,properties) {
	this.mouse=new RelativeVector(-1,-1)

	this.style={strokeStyle:'#00F',shadowColor:'#AAF'}
	this.leftStyle={strokeStyle:'#0A0',shadowColor:'#0F0'}
	this.rightStyle={strokeStyle:'#A00',shadowColor:'#F00'}
	this.midStyle={strokeStyle:'#AA0',shadowColor:'#FF0'}
	this.upStyle={strokeStyle:'#00F',shadowColor:'#BBF'}

	HexBoard.prototype.constructor.call(this,context,properties);
	this.style.lineWidth=this.context.tileRadius/20
	this.style.shadowBlur=this.context.tileRadius/5
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
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toRelative(this.context.canvas.width,this.context.canvas.height)
		this.current=false; 
	}},

	render:{value:function(context){
		this.context.save();
		for(var s in this.style)
			this.context[s]=this.style[s];

		var hex=this.mouse.toHex(this.context.tileRadius)
		if(this.inBounds(hex.a,hex.b))
			this.context.strokeTile(hex)
		
		this.context.restore();
		this.current=true;
	}},
});

