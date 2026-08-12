/*=====================================================
    HEALTH AI FRONTEND
    script.js (Part 1)
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initNavbar();

    initCounter();

    initRipple();

    initCardTilt();

    initReveal();

});

/*=====================================================
    NAVBAR SCROLL
======================================================*/

function initNavbar(){

    const nav = document.querySelector("nav");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>50){

            nav.style.background="rgba(5,20,40,.75)";
            nav.style.backdropFilter="blur(25px)";
            nav.style.boxShadow="0 10px 35px rgba(0,0,0,.3)";

        }else{

            nav.style.background="rgba(5,20,40,.25)";
            nav.style.boxShadow="none";

        }

    });

}

/*=====================================================
    COUNTERS
======================================================*/

function animateCounter(el,target,suffix=""){

    let count=0;

    const speed=target/80;

    function update(){

        count+=speed;

        if(count<target){

            el.innerHTML=Math.floor(count)+suffix;

            requestAnimationFrame(update);

        }else{

            el.innerHTML=target+suffix;

        }

    }

    update();

}

function initCounter(){

    const numbers=document.querySelectorAll(".stats h2");

    if(numbers.length<3) return;

    animateCounter(numbers[0],98,"%");

    animateCounter(numbers[1],15,"K+");

    numbers[2].innerHTML="24/7";

}

/*=====================================================
    BUTTON RIPPLE
======================================================*/

function initRipple(){

    const buttons=document.querySelectorAll("button");

    buttons.forEach(btn=>{

        btn.addEventListener("click",function(e){

            const ripple=document.createElement("span");

            ripple.classList.add("ripple");

            const size=Math.max(this.clientWidth,this.clientHeight);

            ripple.style.width=size+"px";
            ripple.style.height=size+"px";

            const rect=this.getBoundingClientRect();

            ripple.style.left=
            e.clientX-rect.left-size/2+"px";

            ripple.style.top=
            e.clientY-rect.top-size/2+"px";

            this.appendChild(ripple);

            setTimeout(()=>{

                ripple.remove();

            },600);

        });

    });

}

/*=====================================================
    CARD TILT
======================================================*/

function initCardTilt(){

    const card=document.querySelector(".glass-card");

    if(!card) return;

    card.addEventListener("mousemove",(e)=>{

        const rect=card.getBoundingClientRect();

        const x=e.clientX-rect.left;

        const y=e.clientY-rect.top;

        const rotateY=(x/rect.width-.5)*18;

        const rotateX=(.5-y/rect.height)*18;

        card.style.transform=`

        perspective(1000px)

        rotateX(${rotateX}deg)

        rotateY(${rotateY}deg)

        scale(1.03)

        `;

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";

    });

}

/*=====================================================
    SCROLL REVEAL
======================================================*/

function initReveal(){

    const observer=new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("show");

            }

        });

    },{

        threshold:.2

    });

    document.querySelectorAll(

        ".left,.right,.glass-card,.stats"

    ).forEach(el=>{

        el.classList.add("hidden");

        observer.observe(el);

    });

}

/*=====================================================
    HERO PARALLAX
======================================================*/

const hero=document.querySelector(".hero");

document.addEventListener("mousemove",(e)=>{

    if(!hero) return;

    let x=(window.innerWidth/2-e.pageX)/80;

    let y=(window.innerHeight/2-e.pageY)/80;

    hero.style.transform=`translate(${x}px,${y}px)`;

});

/*=====================================================
    GLOW PARALLAX
======================================================*/

const glow1=document.querySelector(".glow1");
const glow2=document.querySelector(".glow2");

document.addEventListener("mousemove",(e)=>{

    const x=e.clientX/window.innerWidth;

    const y=e.clientY/window.innerHeight;

    if(glow1){

        glow1.style.transform=

        `translate(${x*40}px,${y*40}px)`;

    }

    if(glow2){

        glow2.style.transform=

        `translate(${-x*40}px,${-y*40}px)`;

    }

});

/*=====================================================
    END OF PART 1
======================================================*/
/*=====================================================
    HEALTH AI FRONTEND
    script.js (Part 2)
======================================================*/

/*=====================================================
    CURSOR GLOW
======================================================*/

const cursor = document.createElement("div");

