"use strict";

// =====================================================
// HEALTH AI FUTURE MEDICAL HOLOGRAM ENGINE
// PART 1/3
// =====================================================


// =====================================================
// CANVAS SETUP
// =====================================================

const canvas =
document.getElementById("dnaCanvas") ||
document.createElement("canvas");


if(!canvas.id){

    canvas.id="dnaCanvas";
    document.body.prepend(canvas);

}


const ctx = canvas.getContext("2d");


canvas.style.position="fixed";
canvas.style.top="0";
canvas.style.left="0";
canvas.style.width="100%";
canvas.style.height="100%";
canvas.style.pointerEvents="none";
canvas.style.zIndex="-10";



let w;
let h;
let dpr;



function resize(){

    w = window.innerWidth;
    h = window.innerHeight;


    dpr = Math.min(
        window.devicePixelRatio || 1,
        2
    );


    canvas.width = w * dpr;
    canvas.height = h * dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}



window.addEventListener(
    "resize",
    resize
);


resize();



// =====================================================
// GLOBAL VARIABLES
// =====================================================


let time = 0;

let gridMove = 0;



// =====================================================
// BACKGROUND MEDICAL GLOW
// =====================================================


function drawBackgroundGlow(){


    let pulse =
    0.20 +
    Math.sin(time * 0.015) * 0.06;



    let glow =
    ctx.createRadialGradient(

        w/2,
        h/2,
        100,

        w/2,
        h/2,
        900

    );



    glow.addColorStop(
        0,
        `rgba(0,230,255,${pulse})`
    );


    glow.addColorStop(
        0.4,
        "rgba(0,120,255,0.10)"
    );


    glow.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );



    ctx.fillStyle = glow;


    ctx.fillRect(
        0,
        0,
        w,
        h
    );

}



// =====================================================
// FLOATING AI PARTICLES
// =====================================================


const particles=[];



for(
    let i=0;
    i<300;
    i++
){

    particles.push({

        x:Math.random()*w,

        y:Math.random()*h,

        size:Math.random()*2+0.5,

        speed:Math.random()*0.8+0.2,

        direction:Math.random()*2-1,

        alpha:Math.random()*0.7+0.2

    });

}





function drawParticles(){


    ctx.save();


    particles.forEach(p=>{


        p.y -= p.speed;

        p.x += p.direction * 0.15;



        if(p.y < 0){

            p.y = h + 20;

            p.x = Math.random()*w;

        }



        if(p.x > w)
            p.x = 0;


        if(p.x < 0)
            p.x = w;



        ctx.beginPath();



        ctx.fillStyle =
        `rgba(
            100,
            240,
            255,
            ${p.alpha}
        )`;



        ctx.shadowBlur = 20;

        ctx.shadowColor="#00d4ff";



        ctx.arc(

            p.x,

            p.y,

            p.size,

            0,

            Math.PI*2

        );



        ctx.fill();


    });



    ctx.restore();


}




// =====================================================
// FUTURISTIC MEDICAL GRID
// =====================================================


function drawMedicalGrid(){


    ctx.save();



    gridMove += 0.3;



    ctx.globalAlpha = 0.08;


    ctx.strokeStyle="#00d4ff";


    ctx.lineWidth=1;



    for(
        let x=-100;
        x<w+100;
        x+=60
    ){


        ctx.beginPath();


        ctx.moveTo(
            x + gridMove % 60,
            0
        );


        ctx.lineTo(

            x + gridMove % 60,

            h

        );


        ctx.stroke();

    }





    for(
        let y=0;
        y<h;
        y+=60
    ){


        ctx.beginPath();


        ctx.moveTo(

            0,

            y + gridMove % 60

        );



        ctx.lineTo(

            w,

            y + gridMove % 60

        );



        ctx.stroke();


    }



    ctx.restore();


}




// =====================================================
// MEDICAL HOLOGRAM BUBBLES
// =====================================================



const medicalBubbles=[


    {
        icon:"🫀",
        x:150,
        y:500,
        size:48,
        speed:0.35,
        angle:0
    },


    {
        icon:"🧠",
        x:window.innerWidth-180,
        y:300,
        size:55,
        speed:0.25,
        angle:2
    },


    {
        icon:"🫁",
        x:230,
        y:180,
        size:50,
        speed:0.3,
        angle:4
    },


    {
        icon:"🧬",
        x:window.innerWidth-300,
        y:600,
        size:58,
        speed:0.22,
        angle:6
    },


    {
        icon:"🔬",
        x:window.innerWidth/2+300,
        y:160,
        size:45,
        speed:0.28,
        angle:3
    },


    {
        icon:"⚕️",
        x:window.innerWidth/2-320,
        y:400,
        size:50,
        speed:0.25,
        angle:5
    }


];





