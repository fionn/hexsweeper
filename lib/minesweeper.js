var MineSweeper=function MineSweeper(canvas,properties) {
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


	HexBoard.prototype.constructor.call(this,canvas,properties);
	this.resetPos=new RelativeVector(-1+4*this.r,-1+4*this.r).toHex(this.r).toRelative(this.r)
	this.countPos=new RelativeVector(1-4*this.r,-1+4*this.r).toHex(this.r).toRelative(this.r)
	this.selected=this.leftStyle


	var selectPos=new RelativeVector(1-4*this.r,1-4*this.r).toHex(this.r)
	var a=selectPos.a
	var b=selectPos.b
	
	this.selectLeftPos=new HexVector(a,b).toRelative(this.r)
	this.selectRightPos=new HexVector(a-1,b+1).toRelative(this.r)
	this.selectMidPos=new HexVector(a,b+1).toRelative(this.r)

	this.mouse=new RelativeVector(-1,-1).toHex(this.r)
	this.updateStyle(this.style)

	this.reset()
	this.mineImage=this.initMineImage()
}
MineSweeper.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:MineSweeper},
	properties :{value:['minesRatio','mineStyle','radius','style','noStyle','leftStyle','rightStyle','midStyle']},

	reset:{value:function(){
		this.game_over=false;
		this.clicked={}
		this.mines=[]
		this.selected=this.leftStyle
		for(var a=-this.radius;a<=this.radius;++a)
			for(var b=-this.radius;b<=this.radius;++b)
				if(this.inBounds(a,b))
					if(this.minesRatio>Math.random()) 
						this.mines.push(a+','+b)

	}},

	updateStyle:{value:function(style){ for(var s in style) this.style[s]=style[s]; }},
	tileCount:{value:function() { return 6*(2*this.radius*(this.radius+1)+this.radius); }},

	neighbouringMineCount:{value:function(h){
		mod=[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]
		count=0;
		for(var i in mod)
			if(this.mines.indexOf((h.a+mod[i][0])+','+(h.b+mod[i][1]))>=0)
				count++;
		return count;
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
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toHex(this.canvas.width,this.canvas.height,this.r)
		if(this.clicked[this.mouse]==this.leftStyle || this.game_over ) return
		if(this.inBounds(this.mouse.a,this.mouse.b)) {
			this.clicked[this.mouse]=this.clicked[this.mouse]!=this.selected?this.selected:this.noStyle
		}
		if(this.mines.indexOf(this.mouse.toString())>=0)
			this.game_over=true;
	}},
	onMouseRightUp:{value:function(ev){
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toHex(this.canvas.width,this.canvas.height,this.r)
		if(this.clicked[this.mouse]==this.leftStyle || this.game_over ) return
		if(this.inBounds(this.mouse.a,this.mouse.b)) 
			this.clicked[this.mouse]=this.clicked[this.mouse]!=this.rightStyle?this.rightStyle:this.noStyle
	}},
	onMouseMidUp:{value:function(ev){
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toHex(this.canvas.width,this.canvas.height,this.r)
		if(this.clicked[this.mouse]==this.leftStyle || this.game_over ) return
		if(this.inBounds(this.mouse.a,this.mouse.b)) 
			this.clicked[this.mouse]=this.clicked[this.mouse]!=this.midStyle?this.midStyle:this.noStyle
	}},

	onMouseUp:{value:function(ev){
		this.mouse=new AbsoluteVector(ev.layerX,ev.layerY).toHex(this.canvas.width,this.canvas.height,this.r)
		if(this.clicked[this.mouse]==this.noStyle)
			delete this.clicked[this.mouse]
		if(this.mouse.toString()==this.selectLeftPos.toHex(this.r).toString()) 
			this.selected=this.leftStyle
		else if(this.mouse.toString()==this.selectRightPos.toHex(this.r).toString()) 
			this.selected=this.rightStyle
		else if(this.mouse.toString()==this.selectMidPos.toHex(this.r).toString()) 
			this.selected=this.midStyle
		else if(this.game_over && this.mouse.toString()==this.resetPos.toHex(this.r).toString()) 
			this.reset()
		this.current=false;
	}},

	initMineImage:{value:function(){
		var mineImage=document.createElement('canvas')
		var offset=this.r*this.min()/3;
		mineImage.width=4*offset;
		mineImage.height=4*offset;

		var ctx=mineImage.getContext('2d')
		ctx.save()
		for(var s in this.mineStyle)
			if(s in ctx) 
				ctx[s]=this.mineStyle[s]
		ctx.shadowBlur*=this.min()
		ctx.lineWidth*=this.min()

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
		var a=this.countPos.toAbsolute(context.canvas.width,context.canvas.height)

		context.save();
		context.strokeStyle='gray'
		context.lineWidth=this.r*this.min()*0.03

		var c=0
		for(var i in this.clicked)
			if(this.clicked[i]==this.rightStyle)
				c++

		var count=this.mines.length
		var offset=6-count%6
		var mlength=count
		var r=this.r*this.min()
		while(count>offset) {
			if(count-offset<=c) { context.strokeStyle='red' }
			hexagon(context,a.x,a.y,r,count,count+1);
			context.stroke()
			if(count%6==(offset+1)%6) {
				r*=0.8
			}
			count--
		}
		context.restore();
	}},

	render:{value:function(context){
		context.save()
		for(var i in this.clicked) {
			for(var s in this.clicked[i])
				context[s]=this.clicked[i][s];
			var [a,b]=i.split(',').map(Number)
			var h=new HexVector(a,b)
			this.drawTile(context,h.a,h.b);
			context.fill()
			if(this.mines.indexOf(h.toString())>=0 || this.clicked[i]!=this.leftStyle) continue
			var count=this.neighbouringMineCount(h)
			var col='rgb(255,'+Math.floor(255*(count>3?(6-count)/3:1))+','+Math.floor(255*(count<3?(3-count)/3:0))+')';
			var a=h.toAbsolute(this.canvas.width,this.canvas.height,this.r)
			context.strokeStyle=col;
			context.lineWidth=this.r*this.min()*0.1
			hexagon(context,a.x,a.y,this.r*this.min()*0.5,3,count+3);
			context.stroke();
		}

		this.drawMineCount(context);

		var l=this.selectLeftPos.toAbsolute(this.canvas.width,this.canvas.height)
		var r=this.selectRightPos.toAbsolute(this.canvas.width,this.canvas.height)
		var m=this.selectMidPos.toAbsolute(this.canvas.width,this.canvas.height)

		for(var s in this.leftStyle)
			context[s]=this.leftStyle[s];
		hexagon(context,l.x,l.y,this.r*this.min()*0.8,0,6)
		context.fill()
		if(this.selected==this.leftStyle) {
			context.globalAlpha=0.5
			hexagon(context,l.x,l.y,this.r*this.min(),0,6)
			context.fill()
			context.globalAlpha=1
		}
		
		for(var s in this.rightStyle)
			context[s]=this.rightStyle[s];
		hexagon(context,r.x,r.y,this.r*this.min()*0.8,0,6)
		context.fill()
		if(this.selected==this.rightStyle) {
			context.globalAlpha=0.5
			hexagon(context,r.x,r.y,this.r*this.min(),0,6)
			context.fill()
			context.globalAlpha=1
		}
		context.drawImage(this.mineImage,r.x-this.mineImage.width/2,r.y-this.mineImage.height/2)

		for(var s in this.midStyle)
			context[s]=this.midStyle[s];
		hexagon(context,m.x,m.y,this.r*this.min()*0.8,0,6)
		context.fill()
		if(this.selected==this.midStyle) {
			context.globalAlpha=0.5
			hexagon(context,m.x,m.y,this.r*this.min(),0,6)
			context.fill()
			context.globalAlpha=1
		}

		if(this.game_over) {
			for(var i in this.mines) {
				var pos=this.toContext.apply(this,this.mines[i].split(',').map(Number))
				context.drawImage(this.mineImage,pos[0]-this.mineImage.width/2,pos[1]-this.mineImage.height/2);
			}

			var a=this.resetPos.toAbsolute(this.canvas.width,this.canvas.height)
			hexagon(context,a.x,a.y,this.r*this.min(),0,6)
			context.shadowBlur=this.r*this.min()
			context.shadowColor='white'
			context.fillStyle='white'
			context.fill()
		}
		context.restore()

		this.current=true;
	}},
});
