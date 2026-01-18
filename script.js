// Splash Screen
setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("main").classList.remove("hidden");
}, 3000);

// District-wise data WITH location details
const data = {
    Dhanusha: [
        {
            name: "Janaki Mandir",
            desc: "One of Nepal’s most famous temples",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Janaki+Mandir+Janakpur"
        },
        {
            name: "Janakpur Dham",
            desc: "Birthplace of Goddess Sita",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Janakpur+Dham"
        },
        {
            name: "Dhanush Sagar",
            desc: "Sacred pond",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Dhanush+Sagar+Janakpur"
        },
        {
            name: "Ganga Sagar",
            desc: "Religious water body",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Ganga+Sagar+Janakpur"
        },
        {
            name: "Ram Mandir",
            desc: "Important Hindu shrine",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Ram+Mandir+Janakpur"
        }
    ],
    Bara: [
        {
            name: "Gadhimai Temple",
            desc: "Major pilgrimage destination",
            city: "Kalaiya",
            map: "https://www.google.com/maps/dir/?api=1&destination=Gadhimai+Temple+Bara"
        },
        {
            name: "Simraungadh Ruins",
            desc: "Archaeological and historical site",
            city: "Simraungadh",
            map: "https://www.google.com/maps/dir/?api=1&destination=Simraungadh+Ruins"
        },
        {
            name: "Nijgadh Forest Area",
            desc: "Nature and wildlife",
            city: "Simraungadh",
            map: "https://www.google.com/maps/dir/?api=1&destination=Nijgadh+Forest+Area"
        },
        {
            name: "Kalaiya City",
            desc: "Administrative and cultural center",
            city: "Simraungadh",
            map: "https://www.google.com/maps/dir/?api=1&destination=Kalaiya+City"
        },
        {
            name: "Shreepur",
            desc: "Local religious site",
            city: "Simraungadh",
            map: "https://www.google.com/maps/dir/?api=1&destination=Shreepur"
        }
    ],
    Mahottari: [
        {
            name: "Jaleshwar Temple",
            desc: "Ancient Shiva temple",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Jaleshwar+Temple"
        },
        {
            name: "Janakpur–Jaleshwar Road",
            desc: "Cultural and religious corridor",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Janakpur–Jaleshwar+Road"
        },
        {
            name: "Pipra",
            desc: "Historical and religious site",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Pipra"
        },
        {
            name: "Bhangaha",
            desc: "Town with local cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Bhangaha"
        },
        {
            name: "Matihani",
            desc: "Religious and educational center",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Matihani"
        }
    ],
    Saptari: [
        {
            name: "Chhinnamasta Bhagwati Temple",
            desc: "Famous Shakti Peeth",
            city: "Rajbiraj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Chhinnamasta+Bhagwati+Temple"
        },
        {
            name: "Koshi Tappu Wildlife Reserve",
            desc: "Wildlife and nature reserve",
            city: "Rajbiraj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Koshi+Tappu+Wildlife+Reserve"
        },
        {
            name: "Rajbiraj City",
            desc: "Planned city with cultural importance",
            city: "Rajbiraj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Rajbiraj+City"
        },
        {
            name: "Kankalini Temple (Bhardaha)",
            desc: "Major religious site",
            city: "Rajbiraj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Kankalini+Temple+Bhardaha"
        },
        {
            name: "Maleth Dham",
            desc: "Sacred temple with historical value",
            city: "Rajbiraj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Maleth+Dham"
        },
        {
            name: "Koshi Barrage",
            desc: "Scenic and engineering landmark",
            city: "Rajbiraj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Koshi+Barrage"
        }
    ],

    Parsa: [
        {
            name: "Parsa National Park",
            desc: "Eco-tourism and wildlife destination",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Parsa+National+Park"
        },
        {
            name: "Thori",
            desc: "Scenic border town near forest",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Thori+Nepal"
        },
        {
            name: "Birgunj",
            desc: "Administrative and cultural center",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Birgunj"
        },
        {
            name: "Sirsiya River",
            desc: "River with scenic beauty",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Sirsiya+River"
        },
        {
            name: "Gadhimai Temple",
            desc: "Major pilgrimage destination",
            city: "Kalaiya",
            map: "https://www.google.com/maps/dir/?api=1&destination=Gadhimai+Temple+Bara"
        }
    ],
    Sarlahi: [
        {
            name: "Bagmarti River Area - Religious Site",
            desc: "River with scenic beauty",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Bagmarti+River+Area"
        },
        {
            name: "Hariwan City",
            desc: "Planned city with cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Hariwan+City"
        },
        {
            name: "Lalbandi Town",
            desc: "Town with local cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Lalbandi+Town"
        },
        {
            name: "Karmaiya",
            desc: "Town with local cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Karmaiya"
        },
        {
            name: "Murtiya River",
            desc: "River with scenic beauty",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Murtiya+River"
        },

    ],
    Siraha: [
        {
            name: "GolBazar",
            desc: "Town with local cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=GolBazar"
        },
        {
            name: "Karjana River",
            desc: "River with scenic beauty",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Karjana+River"
        },
        {
            name: "Mahendra Ganj",
            desc: "Town with local cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Mahendra+Ganj"
        },
        {
            name: "Lahan City",
            desc: "Planned city with cultural importance",
            city: "Janakpur",
            map: "https://www.google.com/maps/dir/?api=1&destination=Lahan+City"
        }
    ],
    Rautahat: [
        {
            name: "Gaur City",
            desc: "Planned city with cultural importance",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Gaur+City"
        },
        {
            name: "Bagmati River Belt",
            desc: "River with scenic beauty",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Bagmati+River+Belt"
        },
        {
            name: "Durga Bhagwati Temple",
            desc: "Major pilgrimage destination",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Durga+Bhagwati+Temple+Birgunj"
        },
        {
            name: "Chandranighapur",
            desc: "Town with local cultural importance",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Chandranighapuri"
        },
        {
            name: "Nunthar",
            desc: "Shiv Temple with historical value and Suspension Bridge over the Bank of Bagmati River",
            city: "Birgunj",
            map: "https://www.google.com/maps/dir/?api=1&destination=Nunthar"
        }
    ]
};

// Show places with BUTTON, LOCATION & MAP
function showPlaces(district) {
    document.getElementById("districtTitle").innerText =
        "Tourist Places in " + district;

    let output = "";

    data[district].forEach(place => {
        output += `
        <div class="place-card">
            <h3>📍 ${place.name}</h3>
            <p>${place.desc}</p>
            <p><strong>Nearest City:</strong> ${place.city}</p>
            <p><strong>Road Access:</strong> Bus / Taxi available from ${place.city}</p>
            <button onclick="openMap('${place.map}')">
                🗺️ View Location & Road Map
            </button>
        </div>
        `;
    });

    document.getElementById("placeList").innerHTML = output;
}

// Open Google Maps
function openMap(link) {
    window.open(link, "_blank");
}
