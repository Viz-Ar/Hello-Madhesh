const places = [

    {
        name: "Janaki Temple",
        category: "Temple",
        district: "Dhanusha",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800"
    },

    {
        name: "Gadhimai Temple",
        category: "Tourism",
        district: "Bara",
        image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800"
    },

    {
        name: "Provincial Hospital",
        category: "Hospital",
        district: "Janakpur",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
    },

    {
        name: "Madhesh Province Office",
        category: "Government",
        district: "Janakpur",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    },

    {
        name: "Hotel Welcome",
        category: "Hotel",
        district: "Janakpur",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
    }

];

const discoverContainer = document.getElementById("discoverContainer");

const placeSearch = document.getElementById("placeSearch");

const categorySelect = document.getElementById("categorySelect");

function loadPlaces(data) {

    discoverContainer.innerHTML = "";

    data.forEach(place => {

        discoverContainer.innerHTML += `

<div class="place-card">

<img src="${place.image}">

<div class="place-content">

<span>${place.category}</span>

<h3>${place.name}</h3>

<p>District : ${place.district}</p>

<button>Learn More</button>

</div>

</div>

`;

    });

}

loadPlaces(places);

function filterPlaces() {

    const keyword = placeSearch.value.toLowerCase();

    const category = categorySelect.value;

    const filtered = places.filter(place => {

        const matchName = place.name.toLowerCase().includes(keyword);

        const matchCategory =

            category === "all" ||

            place.category === category;

        return matchName && matchCategory;

    });

    loadPlaces(filtered);

}

placeSearch.addEventListener("input", filterPlaces);

categorySelect.addEventListener("change", filterPlaces);
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

console.log(supabase);