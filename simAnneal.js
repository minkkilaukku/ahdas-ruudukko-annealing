class SimAnneal {
    constructor(elClass) {
        this.elClass = elClass;
        this.el = elClass.makeRand();
        this.prevE = this.el.getEnergy();
        this.T = elClass.getStartT();
        this.reduceFactor = 0.99;
        this.iteration = 0;
        this.moves = 0;
        this.stopCond = null;
        this.onStop = null;
    }
    
    reduceT() {
        this.T *= this.reduceFactor;
    }
    
    step() {
        let prevE = this.el.getEnergy();
        const cb = this.el.takeRandStep();
        //TODO could get E from the takeRandStep, so don't need to getEnergy
        //and possibly the element doesn't even physically take the step untill onAccept()
        this.iteration++;
        const E = this.el.getEnergy();
        const dE = E-this.prevE;
        if (dE<0 || randBool(SimAnneal.getProb(dE, this.T))) {
            cb.onAccept();
            this.moves++;
            this.prevE = E;
            if (typeof this.stopCond && this.stopCond()) {
                if (typeof this.onStop === "function") {
                    this.onStop();
                }
            } else {
                this.reduceT();
            }
        } else {
            cb.onReject();
        }
    }
    
}

SimAnneal.getProb = (dE, T) => {
    return Math.exp(-dE/T);
};