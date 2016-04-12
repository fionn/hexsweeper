var AbsoluteVector=function AbsoluteVector(x,y){
	this.x=x; this.y=y;
};
AbsoluteVector.prototype=Object.create(Object.prototype,{
	constructor:{value:AbsoluteVector},
	toRelative:{value:function(w,h){
		var m=Math.min(w,h)
		var x=2*(this.x-w/2)/m;
		var y=2*(this.y-h/2)/m;
		return new RelativeVector(x,y)
	}},
	toHex     :{value:function(w,h,r){
		return this.toRelative(w,h).toHex(r)
	}},
});

var RelativeVector=function RelativeVector(x,y){
	this.x=x; this.y=y;
};
RelativeVector.prototype=Object.create(Object.prototype,{
	constructor:{value:RelativeVector},
	toHex     :{value:function(r){
		var S=r*3, H=Math.sqrt(3)*r*2;
		var a=Math.floor(this.x/S)
		var b=Math.floor(this.y/H)
		var x=this.x-a*S;
		var y=this.y-b*H;
		b-=0.5*(a-Math.abs(a)%2)
		if(a%2==0) {
			if(x>(S/3)*(1+2*Math.abs(1/2-y/H)))
				a++;
			else if(y>H/2) 
				b++
		}
		else {
			if(x>(2*S/3)-(2*S/3)*Math.abs(1/2-y/H)) {
				a++
				if(y<=H/2)
					b--;
			}
		}
		return new HexVector(a,b)
	}},
	toAbsolute:{value:function(w,h) {
		var m=Math.min(w,h)
		var x=this.x*m/2+w/2;
		var y=this.y*m/2+h/2;
		return new AbsoluteVector(x,y)
	}},
});


var HexVector=function HexVector(a,b){
	this.a=a; this.b=b;
};
HexVector.prototype=Object.create(Object.prototype,{
	constructor:{value:HexVector},
	toString:{value:function(){return this.a+','+this.b}},
	toRelative:{value:function(r){
		var x=3*this.a*r;
		var y=2*Math.sqrt(3)*r*(this.b+0.5*this.a);
		return new RelativeVector(x,y)
	}},
	toAbsolute:{value:function(w,h,r) {
		return this.toRelative(r).toAbsolute(w,h)
	}},
});
