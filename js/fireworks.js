rockets = [];

class Particle {
    constructor(x,y,speedX,speedY,color) {
        this.cvs = document.getElementById("cvsFireworks");
        this.ctx = this.cvs.getContext('2d');
        this.color = color;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.alpha = 1;
        this.size = 4 + Math.floor(Math.random() * 3);
        this.resistance = Math.random() * 0.2;
        this.Aresistance = Math.random() * 0.05 + 0.05;
    }
    do_physics() {
        this.x += this.speedX / 2;
        this.y += this.speedY / 2;
        this.alpha -= (Math.random() * this.Aresistance + 0.03) / 2;
        this.speedX *= 0.95 * (1 - (this.resistance / 2));
        this.speedY += 0.5;
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.fillStyle = this.color;
        this.ctx.arc(this.x, this.y, Math.ceil(this.size), 0, 2 * Math.PI);
        this.ctx.fill();
    }
}

class Rocket {
    constructor(width,height) {
        this.cvs = document.getElementById("cvsFireworks");
        this.ctx = this.cvs.getContext('2d');
        // this.x = 100 + Math.floor(Math.random() * 160);
        this.x = Math.floor(Math.random() * Math.abs(width - 200)) + 100;
        this.y = height;
        this.speedX = Math.random() * 15 - 10;
        var speedInc = 40;
        if (window.innerHeight < 500) {
            speedInc = 20;
        } else if (window.innerHeight < 700) {
            speedInc = 30;
        }
        this.speedY = Math.random() * 40 + speedInc;
        this.size = Math.random() * 6 + 4;
        var colors = ["edf67d","fa8334","c84c09","92e873","ef271b","f896d8","ca7df9","271033","724cf9","564592","386641","6a994e","a7c957","f2e8cf","bc4749"];
        this.color = "#" + colors[Math.floor(Math.random() * colors.length)];
        this.flying = true;
        this.particles = [];
        var self = this;
        setTimeout(function() {self.explosion();},500+Math.random() * 500);
    }
    do_physics() {
        this.x += this.speedX / 2;
        this.y -= this.speedY / 2;
        this.speedX *= 0.9;
        this.speedY *= 0.95;
    }
    explosion() {
        this.flying = false;
        var numParticles = Math.floor(Math.random() * 45) + 50;
        var anglePerParticle = (Math.PI * 2) / numParticles;
        for (var i = 0; i < numParticles; i++) {
            var angle = anglePerParticle * i;
            var speedX = Math.cos(angle) * this.size * 4;
            var speedY = Math.sin(angle) * this.size * 3;
            this.particles.push(new Particle(this.x,this.y,speedX/(Math.random() + 1),speedY/(Math.random() + 1),this.color));
        }
    }
    draw() {
        if (this.flying === true) {
            this.ctx.beginPath();
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = this.color;
            this.ctx.arc(this.x, this.y, Math.ceil(this.size), 0, 2 * Math.PI);
            this.ctx.fill();
        } else {
            for (var i = 0; i < this.particles.length; i++) {
                if (this.particles[i].alpha < 0) {
                    this.particles.splice(i,1);
                } else {
                    this.particles[i].draw();
                    this.particles[i].do_physics();
                }
            }
        }
    }
}

class Fireworks {
    constructor(width,height) {
        var cvs = document.getElementById("cvsFireworks");
        var ctx = cvs.getContext('2d');
        rockets.push(new Rocket(width,height));
        setInterval(function() {
            if (rockets.length < 6) {
                rockets.push(new Rocket(width,height));
            }
        },550);
        setInterval(function() {
            ctx.clearRect(0,0,width,height);
            for (var i = 0; i < rockets.length; i++) {

                if (rockets[i].flying === true || rockets[i].particles.length > 0) {
                    rockets[i].draw();
                    rockets[i].do_physics();
                } else {
                    rockets.splice(i,1);
                }
            }
        },25);
    }
}

