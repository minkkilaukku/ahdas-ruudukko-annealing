
class Grid {
    /** Make grid with starting size mxn.
    * The given dimensions will also be set as the wanted ones
    */
    constructor(m, n) {
        this.m = m;
        this.n = n;
        this.wantM = m;
        this.wantN = n;
        this.placing = {};
        this.board = this.makeBoard();
    }
    
    findFreePlacingOnBoard(num) {
        for (let dir of Grid.DIRS) {
            for (let i=0; i<this.m; i++) {
                for (let j=0; j<this.n; j++) {
                    let [x, y] = [i, j];
                    let wasOk = true;
                    for (let c of num) {
                        if (x<0 || x>=this.m || y<0 || y>=this.n
                            || (this.board[x][y].length && c!==this.board[x][y][0]) ) {
                            wasOk = false;
                            break;
                        }
                        x += dir[0];
                        y += dir[1];
                    }
                    if (wasOk) return {place: [i, j], dir: dir};
                }
            }
        }
        return null;
    }
    
    
    findFreePlacing(num) {
        num = num.toString();
        let p = this.findFreePlacingOnBoard(num);
        if (p) return p;
        if (this.n>this.m) {
            return {place: [this.m, 0], dir: [0, 1]};
        } else {
            return {place: [0, this.n], dir: [1, 0]};
        }
    }
    
    makeNewRow() {
        this.board.push(new Array(this.n).fill(null).map(()=>[]));
        this.m += 1;
    }
    
    makeNewColumn() {
        if (this.m===0) { //if empty, have to create also the first row
            this.board.push([]);
            this.m = 1;
        }
        
        for (let i=0; i<this.m; i++) {
            this.board[i].push([]);
        }
        this.n += 1;
    }
    
    removeRow() {
        if (this.m>0) {
            this.board.pop();
            this.m -= 1;
        } else if (this.m===1) {
            this.board = [];
            this.m = 0; 
            this.n = 0;
        }
    }
    
    removeColumn() {
        if (this.n>1) {
            for (let i=0; i<this.m; i++) {
                this.board[i].pop();
            }
            this.n -= 1;
        } else if (this.n===1) { //if removing last column, make it empty
            this.board = [];
            this.m = 0;
            this.n = 0;
        }
    }
    
    checkClearEdges() {
        //columns
        let wasClear = true;
        while (wasClear && this.n>0) {
            let endJ = this.n-1;
            for (let i=0; i<this.m; i++) {
                if (this.board[i][endJ].length) {
                    wasClear = false;
                    break;
                }
            }
            if (wasClear) {
                this.removeColumn();
            }
        }
        
        //rows
        wasClear = true;
        while (wasClear && this.m>0) {
            let endI = this.m-1;
            for (let j=0; j<this.n; j++) {
                if (this.board[endI][j].length) {
                    wasClear = false;
                    break;
                }
            }
            if (wasClear) {
                this.removeRow();
            }
        }
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
    
    /** Set the number num placing starting from place and going to direction dir.
    * The number can go off the current board in the positive direction (in which case
    * the board is expanded), but not in the negative.
    */
    setNum(num, place, dir) {
        num = num.toString();
        if (num in this.placing) this.clearNum(num);
        this.placing[num] = {place, dir};
        let [i, j] = place;
        const [di, dj] = dir;
        
        //make room
        const mostLeft = Math.max(j, j+dj*num.length-1);
        if (mostLeft>=this.n) {
            for (let k=0,kEnd=mostLeft-this.n; k<=kEnd; k++) this.makeNewColumn();
        }
        const mostBottom = Math.max(i, i+di*num.length-1);
        if (mostBottom>=this.m) {
            for (let k=0,kEnd=mostBottom-this.m; k<=kEnd; k++) this.makeNewRow();
        }
        
        for (let c of num) {
            this.board[i][j].push(c);
            i += di;
            j += dj;
        }
    }
    
    
    clashesWith(num1, num2) {
        let [i1, j1] = this.placing[num1].place;
        let dir1 = this.placing[num1].dir;
        let [i2, j2] = this.placing[num2].place;
        let dir2 = this.placing[num2].dir;
        //TODO check the intersection more efficiently
        
        for (let c1 of num1) {
            [i2, j2] = this.placing[num2].place;
            for (let c2 of num2) {
                if (i1===i2 && j1===j2 && c1!==c2) return true;
                i2 += dir2[0];
                j2 += dir2[1];
            }
            i1 += dir1[0];
            j1 += dir1[1];
        }
        return false;
    }
    
    
    takeRandStep() {
        const num = Grid.NUMS_S[randInt(0, Grid.NUMS.length-1)];
        const {place, dir} = Grid.getRandPlacing(num, this.m, this.n);
        const prev = this.placing[num];
        const numS = num.toString();
        this.setNum(numS, place, dir);
        const clearedNums = Grid.NUMS_S.filter(x=>this.clashesWith(numS, x));
        const prevClearedPs = clearedNums.map(x=>this.placing[x]);
        for (let x of clearedNums) {
            this.clearNum(x);
        }
        for (let x of clearedNums) {
            let p = this.findFreePlacing(x);
            this.setNum(x, p.place, p.dir);
        }
        
        this.checkClearEdges();
        
        return {onReject: ()=>{
            for (let i=0; i<prevClearedPs.length; i++) {
                let p = prevClearedPs[i];
                this.setNum(clearedNums[i], p.place, p.dir);
            }
            this.setNum(num, prev.place, prev.dir);
            this.checkClearEdges();
        },
            onAccept: ()=>{}
        };
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
    
    
    countAverageFill() {
        let s = 0; // = Grid.NUMS_S.reduce((cumu, x)=>cumu+x.length, 0);
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                s += this.board[i][j].length;
            }
        }
        return s/(this.m*this.n);
    }
    
