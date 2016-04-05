
var Minesweeper=function Minesweeper(canvas,properties) {
	this.minesRatio=1/3;
	this.mines=[]
	this.show_mines=false
	HexBoard.prototype.constructor.call(this,canvas,properties);
	for(var a=-this.radius;a<=this.radius;++a)
		for(var b=-this.radius;b<=this.radius;++b)
			if(this.inBounds(a,b))
				if(this.minesRatio>Math.random()) 
					this.mines.push(a+','+b)

	console.log(this.mines)
}

Minesweeper.prototype=Object.create(HexBoard.prototype,{
	constructor:{value:HexBoard},
	properties :{value:['radius']},
	tileCount:{value:function() { return 6*(2*this.radius*(this.radius+1)+this.radius); }},
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
		context.save()
		for(var i in this.mines) {
			var pos=this.mines[i].split(',').map(Number)
			var r=0.80-0.25*Math.random()
			context.strokeStyle='rgba(40,8,80,'+r+')';
			context.fillStyle='rgba(40,8,80,'+r+')';
			context.shadowColor='rgb(0,0,0)';
			context.shadowBlur=10
			this.drawMine(context,pos[0],pos[1])
		}
		context.restore()
	}}
});
