
Grid.setParams(10, 15, 100);
Grid.CANVAS_CELL_W = 10;
Grid.CANVAS_CELL_H = 10;

let tickWait = 0;

const sa = new SimAnneal(Grid, 0);
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
        step();
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