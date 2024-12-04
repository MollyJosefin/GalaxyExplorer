const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'; // Proxy-tjänsten hanterar CORS-kraven åt mig och vidarebefordrar förfrågan till API:t
const API_URL = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies';
let allPlanets = []; // Array för att lagra alla planetdata globalt

// --- Hämta API-nyckel via POST ---
// Denna funktion används för att hämta en API-nyckel dynamiskt från en separat endpoint.
// API-nyckeln krävs för att autentisera förfrågningar till planet-API:t.
async function fetchApiKey() {
    const API_KEY_URL = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/keys';
    try {
        const response = await fetch(API_KEY_URL, {
            method: 'POST',
        });

        if (!response.ok) throw new Error(`API-fel: ${response.status}`);
        const data = await response.json();
        return data.key; // Returnerar API-nyckeln

    } catch (error) {
        console.error('Fel vid hämtning av API-nyckel:', error);
        alert('Kunde inte hämta API-nyckeln.');
        return null; // Returnerar null vid fel
    }
}

// --- Hämta planetdata från API:t via GET ---
// Denna funktion hämtar en lista med planeter från API:t. Den använder API-nyckeln som hämtas från fetchApiKey().
async function fetchPlanets() {
    const API_URL = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies';
    try {
        const apiKey = await fetchApiKey(); // Dynamiskt hämta nyckeln
        if (!apiKey) throw new Error('Ingen API-nyckel kunde hämtas.');

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 'x-zocom': apiKey }, // Lägg till API-nyckeln i headers
        });

        if (!response.ok) throw new Error(`API-fel: ${response.status}`);
        const data = await response.json();
        return data.bodies; // Returnerar en lista av planeter
    } catch (error) {
        console.error('Fel vid hämtning av planetdata:', error);
        alert('Kunde inte hämta planetdata.');
        return []; // Returnerar en tom lista vid fel
    }
}



