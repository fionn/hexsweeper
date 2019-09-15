import React from 'react';
import {Cell, CellGrid} from './hexsweeper.js';
import './App.css';
import {MdMenu, MdHelp, MdHelpOutline, MdFlag, MdFingerprint,MdArrowForward, MdAutorenew, MdKeyboardArrowLeft, MdKeyboardArrowRight} from 'react-icons/md';
import Chance from 'chance';

function FullScreen(props) {
    return (<div style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
        {props.children}
    </div>)
}

function Center(props) {
    return (<div style={{margin: "0", position: "absolute", top: "50%", left: "50%", transform: 'translate(-50%, -50%)'}}>
        <div style={{display: 'inline-block'}}>
            {props.children}
        </div>
    </div>)
}

function FitScreen(props) {
    return (<div style={{width: '100vmin', height: '100vmin', position: "relative"}}>
        {props.children}
    </div>)
}

function softVariableColour(cell, radius, i) {
    var Q = 0.5 + 0.5 * cell.q / (radius + 2);
    var R = 0.5 + 0.5 * cell.r / (radius + 2);
    var S = Math.abs(Q + R) / 2.0;
    if(cell.revealed) {
        Q = 1 - Q;
        R = 1 - R;
        S = 1 - S;
        if(cell.count < 0) {
            Q = Q / 2.;
            R = R / 2.;
            S = S / 2.;
        }
    } else if(cell.flagged) {
        Q = Q / 2.;
        R = R / 2.;
        S = S / 2.;
    }
    return `rgb(${255 * Q},${255 * R}, ${255 * S})`;
}

function IconButton(props) {
    var style = {
         display: 'inline-block',
         background: 'rgba(0, 0, 0, 0.5)',
         cursor: 'pointer',
         padding: '0.25em 0.5em',
    };

    var child = new props.type({
        size: "2em",
         color: props.color,
    });

    return (<div className={props.className} style={style} onClick={props.onClick}>{child}</div>);
}