cursor.className = "cursorGlow";

document.body.appendChild(cursor);

document.addEventListener("mousemove", (e) => {

    cursor.style.left = e.clientX + "px";

    cursor.style.top = e.clientY + "px";

});

/*=====================================================
    MOUSE SPOTLIGHT
======================================================*/

const spotlight = document.createElement("div");

spotlight.className = "spotlight";

document.body.appendChild(spotlight);

document.addEventListener("mousemove", (e) => {

    spotlight.style.left = e.clientX + "px";

    spotlight.style.top = e.clientY + "px";

});

/*=====================================================
    SCROLL PROGRESS BAR
======================================================*/

const progress = document.createElement("div");

progress.id = "progressBar";

document.body.appendChild(progress);

window.addEventListener("scroll", () => {

    const doc = document.documentElement;

    const total = doc.scrollHeight - doc.clientHeight;

    const percent = (doc.scrollTop / total) * 100;

    progress.style.width = percent + "%";

});

/*=====================================================
    FLOATING PARTICLES
======================================================*/

const particleContainer = document.getElementById("particles");

if (particleContainer) {

    for (let i = 0; i < 80; i++) {

        const p = document.createElement("div");

        p.className = "particle";

        p.style.left = Math.random() * 100 + "vw";

        p.style.width = 2 + Math.random() * 4 + "px";

        p.style.height = p.style.width;

        p.style.animationDuration =
            8 + Math.random() * 10 + "s";

        p.style.animationDelay =
            Math.random() * 10 + "s";

        particleContainer.appendChild(p);

    }

}

/*=====================================================
    FLOATING DNA ICONS
======================================================*/

const dnaIcons = document.querySelectorAll(".dna-icons i");

dnaIcons.forEach((icon) => {

    const size = 20 + Math.random() * 40;

    icon.style.fontSize = size + "px";

});

/*=====================================================
    AI PROGRESS RING
======================================================*/

const circle = document.querySelector(".circle");

let percentage = 0;

function animateCircle() {

    if (!circle) return;

    percentage++;

    circle.style.background = `

    conic-gradient(

    #00d4ff 0%,

    #0066ff ${percentage}%,

    rgba(255,255,255,.08) ${percentage}%)

    `;

    if (percentage < 94) {

        requestAnimationFrame(animateCircle);

    }

}

animateCircle();

/*=====================================================
    GLOW PULSE
======================================================*/

setInterval(() => {

    document.querySelectorAll(".glow").forEach((g) => {

        g.animate(

            [

                {

                    transform: "scale(1)"

                },

                {

                    transform: "scale(1.15)"

                },

                {

                    transform: "scale(1)"

                }

            ],

            {

                duration: 4000,

                easing: "ease-in-out"

            }

        );

    });

}, 4000);

/*=====================================================
    DISEASE ROTATION
======================================================*/

const diseases = [

    "Influenza",

    "Healthy",

    "COVID-19",

    "Migraine",

    "Allergy",

    "Common Cold",

    "Pneumonia"

];

const disease = document.querySelector(".disease");

let diseaseIndex = 0;

setInterval(() => {

    if (!disease) return;

    disease.style.opacity = "0";

    setTimeout(() => {

        diseaseIndex++;

        if (diseaseIndex >= diseases.length)

            diseaseIndex = 0;

        disease.innerHTML = diseases[diseaseIndex];

        disease.style.opacity = "1";

    }, 300);

}, 5000);

/*=====================================================
    FLOATING CARD EFFECT
======================================================*/

const glass = document.querySelector(".glass-card");

if (glass) {

    let angle = 0;

    setInterval(() => {

        angle += 0.02;

        glass.style.transform +=
            ` translateY(${Math.sin(angle) * 3}px)`;

    }, 30);

}

/*=====================================================
    BUTTON HOVER GLOW
======================================================*/

document.querySelectorAll("button").forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.boxShadow =
            "0 0 25px rgba(0,212,255,.5)";

    });

    btn.addEventListener("mouseleave", () => {

        btn.style.boxShadow = "none";

    });

});

/*=====================================================
    WINDOW RESIZE
======================================================*/

window.addEventListener("resize", () => {

    console.log("Responsive layout updated");

});

