
var Minesweeper=function Minesweeper(canvas,properties) {
	this.minesRatio=1/3;
	this.mines=[]
	this.mineStyle={
		strokeStyle:'white',
		strokeStyle:'rgba(108,0,255,0.5)',
		fillStyle:'rgba(108,0,255,0.5)',
		shadowColor:'rgb(0,0,0)',
		shadowBlur:0.0001,
		lineWidth:0.004,
	}
	this.show_mines=true
	HexBoard.prototype.constructor.call(this,canvas,properties);
	for(var a=-this.radius;a<=this.radius;++a)
		for(var b=-this.radius;b<=this.radius;++b)
			if(this.inBounds(a,b))
				if(this.minesRatio>Math.random()) 
					this.mines.push(a+','+b)

	this.mineImage=this.initMineImage()

	console.log(this.mines)
}

Minesweeper.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:HexBoard},
	properties :{value:['radius','mineStyle']},
	tileCount:{value:function() { return 6*(2*this.radius*(this.radius+1)+this.radius); }},
	onResize:{value:function(){ delete this.mineImage; this.mineImage=this.initMineImage(); }},

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

	drawMine:{value:function(context,a,b) {
		var c=this.toCoord(a,b)
		var x=c[0]*this.min()+this.canvas.width/2
		var y=c[1]*this.min()+this.canvas.height/2
		var offset=this.r/3*this.min()
		context.lineWidth=this.min()*this.r/8;
		context.beginPath()
		context.moveTo(x+offset,y-offset)
		context.lineTo(x-offset,y+offset)
		context.lineTo(x+offset,y+offset)
		context.lineTo(x-offset,y-offset)
		context.stroke()
		context.moveTo(x,y)
		context.beginPath()
		context.arc(x,y,2*offset/3,Math.PI/4,3*Math.PI/4,true)
		context.fill()
		context.stroke()
	}},

	render:{value:function(context){
		for(var i in this.clicked) {
			var ind=this.mines.indexOf(i);
			if(ind>=0 && this.clicked[i]==1) {
				this.show_mines=true
				break
			}
		}
		if(!this.show_mines) return
		for(var i in this.mines) {
			var pos=this.toContext.apply(this,this.mines[i].split(',').map(Number))
			context.drawImage(this.mineImage,pos[0]-this.mineImage.width/2,pos[1]-this.mineImage.height/2);
		}
	}}
});
