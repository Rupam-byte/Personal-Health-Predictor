"use strict";


// =====================================================
// CONFIG
// =====================================================

const API_BASE_URL = "http://127.0.0.1:5000";

const HISTORY_API =
    API_BASE_URL + "/api/history";



// =====================================================
// GLOBAL
// =====================================================

let healthChart = null;

let currentHistory = [];

let pulseTimer = null;



// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    ()=>{


        loadUsername();

        loadDashboard();



        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if(logoutBtn){

            logoutBtn.addEventListener(
                "click",
                logoutUser
            );

        }


    }
);




// =====================================================
// USERNAME
// =====================================================

function loadUsername(){


    const username =
        document.getElementById(
            "navUsername"
        );


    const user =
        JSON.parse(
            localStorage.getItem(
                "currentUser"
            )
        );


    if(username && user){


        username.innerText =
            user.name ||
            user.username ||
            "User";

    }


}



// =====================================================
// LOAD DASHBOARD
// =====================================================


async function loadDashboard(){


try{


const response =
await fetch(
    HISTORY_API,
    {
        method:"GET",
        credentials:"include"
    }
);



const data =
await response.json();



if(!data.success){


    clearDashboard();

    return;

}



currentHistory =
data.history || [];



updateStats(
    currentHistory
);


updateHistoryTable(
    currentHistory
);


updateHealthScore(
    currentHistory
);


updateSummary(
    currentHistory
);


createHealthChart(
    currentHistory
);



}

catch(error){


console.error(
"Dashboard Error:",
error
);


}


}




// =====================================================
// STAT CARDS
// =====================================================


function updateStats(history){


const total =
document.getElementById(
    "totalPredictions"
);


const disease =
document.getElementById(
    "lastDisease"
);


const confidence =
document.getElementById(
    "averageConfidence"
);



if(total)
total.innerText =
history.length;



if(history.length===0){


if(disease)
disease.innerText="-";


if(confidence)
confidence.innerText="0%";


return;


}




const latest =
history[0];



if(disease)
disease.innerText =
latest.predicted_disease || "Unknown";



let sum=0;



history.forEach(item=>{


sum += Number(
item.confidence || 0
);


});



let avg =
Math.round(
sum/history.length
);



if(confidence)
confidence.innerText =
avg+"%";


}






// =====================================================
// HEALTH SCORE
// LOWER CONFIDENCE = BETTER HEALTH
// =====================================================


function updateHealthScore(history){


const score =
document.getElementById(
    "healthScore"
);



if(!score)
return;



if(history.length===0){

score.innerText="0%";

return;

}



let risk=0;



history.forEach(item=>{


risk += Number(
item.confidence || 0
);


});



risk =
Math.round(
risk/history.length
);



let health =
100-risk;



score.innerText =
health+"%";


}





// =====================================================
// HISTORY TABLE
// =====================================================


function updateHistoryTable(history){


const table =
document.getElementById(
"historyTableBody"
);



if(!table)
return;



table.innerHTML="";



if(history.length===0){


table.innerHTML=

`
<tr>
<td colspan="5">
No prediction history found
</td>
</tr>
`;


return;


}





history.forEach(item=>{


const row =
document.createElement(
"tr"
);



let symptoms =
Array.isArray(
item.symptoms_input
)
?
item.symptoms_input.join(", ")
:
"-";



row.innerHTML=

`
<td>
${item.created_at || "Recent"}
</td>


<td>
${item.predicted_disease || "-"}
</td>


<td>
${item.confidence || 0}%
</td>


<td>
${item.risk_level || "-"}
</td>


<td>
${symptoms}
</td>

`;



table.appendChild(row);



});



}





// =====================================================
// HEALTH CONDITION TREND GRAPH
// =====================================================


function createHealthChart(history){



const canvas =
document.getElementById(
"healthTrendChart"
);



if(!canvas)
return;



const ctx =
canvas.getContext(
"2d"
);



if(healthChart)
healthChart.destroy();



if(pulseTimer)
clearInterval(
pulseTimer
);





const sorted =
history
.slice()
.reverse();





const labels =
sorted.map(
(item,index)=>

"Diagnosis "+(index+1)

);





// confidence converted into risk

const values =
sorted.map(
item=>

Number(
item.confidence || 0
)

);





const gradient =
ctx.createLinearGradient(
0,
0,
0,
400
);



gradient.addColorStop(
0,
"rgba(255,77,109,.35)"
);


gradient.addColorStop(
0.5,
"rgba(255,209,102,.25)"
);


gradient.addColorStop(
1,
"rgba(57,255,136,.25)"
);






healthChart =
new Chart(
ctx,
{


type:"line",



data:{


labels:labels,


datasets:[


{

label:
"Health Risk Level",


data:values,


borderWidth:4,


borderColor:
"#00d4ff",


backgroundColor:
gradient,


fill:true,


tension:.45,


pointRadius:8,


pointHoverRadius:12,


pointBackgroundColor:
function(ctx){


let v =
ctx.raw;



if(v<=20)
return "#39ff88";


if(v<=40)
return "#7cff00";


if(v<=60)
return "#ffd166";


if(v<=80)
return "#ff9f43";


return "#ff4d6d";


},


pointBorderColor:
"#ffffff",


pointBorderWidth:3


}


]

},





options:{


responsive:true,


maintainAspectRatio:false,



plugins:{


legend:{


labels:{


color:"#ffffff"

}


},



tooltip:{


callbacks:{


label:(ctx)=>{


let v =
ctx.raw;



let text =
"Critical";



if(v<=20)
text="Excellent";


else if(v<=40)
text="Good";


else if(v<=60)
text="Stable";


else if(v<=80)
text="Warning";



return `Risk ${v}% | ${text}`;


}


}


}


},





scales:{


x:{


ticks:{
color:"#9bd9e8"
},


grid:{
color:"rgba(255,255,255,.08)"
}


},



y:{


min:0,

max:100,


ticks:{


stepSize:20,


color:"#9bd9e8",



callback:(value)=>{


if(value===0)
return "Excellent 🟢";


if(value===20)
return "Good 🟢";


if(value===40)
return "Stable 🟡";


if(value===60)
return "Warning 🟠";


if(value===80)
return "High Risk 🔴";


if(value===100)
return "Critical 🔴";


}


},


grid:{
color:"rgba(255,255,255,.08)"
}


}


}


}


}

);



pulseTimer =
setInterval(()=>{


if(!healthChart)
return;



let size =
8 +
Math.sin(
Date.now()/300
)
*
2;



healthChart
.data
.datasets[0]
.pointRadius =
size;



healthChart.update(
"none"
);



},700);



}







// =====================================================
// AI SUMMARY
// =====================================================


function updateSummary(history){


const text =
document.getElementById(
"aiSummaryText"
);



if(!text)
return;



if(history.length===0){


text.innerText =
"Complete diagnosis to generate AI health insights.";


return;


}



let latest =
history[0];



text.innerText =

`
Latest AI analysis detected
${latest.predicted_disease || "unknown disease"}
with
${latest.confidence || 0}%
confidence.
`;



}





// =====================================================
// CLEAR
// =====================================================


function clearDashboard(){


updateStats([]);

updateHistoryTable([]);

updateHealthScore([]);


}







// =====================================================
// LOGOUT
// =====================================================


async function logoutUser(){


try{


await fetch(

API_BASE_URL+"/api/logout",

{

method:"POST",

credentials:"include"

}

);


}

catch(error){

console.log(error);

}



localStorage.removeItem(
"currentUser"
);



window.location.href =
"login.html";


}