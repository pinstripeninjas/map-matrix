const green = "green";
const yellow = "yellow";
const orange = "orange";
const red = "red";

const map = L.map("map", {
	center: [32.5, -111.2],
	zoom: 8,
	maxZoom: 8,
	minZoom: 8,
	attributionControl: false,
	zoomControl: false,
	dragging: false,
	doubleClickZoom: false,
});

const basemap = L.tileLayer(
	//"https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
	"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
).addTo(map);

const pima = L.geoJSON.ajax("./src/geojson/pima.geojson", { style: startingColor }).addTo(map);
const pinal = L.geoJSON.ajax("./src/geojson/pinal.geojson", { style: startingColor }).addTo(map);
const santaCruz = L.geoJSON
	.ajax("./src/geojson/santa-cruz.geojson", { style: startingColor })
	.addTo(map);
const graham = L.geoJSON.ajax("./src/geojson/graham.geojson", { style: startingColor }).addTo(map);
const greenlee = L.geoJSON
	.ajax("./src/geojson/greenlee.geojson", { style: startingColor })
	.addTo(map);
const cochise = L.geoJSON
	.ajax("./src/geojson/cochise.geojson", { style: startingColor })
	.addTo(map);

function startingColor() {
	return { color: green };
}

pima.on("click", function (e) {
	let currentColor = e.layer.options.color;
	pima.setStyle(cycleColor(currentColor));
});
pinal.on("click", function (e) {
	let currentColor = e.layer.options.color;
	pinal.setStyle(cycleColor(currentColor));
});
santaCruz.on("click", function (e) {
	let currentColor = e.layer.options.color;
	santaCruz.setStyle(cycleColor(currentColor));
});
graham.on("click", function (e) {
	let currentColor = e.layer.options.color;
	graham.setStyle(cycleColor(currentColor));
});
greenlee.on("click", function (e) {
	let currentColor = e.layer.options.color;
	greenlee.setStyle(cycleColor(currentColor));
});
cochise.on("click", function (e) {
	let currentColor = e.layer.options.color;
	cochise.setStyle(cycleColor(currentColor));
});

function cycleColor(currentColor) {
	switch (currentColor) {
		case green:
			return { color: yellow };
		case yellow:
			return { color: orange };
		case orange:
			return { color: red };
		case red:
			return { color: green };
	}
}
