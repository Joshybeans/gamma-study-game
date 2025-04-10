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
    color;
    constructor(position = new Vector2(), size = new Vector2(10, 10), color = "black"){
        this.position = position;
        this.size = size;
        this.velocity = new Vector2(0, 0);
        this.color = color;
    }
    update(deltaTime){
        this.position = this.position.added(this.velocity.multiplied(deltaTime));
    }
    collide(objects){
    }
    draw(){
        canvasCtx.fillStyle = this.color;
        canvasCtx.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

class PlayerCharacter extends Rect{
    Actions = {
        left: false,
        right: false,
        jump: false,
        jumping: false,
    }; 
    onFloor = false;
    constructor(position = new Vector2(), size = new Vector2(10, 20), color = "blue"){
        super(position, size, color);
    }
    update(deltaTime){
        this.Actions.left = false;
        this.Actions.right = false;
        this.Actions.jump = false;
        this.Actions.jumping = false;
        for(let i in globalInputs){
            if(globalInputs[i].code == "ArrowLeft"){
                this.Actions.left = true;
                continue
            }
            if(globalInputs[i].code == "ArrowRight"){
                this.Actions.right = true;
                continue
            }
            if(globalInputs[i].code == "ArrowUp" && globalInputs[i].justPressed){
                this.Actions.jump = true;
                continue
            }
            if(globalInputs[i].code == "ArrowUp"){
                this.Actions.jumping = true;
                continue
            }

        }
        this.velocity.x = damp(this.velocity.x, 250 * (this.Actions.right - this.Actions.left), 0.01, deltaTime)
        this.velocity.y += 800 * deltaTime;
        if(this.Actions.jump && this.onFloor){
            this.velocity.y = -500;
        }
        if(!this.Actions.jumping && this.velocity.y < 0 && !this.onFloor){
            this.velocity.y /= 1.1
        }
        super.update(deltaTime);
    }
    collide(objects){
        let trueFloorIntersection = false;
        for(let i in objects){
            if(objects[i] instanceof QuestionBox){
                continue
            }
            if(queryIntersect(new Vector2(this.position.x, this.position.y + this.size.y), new Vector2(this.position.x, this.position.y + 15), new Vector2(objects[i].position.x, objects[i].position.y), new Vector2(objects[i].position.x + objects[i].size.x, objects[i].position.y)) || queryIntersect(new Vector2(this.position.x + this.size.x, this.position.y + this.size.y), new Vector2(this.position.x + this.size.x, this.position.y + 15), new Vector2(objects[i].position.x, objects[i].position.y), new Vector2(objects[i].position.x + objects[i].size.x, objects[i].position.y))){
                trueFloorIntersection = true;
            }
            if(this.position.x + this.size.x > objects[i].position.x && this.position.x < objects[i].position.x + objects[i].size.x && this.position.y + this.size.y > objects[i].position.y && this.position.y < objects[i].position.y + objects[i].size.y){
                let collisionRect = getCollisionRect(this, objects[i]);
                if(collisionRect.size.y >= collisionRect.size.x){
                    this.velocity.x = 0;
                    while(this.position.x + this.size.x > objects[i].position.x && this.position.x < objects[i].position.x + objects[i].size.x && this.position.y + this.size.y > objects[i].position.y && this.position.y < objects[i].position.y + objects[i].size.y){
                        this.position.x -= Math.sign(objects[i].position.x - this.position.x) * 0.1;
                    }
                } else{
                    this.velocity.y = 0;
                    while(this.position.x + this.size.x > objects[i].position.x && this.position.x < objects[i].position.x + objects[i].size.x && this.position.y + this.size.y > objects[i].position.y && this.position.y < objects[i].position.y + objects[i].size.y){
                        this.position.y -= Math.sign(objects[i].position.y - this.position.y) * 0.1;
                    }
                }
            }
        }
        this.onFloor = trueFloorIntersection;
    }
    draw(){
        super.draw();
    }
}

class QuestionBox extends Rect{
    text;
    textColor;
    hostile = false;
    speed;
    answerable;
    constructor(position = new Vector2(), size = new Vector2(10, 20), rectColor = "blue", text = "Text", answerable = true, textColor = "black", speed = 5000){
        super(position, size, rectColor);
        this.text = text;
        this.answerable = answerable;
        this.textColor = textColor;
        this.speed = speed;
    }
    collide(objects){
        if(this.hostile){
            for(let i in objects){
                if(objects[i] instanceof PlayerCharacter){
                    continue
                }
                if(this.position.x + this.size.x > objects[i].position.x && this.position.x < objects[i].position.x + objects[i].size.x && this.position.y + this.size.y > objects[i].position.y && this.position.y < objects[i].position.y + objects[i].size.y){
                    let collisionRect = getCollisionRect(this, objects[i]);
                    if(collisionRect.size.y >= collisionRect.size.x){
                        this.velocity.x = 0;
                        while(this.position.x + this.size.x > objects[i].position.x && this.position.x < objects[i].position.x + objects[i].size.x && this.position.y + this.size.y > objects[i].position.y && this.position.y < objects[i].position.y + objects[i].size.y){
                            this.position.x -= Math.sign(objects[i].position.x - this.position.x) * 0.1;
                        }
                    } else{
                        this.velocity.y = 0;
                        while(this.position.x + this.size.x > objects[i].position.x && this.position.x < objects[i].position.x + objects[i].size.x && this.position.y + this.size.y > objects[i].position.y && this.position.y < objects[i].position.y + objects[i].size.y){
                            this.position.y -= Math.sign(objects[i].position.y - this.position.y) * 0.1;
                        }
                    }
                }
            }
        } else if(this.answerable){
            if(this.position.x + this.size.x > mainCharacter.position.x && this.position.x < mainCharacter.position.x + mainCharacter.size.x && this.position.y + this.size.y > mainCharacter.position.y && this.position.y < mainCharacter.position.y + mainCharacter.size.y){
                answerQuestion(this.text);
            }
        }    
    }
    update(deltaTime){
        super.update(deltaTime);
        if(this.hostile){
            this.velocity = this.velocity.damped_toward((new Vector2(Math.sign(mainCharacter.position.x - this.position.x), Math.sign(mainCharacter.position.y - this.position.y)).multiplied(this.speed)), 0.9, deltaTime);
        } else{
            this.velocity = new Vector2(0, 0);
        }
    }
    draw(){
        super.draw();
        canvasCtx.fillStyle = this.textColor;
        canvasCtx.font = String(this.size.y) + "px Arial";
        let textMetrics = canvasCtx.measureText(this.text);
        canvasCtx.fillText(this.text, this.position.x, this.position.y + textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent, this.size.x);
    }
}

function onSegment(p,q,r){
    if(q.x <= Math.max(p.x,r.x) && q.x >= Math.min(p.x,r.x) &&
    q.y <= Math.max(p.y,r.y) && q.y >= Math.min(p.y,r.y)){
        return true;
    } else{
        return false;
    }
}

function tripletOrientation(p,q,r){
    let val = (q.y - p.y) * (r.x-q.x) - (q.x - p.x) * (r.y - q.y);

    if(val == 0) return 0; //collinear

    return (val > 0)? 1:2; //clock or counterclock wise
}

function queryIntersect(a1,a2,b1,b2){
    let o1 = tripletOrientation(a1,a2,b1);
    let o2  = tripletOrientation(a1,a2,b2);
    let o3 = tripletOrientation(b1,b2,a1);
    let o4 = tripletOrientation(b1,b2,a2);

    //general case
    if(o1 != o2 && o3 != o4) return true;

    //special cases
    if(o1 == 0 && onSegment(a1,b1,a2)) return true;

    if(o2 == 0 && onSegment(a1,q2,a2)) return true;

    if(o3 == 0 && onSegment(b1,a1,b2)) return true;

    if(o4 == 0 && onSegment(b1,a2,b2)) return true;

    return false;
}

function getCollisionRect(rect1, rect2){
    let collisionRect = new Rect();
    if(rect1.size.x < rect2.size.x){
        if(rect1.position.y > rect2.position.y){
            collisionRect.position.y = rect1.position.y;
            collisionRect.size.y = rect2.position.y + rect2.size.y - rect1.position.y;
        } else{
            collisionRect.position.y = rect2.position.y;
            collisionRect.size.y = rect1.position.y + rect1.size.y - rect2.position.y;
        }
    } else{
        if(rect2.position.y > rect1.position.y){
            collisionRect.position.y = rect2.position.y;
            collisionRect.size.y = rect1.position.y + rect1.size.y - rect2.position.y;
        } else{
            collisionRect.position.y = rect1.position.y;
            collisionRect.size.y = rect2.position.y + rect2.size.y - rect1.position.y;
        }
    }
    if(rect1.size.y < rect2.size.y){
        if(rect1.position.x > rect2.position.x){
            collisionRect.position.x = rect1.position.x;
            collisionRect.size.x = rect2.position.x + rect2.size.x - rect1.position.x;
        } else{
            collisionRect.position.x = rect2.position.x;
            collisionRect.size.x = rect1.position.x + rect1.size.x - rect2.position.x;
        }
    } else{
        if(rect2.position.x > rect1.position.x){
            collisionRect.position.x = rect2.position.x;
            collisionRect.size.x = rect1.position.x + rect1.size.x - rect2.position.x;
        } else{
            collisionRect.position.x = rect1.position.x;
            collisionRect.size.x = rect2.position.x + rect2.size.x - rect1.position.x;
        }
    }
    if(collisionRect.size.x > Math.min(rect1.size.x, rect2.size.x)){
        collisionRect.size.x = Math.min(rect1.size.x, rect2.size.x);
    }
    if(collisionRect.size.y > Math.min(rect1.size.y, rect2.size.y)){
        collisionRect.size.y = Math.min(rect1.size.y, rect2.size.y);
    }
    return collisionRect
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

function collideObjects(objects){
    for(let i in objects){
        if(objects[i] instanceof Array){
            collideObjects(objects[i]);
        } else{
            let objectsCopy = objects.slice(0, objects.length);
            objectsCopy.splice(i, 1);
            objects[i].collide(objectsCopy);
        }
    }
}

function askQuestion(){
    let indexedQuestion = questions[currentQuestion];
    questionBoxMain.text = indexedQuestion[0];
    questionBoxA.text = indexedQuestion[1];
    questionBoxB.text = indexedQuestion[2];
    questionBoxC.text = indexedQuestion[3];
    questionBoxD.text = indexedQuestion[4];
    questionBoxAnswerA.hostile = false;
    questionBoxAnswerB.hostile = false;
    questionBoxAnswerC.hostile = false;
    questionBoxAnswerD.hostile = false;
}

function correctAnswer(){
    score += 1;
    questionBoxMain.text = "Correct!";
    questionBoxA.text = "";
    questionBoxB.text = "";
    questionBoxC.text = "";
    questionBoxD.text = "";
    if(currentQuestion == questions.length - 1){
        currentQuestion = 0;
    } else{
        currentQuestion++;
    }
    setTimeout(askQuestion, 1000);
}

function incorrectAnswer(){
    if(questionBoxAnswerA.hostile || questionBoxMain.text == "Correct!"){
        return
    }
    score -= 1;
    questionBoxMain.text = "INCORRECT!";
    questionBoxA.text = "INCORRECT!";
    questionBoxB.text = "INCORRECT!";
    questionBoxC.text = "INCORRECT!";
    questionBoxD.text = "INCORRECT!";
    questionBoxAnswerA.hostile = true;
    questionBoxAnswerB.hostile = true;
    questionBoxAnswerC.hostile = true;
    questionBoxAnswerD.hostile = true;
    setTimeout(askQuestion, 4000);
}

function answerQuestion(answer){
    if(answer == questions[currentQuestion][5]){
        correctAnswer();
    } else{
        incorrectAnswer();
    }
    scoreBox.text = "Score: " + score;
}

let worldObjects = [];
function process(prevTime){
    const deltaTime = (new Date().getTime() - prevTime)/1000;
    prevTime = new Date().getTime();
    canvasCtx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawObjects(worldObjects);
    updateObjects(worldObjects, deltaTime);
    collideObjects(worldObjects);
    for(let i in globalInputs){
        globalInputs[i].justPressed = false;
    }
    setTimeout(() => {
        process(prevTime);
    }, 1000/60);
}

let questions = [
    [
        "Q: Where is gamma radiation located on the EM spectrum?",
        "A: At a middle frequency",
        "B: At the highest frequency",
        "C: At the lowest frequency",
        "D: Nowhere",
        "B"
    ],
    [
        "Q: Which is NOT a common use of gamma radiation?",
        "A: Sterilizing medical equipment",
        "B: Medical tracing",
        "C: Cooking",
        "D: Treating cancer",
        "C"
    ],
    [
        "Q: About how many feet of lead are needed to block gamma rays?",
        "A: 3.2",
        "B: 5",
        "C: 0.1",
        "D: 1.3",
        "D"
    ],
    [
        "Q: What does NOT produce gamma radiation?",
        "A: Nuetron star",
        "B: Lightning",
        "C: Nuclear Explosions",
        "D: Starting a car",
        "D"
    ],
    [
        "Q: How do scientists detect gamma rays?",
        "A: By using highly dense blocks of crystal",
        "B: By using mirrors",
        "C: By making an educated guess",
        "D: By shooting other gamma rays at the suspected radiation source",
        "A"
    ],
    [
        "Q: What is one reason astronomers detect gamma rays in space?",
        "A: To make the stars more vivid.",
        "B: To view and identify gamma-ray bursts.",
        "C: To try and identify alien activity.",
        "D: To recieve signals transmitted from satellites",
        "B"
    ],
    [
        "Q: What was the most distant object ever detected, at 12.8 billion light years away?",
        "A: A gamma-ray burst from a black hole's birth",
        "B: A gamma-ray burst from a nuetron star",
        "C: A gamma-ray flashlight from aliens",
        "D: A gamma-ray flare caused by unknown forces",
        "A"
    ],
    [
        "Q: What kind of medical operation sometimes uses gamma radiation?",
        "A: Robotic pancreas implant",
        "B: Plastic surgery",
        "C: Brain surgery",
        "D: Kidney transplant",
        "C"
    ],
    [
        "Q: In what year were gamma rays first observed?",
        "A: 1902",
        "B: 1900",
        "C: 1886",
        "D: 1887",
        "B"
    ],
    [
        "Q: What does gamma radiation both cause and treat?",
        "A: The flue",
        "B: Cancer",
        "C: Hate",
        "D: Heart disease",
        "B"
    ],
    [
        "Q: Who first discovered gamma radiation?",
        "A: Paul Villard",
        "B: Albert Einstein",
        "C: Arno Penzias",
        "D: Robert Woodrow Wilson",
        "A"
    ],
];
let currentQuestion = 0;
let questionBoxMain = new QuestionBox(new Vector2(0, 10), new Vector2(800, 30), "yellow", "", false);
let questionBoxA = new QuestionBox(new Vector2(0, 50), new Vector2(800, 20), "red", "", false);
let questionBoxB = new QuestionBox(new Vector2(0, 80), new Vector2(800, 20), "cyan", "", false);
let questionBoxC = new QuestionBox(new Vector2(0, 110), new Vector2(800, 20), "pink", "", false);
let questionBoxD = new QuestionBox(new Vector2(0, 140), new Vector2(800, 20), "orange", "", false);
let questionBoxAnswerA = new QuestionBox(new Vector2(550, 750), new Vector2(20, 20), "red", "A", true, "black", 6000);
let questionBoxAnswerB = new QuestionBox(new Vector2(350, 400), new Vector2(20, 20), "cyan", "B", true, "black", 4000);
let questionBoxAnswerC = new QuestionBox(new Vector2(775, 650), new Vector2(20, 20), "pink", "C", true, "black", 10000);
let questionBoxAnswerD = new QuestionBox(new Vector2(30, 300), new Vector2(20, 20), "orange", "D", true, "black", 5500);
let mainCharacter = new PlayerCharacter(new Vector2(385, 750), new Vector2(30, 50), "#5555ff");

let score = 0;
let scoreBox = new QuestionBox(new Vector2(0, 780), new Vector2(80, 20), "white", "Score: 0", false)

let globalInputs = [];
let initialGlobalInputs = [];
function init(){
    askQuestion(currentQuestion);
    document.addEventListener("keydown", event =>{
        for(let i in globalInputs){
            if(globalInputs[i].code == event.code){
                return
            }
        }
        globalInputs.push({
            code: event.code,
            justPressed: true,
        });
    });
    document.addEventListener("keyup", event =>{
        for(let i in globalInputs){
            if(globalInputs[i].code == event.code){
                globalInputs.splice(i, 1);
                return
            }
        }
    });
    
    worldObjects.push(new Rect(new Vector2(0, -100), new Vector2(canvas.clientWidth, 100)));
    worldObjects.push(new Rect(new Vector2(canvas.clientWidth, 0), new Vector2(canvas.clientWidth + 100, canvas.clientHeight)));
    worldObjects.push(new Rect(new Vector2(0, canvas.clientHeight), new Vector2(canvas.clientWidth, canvas.clientHeight + 100)));
    worldObjects.push(new Rect(new Vector2(-100, 0), new Vector2(100, canvas.clientHeight)));

    worldObjects.push(new Rect(new Vector2(500, 650), new Vector2(100, 50), "grey"));
    worldObjects.push(new Rect(new Vector2(200, 650), new Vector2(100, 20), "brown"));
    worldObjects.push(new Rect(new Vector2(100, 500), new Vector2(100, 50), "green"));
    worldObjects.push(new Rect(new Vector2(300, 450), new Vector2(120, 20), "green"));
    worldObjects.push(new Rect(new Vector2(600, 700), new Vector2(200, 1000), "brown"));
    worldObjects.push(new Rect(new Vector2(650, 400), new Vector2(20, 1000), "black"));
    worldObjects.push(new Rect(new Vector2(760, 420), new Vector2(50, 10)));
    worldObjects.push(new Rect(new Vector2(300, 250), new Vector2(150, 15), "maroon"))
    worldObjects.push(new Rect(new Vector2(600, 570), new Vector2(150, 1000), "grey"));
    worldObjects.push(new Rect(new Vector2(0, 330), new Vector2(100, 20), "purple"));
    
    worldObjects.push(questionBoxMain);
    worldObjects.push(questionBoxA);
    worldObjects.push(questionBoxB);
    worldObjects.push(questionBoxC);
    worldObjects.push(questionBoxD);

    worldObjects.push(scoreBox);

    worldObjects.push(mainCharacter);

    worldObjects.push(questionBoxAnswerA);
    worldObjects.push(questionBoxAnswerB);
    worldObjects.push(questionBoxAnswerC);
    worldObjects.push(questionBoxAnswerD);

    process(new Date().getTime());
}
init();
