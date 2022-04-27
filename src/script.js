const dateDisplay = document.querySelector("#dateDisplay");
const validDate = document.querySelector("#validDate");
const checkboxShowDate = document.querySelector("#checkboxShowDate");

const checkboxMessage = document.querySelector("#checkboxMessage");
const messageDisplay = document.querySelector("#messageDisplay");
const messageText = document.querySelector("#messageText");
const branding = document.querySelector(".branding");

const selectLayer = document.querySelector("#selectLayer");

const mapGraphic = document.querySelector("#map");
const btnDownload = document.querySelector("#btnDownload");

const green = "#99FF98";
const yellow = "#F0C86A";
const orange = "#ED7645";
const red = "#CD2654";
const purple = "#9E01A5";

const map = L.map("map", {
	center: [32.5, -111.2],
	zoom: 7.5,
	maxZoom: 10,
	minZoom: 5,
	zoomSnap: 0.1,
	zoomControl: false,
	dragging: true,
	doubleClickZoom: false,
});

const basemap = L.tileLayer(
	"https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png",
	{
		crossOrigin: "anonymous",
		attribution: `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`,
	}
).addTo(map);

const roads = L.tileLayer(
	"https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png",
	{ crossOrigin: "anonymous" }
).addTo(map);

// getCounties();
async function getCounties() {
	const response = await fetch("./src/geojson/az-counties.geojson");
	const geojson = await response.json();
	L.geoJSON(geojson, { style: startingColor, onEachFeature }).addTo(map);
}

function onEachFeature(feature, layer) {
	layer.on("click", () => {
		let currentColor = layer.options.fillColor;
		layer.setStyle(cycleColor(currentColor));
	});
}

function startingColor() {
	return {
		color: "#333",
		opacity: 0.7,
		fillColor: green,
		fillOpacity: 0.6,
		weight: 2,
	};
}

function cycleColor(currentColor) {
	switch (currentColor) {
		case green:
			return { fillColor: yellow };
		case yellow:
			return { fillColor: orange };
		case orange:
			return { fillColor: red };
		case red:
			return { fillColor: purple };
		case purple:
			return { fillColor: green };
	}
}

validDate.addEventListener("change", (e) => {
	dateDisplay.innerHTML = `Valid: ${e.target.value}`;
});

checkboxShowDate.addEventListener("change", (e) => {
	if (!e.target.checked) {
		dateDisplay.classList.add("d-none");
	} else {
		dateDisplay.classList.remove("d-none");
	}
});

checkboxMessage.addEventListener("change", (e) => {
	if (e.target.checked) {
		messageDisplay.classList.remove("d-none");
		branding.classList.add("bg");
	} else {
		messageDisplay.classList.add("d-none");
		branding.classList.remove("bg");
	}
});

messageText.addEventListener("input", (e) => {
	messageDisplay.textContent = e.target.value;
});

// Download image
btnDownload.addEventListener("click", generateImage);

function generateImage() {
	htmlToImage.toPng(mapGraphic).then(function (dataUrl) {
		const a = document.createElement("a");
		a.href = dataUrl;
		a.download = `risk-map.png`;
		a.click();
		// btnDownloadGraphic.innerHTML = `<i class="fas fa-file-download mr-5"></i>Download Image`;
	});
}

// alt map loading, starting with counties

const RiskMapLayers = (name, url) => {
	const getName = () => name;
	const getUrl = () => url;
	return { getName, getUrl };
};

const arrayOfLayers = [
	RiskMapLayers(
		"counties",
		"https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS/nws_reference_map/MapServer/2"
	),
	RiskMapLayers(
		"pzones",
		"https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS/nws_reference_map/MapServer/8"
	),
	RiskMapLayers(
		"fzones",
		"https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS/nws_reference_map/MapServer/9"
	),
];

changeMapLayer("counties");
selectLayer.addEventListener("change", (e) => {
	changeMapLayer(e.target.value);
});

function changeMapLayer(layerName) {
	map.eachLayer((layer) => {
		if (layer !== basemap && layer !== roads) {
			map.removeLayer(layer);
		}
	});
	let url = "";
	for (let layer of arrayOfLayers) {
		if (layer.getName() === layerName) {
			url = layer.getUrl();
		}
	}
	const newLayer = L.esri.featureLayer({
		url,
		onEachFeature,
		style: startingColor,
	});
	map.addLayer(newLayer);
}
