(function() {
    //选择元素
    function $(selectors) {
        if (selectors.substring(0, 1) == "#") {
            return document.querySelector(selectors);
        } else {
            return document.querySelectorAll(selectors);
        }
    }
    //随机rgb
    function randColor() {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        let color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        return color;
    }

    let canvas = $('#canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    let ctx = canvas.getContext('2d');


    let listFire = [];
    let listFirework = [];

    let listSpecial = [];
    let listSpark = [];
    let lights = [];
    let fireNumber = 10;
    let center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    };
    let range = 100;
    let fired = 0;
    let onHold = 0;
    let supprise = false;

    let actions = [makeDoubleFullCircleFirework, makePlanetCircleFirework, makeFullCircleFirework, makeDoubleCircleFirework, makeHeartFirework, makeCircleFirework, makeRandomFirework];
       //生成随机烟花
    for (let i = 0; i < fireNumber; i++) {
        let fire = {
            x: Math.random() * range / 2 - range / 4 + center.x,
            y: Math.random() * range * 2.5 + canvas.height,
            size: Math.random() + 0.5,
            fill: '#ff3',
            vx: Math.random() - 0.5,
            vy: -(Math.random() + 4),
            ax: Math.random() * 0.06 - 0.03,
            delay: Math.round(Math.random() * range) + range * 4,
            hold: false,
            alpha: 1,
            far: Math.random() * range + (center.y - range)
        };
        fire.base = {
            x: fire.x,
            y: fire.y,
            vx: fire.vx,
            vy: fire.vy
        };
        //
        listFire.push(fire);
        playLaunchSound();
    }
  
    let listExpSound = $('.explode');
    let listLaunchSound = $('.launch');

    function initSpark() {
        let x = Math.random() * range * 3 - range * 1.5 + center.x;
        let vx = Math.random() - 0.5;
        let vy = -(Math.random() + 4);
        let ax = Math.random() * 0.04 - 0.02;
        let far = Math.random() * range * 4 - range + center.y;
        let direct = ax * 10 * Math.PI;
        let max = fireNumber * 0.5;
        for (let i = 0; i < max; i++) {
            let special = {
                x: x,
                y: Math.random() * range * 0.25 + canvas.height,
                size: Math.random() + 2,
                fill: '#ff3',
                vx: vx,
                vy: vy,
                ax: ax,
                direct: direct,
                alpha: 1
            };
            special.far = far - (special.y - canvas.height);
            listSpecial.push(special);
       
            playLaunchSound();
        }
    }

    function playExpSound() {
        let sound = listExpSound[Math.floor(Math.random() * listExpSound.length)];
        sound.volume = Math.random() * 0.4 + 0.1;
        sound.play();
    }

    function playLaunchSound() {
        setTimeout(function() {
            let sound = listLaunchSound[Math.floor(Math.random() * listLaunchSound.length)];
            sound.volume = 0.05;
            sound.play();
        }, 200);
    }

    function makeSpark(special) {
        let color = special.fill;
        let velocity = Math.random() * 6 + 12;
        let max = fireNumber;
        for (let i = 0; i < max; i++) {
            let rad = (Math.random() * Math.PI * 0.3 + Math.PI * 0.35) + Math.PI + special.direct;
            let spark = {
                x: special.x,
                y: special.y,
                size: Math.random() + 1,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.02,
                alpha: 1,
                rad: rad,
                direct: special.direct,
                chain: Math.round(Math.random() * 2) + 2,
                life: Math.round(Math.random() * range / 2) + range / 2
            };
            spark.base = {
                life: spark.life,
                velocity: velocity
            };
            listSpark.push(spark);
        }
        return color;
    }

    function chainSpark(parentSpark) {
        let color = parentSpark.fill;
        if (parentSpark.chain > 0) {
            let velocity = parentSpark.base.velocity * 0.6;
            let max = Math.round(Math.random() * 5);
            for (let i = 0; i < max; i++) {
                let rad = (Math.random() * Math.PI * 0.3 - Math.PI * 0.15) + parentSpark.rad + parentSpark.direct;
                let spark = {
                    x: parentSpark.x,
                    y: parentSpark.y,
                    size: parentSpark.size * 0.6,
                    fill: color,
                    vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                    vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                    ay: 0.02,
                    alpha: 1,
                    rad: rad,
                    direct: parentSpark.direct,
                    chain: parentSpark.chain,
                    life: parentSpark.base.life * 0.8
                };
                spark.base = {
                    life: spark.life,
                    size: spark.size,
                    velocity: velocity
                };
                listSpark.push(spark);
            }

            if (Math.random() > 0.9 && parentSpark.chain > 1) {
               
                playExpSound();
            }
        }
        return color;
    }

    (function loop() {
        requestAnimationFrame(loop);
        update();
        draw();
    }
    )();

    //更新  
    function update() {
        for (let i = 0; i < listFire.length; i++) {
            let fire = listFire[i];
            if (fire.y <= fire.far) {
                
                playExpSound();
                
                fired++;
                let color = actions[Math.floor(Math.random() * actions.length)](fire);
                
                lights.push({
                    x: fire.x,
                    y: fire.y,
                    color: color,
                    radius: range * 2
                });
                
                fire.y = fire.base.y;
                fire.x = fire.base.x;
                
                if (fired % 33 == 0) {
                    initSpark();
                }
                
                supprise = fired % 100 == 0 ? true : supprise;
                if (supprise) {
                    fire.vx = 0;
                    fire.vy = 0;
                    fire.ax = 0;
                    fire.hold = true;
                    onHold++;
                } else {
                    fire.vx = fire.base.vx;
                    fire.vy = fire.base.vy;
                    fire.ax = Math.random() * 0.06 - 0.03;
                    
                    playLaunchSound();
                }
            }

            if (fire.hold && fire.delay <= 0) {
                onHold--;
                fire.hold = false;
                fire.delay = Math.round(Math.random() * range) + range * 4;
                fire.vx = fire.base.vx;
                fire.vy = fire.base.vy;
                fire.ax = Math.random() * 0.06 - 0.03;
                fire.alpha = 1;
                
                playLaunchSound();
            } else if (fire.hold && fire.delay > 0) {
                fire.delay--;
            } else {
                fire.x += fire.vx;
                fire.y += fire.vy;
                fire.vx += fire.ax;
                fire.alpha = (fire.y - fire.far) / fire.far;
            }
        }

        
        for (let i = listFirework.length - 1; i >= 0; i--) {
            let firework = listFirework[i];
            if (firework) {
                firework.vx *= 0.9;
                firework.vy *= 0.9;
                firework.x += firework.vx;
                firework.y += firework.vy;
                firework.vy += firework.ay;
                firework.alpha = firework.life / firework.base.life;
                firework.size = firework.alpha * firework.base.size;
                firework.alpha = firework.alpha > 0.6 ? 1 : firework.alpha;

                firework.life--;
                if (firework.life <= 0) {
                    listFirework.splice(i, 1);
                }
            }
        }

        
        for (let i = listSpecial.length - 1; i >= 0; i--) {
            let special = listSpecial[i];
            if (special.y <= special.far) {
                
                playExpSound();
                
                lights.push({
                    x: special.x,
                    y: special.y,
                    color: special.fill,
                    alpha: 0.02,
                    radius: range * 2
                });

                makeSpark(special);
                
                listSpecial.splice(i, 1);
            } else {
                special.x += special.vx;
                special.y += special.vy;
                special.vx += special.ax;
                special.alpha = (special.y - special.far) / special.far;
            }
        }

        
        for (let i = listSpark.length - 1; i >= 0; i--) {
            let spark = listSpark[i];
            if (spark) {
                spark.vx *= 0.9;
                spark.vy *= 0.9;
                spark.x += spark.vx;
                spark.y += spark.vy;
                spark.vy += spark.ay;
                spark.alpha = spark.life / spark.base.life + 0.2;

                spark.life--;
                if (spark.life < spark.base.life * 0.8 && spark.life > 0) {

                    spark.chain--;
                    chainSpark(spark);
                }
                if (spark.life <= 0) {
                    listSpark.splice(i, 1);
                }
            }
        }
    }

    function draw() {
        
        ctx.globalCompositeOperation = 'source-over';
        
        ctx.globalAlpha = 0.1;

        let img = document.getElementById("bg");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < listFire.length; i++) {
            let fire = listFire[i];
            ctx.globalAlpha = fire.alpha;
            ctx.beginPath();
            
            ctx.arc(fire.x, fire.y, fire.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = fire.fill;
            ctx.fill();
        }

        for (let i = 0; i < listFirework.length; i++) {
            let firework = listFirework[i];
            ctx.globalAlpha = firework.alpha;
            ctx.beginPath();
            
            ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = firework.fill;
            ctx.fill();
        }

        for (let i = 0; i < listSpecial.length; i++) {
            let special = listSpecial[i];
            ctx.globalAlpha = special.alpha;
            ctx.fillStyle = special.fill;
            
            ctx.fillRect(special.x - special.size, special.y - special.size, special.size * 2, special.size * 2);
        }

        for (let i = 0; i < listSpark.length; i++) {
            let spark = listSpark[i];
            ctx.globalAlpha = spark.alpha;
            ctx.fillStyle = spark.fill;
            
            ctx.fillRect(spark.x - spark.size, spark.y - spark.size, spark.size * 2, spark.size * 2);
        }

        
        while (lights.length) {
            let light = lights.pop();
            let gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.2, light.color);
            gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.globalAlpha = light.alpha ? light.alpha : 0.25;
            ctx.fillStyle = gradient;
            ctx.fillRect(light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
        }

    }

    //各种烟花形状
    function makeCircleFirework(fire) {
        let color = randColor();
        let velocity = Math.random() * 2 + 6;
        let max = fireNumber * 5;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.04,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 2
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return color;
    }

    function makeDoubleCircleFirework(fire) {
        let color = randColor();
        let velocity = Math.random() * 2 + 8;
        let max = fireNumber * 3;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.04,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        color = randColor();
        velocity = Math.random() * 3 + 4;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.04,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return color;
    }

    function makePlanetCircleFirework(fire) {
        let color = '#aa0609';
        let velocity = Math.random() * 2 + 4;
        let max = fireNumber * 2;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.04,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        max = fireNumber * 4;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity * Math.random(),
                vy: Math.sin(rad) * velocity * Math.random(),
                ay: 0.04,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        max = fireNumber * 3;
        color = '#ff9';
        let rotate = Math.random() * Math.PI * 2;
        let vx = velocity * (Math.random() + 2);
        let vy = velocity * 0.6;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            
            let cx = Math.cos(rad) * vx + (Math.random() - 0.5) * 0.5;
            let cy = Math.sin(rad) * vy + (Math.random() - 0.5) * 0.5;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: cx * Math.cos(rotate) - cy * Math.sin(rotate),
                
                vy: cx * Math.sin(rotate) + cy * Math.cos(rotate),
                
                ay: 0.02,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return '#aa0609';
    }

    function makeFullCircleFirework(fire) {
        let color = randColor();
        let velocity = Math.random() * 8 + 8;
        let max = fireNumber * 3;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.06,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        max = fireNumber * Math.round(Math.random() * 4 + 4);
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity * Math.random(),
                vy: Math.sin(rad) * velocity * Math.random(),
                ay: 0.06,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return color;
    }

    function makeDoubleFullCircleFirework(fire) {
        let color = randColor();
        let velocity = Math.random() * 8 + 8;
        let max = fireNumber * 3;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.04,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        color = randColor();
        velocity = Math.random() * 3 + 4;
        max = fireNumber * 2;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(rad) * velocity + (Math.random() - 0.5) * 0.5,
                ay: 0.06,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        max = fireNumber * 4;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * velocity * Math.random(),
                vy: Math.sin(rad) * velocity * Math.random(),
                ay: 0.06,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return color;
    }

    function makeHeartFirework(fire) {
        let color = randColor();
        let velocity = Math.random() * 3 + 3;
        let max = fireNumber * 5;
        let rotate = Math.random() * Math.PI * 2;
        for (let i = 0; i < max; i++) {
            let rad = (i * Math.PI * 2) / max + rotate;
            let v, p;
            if (rad - rotate < Math.PI * 0.5) {
                p = (rad - rotate) / (Math.PI * 0.5);
                v = velocity + velocity * p;
            } else if (rad - rotate > Math.PI * 0.5 && rad - rotate < Math.PI) {
                p = (rad - rotate - Math.PI * 0.5) / (Math.PI * 0.5);
                v = velocity * (2 - p);
            } else if (rad - rotate > Math.PI && rad - rotate < Math.PI * 1.5) {
                p = (rad - rotate - Math.PI) / (Math.PI * 0.5);
                v = velocity * (1 - p);
            } else if (rad - rotate > Math.PI * 1.5 && rad - rotate < Math.PI * 2) {
                p = (rad - rotate - Math.PI * 1.5) / (Math.PI * 0.5);
                v = velocity * p;
            } else {
                v = velocity;
            }
            v = v + (Math.random() - 0.5) * 0.25;
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.cos(rad) * v,
                vy: Math.sin(rad) * v,
                ay: 0.02,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 1.5
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return color;
    }

    function makeRandomFirework(fire) {
        let color = randColor();
        for (let i = 0; i < fireNumber * 5; i++) {
            let firework = {
                x: fire.x,
                y: fire.y,
                size: Math.random() + 1.5,
                fill: color,
                vx: Math.random() * 15 - 7.5,
                vy: Math.random() * -15 + 5,
                ay: 0.05,
                alpha: 1,
                life: Math.round(Math.random() * range / 2) + range / 2
            };
            firework.base = {
                life: firework.life,
                size: firework.size
            };
            listFirework.push(firework);
        }
        return color;
    }
}
)();
