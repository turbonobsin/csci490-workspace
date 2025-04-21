let n = 5.3;

function calc(){
    let s = "";
    console.log("convert: ",n.toString(2));
    
    
    for(let i = 0; i < 64; i++){
        let v = n & 1;
        n >>= 1;
        // s += v;
        s = v+s;
    }
    console.log(s);

}
calc();