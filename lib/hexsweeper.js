var Hexsweeper=function Hexsweeper(properties){
	var this_=this;
	this.mouse={a:{x:0,y:0},r:{X:-1,Y:-1},h:{X:-100,Y:-100}}
	this.mines=[]
	this.selected=[]
	this.tiles={}
	this.tileCount=0
	this.game_over=false;	
	Game.call(this,properties)
	
	document.body.appendChild(this.context.canvas);
	this.grid_context=new Context(undefined,{
		rescale      :this.rescale,
		radius       :this.radius,
		hexRadius    :this.hexRadius,
		strokeStyle  :'#00F',
		hex:{
			lineWidth:0.05,
		},
	});

	this.selected_context=new Context(undefined,{
		rescale      :this.rescale,
		radius       :this.radius,
		hexRadius    :this.hexRadius,
	});

	this.mouse_context=new Context(undefined,{
		rescale      :this.rescale,
		radius       :this.radius,
		hexRadius    :this.hexRadius,
		hex:{
			lineWidth:0.05,
			shadowBlur:0.5,
			shadowColor:'#FFF',
		},
	});

	this.ui_context=new Context(undefined,{
		rescale      :this.rescale,
		radius       :this.radius,
		hexRadius    :this.hexRadius,
	});
	this.ui_context.r.lineWidth=0.01,
	this.ui_context.r.strokeStyle='#FFF',
	this.ui_context.r.shadowColor='#F0F',
	this.ui_context.r.fillStyle='#FFF',
	this.ui_context.r.shadowBlur=1,

	this.selector_position=this.mouse_context.r.toRel(-1,-1)
	this.selector_size=0.05
	this.effective_mouse_down=0
	this.mouse_down_mod=0;

	this.renders=[
		this.renderGrid,
		this.renderSelected,
		this.renderUI,
	]

	this.draws=[
		this.drawSelected,
		this.drawGrid,
		this.drawUI,
		this.drawMouse,
	]

	this.needs_rendering=Object.keys(this.renders)
	this.reset()
};

