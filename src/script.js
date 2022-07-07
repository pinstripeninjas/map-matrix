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

// module pattern to control leaflet map
const mapControl = (() => {
	// create leaflet map
	const map = L.map("map", {
		center: [32.4, -111.0],
		zoom: 7.8,
		maxZoom: 10,
		minZoom: 5,
		zoomSnap: 0.1,
		zoomControl: false,
		dragging: true,
		doubleClickZoom: false,
	});
	// create basemap
	const basemap = L.tileLayer(
		"https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png",
		{
			crossOrigin: "anonymous",
			attribution: `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`,
		}
	);
	// probably remove this counties layer later...
	const counties = async () => {
		const response = await fetch("./src/geojson/az-counties.geojson");
		const data = await response.json();
		return L.geoJSON(data, {
			style: {
				color: "black",
				weight: 1,
				fillOpacity: 0,
				dashArray: [4, 8],
			},
		});
	};

	// factory function for creating map layers
	const RiskMapLayers = (name, url) => {
		const getName = () => name;
		const getUrl = () => url;
		return { getName, getUrl };
	};
	// create array of RiskMapLayers
	const arrayOfLayers = [
		// RiskMapLayers("counties", "./src/geojson/az-counties.geojson"),
		RiskMapLayers("pzones", "./src/geojson/zfptwc.geojson"),
		RiskMapLayers("fzones", "./src/geojson/fwftwc.geojson"),
	];

	// layer group that holds the counties/pzones/fzones
	const green = "#99FF98";
	const yellow = "#F0C86A";
	const orange = "#ED7645";
	const red = "#CD2654";
	const purple = "#9E01A5";

	const cycleColor = (currentColor) => {
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
	};
	const onEachFeature = (feature, layer) => {
		layer.on("click", () => {
			let currentColor = layer.options.fillColor;
			layer.setStyle(cycleColor(currentColor));
		});
	};

	const startingColor = () => {
		return {
			color: "#333",
			opacity: 0.7,
			fillColor: green,
			fillOpacity: 0.6,
			weight: 2,
		};
	};
	const layerGroup = L.layerGroup();
	const getLayerGroup = () => layerGroup;
	// change map layer based on selection, argument is layer name
	const changeLayerGroup = async (layerName) => {
		layerGroup.clearLayers();
		let url = "";
		for (let layer of arrayOfLayers) {
			if (layer.getName() === layerName) {
				url = layer.getUrl();
			}
		}
		const response = await fetch(url);
		const geojson = await response.json();
		const newLayer = L.geoJSON(geojson, { style: startingColor, onEachFeature });
		layerGroup.addLayer(newLayer);
	};

	const roads = L.tileLayer(
		"https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png",
		{ crossOrigin: "anonymous" }
	);

	const loadCities = async () => {
		const response = await fetch("./src/geojson/TWCcities.geojson");
		const geojson = await response.json();
		const cities = L.geoJSON(geojson, {
			pointToLayer: (feature, latlng) => {
				console.log("feature:", feature);
				console.log("latlng:", latlng);
				return L.marker(latlng, {
					icon: L.divIcon({
						iconSize: "auto",
						html: `<div class="city-marker">${feature.properties.City}</div>`,
					}),
				});
			},
		});
		return cities;
	};

	const createMap = async () => {
		map.addLayer(basemap);
		const blarba = await counties();
		map.addLayer(blarba);
		changeLayerGroup("pzones");
		map.addLayer(layerGroup);
		map.addLayer(roads);
		const cities = await loadCities();
		map.addLayer(cities);
	};

	return { createMap, getLayerGroup, changeLayerGroup };
})();

// create leaflet map
mapControl.createMap();

// change listener that changes map layer based on selection
selectLayer.addEventListener("change", (e) => {
	mapControl.changeLayerGroup(e.target.value);
});

validDate.addEventListener("change", (e) => {
	console.log(e.target.value);
	const tempDate = new Date(`${e.target.value}T00:00:00`).toLocaleDateString();
	dateDisplay.innerHTML = `Valid: ${tempDate}`;
});

// const currentDate = new Date().toLocaleDateString();
// dateDisplay.innerHTML = `Valid: ${currentDate}`;
validDate.valueAsDate = new Date();
validDate.dispatchEvent(new Event("change"));

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