/*=====================================================
    END OF PART 2
======================================================*/
/*=====================================================
    HEALTH AI FRONTEND
    script.js (Part 3A)
======================================================*/

/*=====================================================
    SMOOTH NAVIGATION
======================================================*/

document.querySelectorAll("nav a").forEach(link=>{

    link.addEventListener("click",function(e){

        const href=this.getAttribute("href");

        if(href.startsWith("#")){

            e.preventDefault();

            const target=document.querySelector(href);

            if(target){

                target.scrollIntoView({

                    behavior:"smooth"

                });

            }

        }

    });

});

/*=====================================================
    HERO TITLE ANIMATION
======================================================*/

const heroTitle=document.querySelector(".left h1");

if(heroTitle){

    heroTitle.animate([

        {

            opacity:0,

            transform:"translateY(60px)"

        },

        {

            opacity:1,

            transform:"translateY(0px)"

        }

    ],{

        duration:1200,

        easing:"ease-out"

    });

}

/*=====================================================
    PARAGRAPH FADE
======================================================*/

const heroText=document.querySelector(".left p");

if(heroText){

    heroText.animate([

        {

            opacity:0

        },

        {

            opacity:1

        }

    ],{

        duration:1800

    });

}

/*=====================================================
    BUTTON ANIMATION
======================================================*/

document.querySelectorAll(".hero-buttons button")

.forEach((btn,index)=>{

    btn.animate([

        {

            opacity:0,

            transform:"translateY(30px)"

        },

        {

            opacity:1,

            transform:"translateY(0)"

        }

    ],{

        duration:1000,

        delay:index*200,

        fill:"forwards"

    });

});

/*=====================================================
    STATS ANIMATION
======================================================*/

document.querySelectorAll(".stats div")

.forEach((box,index)=>{

    box.animate([

        {

            opacity:0,

            transform:"translateY(50px)"

        },

        {

            opacity:1,

            transform:"translateY(0)"

        }

    ],{

        duration:1000,

        delay:500+(index*200),

        fill:"forwards"

    });

});

/*=====================================================
    LOGO PULSE
======================================================*/

const logo=document.querySelector(".logo i");

if(logo){

    setInterval(()=>{

        logo.animate([

            {

                transform:"scale(1)"

            },

            {

                transform:"scale(1.3)"

            },

            {

                transform:"scale(1)"

            }

        ],{

            duration:1000

        });

    },2500);

}

/*=====================================================
    CHIP HOVER
======================================================*/

document.querySelectorAll(".chips span")

.forEach(chip=>{

    chip.addEventListener("mouseenter",()=>{

        chip.style.transform="translateY(-4px)";

    });

    chip.addEventListener("mouseleave",()=>{

        chip.style.transform="translateY(0px)";

    });

});

/*=====================================================
    REPORT BUTTON EFFECT
======================================================*/

const report=document.querySelector(".report-btn");

if(report){

report.addEventListener("mouseenter",()=>{

report.style.transform="scale(1.04)";

});

report.addEventListener("mouseleave",()=>{

report.style.transform="scale(1)";

});

}

/*=====================================================
    GLASS CARD SHADOW
======================================================*/

const glassCard=document.querySelector(".glass-card");

if(glassCard){

glassCard.addEventListener("mousemove",(e)=>{

const rect=glassCard.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

glassCard.style.boxShadow=

`${(x-rect.width/2)/10}px
${(y-rect.height/2)/10}px
40px rgba(0,212,255,.35)`;

});

glassCard.addEventListener("mouseleave",()=>{

glassCard.style.boxShadow="0 20px 60px rgba(0,0,0,.35)";

});

}

/*=====================================================
    FLOATING EFFECT
======================================================*/

let floating=0;

setInterval(()=>{

floating+=0.03;

if(glassCard){

glassCard.style.marginTop=

Math.sin(floating)*8+"px";

}

},30);

/*=====================================================
    AI STATUS BLINK
======================================================*/

const live=document.querySelector(".card-top span");

if(live){

setInterval(()=>{

live.style.opacity=

live.style.opacity==="0.3"

?"1":"0.3";

},800);

}

/*=====================================================
    END OF PART 3A
======================================================*/
/*=====================================================
    HEALTH AI FRONTEND
    script.js (Part 3B)
======================================================*/