function drawMedicalBubbles(){


    medicalBubbles.forEach(b=>{


        b.angle += 0.015;


        b.y -= b.speed;



        let floatX =
        Math.sin(b.angle)*35;



        let floatY =
        Math.cos(b.angle*1.5)*20;



        if(b.y < -150){

            b.y = h + 150;

        }




        ctx.save();



        ctx.translate(

            b.x + floatX,

            b.y + floatY

        );



        ctx.rotate(

            Math.sin(b.angle)*0.12

        );



        // outer rings

        for(
            let r=0;
            r<3;
            r++
        ){


            ctx.beginPath();


            ctx.arc(

                0,

                0,

                b.size+20+r*10,

                0,

                Math.PI*2

            );



            ctx.strokeStyle =
            `rgba(
                0,
                220,
                255,
                ${0.15-r*0.04}
            )`;



            ctx.stroke();

        }



        let bubble =
        ctx.createRadialGradient(

            -15,
            -15,
            5,

            0,
            0,
            b.size

        );



        bubble.addColorStop(
            0,
            "rgba(255,255,255,.5)"
        );


        bubble.addColorStop(
            .5,
            "rgba(0,220,255,.2)"
        );


        bubble.addColorStop(
            1,
            "rgba(0,80,255,.05)"
        );



        ctx.beginPath();


        ctx.arc(
            0,
            0,
            b.size,
            0,
            Math.PI*2
        );


        ctx.fillStyle=bubble;


        ctx.shadowBlur=45;

        ctx.shadowColor="#00ffff";


        ctx.fill();



        ctx.strokeStyle=
        "rgba(150,250,255,.8)";


        ctx.lineWidth=2;


        ctx.stroke();



        // reflection

        ctx.beginPath();


        ctx.arc(
            -15,
            -18,
            9,
            0,
            Math.PI*2
        );


        ctx.fillStyle=
        "rgba(255,255,255,.4)";


        ctx.fill();



        // icon

        ctx.font =
        `${b.size}px Arial`;


        ctx.textAlign="center";

        ctx.textBaseline="middle";


        ctx.fillText(
            b.icon,
            0,
            5
        );



        ctx.restore();



    });


}
// =====================================================
// PART 2/3
// DNA + SCANNER + MOLECULAR SYSTEM
// =====================================================



// =====================================================
// DNA VARIABLES
// =====================================================

let dnaRotation = 0;

const dnaHeight = 600;

const dnaSpacing = 12;

const dnaRadius = 95;



// =====================================================
// 3D DNA HELIX
// =====================================================


function drawDNA(offsetX){


    ctx.save();



    ctx.translate(

        w/2 + offsetX,

        h/2

    );



    for(

        let y=-dnaHeight/2;

        y<=dnaHeight/2;

        y+=dnaSpacing

    ){



        let angle =
        y*0.045 + dnaRotation;



        let left =
        Math.sin(angle) * dnaRadius - dnaRadius;



        let right =
        -Math.sin(angle) * dnaRadius + dnaRadius;



        let depth =
        (Math.cos(angle)+1)/2;




        // connection lines

        ctx.beginPath();



        ctx.moveTo(

            left,

            y

        );



        ctx.lineTo(

            right,

            y

        );



        ctx.strokeStyle =
        `rgba(
            0,
            220,
            255,
            ${0.18 + depth*0.5}
        )`;



        ctx.lineWidth=1.5;



        ctx.stroke();





        // glowing DNA nodes

        [left,right].forEach(x=>{


            ctx.beginPath();



            ctx.fillStyle =
            `rgba(
                180,
                250,
                255,
                ${0.4+depth*0.6}
            )`;



            ctx.shadowBlur=25;

            ctx.shadowColor="#00d4ff";



            ctx.arc(

                x,

                y,

                4+depth*3,

                0,

                Math.PI*2

            );



            ctx.fill();



        });



    }



    ctx.restore();


}