function Slide(props) {
    if(!props.display)
        return null;

    var cells = null;
    if(props.cells !== undefined)
        cells = props.cells.map((c, i) => {
            return (
            <svg key={i} viewBox="-1 -1 2 2" width="4em" height="4em">
                <Cell fill="white" q={0} r={0} {...c}/>
            </svg>)
        });

    var next=null;
    if(props.next) {
        next = (<IconButton type={MdKeyboardArrowRight} onClick={() => props.next()}/>)
    }

    var prev=null;
    if(props.prev) {
        prev = (<IconButton type={MdKeyboardArrowLeft} onClick={() => props.prev()}/>)
    }


    return (<div style={{display: "flex", width:"100%", height:"100%",
                         justifyContent: "center",
                         alignContent: "center"}}>
        <div style={{width: "50%", height: "50%", textAlign: "center",
                     marginTop: "auto", marginBottom: "auto"}}>
            {cells}
            {props.children}
            <div>
                {prev}
                {next}
            </div>
        </div>
    </div>)
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            radius: 4,
            seed: new Date().getTime(),
            showHelp: false,
            activeTool: 'reveal',
            cells: {},
            bombRatio: 0.3,
            showNext: false,
            helpSlide: 0,
        }

        this.toggleHelp = this.toggleHelp.bind(this);
        this.onActivate = this.onActivate.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.setSlide = this.setSlide.bind(this);
    }

    toggleHelp() {
        this.setState({
            helpSlide: 0,
            showHelp: !this.state.showHelp,
        });
    }

    initiateGame() {
        var chance = new Chance(this.state.seed);

        var cells = {}
        for(var q=-this.state.radius; q<=this.state.radius; q++)
            for(var r=Math.max(-this.state.radius, -q -this.state.radius); r<=Math.min(this.state.radius, -q + this.state.radius); r++)
                cells[q + ',' + r] = {q: q, r: r, 'count': 0, 'flagged': false, 'revealed': false, 'exploded': false}

        var bombs = chance.pickset(Object.keys(cells), Math.floor(this.state.bombRatio * Object.keys(cells).length));
        bombs.forEach(b => {
            cells[b].count = -1
            var p = b.split(',').map(x => parseInt(x));
            [
                [+1, 0], [+1, -1], [0, -1],
                [-1, 0], [-1, +1], [0, +1],
            ].forEach(o => {
                var P = [p[0] + o[0], p[1] + o[1]]
                var key = P.join(',')
                if(cells[key] !== undefined && cells[key].count !== -1)
                    cells[key].count += 1
            });
        });

       this.setState({
            cells: cells,
            showNext: false,
        });
    }

    isGameOver() {
        var bombCount = 0;
        var flagged_bombs = 0;
        var unrevealed_cells = 0;
        var revealed_bombs = 0;
        for(var cell of Object.values(this.state.cells)) {
            if(cell.count < 0)
                bombCount += 1

            if(cell.flagged && cell.count >= 0)
                return false;

            if(cell.flagged && cell.count < 0)
                flagged_bombs += 1;

            if(!cell.revealed && !cell.flagged)
                unrevealed_cells += 1;

            if(cell.revealed && cell.count < 0)
                revealed_bombs += 1;
        }

        if(flagged_bombs + revealed_bombs === bombCount)
            return true;

        if(bombCount - flagged_bombs - revealed_bombs === unrevealed_cells)
            return true

        return false;
    }


    onActivate(key) {
        if(this.state.activeTool === 'reveal') 
            this.revealCell(key)
        else if(this.state.activeTool === 'flag')
            this.toggleFlag(key)
        if(this.isGameOver()) {
            this.setState({
                showNext: true,
            });
        }
    }

    toggleFlag(key) {
        var cells = {...this.state.cells};
        if(!cells[key].revealed) {
            cells[key].flagged = !cells[key].flagged;
            this.setState({cells: cells});
        }
    }

    revealCell(key) {
        var cells = {...this.state.cells};
        if(!cells[key].revealed && !cells[key].flagged) {
            cells[key].revealed = true;
            function propagateEmpty(p) {
                [
                    [+1, 0], [+1, -1], [0, -1],
                    [-1, 0], [-1, +1], [0, +1],
                ].forEach(o => {
                    var key = `${p.q + o[0]},${p.r + o[1]}`;
                    var cell = cells[key]
                    if(cell !== undefined && !cell.revealed && !cell.count >= 0 && !cell.flagged) {
                         cell.revealed = true
                         if(cell.count === 0)
                             propagateEmpty(cell)
                    }
                });
            }

            function propagateBomb(p) {
                [
                    [+1, 0], [+1, -1], [0, -1],
                    [-1, 0], [-1, +1], [0, +1],
                ].forEach(o => {
                    var key = `${p.q + o[0]},${p.r + o[1]}`;
                    var cell = cells[key]
                    if(cell !== undefined && !cell.revealed && !cell.flagged) {
                         cell.revealed = true
                         cell.exploded = true
                         if(cell.count < 0)
                             propagateBomb(cell)
                    }
                });
            }

            if(cells[key].count === 0) {
                propagateEmpty(cells[key]);
            }

            if(cells[key].count < 0) {
                cells[key].exploded = true;
                propagateBomb(cells[key]);
            }
            this.setState({cells: cells});

        }
    }

    setTool(tool) {
        this.setState({
            activeTool: tool
        });
    }

    startNewGame() {
        this.setState({
            seed: new Date().getTime(),
        }, () => {
            this.initiateGame();
        })
    }

    componentDidMount() {
        document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });
        this.initiateGame();
    }

    setSlide(i) {
        this.setState({
            helpSlide: i
        });
    }

    render() {
        var help = null;
        if(this.state.showHelp) {
            help = (<div style={{position: "absolute",
                                 top: 0,
                                 background: "black", width: "100%", height: "100%" }}>

                <Slide display={this.state.helpSlide == 0} cells={[{}]}
                       next={() => this.setSlide(1)}>
                    <div>
                        This is an "unrevealed" cell.
                        It may or may not be hiding a bomb.
                        You can reveal the contents of a cell by clicking/tapping it.
                        The goal of this game is to either flag all unrevealed bombs, or to reveal all non-bomb cells.
                    </div>
                </Slide>

                <Slide display={this.state.helpSlide == 1} cells={[
                        {revealed: true, count: 0, flagged: false},
                        {revealed: true, count: 1, flagged: false},
                        {revealed: true, count: 2, flagged: false},
                        {revealed: true, count: 3, flagged: false},
                        {revealed: true, count: 4, flagged: false},
                        {revealed: true, count: 5, flagged: false},
                        {revealed: true, count: 6, flagged: false, scale:1},
                    ]}
                    prev={() => this.setSlide(0)}
                    next={() => this.setSlide(2)}>

                    <div>
                        These are "revealed" cells that didn't hide a bomb.
                        The shape inside the cell indicates the number of bomb in the neighbouring cells, from 0 to 6.
                        In general, the number of triangles indicates the number of neighbours with bomb.
                        Using these, you can sometimes deduce if a specific neighbour hides a bomb.
                    </div>
                </Slide>

                <Slide display={this.state.helpSlide == 2} cells={[
                        {revealed: false, count: 0, flagged: true},
                    ]}
                    prev={() => this.setSlide(1)}
                    next={() => this.setSlide(3)}>

                    <div>
                        This is a "flagged" cell.
                        You can flag cells by clicking the <span><MdFlag /></span> icon in the bottom left.
                        This will switch to "flag" mode, and any cells you click/tap will be flagged.
                        You can return to "reveal" mode by clickgin the <span><MdFingerprint /></span> button in the bottom right.
                    </div>
                </Slide>

                <Slide display={this.state.helpSlide == 3} cells={[
                        {revealed: true, count: -1, flagged: false},
                    ]}
                    prev={() => this.setSlide(2)}
                    next={() => this.setSlide(4)}>

                    <div>
                        This is a revealed "bomb" cell.
                        They will reveal and "explode" neighbouring cells.
                        This can lead to a chain reaction!
                        Exploded cells will appear as small cells.
                    </div>
                </Slide>



                <Slide display={this.state.helpSlide == 4} 
                    prev={() => this.setSlide(3)}>

                    <div>
                        You can start a new game by clicking the <span><MdAutorenew /></span>, unless
                        you've finished the current game, in which case you will see the <span><MdArrowForward /></span> button.
                        Either can be located in the center of the bottom of the screen.
                    </div>
                </Slide>

                <IconButton type={MdHelp}
                            className="topRight"
                            onClick={this.toggleHelp}
                            color="white"/>



            </div>)
        }

        var score = Object.values(this.state.cells).reduce((o,v,i) => {
            if(v.exploded)
                return o
            return o + 1
        }, 0) * 100 / Object.keys(this.state.cells).length;

        var scoreElement = null;
        if(this.state.showNext)
            scoreElement = (<div className="top" color="white">
                score: {score.toFixed(2)}%
            </div>)

        return (<div className="App">
            <FullScreen>
                <Center>
                    <FitScreen>
                        <CellGrid innerScale={0.9}
                                  radius={this.state.radius}
                                  cells={this.state.cells}
                                  getColour={softVariableColour}
                                  onActivate={this.onActivate}/>
                    </FitScreen>
                </Center>
            </FullScreen>

            <IconButton type={MdFingerprint}
                        className="bottomRight"
                        onClick={() => this.setTool("reveal")}
                        color={this.state.activeTool === 'reveal' ? "green" : "white"}/>

            <IconButton type={MdFlag}
                        className="bottomLeft"
                        onClick={() => this.setTool("flag")}
                        color={this.state.activeTool === 'flag' ? "green" : "white"}/>

            <IconButton type={this.state.showNext ? MdArrowForward : MdAutorenew}
                        className="bottom"
                        onClick={() => this.startNewGame()}
                        color="yellow"/>

            <IconButton type={MdMenu}
                        className="topLeft"
                        color="white"/>

            <IconButton type={MdHelpOutline}
                        className="topRight"
                        onClick={this.toggleHelp}
                        color="white"/>

            {scoreElement}
            {help}
        </div>);
    }
}

export default App;
