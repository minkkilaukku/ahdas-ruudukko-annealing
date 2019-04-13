const randInt = (a, b)=>a+Math.floor(Math.random()*(b-a+1));
const randIntW = (a, b, w)=>a+Math.floor(Math.random()**w*(b-a+1));
const randBool = (prob)=>Math.random()<prob;

const getMostFrequent = arr => {
    const counts = {};
    let maxF = 0;
    let maxEl = undefined;
    for (let x of arr) {
        if (!counts[x]) counts[x] = 0;
        counts[x] += 1;
        if (counts[x]>maxF) {
            maxF = counts[x];
            maxEl = x;
        }
    }
    return {el: maxEl, count: counts[maxEl]};
};