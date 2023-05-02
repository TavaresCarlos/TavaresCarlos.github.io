lagoaSanta = document.getElementById('cidade')

//var map = L.map('mapa').setView([51.505, -0.09], 13);

L.MakiMarkers.accessToken = MAPBOX_KEY;

var mapboxAttribution =
  'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

// Adiciona um tile Layer ao mapa

const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap',
});

const satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 21,
  subdomains:['mt0','mt1','mt2','mt3']
});

const tileLayers = [osm];

// Adiciona o mapa do leaflet à div mapa
const map = L.map('mapa', {
  layers: tileLayers,
  center: INITIAL_VIEW.cidade,
  zoom: INITIAL_ZOOM,
});

const layers = {};
// layers['Pontos'] = markersFromGEOJSON(null).addTo(map)
layers['Pontos'] = clusteredPoints(markersFromGEOJSON(null)).addTo(map);

const baseMaps = {
  OpenStreetMaps: osm
};

//Ícones ponto
const acidentes = L.icon({
  iconUrl: '../images/acidentes.png',
  iconSize: [25, 25],
  popupAnchor: [0, -10],
});

// Filtrando os pontos
let pointsFilter = undefined;

const pointFilterSelect = document.getElementById('filtro-pontos');
pointFilterSelect.onchange = ({ target }) => {
  const { value } = target;
  if (value == '') {
    pointsFilter = undefined;
    pointInput.disabled = true;
    pointInput.value = '';
    // Limpando filtro
    applyFilter('Pontos');
  } else {
    pointInput.disabled = false;
    pointsFilter = {};
    const fieldToFilter = pontosFields.find(
      (field) => field['position'] == value,
    );
    pointsFilter['fieldToFilter'] = fieldToFilter;
  }
};

function applyFilter(layer) {
  layers[layer].clearLayers();

  //Associando os dados dos pontos ao filtro
  layers[layer].addData(pontos);
  layers[layer].addData(p);

  return layers[layer];
}

const pointInput = document.getElementById('filtro-pontos-value');
pointInput.value = '';
pointInput.onchange = () => {
  // Filtrando quando o imput Muda
  applyFilter('Pontos');
};

// Criando as opções do select
pontosFields.forEach((field) => {
  pointFilterSelect.appendChild(new Option(field['name'], field['position']));
});

function filterToApply(element) {
  if (!pointsFilter) {
    return true;
  }
  const f =
    element.properties[pointsFilter['fieldToFilter']['name']] ==
    pointInput.value;
  return f;
}


//Função que transforma a camada de pontos para marcadores
//Fonte: https://gis.stackexchange.com/questions/110402/changing-default-style-on-point-geojson-layer-in-leaflet 
function pointToLayer(_feature, latlng) {
  return L.marker(latlng, { icon: acidentes });
}

//Função para adicionar pontos a partir de um GeoJSON
function markersFromGEOJSON(markers) {
  return new L.geoJson(markers, {
    onEachFeature: createPopup,
    pointToLayer,
    filter: filterToApply,
  });
}

function polygonFromGEOJSON(polygons) {
  'Função para adicionar poligonos a partir de um GeoJSON.';
  return polygons.map((polygon) => {
    return L.geoJson(polygon, {
      onEachFeature: createPopup,
    });
  });
}

function clusteredPoints(layer) {
  // clusterizando
  const clusterPoints = L.markerClusterGroup.layerSupport();
  // add o cluster ao mapa
  clusterPoints.addTo(map);
  // Integrando com o controle de camadas nativo
  clusterPoints.checkIn(layer); // É aqui que a mágica acontece hahaha
  return layer;
}

//Criando os pontos do mapa
layers['Pontos'].addData(pontos);
layers['Pontos'].addData(p);

layers["Limite Municipal"] = L.layerGroup(polygonFromGEOJSON(municipio.features));

//Controle de camadas
const layerControl = L.control
  .layers(baseMaps, layers, { collapsed: true })
  .addTo(map);

layerControl.addBaseLayer(satellite, 'Satélite');
