const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const API_URL = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies';
const API_KEY = 'solaris-2ngXkR6S02ijFrTP';
let allPlanets = []; // Global variabel för att lagra planetdata

// Hämta planetdata från API
async function fetchPlanets() {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'x-zocom': API_KEY, // Skickar API-nyckeln i headern
            },
        });

        if (!response.ok) {
            throw new Error(`API-fel: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Parsar JSON-data
        console.log(data.bodies); // Kontrollera datan i konsolen
        return data.bodies; // Returnerar alla himlakroppar
    } catch (error) {
        console.error('Fel vid hämtning av API-data:', error);
        return [];
    }
}

// Visa planeter och hantera filtrering
function loadPlanets(filter = "") {
    const planetList = document.getElementById("planet-list");
    if (!planetList) return;

    planetList.innerHTML = ""; // Rensa innehållet

    // Filtrera och rendera planeter
    allPlanets
        .filter(planet => planet.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(planet => {
            const planetItem = document.createElement("div");
            planetItem.className = "planet-item";
            planetItem.innerHTML = `
                <img src="${planet.image || 'default-image.jpg'}" alt="${planet.name}">
                <h3>${planet.name}</h3>
            `;
            planetItem.addEventListener("click", () => showPlanetCard(planet)); // Klick för detaljer
            planetList.appendChild(planetItem);
        });

    if (planetList.innerHTML === "") {
        planetList.innerHTML = "<p>Inga planeter matchar din sökning.</p>";
    }
}

//Koppla en click-händelse till varje planet i HTML
document.querySelectorAll(".planet").forEach(planet => {
    planet.addEventListener('click', async () => {
        const planetId = parseInt(planet.getAttribute('data-id'), 10); // Läs data-id och konvertera till ett nummer
        const planets = await fetchPlanets(); // Hämta API-data
        const selectedPlanet = planets.find(p => p.id === planetId); // Hitta rätt planet

        if (selectedPlanet) {
            showPlanetCard(selectedPlanet); // Visa popup med planetinfo
        } else {
            console.error(`Ingen planet med id ${planetId} hittades.`);
        }
    });
});


// Visa detaljer om en planet på ett kort, inspirerad av Pokémonkort
function showPlanetCard(planet) {
    const planetPopup = document.getElementById("planet-popup");
    const header = document.querySelector("header");
    const solarSystem = document.getElementById("solar-system");

    if (!planetPopup || !header || !solarSystem) {
        console.error("Något element saknas för popup eller bakgrund.");
        return;
    }

    console.log("Planet clicked:", planet);

    // Sätt planetens namn och beskrivning
    document.getElementById("planet-name").textContent = planet.name;
    document.getElementById("planet-description").textContent = planet.desc || 'Ingen beskrivning tillgänglig.';

    // Hitta planetkortet och stängknappen
    const planetCard = document.querySelector(".planet-card");
    const closeButton = document.getElementById("close-card");

    if (!planetCard || !closeButton) {
        console.error("Planetkortet eller stängknappen hittades inte.");
        return;
    }

    // Rensa tidigare extra info varje gång ett nytt kort öppnas
    const extraInfoElements = document.querySelectorAll(".planet-card p.extra-info");
    extraInfoElements.forEach(element => element.remove());

    // Lägg till ny extra info från APIet
    const extraInfo = document.createElement('div');
    extraInfo.id = "extra-info";
    extraInfo.innerHTML = `
        <p class="extra-info">Avstånd från solen: ${planet.distance || 'Okänt'} km</p>
        <p class="extra-info">Temperatur dag: ${planet.temp?.day || 'Okänt'}°C</p>
        <p class="extra-info">Temperatur natt: ${planet.temp?.night || 'Okänt'}°C</p>
        <p class="extra-info">Månar: ${planet.moons?.join(", ") || 'Inga'}</p>
    `;

    // Lägg till extra-info innan "Stängknappen"
    planetCard.insertBefore(extraInfo, closeButton);

    // Visa popup och blurra bakgrunden
    planetPopup.classList.remove("hidden");
    header.classList.add("blurred");
    solarSystem.classList.add("blurred");

    // Lägg till klass för att inaktivera scroll på bakgrunden
    document.body.classList.add("popup-active");

    // Scrolla till toppen av popup om texten är för stor för skärmen
    planetPopup.scrollTop = 0;
}


// Stäng popup
document.getElementById("close-card").addEventListener("click", () => {
    const planetPopup = document.getElementById("planet-popup");
    const solarSystem = document.getElementById("solar-system");
    const header = document.querySelector("header");

    if (planetPopup && solarSystem && header) {
        planetPopup.classList.add("hidden");
        solarSystem.classList.remove("blurred");
        header.classList.remove("blurred");
    }
});





// Stäng popup
document.getElementById("close-card").addEventListener("click", () => {
    const planetPopup = document.getElementById("planet-popup");
    const solarSystem = document.getElementById("solar-system");
    const header = document.querySelector("header");

    if (planetPopup && solarSystem && header) {
        planetPopup.classList.add("hidden");
        solarSystem.classList.remove("blurred");
        header.classList.remove("blurred");

        // Ta bort klassen för att återställa scroll
        document.body.classList.remove("popup-active"); // Ta bort popup-klassen
        console.log("popup-active class removed"); // Kontrollera att detta körs

        // Säkerställ att scrollen återställs korrekt
        document.body.style.overflow = ""; // Rensa direkt inställda scroll-egenskaper
    }
});


// Hantera sökfält
// Lyssna på sökfältet för "input" och "keydown" (Enter)
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase(); // Sökterm, i små bokstäver
    const planets = document.querySelectorAll(".planet"); // Hämta alla planeter
    let matchFound = false; // Spåra om en match hittas

    planets.forEach(planet => {
        const planetName = planet.getAttribute("aria-label").toLowerCase(); // Hämta planetens namn

        // Kontrollera om planetens namn matchar sökningen
        if (planetName.includes(searchTerm) && searchTerm !== "") {
            planet.classList.add("highlight"); // Lägg till highlight om det matchar
            matchFound = true; // Sätt flaggan att en match hittas
        } else {
            planet.classList.remove("highlight"); // Ta bort highlight om det inte matchar
        }
    });

    // Om ingen match hittades, ta bort alla highlights
    if (!matchFound || searchTerm === "") {
        planets.forEach(planet => planet.classList.remove("highlight"));
    }
});

// Hantera "Enter"-tangent för att öppna informationskort
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { // Kontrollera om tangenten är Enter
        const highlightedPlanet = document.querySelector(".planet.highlight"); // Hitta markerad planet

        if (highlightedPlanet) {
            const planetId = parseInt(highlightedPlanet.getAttribute("data-id"), 10); // Hämta planetens id
            fetchPlanets().then(planets => {
                const selectedPlanet = planets.find(p => p.id === planetId); // Hitta planet i API-datan
                if (selectedPlanet) {
                    showPlanetCard(selectedPlanet); // Visa informationskort
                } else {
                    console.error("Ingen matchande planet hittades.");
                }
            });
        } else {
            // Om ingen planet är markerad, visa ett meddelande
            alert("Ingen planet är hittad. Skriv in ett riktigt planetnamn för att söka.");
        }
    }
});



// Vid sidladdning
document.addEventListener("DOMContentLoaded", () => {
    fetchPlanets(); // Hämta och visa planeter
});



// --- Stjärnhimlen med slumpmässig placering ---
document.addEventListener("DOMContentLoaded", () => {
    const starsContainer = document.querySelector(".stars");
    const numStars = 1000; // Antal stjärnor

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.animationDuration = `${Math.random() * 5 + 2}s`; // Slumpmässig varaktighet
        starsContainer.appendChild(star);
    }

    // Generera rörliga stjärnor som är svagare än kometen
    const movingStarContainer = document.querySelector(".moving-stars-container");
    const numMovingStars = 15;
    
    for (let i = 0; i < numMovingStars; i++) {
        const movingStar = document.createElement("div");
        movingStar.classList.add("moving-star");
        movingStar.style.top = `${Math.random() * 100}vh`;
        movingStar.style.left = `${Math.random() * 100}vw`;
        movingStar.style.animationDuration = `${Math.random() * 10 + 10}s`; // Slumpmässig varaktighet
        movingStarContainer.appendChild(movingStar);
    }
    
});

// För en snyggare fade in och ut effekt på planeterna vid ändring av skärmens storlek
let isVertical = window.innerWidth <= 1024; // Kontrollera initial layout

function updateLayout() {
    const planets = document.querySelectorAll('.planet');
    const solarSystem = document.getElementById('solar-system');
    const sun = document.querySelector('.sun');
    const isSmallScreen = window.innerWidth <= 1024;

    // Om brytningen sker (från horisontell till vertikal eller vice versa)
    if (isSmallScreen !== isVertical) {
        // Dimma ut planeterna och solen
        planets.forEach(planet => planet.classList.add('hidden'));
        if (sun) sun.classList.add('hidden');

        setTimeout(() => {
            // Byt layout efter fade-out
            solarSystem.style.flexDirection = isSmallScreen ? 'column' : 'row';
            solarSystem.style.gap = isSmallScreen ? '20px' : '50px'; // Justera gap

            // Dimma in planeterna och solen (om de ska synas)
            planets.forEach(planet => planet.classList.remove('hidden'));
            if (!isSmallScreen && sun) sun.classList.remove('hidden');

            // Uppdatera layoutstatus
            isVertical = isSmallScreen;
        }, 300); // Vänta på fade-out (0.3s)
    } else {
        // Ingen brytning, bara justera gap
        solarSystem.style.gap = isSmallScreen ? '20px' : '50px';
    }
}

// Lyssna på fönstrets storleksändring
window.addEventListener('resize', updateLayout);

// Initiera layout vid sidladdning
window.addEventListener('load', updateLayout);
