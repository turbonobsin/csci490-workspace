class Obj{
    constructor(x,y,vx,vy,c){
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.c = c;
    }
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    c = [0,0,0,1];

    run(){
        this.x += this.vx;
        this.y += this.vy;
    }
}

/**@type {Obj[]} */
let objs = [];

function gen(){
    for(let i = 0; i < 1000; i++){
        objs.push(new Obj(
            Math.random()*can.width,
            Math.random()*can.height,
            Math.random()-0.5,
            Math.random()-0.5,
            [
                Math.random(),
                Math.random(),
                Math.random(),
                1
            ]
        ));
    }
}