/*=====================================================
    ECG GLOW ANIMATION
======================================================*/

const ecgLine = document.querySelector(".ecg polyline");

if (ecgLine) {

    setInterval(() => {

        ecgLine.animate(
            [
                {
                    filter: "drop-shadow(0 0 5px cyan)"
                },
                {
                    filter: "drop-shadow(0 0 20px #00d4ff)"
                },
                {
                    filter: "drop-shadow(0 0 5px cyan)"
                }
            ],
            {
                duration: 1000
            }
        );

    }, 1000);

}

/*=====================================================
    CARD FADE LOOP
======================================================*/

const card = document.querySelector(".glass-card");

if (card) {

    setInterval(() => {

        card.animate(
            [
                {
                    opacity: 1
                },
                {
                    opacity: .97
                },
                {
                    opacity: 1
                }
            ],
            {
                duration: 2500
            }
        );

    }, 2500);

}

/*=====================================================
    BUTTON PULSE
======================================================*/

document.querySelectorAll("button").forEach(btn => {

    setInterval(() => {

        btn.animate(
            [
                {
                    transform: "scale(1)"
                },
                {
                    transform: "scale(1.04)"
                },
                {
                    transform: "scale(1)"
                }
            ],
            {
                duration: 1800
            }
        );

    }, 5000);

});

/*=====================================================
    RANDOM CHIP HIGHLIGHT
======================================================*/

const chips = document.querySelectorAll(".chips span");

if (chips.length > 0) {

    setInterval(() => {

        chips.forEach(c => {

            c.style.background = "rgba(255,255,255,.08)";
            c.style.color = "#fff";

        });

        const random = Math.floor(Math.random() * chips.length);

        chips[random].style.background = "#00d4ff";
        chips[random].style.color = "#08131f";

    }, 1800);

}

/*=====================================================
    PARALLAX ROTATION
======================================================*/

document.addEventListener("mousemove", e => {

    const x = (e.clientX / window.innerWidth - 0.5) * 6;
    const y = (e.clientY / window.innerHeight - 0.5) * -6;

    if (card) {

        card.style.transform =
            `perspective(1200px)
             rotateX(${y}deg)
             rotateY(${x}deg)`;

    }

});

/*=====================================================
    FLOATING GLOW BLOBS
======================================================*/

document.querySelectorAll(".glow").forEach(glow => {

    let angle = Math.random() * 360;

    setInterval(() => {

        angle += 0.4;

        const x = Math.sin(angle * Math.PI / 180) * 25;
        const y = Math.cos(angle * Math.PI / 180) * 25;

        glow.style.transform =
            `translate(${x}px, ${y}px)`;

    }, 30);

});

/*=====================================================
    PAGE VISIBILITY
======================================================*/

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        console.log("Animation paused");

    } else {

        console.log("Animation resumed");

    }

});

/*=====================================================
    RANDOM BACKGROUND COLOR SHIFT
======================================================*/

setInterval(() => {

    document.body.animate(
        [
            {
                filter: "brightness(1)"
            },
            {
                filter: "brightness(1.05)"
            },
            {
                filter: "brightness(1)"
            }
        ],
        {
            duration: 6000
        }
    );

}, 6000);

/*=====================================================
    AI LOADING TEXT
======================================================*/

const predictionText = document.querySelector(".prediction-text");

const messages = [

    "Analyzing patient symptoms...",

    "Processing neural network...",

    "Comparing disease patterns...",

    "Generating prediction report...",

    "Analysis completed."

];

let messageIndex = 0;

if (predictionText) {

    setInterval(() => {

        predictionText.style.opacity = "0";

        setTimeout(() => {

            predictionText.textContent = messages[messageIndex];

            predictionText.style.opacity = "1";

            messageIndex++;

            if (messageIndex >= messages.length) {

                messageIndex = 0;

            }

        }, 300);

    }, 4000);

}

/*=====================================================
    CONSOLE MESSAGE
======================================================*/

console.log("%cHealthAI Frontend Loaded",
"color:#00d4ff;font-size:20px;font-weight:bold;");

console.log("UI Ready");

/*=====================================================
    END
======================================================*/