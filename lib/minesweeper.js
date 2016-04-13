var MineSweeper=function MineSweeper(context,properties) {
	this.clicked={}
	this.mines=[]
	this.game_over=false;
	HexBoard.prototype.constructor.call(this,context,properties);
	this.styles=[this.leftStyle,this.midStyle,this.rightStyle]

	this.resetPos={x:-0.85,y:-0.85}
	this.countPos={x:0.85,y:-0.85}
	this.selected=this.leftStyle
	this.selectPos={x:0.6,y:0.89}
	this.mouse=new RelativeVector(-1,-1).toHex(this.context.tileRadius)
	this.updateStyle(this.style)

	this.reset()
	this.mineImage=this.initMineImage()
}
MineSweeper.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:MineSweeper},
	default_properties:{value:{
		minesRatio:1/3,
		mineStyle :{strokeStyle:'rgba(108,0,255,0.5)', fillStyle:'rgba(108,0,255,0.5)', shadowColor:'rgb(0,0,0)', shadowBlur:0.0001, lineWidth:0.004},
		radius    :6,
		style     :{fillStyle:'rgba(0,0,0,0.5)'},
		style     :{fillStyle:'rgba(0,0,0,0.5)'},
		leftStyle :{fillStyle:'rgba(0,126,0,1.0)'},
		rightStyle:{fillStyle:'rgba(126,0,0,1.0)'},
		midStyle  :{fillStyle:'rgba(126,126,0,1.0)'},
	}},

	placeMines:{value:function(){
		for(var a=-this.radius;a<=this.radius;++a)
			for(var b=-this.radius;b<=this.radius;++b)
				if(this.inBounds(a,b) && !(a+','+b in this.clicked))
					if(this.minesRatio>Math.random()) 
						this.mines.push(a+','+b)
	}},

	reset:{value:function(){
		this.game_over=false;
		this.clicked={}
		this.mines=[]
		this.selected=this.leftStyle
	}},

	updateStyle:{value:function(style){ for(var s in style) this.style[s]=style[s]; }},
	tileCount:{value:function() { return 6*this.radius*(this.radius-1)+1; }},

	neighbouringMineCount:{value:function(h){
		mod=[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]
		count=0;
		for(var i in mod)
			if(this.mines.indexOf((h.a+mod[i][0])+','+(h.b+mod[i][1]))>=0)
				count++;
		return count;
	}},

	countClicked:{value:function(s){
		var count=0;
		for(var i in this.clicked)
			if(this.clicked[i]==s)
				count++
		return count
	}},

	unfoundMineCount:{value:function(h){
		var count=this.mines.length;
		for(var i in this.clicked)
			if(this.mines.indexOf(i)>=0 && this.clicked[i]==this.rightStyle)
				count--
		return count
	}},

	onResize:{value:function(){ delete this.mineImage; this.mineImage=this.initMineImage(); }},
	onMouseLeftUp:{value:function(ev){
		this.mouse=this.context.absoluteToHex({x:ev.layerX,y:ev.layerY})
		var mouse_str=this.mouse.a+','+this.mouse.b
		if(this.clicked[mouse_str]==this.leftStyle || this.game_over ) return
		if(this.inBounds(this.mouse.a,this.mouse.b))
			this.clicked[mouse_str]=this.clicked[mouse_str]!=this.selected?this.selected:this.noStyle
		
	}},
	onMouseRightUp:{value:function(ev){
		this.mouse=this.context.absoluteToHex({x:ev.layerX,y:ev.layerY})
		var mouse_str=this.mouse.a+','+this.mouse.b
		if(this.clicked[mouse_str]==this.leftStyle || this.game_over ) return
		if(this.inBounds(this.mouse.a,this.mouse.b)) 
			this.clicked[mouse_str]=this.clicked[mouse_str]!=this.rightStyle?this.rightStyle:this.noStyle
	}},
	onMouseMidUp:{value:function(ev){
		this.mouse=this.context.absoluteToHex({x:ev.layerX,y:ev.layerY})
		var mouse_str=this.mouse.a+','+this.mouse.b
		if(this.clicked[mouse_str]==this.leftStyle || this.game_over ) return
		if(this.inBounds(this.mouse.a,this.mouse.b)) 
			this.clicked[mouse_str]=this.clicked[mouse_str]!=this.midStyle?this.midStyle:this.noStyle
	
	}},

	onMouseUp:{value:function(ev){
		this.mouse=this.context.absoluteToHex({x:ev.layerX,y:ev.layerY});
		var mouse_str=this.mouse.a+','+this.mouse.b;
		var reset=this.context.relativeToHex(this.resetPos);
		var reset_str=reset.a+','+reset.b;

		if(this.inBounds(this.mouse.a,this.mouse.b) && this.mines.length==0 && this.minesRatio!=0) this.placeMines()

		if(this.clicked[this.mouse.a+','+this.mouse.b]==this.leftStyle)
			if(this.neighbouringMineCount(this.mouse)==0)
				this.revealNeighbours(this.mouse)

		
		if(this.clicked[this.mouse]==this.noStyle)
			delete this.clicked[this.mouse]
		if(this.game_over) 
			this.reset()
		if(this.mines.indexOf(mouse_str)>=0 && this.clicked[mouse_str]==this.leftStyle)
			this.game_over=true;
		if((this.unfoundMineCount()==0 && this.mines.length==this.countClicked(this.rightStyle) && this.mines.length!=0) || this.countClicked(this.leftStyle)+this.mines.length==this.tileCount())
			this.game_over=true

		this.current=false;
	}},

	initMineImage:{value:function(){
		var mineImage=document.createElement('canvas')
		var offset=this.context.tileRadius*this.context.min/3;
		mineImage.width=4*offset;
		mineImage.height=4*offset;

		var ctx=mineImage.getContext('2d')
		ctx.save()
		for(var s in this.mineStyle)
			if(s in ctx) 
				ctx[s]=this.mineStyle[s]
		ctx.lineWidth*=this.context.min

		ctx.translate(2*offset,2*offset)
		ctx.beginPath()
		ctx.moveTo(+offset,-offset)
		ctx.lineTo(-offset,+offset)
		ctx.lineTo(+offset,+offset)
		ctx.lineTo(-offset,-offset)
		ctx.stroke()

		ctx.beginPath()
		ctx.arc(0,0,2*offset/3,Math.PI/4,3*Math.PI/4,true)
		ctx.fill()
		ctx.stroke()
		ctx.restore()

		return mineImage
	}},

	drawMineCount:{value:function(context){
		var a=this.context.relativeToAbsolute(this.countPos)

		this.context.save();
		this.context.strokeStyle='gray'

		var c=this.countClicked(this.rightStyle)
		var count=this.mines.length
		var r=this.context.min/20
		var r_decrease=r/(Math.ceil(this.mines.length/6))
		this.context.lineWidth=r_decrease*0.0002
		this.context.lineWidth=0.2*r_decrease/this.context.min;
		
		while(count>0) {
			if(count<=c) { this.context.strokeStyle='red' }
			if(count%6==0) r-=r_decrease
			this.context.strokeHexagon(a.x,a.y,r,count,count+1);
			count--
		}
		this.context.restore();
	}},

	revealNeighbours:{value:function(h){	
		mod=[[1,0],[0,1],[-1,0],[0,-1],[1,-1],[-1,1]]
		for(var i in mod){
			var a=h.a+mod[i][0]
			var b=h.b+mod[i][1]
			if(!(a+','+b in this.clicked) && this.inBounds(a,b)) {
				this.clicked[a+','+b]=this.leftStyle
				var count=this.neighbouringMineCount({a:a,b:b})
				if(count==0) {
					this.revealNeighbours({a:a,b:b})
				}
			}
		}	
	}},

	renderClicked:{value:function(){
		this.context.save()
		this.context.shadowBlur=0;
		this.context.lineWidth=this.context.tileRadius*0.1
		for(var i in this.clicked) {
			for(var s in this.clicked[i])
				this.context[s]=this.clicked[i][s];
			var c=i.split(',').map(Number)
			var h={a:c[0],b:c[1]}
			var a=this.context.hexToAbsolute(h)

			this.context.fillTile(h)

			if(this.mines.indexOf(i)<0 && this.clicked[i]==this.leftStyle) { 
				var count=this.neighbouringMineCount(h)
				this.context.strokeStyle='rgb(255,'+Math.floor(255*(count>3?(6-count)/3:1))+','+Math.floor(255*(count<3?(3-count)/3:0))+')';
				this.context.strokeHexagon(a.x,a.y,this.context.tileRadius*this.context.min*0.5,3,count+3);
			}
		}
		this.context.restore()
	}},

	render:{value:function(context){
		if(this.mousedelay/1000>1) {
			if(this.mousedown==8) this.mousedown=1
		//	this.selected=this.styles[this.styles.indexOf(this.selected)+1]
		}

		this.context.save()

		this.renderClicked()
		if(this.mines.length>0) this.drawMineCount();

		var m=this.context.relativeToAbsolute(this.selectPos)

		var ind=this.styles.indexOf(this.selected)
		function posMod(a,b){ return (a+b)%b; }
		for(var i=0; i<this.styles.length;i++)  {
			var I=posMod(i+ind+1,this.styles.length)
			var offsetx=40*posMod(ind-I,this.styles.length)
			var offsety=Math.sqrt(3)*10*posMod(ind-I,this.styles.length)
			var style=this.styles[I]
			for(var s in style)
				context[s]=style[s];
			this.context.hexagon(m.x+offsetx,m.y-offsety,0.05*this.context.min,0,6)
			this.context.fill()
		}

		for(var s in this.selected)
			context[s]=this.selected[s];
		if(this.selected==style) {
			this.context.globalAlpha=0.5
			this.context.hexagon(m.x,m.y,0.05*this.context.min*1.2,0,6)
			this.context.fill()
			this.context.globalAlpha=1
		}

		if(this.game_over) {
			for(var i in this.mines) {
				var c=this.mines[i].split(',').map(Number)
				var pos=new HexVector(c[0],c[1]).toAbsolute(this.context.canvas.width,this.context.canvas.height,this.context.tileRadius)
				context.drawImage(this.mineImage,pos.x-this.mineImage.width/2,pos.y-this.mineImage.height/2);
			}

			var a=this.context.relativeToAbsolute(this.resetPos)	
			context.hexagon(a.x,a.y,this.context.tileRadius*this.context.min,0,6)
			context.shadowBlur=this.context.tileRadius*this.context.min
			context.shadowColor='white'
			context.fillStyle='white'
			context.fill()
		}
		context.restore()

		this.current=true;
	}},
});
