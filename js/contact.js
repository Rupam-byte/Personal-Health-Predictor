// ===================================================
// HEALTH AI CONTACT SEARCH
// Simple Web Search Approach
// ===================================================


document.addEventListener("DOMContentLoaded",()=>{


const searchInput =
document.getElementById("doctorSearch");


const locationBtn =
document.getElementById("locationBtn");


const locationText =
document.getElementById("locationText");


const results =
document.getElementById("results");



let userLocation = "";




// ==============================
// ENABLE LOCATION
// ==============================


locationBtn.addEventListener("click",()=>{


if(!navigator.geolocation){


alert("Location not supported");


return;


}



navigator.geolocation.getCurrentPosition(

(position)=>{


const lat =
position.coords.latitude;


const lng =
position.coords.longitude;



userLocation =
`${lat},${lng}`;



locationText.innerHTML=

`
<i class="fa-solid fa-circle-check"></i>
Location detected
`;



showDefaultSearch();



},


()=>{


locationText.innerHTML=

`
Location permission denied
`;



}


);



});






// ==============================
// SEARCH
// ==============================


// ==============================
// ENTER KEY GOOGLE SEARCH
// ==============================

searchInput.addEventListener(
"keydown",
(e)=>{


if(e.key === "Enter"){


let query =
searchInput.value.trim();



if(query.length < 2)
return;



let location =
userLocation
?
" near my location"
:
"";


let googleSearch =

`https://www.google.com/search?q=${encodeURIComponent(
query + " doctor clinic hospital" + location
)}`;



window.open(
googleSearch,
"_blank"
);



}



});



function showDefaultSearch(){


results.innerHTML=`

<div class="doctor-card">

<h3>
Search Healthcare
</h3>

<p>
Type doctor name or disease
</p>

</div>

`;


}








// ==============================
// WEB SEARCH RESULT
// ==============================


function searchWeb(query){



let location =
userLocation
?
` near my location`
:
"";




let googleSearch =

`https://www.google.com/search?q=${encodeURIComponent(
query+" doctor clinic hospital"+location
)}`;



let mapsSearch =

`https://www.google.com/maps/search/${encodeURIComponent(
query+" doctor"
)}`;



results.innerHTML=`

<div class="doctor-card">


<h3>
${query} Specialist Search
</h3>



<p>
Find verified doctors, clinics and hospitals.
</p>



<a

href="${googleSearch}"

target="_blank"

class="search-btn">

<i class="fa-brands fa-google"></i>

Search Google

</a>


<br><br>



<a

href="${mapsSearch}"

target="_blank"

class="search-btn">

<i class="fa-solid fa-map-location-dot"></i>

Open Google Maps

</a>



</div>

`;



}


});