Hexsweeper.prototype=Object.create(Game.prototype,{
	constructor: {value: Hexsweeper},
	default_properties: {value:{
		name      : 'Hexsweeper',
		radius    : 6,
		minesRatio: 0.22,
		hexRadius :'auto',
		rescale   :0.75,
	}},
	
	inBounds:{value:function(h){ return (Math.abs(h.a+h.b)+Math.abs(h.a)+Math.abs(h.b))/2<=this.radius; }},
	initialiseTiles:{value:function(){
		this.tiles={}
		this.tileCount=0
		for(var a=-this.radius;a<=this.radius;++a) {
			for(var b=-this.radius;b<=this.radius;++b) {
				if(this.inBounds({a:a,b:b})){
					this.tileCount++;
					var neighbours=[
						{a:a+1,b:b+0},
						{a:a-1,b:b+0},
						{a:a+0,b:b+1},
						{a:a+0,b:b-1},
						{a:a+1,b:b-1},
						{a:a-1,b:b+1},
					];
					this.tiles['a:'+a+',b:'+b]={
						a:a,
						b:b,
						button:0,
						isMine:false,
						neighbours: neighbours.filter(function(h){ return this.inBounds(h); },this),
						count:0,
						flag:0,
					}
				}
			}
		}
		this.mines=[]
		this.selected=[]
	}},

	initialiseMines:{value:function(){
		for(var tile in this.tiles) {
			if(this.minesRatio>Math.random() && this.tiles[tile].button==0) {
				this.tiles[tile].isMine=true
				this.mines.push(tile)
				for(var i=0; i<this.tiles[tile].neighbours.length; ++i) {	
					var neighbour=this.tiles[tile].neighbours[i]
					this.tiles['a:'+neighbour.a+',b:'+neighbour.b].count++;
				}
			}
		}
	}},
	
	render:{value:function() { 
		this.update()
		this.context.clear()
		var render_again=[]
		for(var i in this.needs_rendering) {
			this.renders[this.needs_rendering[i]].call(this);
		}
		for(var i in this.draws) {
			if(this.draws[i].call(this,this.context.context))
				render_again.push(i)
		}
		this.needs_rendering=render_again
	}},

	reset:{value:function(){
		this.initialiseTiles()
		this.game_over=false;
	}},

	onMouseMove:{value:function(ev){
		var a=this.mouse_context.a.toAbs(ev.layerX,ev.layerY)
		var r=this.mouse_context.a.toRel(a,this.mouse_context.r.rescale)
		var h=this.mouse_context.a.toHex(a,this.mouse_context.h.rescale,this.mouse_context.h.hexRadius)
		this.mouse={a:a,r:r,h:h}
	}},

	onMouseUpAfter:{value:function(ev){
		if(this.game_over) {
			this.needs_rendering=Object.keys(this.renders)
			return this.reset()
		}

		var h=this.mouse.h
		var t=h.toString()

		function d(a,b){
			return Math.sqrt(Math.pow(a.X-b.X,2)+Math.pow(a.Y-b.Y,2))
		}
		if(d(this.mouse.r,this.selector_position)<2*this.selector_size) {
			this.mouse_down_mod+=1
			this.mouse_down_mod%=3
		}

		if(!this.inBounds(h)) return
		var tile=this.tiles[t]
		if(tile.button==0) {
			tile.button=this.effective_mouse_down	
			if(this.selected.indexOf(t)<0)
				this.selected.push(t)
		} else if(tile.button!=1 && this.effective_mouse_down==tile.button) {
			tile.button=0;
			this.selected.splice(this.selected.indexOf(t),1)
		}
		this.needs_rendering.push(1)
		if(this.mines.length==0) {
			this.initialiseMines()
		}

		if(tile.button==1)
			this.tileSelected(tile)
	}},

	tileSelected:{value:function(tile){
		// if player clicks on a mine, game over
		if(tile.isMine) {
			this.game_over=true
			this.needs_rendering.push(1)
			this.needs_rendering.push(2)
		} else {
			if(tile.count==0) {
				for(var i=0; i<tile.neighbours.length; ++i) {
					if(!(this.inBounds(tile.neighbours[i]))) continue
					var t='a:'+tile.neighbours[i].a+',b:'+tile.neighbours[i].b
					var ttile=this.tiles[t]
					if(this.selected.indexOf(t)<0) {
						this.selected.push(t)
						ttile.button=1
						this.tileSelected(ttile)
					}
				}
			}
		}
	}},

	renderGrid:{value:function() {
		this.grid_context.clear(); 
		this.grid_context.h.save()
		var properties=this.grid_context.h.getProperties()
		var ctx=new HexContext(undefined,this.grid_context.h.getProperties());
		for(var i=1; i<=this.grid_context.h.radius; i++)
			for(var j=0;j+i<=this.grid_context.h.radius;j++)
				if((Math.abs(i+j)+Math.abs(i)+Math.abs(j))/2<=this.grid_context.h.radius)
					ctx.imageHexagon(ctx.toHex(i,j));
		function display(x,y,A) {
			var r=Math.sqrt(x*x+y*y), a=Math.asin(x/r);
			var X=r*Math.sin(a+A), Y=r*Math.cos(a+A);
			return [X,Y]
		}

		var c=display(this.grid_context.h.canvas.width/2,this.grid_context.h.canvas.height/2,Math.PI/3)
		for(var i=0; i<6; i++) {
			this.grid_context.h.drawImage(ctx.canvas,0,0)
			this.grid_context.h.translate(c[0],c[1])
			this.grid_context.h.rotate(Math.PI/3)
		}
		this.grid_context.h.imageHexagon(this.grid_context.h.toHex(0,0))
		this.grid_context.h.restore()
	}},
	renderSelected:{value:function(){
		this.selected_context.clear();
		this.selected_context.h.save(); 
		var styles=['rgb(140,140,140)','rgb(0,140,0)','rgb(140,0,0)','rgb(140,140,0)','rgb(140,0,255)']
		if(this.game_over) {
			this.selected_context.h.fillStyle=styles[4]
			for(var t in this.mines)
				this.selected_context.h.fillHexagon(this.tiles[this.mines[t]]); 
			this.selected_context.h.globalAlpha=0.5
		}
		
		for(var t in this.selected) {
			var tile=this.tiles[this.selected[t]]
			this.selected_context.h.fillStyle=styles[tile.button]
			this.selected_context.h.fillHexagon(tile); 
			if(!tile.isMine && tile.button==1) {
				this.selected_context.h.lineWidth=0.1
				this.selected_context.h.strokeStyle='rgb(255,'+Math.floor(255*(tile.count>3?(6-tile.count)/3:1))+','+Math.floor(255*(tile.count<3?(3-tile.count)/3:0))+')';
				this.selected_context.h.strokeHexagon(tile,0.5,3,tile.count+3);
			}
		}


		if(this.game_over) {
			this.selected_context.h.globalAlpha=1
		}
		this.selected_context.h.restore()
	}},

	renderUI:{value:function(){
		this.ui_context.clear();
		this.ui_context.r.save();
		// draw reset button
		var r=this.ui_context.r.toRel(0,1.15)
		this.ui_context.r.fillStyle='#FFF';
		if(this.game_over) {
			this.ui_context.r.fillHexagon(r,0.05);
		} else {
			this.ui_context.r.strokeHexagon(r,0.05);
		}
	}},
	
	drawSelected:{value:function(context){context.drawImage(this.selected_context.canvas,0,0);}},
	drawGrid    :{value:function(context){context.drawImage(this.grid_context.canvas,0,0);}},
	drawUI      :{value:function(context){context.drawImage(this.ui_context.canvas,0,0);}},
	drawMouse:{value:function(context){
		var h=this.mouse.h
		var styles=['#FFF','#0F0','#F00','#FF0']
		this.mouse_context.h.fillStyle=styles[this.effective_mouse_down]
		this.mouse_context.h.strokeStyle=styles[this.effective_mouse_down]
		this.mouse_context.h.shadowColor=styles[this.effective_mouse_down]
		this.mouse_context.clear()
		if(this.inBounds(h))
			this.mouse_context.h.strokeHexagon(h)
		this.mouse_context.r.fillHexagon(this.selector_position,this.selector_size);
		this.mouse_context.a.beginPath();
		this.mouse_context.a.strokeStyle='#FFF';
		context.drawImage(this.mouse_context.canvas,0,0);
	}},

	update:{value:function() {
		if(this.mouse_down_time==0)
			this.effective_mouse_down=this.mouse_down_mod+1;
		else {
			var t=Math.floor((new Date()-this.mouse_down_time)/1000)
			this.effective_mouse_down=((this.mouse_button>>1)+t+this.mouse_down_mod)%3+1
		}
	}},
});
