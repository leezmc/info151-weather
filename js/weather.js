// https://open-meteo.com/en/docs?hourly=&temperature_unit=fahrenheit&wind_speed_unit=mph#settings

const CITIES = {
    philadelphia: { lat: 39.9526, lon: -75.1652 },
    "new-york": { lat: 40.7128, lon: -74.006 },
    juneau: { lat: 58.3005, lon: -134.4197 },
};

const WMO = {
    0: "Clear Sky ☀️",
    1: "Mainly Clear 🌤️",
    2: "Partly Cloudy ⛅",
    3: "Overcast ☁️",
    45: "Foggy 🌫️",
    48: "Foggy 🌫️",
    51: "Light Drizzle 🌦️",
    53: "Drizzle 🌦️",
    55: "Heavy Drizzle 🌦️",
    61: "Light Rain 🌧️",
    63: "Rain 🌧️",
    65: "Heavy Rain 🌧️",
    71: "Light Snow 🌨️",
    73: "Snow 🌨️",
    75: "Heavy Snow ❄️",
    80: "Rain Showers 🌦️",
    81: "Rain Showers 🌦️",
    82: "Heavy Showers 🌧️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm ⛈️",
    99: "Thunderstorm ⛈️",
};

function aqCategory(aqi) {
    if (aqi <= 50) return { label: "Good", cls: "aq-good" };
    if (aqi <= 100) return { label: "Moderate", cls: "aq-moderate" };
    if (aqi <= 150) return { label: "Unhealthy for Some", cls: "aq-fair" };
    return { label: "Poor", cls: "aq-poor" };
}

function fToC(f) {
    return Math.round(((f - 32) * 5) / 9);
}

let tempF, highF, lowF;
let isFahrenheit = true;

function renderTemps() {
    const unit = isFahrenheit ? "°F" : "°C";
    const t = isFahrenheit ? tempF : fToC(tempF);
    const h = isFahrenheit ? highF : fToC(highF);
    const l = isFahrenheit ? lowF : fToC(lowF);
    document.getElementById("temperature").textContent = `${t}${unit}`;
    document.getElementById("temp-range").textContent =
        `High: ${h}${unit}   Low: ${l}${unit}`;
    document.getElementById("unit-toggle").textContent = isFahrenheit
        ? "°C"
        : "°F";
}

async function loadWeather() {
    const cityKey = document.querySelector(".weather-app").dataset.city;
    const city = CITIES[cityKey];
    if (!city) return;

    const [weatherRes, aqRes] = await Promise.all([
        fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=precipitation_probability&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`,
        ),
        fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi`,
        ),
    ]);

    const weather = await weatherRes.json();
    const aq = await aqRes.json();

    tempF = Math.round(weather.current.temperature_2m);
    highF = Math.round(weather.daily.temperature_2m_max[0]);
    lowF = Math.round(weather.daily.temperature_2m_min[0]);

    const hour = new Date().getHours();
    const rainChance = weather.hourly.precipitation_probability[hour];
    const humidity = weather.current.relative_humidity_2m;
    const condition = WMO[weather.current.weather_code] ?? "Unknown";
    const aqInfo = aqCategory(Math.round(aq.current.us_aqi));

    document.getElementById("condition").textContent = condition;
    document.getElementById("humidity").textContent = `${humidity}%`;
    document.getElementById("rain-chance").textContent = `${rainChance}%`;

    const aqEl = document.getElementById("air-quality");
    aqEl.textContent = aqInfo.label;
    aqEl.className = `detail-value ${aqInfo.cls}`;

    renderTemps();
}

document.getElementById("unit-toggle").addEventListener("click", () => {
    isFahrenheit = !isFahrenheit;
    renderTemps();
});

loadWeather();