    countCompactness() {
        let s = 0;
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                s += (this.m-i)*(this.n-j)*this.board[i][j].length;
            }
        }
        return 4*s/(this.m*(this.m+1)*this.n*(this.n+1));
    }
    
    countOverFill() {
        let s = 0;
        for (let i=this.wantM; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                s += i*this.board[i][j].length**2;
            }
        }
        for (let i=0; i<this.wantM; i++) {
            for (let j=this.wantN; j<this.n; j++) {
                s += j*this.board[i][j].length**2;
            }
        }
        return s;
    }
    
    getEnergy() {
        return this.countOverFill();
        /*
        const a = this.board;
        let s1 = 0;
        const lastJ = this.n-1;
        for (let i=0; i<this.m; i++) {
            s1 += a[i][lastJ].length;
        }
        let s2 = 0;
        const lastI = this.m-1;
        for (let j=0; j<this.n; j++) {
            s2 += a[lastI][j].length;
        }
        //TODO what formula to use?
        let ret = 0;
        ret += this.m*this.n;
        ret +=  9.93*(s1 + s2);
        ret += 20/(1+2*this.countCompactness());
        return ret;
        */
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

/** Set squares upto k^2  and the wanted solution size mxn */
Grid.setParams = (m,n,k) => {
    Grid.K_UPTO = k;
    Grid.NUMS = Grid.cleanNums(new Array(k).fill(null).map((_,i)=>(i+1)**2).reverse());
    Grid.NUMS_S = Grid.NUMS.map(num=>num.toString());
    Grid.M = m;
    Grid.N = n;
};

Grid.setParams(4,5,20);

Grid.DIRS = [ [-1,-1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1,-1], [1, 0], [1, 1] ];
Grid.DIRS_0 = [ [-1, 0], [1, 0] ];
Grid.DIRS_1 = [ [0, -1], [0, 1] ];


/** Get dir [di, dj] at random for a number of length numLen on mxn board. */
Grid.getRandDir = (numLen, m, n) => {
    if (numLen>n) return Grid.DIRS_0[randInt(0, Grid.DIRS_0.length-1)];
    if (numLen>m) return Grid.DIRS_1[randInt(0, Grid.DIRS_1.length-1)];
    return Grid.DIRS[randInt(0, Grid.DIRS.length-1)];
}

/** Get {place, dir} at random on mxn board. */
Grid.getRandPlacing = (num, m, n) => {
    const numS = num.toString();
    const numLen = numS.length;
    const dir = Grid.getRandDir(numLen);
    const i0 = randInt(dir[0]<0 ? numLen-1 : 0, dir[0]>0 ? m-numLen : m-1);
    const j0 = randInt(dir[1]<0 ? numLen-1 : 0, dir[1]>0 ? n-numLen : n-1);
    return {place: [i0, j0], dir: dir};
};

Grid.makeRand = () => {
    const r = new Grid(Grid.M, Grid.N);
    for (let num of Grid.NUMS.slice(0).sort(()=>Math.random()-0.5)) {
        let {place, dir} = r.findFreePlacing(num);
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


