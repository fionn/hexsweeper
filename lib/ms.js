var Hexsweeper=function Hexsweeper(properties){
	this.mines=[]
	this.tiles={}
	Game.call(this,properties)

	this.renderer.newLayer('background_fill',0,false);
	this.renderer.layers['background_fill'].add(MineSweeper,{minesRatio:this.minesRatio,radius:this.radius});

	this.renderer.newLayer('background_stroke',0,false);
	this.renderer.layers['background_stroke'].add(HexBoard,{radius:this.radius});

	this.renderer.newLayer('mouse',0,true);
	this.renderer.layers['mouse'].add(HexMouse,{radius:this.radius});
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
		for(var a=-this.radius;a<=this.radius;++a)
			for(var b=-this.radius;b<=this.radius;++b)
				if(this.inBounds(a,b)){
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
						buttons:0,
						isMine:false,
						neighbours: neighbours.filter(function(h){ return this.inBounds(h); },this),
					}
				}
	}},

	initialiseMines:{value:function(){
		for(var tile in this.tiles)
			if(this.minesRatio>Math.random()) {
				this.tiles[tile].isMine=true
				this.mines.push(tile)
			}
	}},
});