// =====================================================
// DNA SCANNER LASER
// =====================================================


let scanPosition=-350;



function drawScanner(){


    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );



    scanPosition += 2;



    if(scanPosition>350){

        scanPosition=-350;

    }




    let scanner =
    ctx.createLinearGradient(

        0,

        scanPosition-60,

        0,

        scanPosition+60

    );



    scanner.addColorStop(

        0,

        "rgba(0,212,255,0)"

    );



    scanner.addColorStop(

        0.5,

        "rgba(0,255,255,.9)"

    );



    scanner.addColorStop(

        1,

        "rgba(0,212,255,0)"

    );



    ctx.fillStyle=scanner;



    ctx.shadowBlur=30;

    ctx.shadowColor="#00ffff";



    ctx.fillRect(

        -230,

        scanPosition,

        460,

        6

    );



    ctx.restore();


}




// =====================================================
// MOLECULAR ORBIT SYSTEM
// =====================================================


let orbitRotation=0;



function drawMolecularOrbit(){



    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );



    orbitRotation += 0.01;



    ctx.rotate(

        orbitRotation

    );





    // orbit rings

    for(

        let i=0;

        i<3;

        i++

    ){



        ctx.beginPath();



        ctx.ellipse(

            0,

            0,

            170+i*35,

            70+i*20,

            0,

            0,

            Math.PI*2

        );



        ctx.strokeStyle =
        `rgba(
            0,
            220,
            255,
            ${0.12-i*0.03}
        )`;



        ctx.lineWidth=1;



        ctx.stroke();



    }





    // orbit particles

    for(

        let i=0;

        i<8;

        i++

    ){



        let angle =
        orbitRotation+i;



        let x =
        Math.cos(angle)*240;



        let y =
        Math.sin(angle)*90;



        ctx.beginPath();



        ctx.arc(

            x,

            y,

            3,

            0,

            Math.PI*2

        );



        ctx.fillStyle=
        "rgba(0,255,255,.9)";



        ctx.shadowBlur=15;

        ctx.shadowColor="#00ffff";



        ctx.fill();



    }



    ctx.restore();


}





// =====================================================
// HOLOGRAM MEDICAL WAVES
// =====================================================


let waveOffset=0;



function drawMedicalWaves(){


    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );



    waveOffset +=0.04;



    for(

        let layer=0;

        layer<4;

        layer++

    ){



        ctx.beginPath();



        for(

            let x=-400;

            x<=400;

            x+=10

        ){



            let y =
            Math.sin(

                x*0.03 +

                waveOffset +

                layer

            ) -

            (

                25 +

                layer*10

            );



            if(x===-400){

                ctx.moveTo(

                    x,

                    y

                );

            }

            else{

                ctx.lineTo(

                    x,

                    y

                );

            }


        }




        ctx.strokeStyle =
        `rgba(
            0,
            220,
            255,
            ${0.12-layer*0.025}
        )`;



        ctx.lineWidth=1;



        ctx.stroke();



    }



    ctx.restore();


}




// =====================================================
// FUTURISTIC HUD RINGS
// =====================================================


let hudRotation=0;



function drawHUD(){


    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );



    hudRotation +=0.008;



    ctx.rotate(

        hudRotation

    );





    for(

        let i=0;

        i<6;

        i++

    ){



        ctx.beginPath();



        ctx.arc(

            0,

            0,

            250+i*35,

            0,

            Math.PI*2

        );



        ctx.strokeStyle =
        "rgba(0,220,255,.06)";



        ctx.lineWidth=1;



        ctx.stroke();



    }





    // radar points

    for(

        let i=0;

        i<12;

        i++

    ){



        let angle =
        (i*Math.PI*2)/12;



        let x =
        Math.cos(angle)*320;



        let y =
        Math.sin(angle)*320;



        ctx.beginPath();



        ctx.arc(

            x,

            y,

            2,

            0,

            Math.PI*2

        );



        ctx.fillStyle=
        "rgba(0,255,255,.8)";



        ctx.fill();



    }




    ctx.restore();


}
// =====================================================
// PART 3/3
// HEART + ECG + FINAL ANIMATION LOOP
// =====================================================



// =====================================================
// ANATOMICAL HEART SYSTEM
// =====================================================


let heartRotation = 0;

let heartBeat = 0;



