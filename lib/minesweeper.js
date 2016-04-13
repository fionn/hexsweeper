var MineSweeper=function MineSweeper(context,properties) {
	this.clicked={}
	this.mines=[]
	this.game_over=false;

	this.minesRatio=1/3;

	this.style={fillStyle:'rgba(0,0,0,0.5)'}
	this.leftStyle={fillStyle:'rgba(0,255,0,0.5)'}
	this.rightStyle={fillStyle:'rgba(255,0,0,0.5)'}
	this.midStyle={fillStyle:'rgba(255,255,0,0.5)'}
	this.noStyle={fillStyle:'rgba(0,0,0,0.5)'}
	this.mineStyle={
		strokeStyle:'white',
		strokeStyle:'rgba(108,0,255,0.5)',
		fillStyle:'rgba(108,0,255,0.5)',
		shadowColor:'rgb(0,0,0)',
		shadowBlur:0.0001,
		lineWidth:0.004,
	}


	HexBoard.prototype.constructor.call(this,context,properties);

	this.resetPos={x:-0.85,y:-0.85}
	this.countPos={x:0.85,y:-0.85}
//	this.countPos=new RelativeVector(1-4*this.context.tileRadius,-1+4*this.context.tileRadius).toHex(this.context.tileRadius).toRelative(this.context.tileRadius)
	this.selected=this.leftStyle


	this.selectLeftPos={x:0.75,y:0.85}
	this.selectMidPos={x:0.85,y:0.85}
	this.selectRightPos={x:0.85,y:0.75}
//	var selectPos=new RelativeVector(1-4*this.context.tileRadius,1-4*this.context.tileRadius).toHex(this.context.tileRadius)
//	var a=selectPos.a
//	var b=selectPos.b
//	
//	this.selectLeftPos=new HexVector(a,b).toRelative(this.context.tileRadius)
//	this.selectRightPos=new HexVector(a-1,b+1).toRelative(this.context.tileRadius)
//	this.selectMidPos=new HexVector(a,b+1).toRelative(this.context.tileRadius)

	this.mouse=new RelativeVector(-1,-1).toHex(this.context.tileRadius)
	this.updateStyle(this.style)

	this.reset()
	this.mineImage=this.initMineImage()
}
MineSweeper.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:MineSweeper},
	properties :{value:['minesRatio','mineStyle','radius','style','noStyle','leftStyle','rightStyle','midStyle']},

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
		if(this.mines.length==0 && this.minesRatio!=0) this.placeMines()

		if(this.clicked[this.mouse.a+','+this.mouse.b]==this.leftStyle)
			if(this.neighbouringMineCount(this.mouse)==0)
				this.revealNeighbours(this.mouse)

		
		if(this.clicked[this.mouse]==this.noStyle)
			delete this.clicked[this.mouse]
//		if(this.mouse_str==this.selectLeftPos.toHex(this.context.tileRadius).toString()) 
//			this.selected=this.leftStyle
//		else if(this.mouse_str==this.selectRightPos.toHex(this.context.tileRadius).toString()) 
//			this.selected=this.rightStyle
//		else if(this.mouse_str==this.selectMidPos.toHex(this.context.tileRadius).toString()) 
//			this.selected=this.midStyle
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
		this.context.lineWidth=0.002

		var c=this.countClicked(this.rightStyle)
		var count=this.mines.length
		var r=this.context.min/20
		while(count>0) {
			if(count<=c) { this.context.strokeStyle='red' }
			if(count%6==0) r*=0.8
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
		this.context.save()

		this.renderClicked()
		if(this.mines.length>0) this.drawMineCount();

		var l=this.context.relativeToAbsolute(this.selectLeftPos)
		var m=this.context.relativeToAbsolute(this.selectMidPos)
		var r=this.context.relativeToAbsolute(this.selectRightPos)

		for(var s in this.leftStyle)
			context[s]=this.leftStyle[s];
		this.context.hexagon(l.x,l.y,0.025*this.context.min*0.8,0,6)
		this.context.fill()
		if(this.selected==this.leftStyle) {
			this.context.globalAlpha=0.5
			this.context.hexagon(l.x,l.y,0.025*this.context.min,0,6)
			this.context.fill()
			this.context.globalAlpha=1
		}
		
		for(var s in this.rightStyle)
			this.context[s]=this.rightStyle[s];
		this.context.hexagon(r.x,r.y,0.025*this.context.min*0.8,0,6)
		this.context.fill()
		if(this.selected==this.rightStyle) {
			this.context.globalAlpha=0.5
			this.context.hexagon(r.x,r.y,0.025*this.context.min,0,6)
			this.context.fill()
			this.context.globalAlpha=1
		}

		for(var s in this.midStyle)
			this.context[s]=this.midStyle[s];
		this.context.hexagon(m.x,m.y,0.025*this.context.min*0.8,0,6)
		this.context.fill()
		if(this.selected==this.midStyle) {
			context.globalAlpha=0.5
			context.hexagon(m.x,m.y,0.025*this.context.min,0,6)
			context.fill()
			context.globalAlpha=1
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
