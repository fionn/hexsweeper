var HexBoard=function HexBoard(context,properties) {
	var this_=this;
	this.mousedown=0;
	this.context=context;
	this.radius=6;
	this.current=false;
	O.prototype.constructor.call(this,properties);
	context.setupGrid(this.radius)

	window.addEventListener('throttledResize', function(ev) {this_.onResize(ev)});
	document.addEventListener('contextmenu',function(ev){ev.preventDefault()});
	if(this.useMouse) {
		// Prevents right click showing context menu

		//mouse events 
		document.addEventListener('mousemove',function(ev){this_.onMouseMove(ev)});
		document.addEventListener('mousedown',function(ev){
			this_.mouse_down_time=ev.buttons
			this_.mouse_button=ev.buttons
			this_.mousetime=new Date()
			switch(ev.buttons) {
				case 1: this_.onMouseLeftDown(ev); break;
				case 2: this_.onMouseRightDown(ev); break;
				case 4: this_.onMouseMidDown(ev); break;
			}
			this_.onMouseDown(ev);
			ev.preventDefault()
		});

		document.addEventListener('mouseup',function(ev){
			this_.mousedelay=new Date()-this_.mousetime
			switch(this_.mousedown) {
				case 1: this_.onMouseLeftUp(ev); break;
				case 2: this_.onMouseRightUp(ev); break;
				case 4: this_.onMouseMidUp(ev); break;
			}
			this_.onMouseUp(ev);
			ev.preventDefault()
			this_.mouse_button=ev.buttons
			this_.mousetime=undefined
		});
	}
}

HexBoard.prototype=Object.create(O.prototype,{
	constructor:{value:HexBoard},
	default_properties:{value:{
		radius:6,
		useMouse:false,
	}},
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
	HexBoard.prototype.constructor.call(this,context,properties);
	this.style=-1
	this.styles=[this.leftStyle,this.midStyle,this.rightStyle];
	this.updateStyle(this.style)
}

HexMouse.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:HexMouse},
	default_properties:{value:{
		useMouse  :true,
//		style     :{strokeStyle:'#00F',shadowColor:'#AAF'},
		leftStyle :{strokeStyle:'#0A0',shadowColor:'#0F0'},
		rightStyle:{strokeStyle:'#A00',shadowColor:'#F00'},
		midStyle  :{strokeStyle:'#AA0',shadowColor:'#FF0'},
		upStyle   :{strokeStyle:'#00F',shadowColor:'#BBF'},
	}},
	updateStyle:{value:function(style){ for(var s in style) this.style[s]=style[s]; }},

	onMouseDown     :{value:function(ev) {
		this.mouse_down_time=new Date()
	}},

	onMouseLeftDown :{value:function(ev){this.style=0;}},
	onMouseRightDown:{value:function(ev){this.style=1;}},
	onMouseMidDown  :{value:function(ev){this.style=2;}},
	onMouseUp       :{value:function(ev){this.style=-1}},
	onMouseMove     :{value:function(ev){ 
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toRelative(this.context.canvas.width,this.context.canvas.height)
		this.current=false; 
	}},

	render:{value:function(context){
		if(this.mouse_down_time>=0)
			
		this.context.save();
		this.context.lineWidth=this.context.tileRadius/20
		this.context.shadowBlur=this.context.tileRadius/5

		if(this.style>=0) {
			var style=(this.style+Math.floor(((new Date()-this.mouse_down_time)%3000)/1000)%3)
			for(var s in this.styles[style])
				this.context[s]=this.styles[style][s];
		} else 
			for(var s in this.upStyle)
				this.context[s]=this.upStyle[s];

		var hex=this.mouse.toHex(this.context.tileRadius)
		if(this.inBounds(hex.a,hex.b))
			this.context.strokeTile(hex)
		
		this.context.restore();
		this.current=false;
	}},
});

