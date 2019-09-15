import React from 'react';

class Cell extends React.Component {
    constructor(props) {
        super(props)
        this.element=React.createRef()
        this.el = undefined;
    }

    // this is a workaround for onClick not working in firefox
    componentDidMount() { 
        if(this.props.onClick !== undefined) {
            this.el = this.element.current
            this.el.addEventListener('click', this.props.onClick.bind(this)); 
        }
    }
    componentWillUnmount() { 
        if(this.el !== undefined) {
            this.el.removeEventListener('click', this.props.onClick.bind(this)); 
        }   
        this.el = undefined;
    }

    get q() { return this.props.q || 0; }
    get r() { return this.props.r || 0; }
    get revealed() { return this.props.revealed !== undefined ? this.props.revealed : false; }
    get flagged() { return this.props.flagged !== undefined ? this.props.flagged : false; }
    get exploded() { return this.props.exploded !== undefined ? this.props.exploded : false; }
    get count() { return this.props.count !== undefined ? this.props.count : 0; }
    get isBomb() { return this.count < 0;}

    get colour() { return this.props.colour !== undefined ? this.props.colour : "white"; }
    get position() { return this.props.position !== undefined ? this.props.position : [0, 0]; }
    get scale() { return this.props.scale !== undefined ? this.props.scale : 1; }
    get strokeWidth() { return this.props.strokeWidth !== undefined ? this.props.strokeWidth : 0.15 * this.scale; }

    makeHexagon(mask) {
        return (<path key="hexagon"
                   stroke="none"
                   mask={"url(#" + mask + ")"}
                   fill={this.colour}
                   strokeWidth={this.strokeWidth}
                   d='M1.00 0.00L0.50 0.87L-0.50 0.87L-1.00 0.00L-0.50 -0.87L0.50 -0.87Z' />);
    }

    makeFlag() {
        return (<path key="flag"
                      d='M-0.5 0.5L0.5 -0.5M0.5 0.5L-0.5 -0.5'
                      stroke='black'
                      strokeLinecap='round'
                      strokeWidth={this.strokeWidth} />)
    }

    makeBomb() {
        return (<path key="bomb"
                      d='M0 0.6L0 -0.6M0.52 0.3 L-0.52 -0.3M-0.52 0.3 L0.52 -0.3'
                      stroke='black'
                      strokeLinecap='round'
                      strokeWidth={this.strokeWidth} />)

    }

    makeBombCount() {
        var children = [];

        for(var i=0; i<this.count; i++) {
            var rotation = 180 + 360 * i / this.count;
            children.push((<path d='M0 0.4L-0.15 0.1L0.15 0.1Z'
                                 key={i}
                                 transform={`rotate(${rotation})`}
                                 stroke='black'
                                 strokeWidth={this.strokeWidth} />))
        }
        return (<g key="bomb count">{children}</g>);
    }

    makeCircle() {
        return (<circle r={0.5}
                        cx={0}
                        cy={0}
                        key={0}
                        fill="none"
                        stroke='black'
                        strokeWidth={this.strokeWidth} />)
    }


    render() {
        var mask_children = [<rect key="bg" x="-2" y="-2" width="4" height="4" fill="white"/>];
        var className = "cell"
        var maskId = `circleMask_${this.q}_${this.r}_${Math.random()}`;

        if(this.flagged) {
            mask_children.push(this.makeFlag());
            mask_children.push(this.makeCircle());
            className += " flagged"
        } else if(this.revealed) {
            className += " revealed"
            if(this.isBomb) {
                className += " bomb"
                mask_children.push(this.makeBomb())
            } else {
                mask_children.push(this.makeCircle());
                mask_children.push(this.makeBombCount())
            }
        }

        var children = [
            this.makeHexagon(maskId),
            (<mask key="mask" id={maskId}>{mask_children}</mask>)
        ];

        var scale = this.scale;
        if(this.exploded) {
            scale *= 0.5;
        }

        return (<g ref={this.element}
                   className={className}
                   style={{cursor: "pointer"}}
                   transform={`translate(${this.position.join(',')}), scale(${scale})`}>
                    {children}
                </g>)
    }
}

class CellGrid extends React.Component {
    get getColour() { return this.props.getColour !== undefined ? this.props.getColour : () => "white"; }
    get onActivate() { return this.props.onActivate !== undefined ? this.props.onActivate : () => undefined; }

    get scale() { return this.props.scale !== undefined ? this.props.scale : 1; }
    get innerScale() { return this.props.innerScale !== undefined ? this.props.innerScale : 0.9 }
    get radius() { return this.props.radius !== undefined ? this.props.radius : 2; }
    get padding() { return this.props.padding !== undefined ? this.props.padding : 1; }

    render() {
        var w = this.scale * Math.sqrt(3) * (2 * (this.radius) + 1 + 2 * this.padding);
        var viewBox = `-${w/2.} -${w/2.} ${w} ${w}`

        var elements = Object.values(this.props.cells).map(cell => {
            var q = cell.q;
            var r = cell.r;
            var key = q + "," + r;
            var x = this.scale * 3./2 * q;
            var y = this.scale * (Math.sqrt(3) * r + Math.sqrt(3)/2 * q);
            return (
                    <Cell key={key}
                          {...cell}
                          colour={this.getColour(cell, this.radius)}
                          position={[x, y]}
                          scale={this.innerScale}
                          onClick={() => this.onActivate(key)}/>
            )
        });
                
        return (<svg viewBox={viewBox} className="hueRotate">
            <g>{elements}</g>
        </svg>)
    }
}

export {Cell, CellGrid};
export default CellGrid;


