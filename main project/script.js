const canvas = document.getElementById("mainCanvas");
const canvasCtx = canvas.getContext("2d");

function damp(from, to, amount, deltaTime){
    return (from - to) * amount ** deltaTime + to;
}

function log(text){
    document.getElementById("debug").innerHTML = text + "<br>" + document.getElementById("debug").innerHTML;
}

class Vector2{
    x;
    y;
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    multiplied(n){
        return new Vector2(this.x * n, this.y * n)
    }
    added(n){
        return new Vector2(this.x + n.x, this.y + n.y)
    }
    damped_toward(n, amount, deltaTime){
        return new Vector2(damp(this.x, n.x, amount, deltaTime), damp(this.y, n.y, amount, deltaTime))
    }
}

class Rect{
    position;
    size;
    velocity;
    constructor(position = new Vector2(), size = new Vector2(10, 10)){
        this.position = position;
        this.size = size;
        this.velocity = new Vector2(0, 0);
    }
    update(deltaTime){
        this.position = this.position.added(this.velocity.multiplied(deltaTime));
    }
    draw(){
        canvasCtx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

function drawObjects(objects){
    for(let i in objects){
        if(objects[i] instanceof Array){
            drawObjects(objects[i]);
        } else{
            objects[i].draw();
        }
    }
}

function updateObjects(objects, deltaTime){
    for(let i in objects){
        if(objects[i] instanceof Array){
            drawObjects(objects[i]);
        } else{
            objects[i].update(deltaTime);
        }
    }
}

let globalInputs = [];
document.addEventListener("keydown", event =>{
    for(let i in globalInputs){
        if(globalInputs[i] == event.code){
            return
        }
    }
    globalInputs.push(event.code)
});
document.addEventListener("keyup", event =>{
    for(let i in globalInputs){
        if(globalInputs[i] == event.code){
            globalInputs.splice(i, 1);
            return
        }
    }
});

class PlayerCharacter extends Rect{
    Actions = {
        left: false,
        right: false,
        jump: false,
    }; 
    constructor(position = new Vector2(), size = new Vector2(10, 20)){
        super(position, size);
    }
    update(deltaTime){
        this.Actions.left = false;
        this.Actions.right = false;
        for(let i in globalInputs){
            if(globalInputs[i] == "ArrowLeft"){
                this.Actions.left = true;
                continue
            }
            if(globalInputs[i] == "ArrowRight"){
                this.Actions.right = true;
                continue
            }
        }
        this.velocity.x = damp(this.velocity.x, 100 * (this.Actions.right - this.Actions.left), 0.1, deltaTime)
        super.update(deltaTime);
    }
    draw(){
        super.draw();
    }
}

let character = new PlayerCharacter(new Vector2(100, 200));
let worldObjects = [character, new Rect(new Vector2(200, 210))];
worldObjects[0].velocity = new Vector2(0, 0);
function process(prevTime){
    const deltaTime = (new Date().getTime() - prevTime)/1000;
    prevTime = new Date().getTime();
    canvasCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawObjects(worldObjects);
    updateObjects(worldObjects, deltaTime);
    setTimeout(() => {
        process(prevTime);
    }, 1000/60);
}

function init(){
    process(new Date().getTime());
}
init();
