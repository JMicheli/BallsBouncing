// JavaScript source code

let canvas = document.getElementById("GameScreen");
let ctx = canvas.getContext("2d");
let canvasx = 800;
let canvasy = 600;

//physical constants go here
const g = 0.1 //pixels per second^2

//This will define forces that can influence the motion
//of objects. It is a basic class, more complex forces
//can be defined as inheritants of it
class force {
    constructor(f, dir) {
        this.strength = f;
        this.direction = dir;
        this.falloff = 0;
    }

    //Falloff types: 0 - none, 1 - linear, 2 - invsq (inverse square)
    setFalloff(n) {
        if (n == "none") {
            this.falloff = 0;
        }
        if (n == "linear") {
            this.falloff = 1;
        }
        if (n == "invsq") {
            this.falloff = 2;
        }
    }

    //Just a quick distance between points function, useful for a variety of things
    distance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) ^ 2 + (p1[1] - p2[1]) ^ 2);
    }

    //The returnValue function is intended to be overloaded
    //in order to return appropriate values based on the
    //object being influenced
    returnValue(obj) {
        return [(this.strength * Math.cos(this.direction)), (this.strength * Math.sin(this.direction) * -1)];
    }
}

class attractor extends force {
    constructor(f, x, y) {
        super(f, null);
        this.pos = [x, y];
        this.falloff = 1;
    }

    returnValue(obj) {
        var r = [this.pos[0] - obj.pos[0], this.pos[1] - obj.pos[1]];
        var d = super.distance(obj.pos, this.pos);
        var u = [r[0] / d, r[1] / d];

        if (this.falloff == 2) {
            return [u[0] * this.strength / (d^2), u[1] * this.strength / (d^2)]
        }
        else {
            this.falloff = 1;
            return [u[0] * this.strength / d, u[1] * this.strength / d]
        }
    }
}

class repulsor extends force {
    constructor(f, x, y) {
        super(f, null);
        this.pos = [x, y];
        this.falloff = 1;
    }

    returnValue(obj) {
        var r = [obj.pos[0] - this.pos[0], obj.pos[1] - this.pos[1]];
        var d = super.distance(obj.pos, this.pos);
        var u = [r[0] / d, r[1] / d];

        if (this.falloff == 2) {
            return [u[0] * this.strength / (d ^ 2), u[1] * this.strength / (d ^ 2)]
        }
        else {
            this.falloff = 1;
            return [u[0] * this.strength / d, u[1] * this.strength / d]
        }
    }
}

//Any physical constants that are appropriately embodied as forces go here
const gravity = new force(g, Math.PI * 1.5);

//This will be each individual renderable object
//It will have a method that can be called to render
//itself
class renderObj {
    constructor(x, y, physicsbool) {
        this.pos = [x, y] //An array dictating the x and y position. +x is to the right, +y is down (weird)
        this.vel = [0, 0] //An array dictating the x and y velocity
        this.forces = []; //The array of forces influencing the object
        this.physicsenabled = physicsbool; //If true, then the physics loop will run
    }

    addForce(f) {
        this.forces.push(f);
        this.physicsenabled = true;
    }

    setVelocity(velocity) {
        this.vel[0] = velocity[0];
        this.vel[1] = velocity[1];
    }

    //This method is expected to be overloaded by any inheriting objects
    //If you don't do that, then you're just gonna end up drawing a dot
    draw() {
        ctx.beginPath();
        ctx.arc(this.pos[0], this.pos[1], 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    physics() {

        //This step takes forces and applies them to the object to
        //influence their veloctiy for the step
        var i;
        for (i = 0; i < this.forces.length; i++) {
            var influence = this.forces[i].returnValue(this);
            this.vel[0] += influence[0];
            this.vel[1] += influence[1];
        }

        //Basic step, increasing position by velocity
        this.pos[0] += this.vel[0]
        this.pos[1] += this.vel[1];

        //Colision detection (with bouncing, fully conserved energy)
        if (this.pos[0] < 0) {
            this.pos[0] = 0;
            this.vel[0] = this.vel[0] * -1;
        }
        if (this.pos[0] > canvasx) {
            this.pos[0] = canvasx;
            this.vel[0] = this.vel[0] * -1;
        }
        if (this.pos[1] < 0) {
            this.pos[1] = 0
            this.vel[1] = this.vel[1] * -1;
        }
        if (this.pos[1] > canvasy) {
            this.pos[1] = canvasy;
            this.vel[1] = this.vel[1] * -1;
        }
    }
}

//The idea with this class is that we should be able to make a nice array
//that will contain each object we want to render, so we can just loop 
//through them when the time comes.
class renderEngine {
    constructor() {
        this.stream = [];
    }

    addItem(i) {
        this.stream.push(i);
    }

    doRender() {
        ctx.clearRect(0, 0, 800, 600);
        var i;
        for (i = 0; i < this.stream.length; i++) {
            this.stream[i].draw();
        }
    }

    doPhysics() {
        var j;
        for (j = 0; j < this.stream.length; j++) {
            this.stream[j].physics();
        }
    }
}

//Create the engine that will be used throughout
var engine = new renderEngine();

//setInternval begins an internal timer that does the function in brackets
//forever every 20 milliseconds (the value at the very bottom)
var z = 0;
var interval = setInterval(function () {
    //console.log("starting physics loop");
    engine.doPhysics();
    //console.log("starting render loop");
    engine.doRender();
    //z++;

    //if (z > 5) {
    //    clearInterval(interval);
    //}
}, 20);
