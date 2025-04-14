<template>
  <div id="map-container">
    <ErrorBanner />
    <div id="map"></div>
    <!-- Movable Modal -->
    <WfsModal />
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted, watch} from 'vue';
import { useAppStore } from "@/stores/app";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ErrorBanner from "@/components/banner/ErrorBanner.vue";
import WfsModal from '@/components/popups/WFSResponse.vue';

const appStore = useAppStore();

onMounted(() => {
  const map = L.map('map', {
    zoomControl: false,
    maxBounds: [[-90, -180], [90, 180]],
    minZoom: 2,
  }).setView([39.87, -105.045], 8);

  appStore.setMap(map);

  const tileLayerInstance = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const api_url: string = import.meta.env.VITE_API_URL;
  const myKey: string = import.meta.env.VITE_MY_KEY;

  // Point Marker
  const pointMarkerLayer = L.layerGroup().addTo(map);

  // Bounding box
  let bbox = "";

  const isBboxEmpty = (): boolean => {
      return bbox === "";
  };

  const parseWfsResponse = (rawResponse: string) => {
    try {
      const features = JSON.parse(rawResponse);
      const parsedWfsResponse = features.map((feature: any) => ({
        id: feature.id,
        geometry: feature.geometry,
        properties: {
        ...feature.properties,
        cloudCover: feature.properties.cloudCover != null 
          ? (feature.properties.cloudCover * 100).toFixed(2) + '%' 
          : 'N/A',
          sunElevation: feature.properties.sunElevation != null 
          ? (Math.round(feature.properties.sunElevation * 100) / 100) + '°' 
          : 'N/A',
      },
      }));
      appStore.setWfsResults(parsedWfsResponse);
    } catch (error) {
      console.error("Error parsing WFS response:", error);
      appStore.setWfsResults([]);
    }
  };

  // Function to calculate tile bounds
  const getTileBounds = (latlng: L.LatLng, zoom: number): L.LatLngBounds => {
    const tileSize = tileLayerInstance.options.tileSize as number;
    const crs = map.options.crs;
    if (!crs) {
      console.error('CRS is not defined in the map options!');
      return L.latLngBounds(latlng, latlng);
    }
    const pixelCoords = crs.latLngToPoint(latlng, zoom);
    const tileX = Math.floor(pixelCoords.x / tileSize) * tileSize;
    const tileY = Math.floor(pixelCoords.y / tileSize) * tileSize;
    const topLeft = crs.pointToLatLng(L.point(tileX, tileY), zoom);
    const bottomRight = crs.pointToLatLng(L.point(tileX + tileSize, tileY + tileSize), zoom);
    return L.latLngBounds(topLeft, bottomRight);
  };

  // Construct the GetMap URL
  const generateUrl = (() => {
      if(isBboxEmpty()){
        const bounds = map.getBounds(); // Get current bounds in Lat/Lon (EPSG:4326)
        const sw = L.CRS.EPSG3857.project(bounds.getSouthWest()); // Convert SW corner to EPSG:3857
        const ne = L.CRS.EPSG3857.project(bounds.getNorthEast()); // Convert NE corner to EPSG:3857

        bbox = `${sw.x},${sw.y},${ne.x},${ne.y}`; // Create bbox in EPSG:3857
      }

    let getMapUrl = `${api_url}streaming/v1/ogc/wms?` +
      `&service=WMS` +
      `&request=GetMap` +
      `&layers=Maxar:Imagery` +
      `&format=image/vnd.jpeg-png` +
      `&transparent=true` +
      `&version=1.3.0` +
      `&maxar_api_key=${myKey}` +
      `&width=512` +
      `&height=512` +
      `&crs=EPSG:3857` +
      `&bbox=${bbox}`;  

    if (appStore.validCqlFilter) {
      getMapUrl += `&cql_Filter=${appStore.validCqlFilter}`;
    }

    if (appStore.validSortBy) {
      getMapUrl += `&sortBy=${appStore.validSortBy}`;
    }

    appStore.setWmsUrl(getMapUrl);
  });

  map.on('click', async (e) => {
    const latlng = e.latlng;
    
    // Highlight the clicked tile
    const tileBounds = getTileBounds(latlng, map.getZoom());

    // Clear previous markers
    pointMarkerLayer.clearLayers();

    // Add a marker at the clicked point
    const marker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'custom-vuetify-marker',
        html: `<i class="mdi mdi-map-marker" style="font-size: 24px; color: red;"></i>`,
        iconAnchor: [12, 24],
      }),
    });
    
    appStore.setCoordinates(latlng.lat.toFixed(6), latlng.lng.toFixed(6));
    
    marker.addTo(pointMarkerLayer);

    // Define a small delta (e.g., 10 meters in EPSG:3857)
    const delta = 1000; // Adjust this value to make the bbox smaller/larger
    const projectedPoint = L.CRS.EPSG3857.project(latlng); // Convert clicked point to EPSG:3857

    // Calculate tiny bbox
    const sw = L.point(projectedPoint.x - delta, projectedPoint.y - delta);
    const ne = L.point(projectedPoint.x + delta, projectedPoint.y + delta);

    // Convert bbox corners back to geographic coordinates if needed
    const swLatLng = L.CRS.EPSG3857.unproject(sw);
    const neLatLng = L.CRS.EPSG3857.unproject(ne);
    
    // Construct bbox string in EPSG:3857 coordinates
    bbox = `${sw.x},${sw.y},${ne.x},${ne.y}`;

    const api_url: string = import.meta.env.VITE_API_URL;
    const myKey: string = import.meta.env.VITE_MY_KEY;

    let cqlFilter = `BBOX(featureGeometry,${bbox},'EPSG:3857')`;

    if (appStore.validCqlFilter) {
      cqlFilter += ` AND (${appStore.validCqlFilter})`;
    }

    // API call to Maxar WFS endpoint
    const params = {
      service: 'WFS',
      request: 'GetFeature',
      version: '2.0.0',
      typeNames: 'Maxar:FinishedFeature',
      cql_Filter: cqlFilter,
      outputFormat: 'application/json',
      sortBy: appStore.validSortBy,
      maxar_api_key: myKey,
    };
    var wfsQuery;
    if(!params.sortBy.length){
      const { sortBy: removedKey, ...newObject } = params;
      wfsQuery = new URLSearchParams(newObject).toString();
    }
    else{
      wfsQuery = new URLSearchParams(params).toString();
    }

    const wfsUrl = `${api_url}streaming/v1/ogc/wfs?${wfsQuery}`;

  try {
    const response = await fetch(wfsUrl);

    const data = await response.json();
    const wfsResponse = JSON.stringify(data.features, null, 2);
    parseWfsResponse(wfsResponse);
  } catch (error: any) {
    const errorInfo = "Error fetching results";
    appStore.setRecentError({ 
      timestamp: new Date().toISOString(), 
      info: errorInfo, 
      error: error.message || error 
    });
  }
    generateUrl();
  });

  watch(() => appStore.validCqlFilter, () => {
    generateUrl();
  },{ immediate: true, deep: true });
  watch(() => appStore.validSortBy, () => {
    generateUrl();
  },{ immediate: true, deep: true });
});
</script>

<style scoped>
/* Map Container */
#map-container {
  height: 600px;
  width: 100%;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

/* Modal Styles */
.custom-modal {
  border-radius: 8px;
  position: absolute;
  top: 10%;
  left: 20%;
  margin: 0;
  width: 60%;
  padding: 0;
}

/* Modal Content */
.modal-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* Feature Table */
.feature-table {
  display: flex;
  flex-direction: column;
  background: white;
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
}

/* Tree Structure */
.tree {
  list-style: none;
  padding-left: 20px;
  font-size: 14px;
}

.tree ul {
  list-style: none;
  padding-left: 20px;
}

.tree details summary {
  cursor: pointer;
}

/* General Content Styling */
.content {
  padding: 10px;
}
</style>
