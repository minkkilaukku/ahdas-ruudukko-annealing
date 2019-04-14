
class Grid {
    constructor(m, n, nums) {
        this.m = m;
        this.n = n;
        this.placing = {};
        this.board = this.makeBoard();
    }
    
    
    clearNum(num) {
        num = num.toString();
        if (!(num in this.placing)) return;
        let [i, j] = this.placing[num].place;
        const [di, dj] = this.placing[num].dir;
        for (let c of num) {
            let ind = this.board[i][j].indexOf(c);
            this.board[i][j].splice(ind, 1);
            i += di;
            j += dj;
        }
        delete this.placing[num];
    }
    
    setNum(num, place, dir) {
        num = num.toString();
        if (num in this.placing) this.clearNum(num);
        this.placing[num] = {place, dir};
        let [i, j] = place;
        const [di, dj] = dir;
        for (let c of num) {
            this.board[i][j].push(c);
            i += di;
            j += dj;
        }
    }
    
    
    
    takeRandStep() {
        const num = Grid.NUMS[randInt(0, Grid.NUMS.length-1)];
        const {place, dir} = Grid.getRandPlacing(num);
        const prev = this.placing[num];
        this.setNum(num, place, dir);
        return {onReject: ()=>{this.setNum(num, prev.place, prev.dir);},
               onAccept: ()=>{}};
    }
    
    
    /**Put the placings on a mxn board (2d-array).
    * Entry is an array of digits that land there (counting also same multiple times)
    */
    makeBoard() {
        const a = (new Array(this.m).fill(null)
                .map(()=>new Array(this.n).fill(null)
                .map(()=>[])));
        for (let numS in this.placing) {
            let [di, dj] = this.placing[numS].dir;
            let [i, j] = this.placing[numS].place;
            for (let c of numS) {
                a[i][j].push(c);
                i += di;
                j += dj;
            }
        }
        return a;
    }
    
    getEnergy() {
        let s = 0;
        const a = this.makeBoard();
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                if (a[i][j].length<2) continue;
                let {el, count} = getMostFrequent(a[i][j]);
                s += a[i][j].length-count;
            }
        }
        return s;
    }
    
    toString() {
        return this.makeBoard().map(row=>row.map(x=>(x&&x.length)?x[0]:'_').join("")).join("\n");
    }
    
    makeHTMLElem() {
        const a = this.board;
        const getMax = arr=>Math.max.apply(Math, arr);
        const maxLen = getMax(a.map(r=>getMax(r.map(x=>x.length||0))));
        const getFillStyle = (i, j) => {
            if (a[i][j].length<2) return "rgba(0,0,0,0.7)";
            let {count} = getMostFrequent(a[i][j]);
            return `rgba(${Math.floor(255*(a[i][j].length-count)/maxLen)}, 0, 0, 0.7)`;
        };
        const c = document.createElement("canvas");
        c.classList.add("grid");
        const cellW = (Grid.CANVAS_CELL_W || 40);
        const cellH = (Grid.CANVAS_CELL_H || 40);
        c.width = cellW * this.m;
        c.height = cellW * this.n;
        const ctx = c.getContext("2d");
        ctx.font = (0.95*cellW)+"px Helvetica";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                if (a[i][j] !== null) {
                    ctx.fillStyle = getFillStyle(i, j);
                    for (let digit of a[i][j]) {
                        ctx.fillText(digit, (i+0.5)*cellW, (j+0.5)*cellH, cellW);
                    }
                }
            }
        }
        
        const ret = document.createElement("div");
        ret.classList.add("gridEl");
        ret.appendChild(c);
        /*
        const infoEl = document.createElement("p");
        infoEl.innerHTML = this.fitness.toFixed(7);
        ret.appendChild(infoEl);
        */
        return ret;
    }
}

Grid.cleanNums = luvut => {
    const pal = [];
    for (let x of luvut) {
        const xStr = x.toString(10);
        if (pal.every(y=>y.toString(10).indexOf(xStr)<0)) {
            pal.push(x);
        }
    }
    return pal;
};

/** Set grid size mxn and squares upto k^2 */
Grid.setParams = (m, n, k) => {
    Grid.M = m;
    Grid.N = n;
    Grid.K_UPTO = k;
    Grid.NUMS = Grid.cleanNums(new Array(k).fill(null).map((_,i)=>(i+1)**2).reverse());
};

Grid.setParams(4, 5, 20);

Grid.DIRS = [ [-1,-1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1,-1], [1, 0], [1, 1] ];
Grid.DIRS_0 = [ [-1, 0], [1, 0] ];
Grid.DIRS_1 = [ [0, -1], [0, 1] ];

Grid.getRandDir = (numLen) => {
    if (numLen>Grid.N) return Grid.DIRS_0[randInt(0, Grid.DIRS_0.length-1)];
    if (numLen>Grid.M) return Grid.DIRS_1[randInt(0, Grid.DIRS_1.length-1)];
    return Grid.DIRS[randInt(0, Grid.DIRS.length-1)];
}

Grid.getRandPlacing = num => {
    const numS = num.toString();
    const numLen = numS.length;
    const dir = Grid.getRandDir(numLen);
    const i0 = randInt(dir[0]<0 ? numLen-1 : 0, dir[0]>0 ? Grid.M-numLen : Grid.M-1);
    const j0 = randInt(dir[1]<0 ? numLen-1 : 0, dir[1]>0 ? Grid.N-numLen : Grid.N-1);
    return {place: [i0, j0], dir: dir};
};

Grid.makeRand = () => {
    const r = new Grid(Grid.M, Grid.N, Grid.NUMS);
    r.placing = {};
    for (let num of Grid.NUMS) {
        let {place, dir} = Grid.getRandPlacing(num);
        r.setNum(num, place, dir);
    }
    return r;
};

Grid.getStartT = () => {
    let s = 0;
    let n = 10;
    for (let i=0; i<n; i++) {
        let g = Grid.makeRand();
        s += g.getEnergy();
    }
    return s/n;
};