function drawHeart(){


    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );



    heartRotation +=0.006;



    heartBeat +=0.08;



    let beatScale =

    1 +

    Math.sin(heartBeat)*0.035;



    ctx.rotate(

        heartRotation

    );



    ctx.scale(

        beatScale,

        beatScale

    );





    ctx.beginPath();



    for(

        let t=0;

        t<=Math.PI*2;

        t+=0.015

    ){



        let x =

        16 *

        Math.pow(

            Math.sin(t),

            3

        );



        let y =

        -(

            13*Math.cos(t)

            -

            5*Math.cos(2*t)

            -

            2*Math.cos(3*t)

            -

            Math.cos(4*t)

        );





        if(t===0){


            ctx.moveTo(

                x*7,

                y*7

            );


        }

        else{


            ctx.lineTo(

                x*7,

                y*7

            );


        }


    }



    ctx.closePath();



    ctx.strokeStyle =

    "rgba(0,240,255,.95)";



    ctx.lineWidth=3;



    ctx.shadowBlur=45;

    ctx.shadowColor="#00ffff";



    ctx.stroke();





    // internal vessels

    ctx.beginPath();



    ctx.moveTo(

        -40,

        -50

    );



    ctx.lineTo(

        0,

        -10

    );



    ctx.lineTo(

        35,

        -60

    );




    ctx.moveTo(

        -25,

        -5

    );



    ctx.lineTo(

        25,

        35

    );





    ctx.moveTo(

        -10,

        5

    );



    ctx.lineTo(

        10,

        60

    );





    ctx.strokeStyle=

    "rgba(170,250,255,.7)";



    ctx.lineWidth=1;



    ctx.stroke();



    ctx.restore();


}




// =====================================================
// ECG HEART PULSE
// =====================================================



function drawECG(){



    let pulse =

    Math.abs(

        Math.sin(

            Date.now()*0.004

        )

    );



    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );





    // pulse circle

    ctx.beginPath();



    ctx.arc(

        0,

        0,

        170 + pulse*35,

        0,

        Math.PI*2

    );



    ctx.strokeStyle =

    `rgba(

        0,

        240,

        255,

        ${0.1+pulse*0.25}

    )`;



    ctx.lineWidth=3;



    ctx.shadowBlur=50;

    ctx.shadowColor="#00ffff";



    ctx.stroke();





    // ECG line

    ctx.beginPath();



    let start=-250;



    for(

        let x=0;

        x<500;

        x+=5

    ){



        let y=0;



        if(

            x>180 &&

            x<220

        ){

            y=-45;

        }

        else if(

            x>=220 &&

            x<260

        ){

            y=45;

        }

        else if(

            x>=260 &&

            x<290

        ){

            y=-20;

        }





        if(x===0){

            ctx.moveTo(

                start+x,

                y

            );

        }

        else{


            ctx.lineTo(

                start+x,

                y

            );


        }



    }





    ctx.strokeStyle=

    "rgba(0,255,255,.8)";



    ctx.lineWidth=2;



    ctx.stroke();



    ctx.restore();


}




// =====================================================
// ENERGY SHOCKWAVE
// =====================================================


let shock=0;



function drawShockwave(){


    shock++;



    if(shock>300){

        shock=0;

    }



    ctx.save();



    ctx.translate(

        w/2,

        h/2

    );



    ctx.beginPath();



    ctx.arc(

        0,

        0,

        shock,

        0,

        Math.PI*2

    );



    ctx.strokeStyle =

    `rgba(

        0,

        220,

        255,

        ${1-shock/300}

    )`;



    ctx.lineWidth=2;



    ctx.stroke();



    ctx.restore();


}




// =====================================================
// FINAL ANIMATION LOOP
// =====================================================



function animate(){


    time++;



    ctx.clearRect(

        0,

        0,

        w,

        h

    );





    // background systems

    drawBackgroundGlow();


    drawMedicalGrid();


    drawParticles();


    drawMedicalBubbles();





    // AI hologram systems

    drawHUD();


    drawMolecularOrbit();


    drawMedicalWaves();





    // DNA

    dnaRotation +=0.012;



    drawDNA(-270);



    drawDNA(270);





    // scanner

    drawScanner();





    // heart

    drawHeart();



    drawECG();



    drawShockwave();





    requestAnimationFrame(

        animate

    );


}





// =====================================================
// START ENGINE
// =====================================================



requestAnimationFrame(

    animate

);