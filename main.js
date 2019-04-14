let stopOnCells = 4*5; //amount of cells that's accepted as a optimal solution
Grid.setParams(20);
Grid.CANVAS_CELL_W = 20;
Grid.CANVAS_CELL_H = 20;

let tickWait = 0;
let stepsPerTick = 10;

const sa = new SimAnneal(Grid);
sa.stopCond = function() {
    return this.el.m*this.el.n <= stopOnCells;
};
sa.onStop = () => {
    if (contAnneal) {
        stopAnneal();
    }
    console.log("Answer found in iteration "+sa.iteration);
    console.log(sa.el.toString());
};

const view = document.createElement("div");
document.body.appendChild(view);

view.update = function() {
    this.innerHTML = "";
    this.appendChild(sa.el.makeHTMLElem());
};

const infoText = document.createElement("p");
infoText.update = () => {
    infoText.innerHTML = ("Iteration: "+sa.iteration
                        +"<br/>Moves: "+sa.moves
                          +"<br/>T: "+sa.T
                         +"<br/>Energy: "+sa.prevE);
};
infoText.update();
document.body.appendChild(infoText);


let contAnneal = false;

const step = function() {
    sa.step();
    view.update();
    infoText.update();
};

const startAnneal = () => {
    contAnneal = true;
    startButt.innerHTML = "running...";
    startButt.disabled = true;
    onceButt.disabled = true;
    stopButt.disabled = false;
    const tick = () => {
        for (let i=0; i<stepsPerTick; i++) {
            step();
            if (!contAnneal) break;
        }
        if (contAnneal) setTimeout(tick, tickWait);
    }
    setTimeout(tick, 0);
};

const stopAnneal = () => {
    contAnneal = false;
    stopButt.disabled = true;
    startButt.innerHTML = "start";
    startButt.disabled = false;
    onceButt.disabled = false;
};

const onceButt = document.createElement("button");
onceButt.innerHTML = "take one step";
onceButt.onclick = ()=> {
   step();   
};
document.body.appendChild(onceButt);

const startButt = document.createElement("button");
startButt.innerHTML = "start";
startButt.onclick = ()=> {startAnneal();};
document.body.appendChild(startButt);

const stopButt = document.createElement("button");
stopButt.innerHTML = "stop";
stopButt.onclick = ()=>{stopAnneal();};
stopButt.disabled = true;
document.body.appendChild(stopButt);


view.update();