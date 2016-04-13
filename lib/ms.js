var Hexsweeper=function Hexsweeper(properties){
	var this_=this;
	this.mouse={x:0,y:0}
	this.mines=[]
	this.selected=[]
	this.tiles={}
	this.tileCount=0
	this.game_over=false;	
	Game.call(this,properties)

	this.renderer.newLayer('background_fill',0,false);
	this.renderer.layers['background_fill'].add(MineSweeper,{minesRatio:this.minesRatio,radius:this.radius});

	this.renderer.newLayer('background_stroke',0,false);
	this.renderer.layers['background_stroke'].add(HexBoard,{radius:this.radius});

	this.renderer.newLayer('mouse',0,true);
	this.renderer.layers['mouse'].add(HexMouse,{radius:this.radius});

	var bcnv=document.createElement('canvas')
	var bctx=new HexContext(bcnv.getContext('2d'),0.9)
	bctx.canvas.width=this.renderer.canvas.width;
	bctx.canvas.height=this.renderer.canvas.height;
	bctx.setupGrid(this.radius)
	bctx.lineWidth=0.004
	bctx.strokeStyle='#00F'
	bctx.shadowBlur=0.008;
	bctx.shadowColor='#000'

	var Bcnv=document.createElement('canvas')
	var Bctx=new HexContext(Bcnv.getContext('2d'),0.9)
	Bctx.canvas.width=this.renderer.canvas.width;
	Bctx.canvas.height=this.renderer.canvas.height;
	Bctx.setupGrid(this.radius)
	Bctx.lineWidth=0

	var mcnv=document.createElement('canvas')
	this.mctx=new HexContext(mcnv.getContext('2d'),0.9)
	var mctx=this.mctx;
	mctx.canvas.width=this.renderer.canvas.width;
	mctx.canvas.height=this.renderer.canvas.height;
	mctx.setupGrid(this.radius)
	mctx.lineWidth=0.002
	mctx.shadowBlur=0.004;

	this.effective_mouse_down=0
	this.update=function(){
		if(this_.mouse_down_time==0)
			this.effective_mouse_down=0;
		else {
			var t=Math.floor((new Date()-this_.mouse_down_time)/1000)
			this.effective_mouse_down=((this_.mouse_button>>1)+t)%3+1
		}
	}

	this.renders=[
		function(){bctx.clear(); bctx.save(); bctx.strokeGrid(); bctx.restore()},
		function(){
			Bctx.clear(); Bctx.save(); 
			var styles=['rgb(140,140,140)','rgb(0,140,0)','rgb(140,0,0)','rgb(140,140,0)','rgb(140,0,255)']
			if(this_.game_over) {
				Bctx.fillStyle=styles[4]
				for(var t in this_.mines)
					Bctx.fillTile(this_.tiles[this_.mines[t]]); 
				Bctx.globalAlpha=0.5
			}
			
			for(var t in this_.selected) {
				var tile=this_.tiles[this_.selected[t]]
				Bctx.fillStyle=styles[tile.button]
				Bctx.fillTile(tile); 
				if(!tile.isMine && tile.button==1) {
					var a=Bctx.hexToAbsolute(tile)
					Bctx.lineWidth=0.005
					Bctx.strokeStyle='rgb(255,'+Math.floor(255*(tile.count>3?(6-tile.count)/3:1))+','+Math.floor(255*(tile.count<3?(3-tile.count)/3:0))+')';
					Bctx.strokeHexagon(a.x,a.y,Bctx.tileRadius*Bctx.min*0.5,3,tile.count+3);
				}
			}


			if(this_.game_over) {
				Bctx.globalAlpha=1
			}
			Bctx.restore()
		},
	]

	this.draws=[
		function(context){context.drawImage(Bcnv,0,0);},
		function(context){context.drawImage(bcnv,0,0);},
		function(context){
			mctx.clear()
			var h=mctx.absoluteToHex(this_.mouse)
			if(!this_.inBounds(h)) return
			var styles=['#FFF','#0F0','#F00','#FF0']
			mctx.strokeStyle=styles[this_.effective_mouse_down]
			mctx.shadowColor=styles[this_.effective_mouse_down]
			mctx.strokeTile(h)
			context.drawImage(mcnv,0,0);
		},
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
					this.tiles['Tile:'+a+','+b]={
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
					this.tiles['Tile:'+neighbour.a+','+neighbour.b].count++;
				}
			}
		}
	}},
	
	render:{value:function() { 
//		Game.prototype.render.call(this);
		this.update()
		this.renderer.clear()
		var render_again=[]
		for(var i in this.needs_rendering)
			this.renders[this.needs_rendering[i]]();
		for(var i in this.draws) {
			if(this.draws[i](this.renderer.context))
				render_again.push(i)
		}
		this.needs_rendering=render_again
	}},

	reset:{value:function(){
		this.initialiseTiles()
		this.game_over=false;
	}},

	onMouseMove:{value:function(ev){
		this.mouse={x:ev.layerX,y:ev.layerY}
	}},

	onMouseUpAfter:{value:function(ev){
		if(this.game_over) {
			this.needs_rendering=Object.keys(this.renders)
			return this.reset()
		}

		var h=this.mctx.absoluteToHex(this.mouse)
		var t='Tile:'+h.a+','+h.b
		if(!this.inBounds(h)) return
		var tile=this.tiles[t]
		if(tile.button==1) {
		} if(this.effective_mouse_down==tile.button) {
			tile.button=0
			this.selected.splice(this.selected.indexOf(t),1)
		} else {
			tile.button=this.effective_mouse_down
			if(this.selected.indexOf(t)<0)
				this.selected.push(t)
		}
		this.needs_rendering.push(1)
		if(this.mines.length==0) {
			this.initialiseMines()
		}

		if(tile.button==1)
			this.tileSelected(tile)
	}},

	tileSelected:{value:function(tile){
		if(tile.isMine) {
			this.game_over=true
			this.needs_rendering.push(1)
		} else {
			if(tile.count==0) {
				for(var i=0; i<tile.neighbours.length; ++i) {
					console.log(tile.neighbours[i])
					if(!(this.inBounds(tile.neighbours[i]))) continue
					var t='Tile:'+tile.neighbours[i].a+','+tile.neighbours[i].b
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
});
