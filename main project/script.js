const canvas = document.getElementById("mainCanvas");
const canvasCtx = canvas.getContext("2d");
canvasCtx.fillRect(0, 0, 100, 100);

/*class Vector2{
    x;
    y;
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
}

class Rect{
    position;
    size;
    constructor(position = new Vector2(), size = new Vector2(10, 10)){
        this.position = position;
        this.size = size;
    }
    draw(){
        canvasCtx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

function process(){
    var r = new Rect();
    r.draw();
    setTimeout(process, 1000/60);
}

function init(){
    canvasCtx.fillRect(0, 0, 100, 100)
    //process();
}
init();*/