// --- Visa och filtrera planeter baserat på användarens sökning ---
// Denna funktion renderar planeter i en lista och applicerar en sökfilterfunktion.
function loadPlanets(filter = "") {
    const planetList = document.getElementById("planet-list");
    if (!planetList) return; // Om elementet saknas, avsluta

    planetList.innerHTML = ""; // Rensa tidigare innehåll

    // Filtrera och rendera varje planet som matchar sökningen
    allPlanets
        .filter(planet => planet.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(planet => {
            const planetItem = document.createElement("div");
            planetItem.className = "planet-item";  // CSS-klass för styling
            planetItem.innerHTML = `
                <img src="${planet.image || 'default-image.jpg'}" alt="${planet.name}">
                <h3>${planet.name}</h3>
            `;
            // Lägg till click-event för att visa detaljerad information
            planetItem.addEventListener("click", () => showPlanetCard(planet)); // Klick för detaljer
            planetList.appendChild(planetItem); // Lägg till planet i listan
        });

        // Visa meddelande om inga planeter matchar
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


// --- Visa detaljer om en vald planet i en popup ---
// Denna funktion öppnar en popup med detaljerad information om en planet.
function showPlanetCard(planet) {
    const planetPopup = document.getElementById("planet-popup");
    const header = document.querySelector("header");
    const solarSystem = document.getElementById("solar-system");

    if (!planetPopup || !header || !solarSystem) {
        console.error("Något element saknas för popup eller bakgrund.");
        return;
    }

    console.log("Planet clicked:", planet);

    // Uppdatera popupens innehåll med planetens namn och beskrivning
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

    // Hantera extra info såsom avstånd, temperatur och månar
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

    // Visa popupen och applicera en "blur"-effekt på bakgrunden
    planetPopup.classList.remove("hidden");
    header.classList.add("blurred");
    solarSystem.classList.add("blurred");

    // Lägg till klass för att inaktivera scroll på bakgrunden
    document.body.classList.add("popup-active");

    // Scrolla till toppen av popup om texten är för stor för skärmen
    planetPopup.scrollTop = 0;
}



// --- Stäng popup och återställ bakgrund ---
// Funktionen stänger popupen och återställer bakgrundens stil och scroll.
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


// --- Hantera sökfältets inmatning ---
// Lyssna på inmatning och "Enter"-tryck i sökfältet för att filtrera eller välja en planet.
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();  // Använd små bokstäver för jämförelse
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





// --- Generera en stjärnhimmel med slumpmässig placering ---
// Denna del genererar en bakgrund av "stjärnor" för att ge en rymdliknande atmosfär.
document.addEventListener("DOMContentLoaded", () => {
    const starsContainer = document.querySelector(".stars");  // Element där stjärnorna ska placeras
    const numStars = 1000; // Antal stjärnor som ska genereras

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement("div"); // Skapa ett stjärnelement
        star.classList.add("star"); // CSS-klass för styling
        // Slumpmässig placering och animation
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.animationDuration = `${Math.random() * 5 + 2}s`; // Slumpmässig varaktighet
        starsContainer.appendChild(star); // Lägg till stjärnan i containern
    }

     // --- Generera rörliga stjärnor --- 
    // Skapar "stjärnfall" eller rörliga stjärnor som rör sig över skärmen
    const movingStarContainer = document.querySelector(".moving-stars-container");
    const numMovingStars = 15; // Antal rörliga stjärnor
    
    for (let i = 0; i < numMovingStars; i++) {
        const movingStar = document.createElement("div"); // Skapa ett rörligt stjärnelement
        movingStar.classList.add("moving-star"); // CSS-klass för styling
        movingStar.style.top = `${Math.random() * 100}vh`;
        movingStar.style.left = `${Math.random() * 100}vw`;
        movingStar.style.animationDuration = `${Math.random() * 10 + 10}s`; // Slumpmässig varaktighet
        movingStarContainer.appendChild(movingStar); // Lägg till rörlig stjärna i containern
    }
    
});

// --- Anpassa layouten vid olika skärmstorlekar ---
// Funktionen anpassar planeternas layout baserat på om skärmen är horisontell eller vertikal.
let isVertical = window.innerWidth <= 1024; // Kontrollera initial layout

function updateLayout() {
    const planets = document.querySelectorAll('.planet'); // Hämta alla planet-element
    const solarSystem = document.getElementById('solar-system'); // Huvudcontainer för solsystemet
    const sun = document.querySelector('.sun'); // Solens element
    const isSmallScreen = window.innerWidth <= 1024; // Kontrollera om skärmen är liten (t.ex. mobil)

    // Om brytningen sker (från horisontell till vertikal eller vice versa)
    if (isSmallScreen !== isVertical) {
        // Dölj planeter och solen tillfälligt för en snygg fade-effekt
        planets.forEach(planet => planet.classList.add('hidden'));
        if (sun) sun.classList.add('hidden');

        setTimeout(() => {
             // Ändra layout efter fade-out
            solarSystem.style.flexDirection = isSmallScreen ? 'column' : 'row';
            solarSystem.style.gap = isSmallScreen ? '20px' : '50px'; // Justera gap

            // Visa planeter och solen igen efter layoutändringen
            planets.forEach(planet => planet.classList.remove('hidden'));
            if (!isSmallScreen && sun) sun.classList.remove('hidden');

            // Uppdatera layoutstatus
            isVertical = isSmallScreen;
        }, 300); // Vänta på fade-out (0.3s)
    } else {
        // Om layouten inte ändras, justera bara avståndet mellan planeter
        solarSystem.style.gap = isSmallScreen ? '20px' : '50px';
    }
}

// --- Lyssna på ändring av skärmens storlek ---
// Uppdaterar layouten dynamiskt när fönstret ändrar storlek.
window.addEventListener('resize', updateLayout);

// --- Initiera layouten vid sidladdning ---
// Kör layoutlogiken direkt när sidan laddas.
window.addEventListener('load', updateLayout);
