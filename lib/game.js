var Game=function Game(properties) {
	var this_=this;
	this.context=new Context(undefined,{
		width:window.innerWidth*0.99,
		height:window.innerHeight*0.98,
	});
	this.mouse_down_time=0
	this.interval=undefined;
	O.call(this,properties,true);
	document.body.style.background=this.background;
	document.body.style.margin=0;
	window.addEventListener('throttledResize',function(ev){
	//	this_.context.width=window.innerWidth*0.97;
	//	this_.context.height=window.innerHeight*0.97;
		this_.onResize();
	});
	document.addEventListener('contextmenu',function(ev){ev.preventDefault()});
	//mouse events 
	document.addEventListener('mousemove',function(ev){this_.onMouseMove(ev)});
	document.addEventListener('mousedown',function(ev){
		this_.mouse_down_time=new Date();
		this_.mouse_button=ev.buttons
		this_.onMouseDownBefore(ev);
		switch(ev.buttons) {
			case 1: this_.onMouseLeftDown(ev); break;
			case 2: this_.onMouseRightDown(ev); break;
			case 4: this_.onMouseMidDown(ev); break;
		}
		this_.onMouseDownAfter(ev);
		ev.preventDefault()
	});
	document.addEventListener('touchstart',function(ev){
		var a=this_mouse_context.a.toAbs(ev.touches[0].layerX,ev.touches[0].ev.layerY)
		var r=this_mouse_context.a.toRel(a,this_mouse_context.r.rescale)
		var h=this_mouse_context.a.toHex(a,this_mouse_context.h.rescale,this_mouse_context.h.hexRadius)
		this_mouse={a:a,r:r,h:h}

		this_.mouse_down_time=new Date();
		this_.mouse_button=1
		this_.onMouseDownBefore(ev);
		this_.onMouseDownAfter(ev);
	});

	document.addEventListener('mouseup',function(ev){
		this_.onMouseUpBefore(ev);
		switch(this_.mousedown) {
			case 1: this_.onMouseLeftUp(ev); break;
			case 2: this_.onMouseRightUp(ev); break;
			case 4: this_.onMouseMidUp(ev); break;
		}
		this_.onMouseUpAfter(ev);
		this_.mouse_button=ev.buttons
		this_.mouse_down_time=0
	});
	document.addEventListener('touchmove',function(ev){
		return;
		var a=this_mouse_context.a.toAbs(ev.touches[0].layerX,ev.touches[0].ev.layerY)
		var r=this_mouse_context.a.toRel(a,this_mouse_context.r.rescale)
		var h=this_mouse_context.a.toHex(a,this_mouse_context.h.rescale,this_mouse_context.h.hexRadius)
		this_mouse={a:a,r:r,h:h}
	});
	document.addEventListener('touchend',function(ev){
		this_.onMouseUpBefore(ev);
		this_.onMouseUpAfter(ev);
		this_.mouse_button=0
		this_.mouse_down_time=0
	});
	document.addEventListener('touchcancel',function(ev){
		this_.onMouseUpBefore(ev);
		this_.onMouseUpAfter(ev);
		this_.mouse_button=0
		this_.mouse_down_time=0
	});



}

Game.prototype=Object.create(O.prototype,{
	constructor       :{value:Game},
	default_properties:{value:{
		name:'defaultGameName',
		background:'black',
	}},
	start: {value: function() {
		var this_=this;
		window.dispatchEvent(new Event('throttledResize'));
		this.interval=window.setInterval(function(){this_.render()},1000/this.fps);
	}},
	pause:{value:function(){window.clearInterval(this.interval);}},
	onMouseDownBefore:{value:function(ev){}},
	onMouseUpBefore  :{value:function(ev){}},
	onMouseDownAfter :{value:function(ev){}},
	onMouseUpAfter   :{value:function(ev){}},
	onMouseLeftDown  :{value:function(ev){}},
	onMouseLeftUp    :{value:function(ev){}},
	onMouseRightDown :{value:function(ev){}},
	onMouseRightUp   :{value:function(ev){}},
	onMouseMidUp     :{value:function(ev){}},
	onMouseMidDown   :{value:function(ev){}},
	onMouseMove      :{value:function(ev){}},
	onResize         :{value:function(ev){}},
});


