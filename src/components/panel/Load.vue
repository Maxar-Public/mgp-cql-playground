<template>
    <v-btn variant="outlined" size="small" @click="load">Load →</v-btn>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/stores/app';
import { CRS } from 'leaflet';


const appStore = useAppStore();

const load = async () => {
  const map = appStore.map as L.Map | null;
  if (!map) {
    const errorInfo = "Map is not initialized yet!";
    appStore.setRecentError({ 
      timestamp: new Date().toISOString(), 
      info: errorInfo, 
      error: null 
    });
    return;
  }

  const api_url: string = appStore.apiURL;
  const myKey: string = appStore.apiKey;

  appStore.initializeWmsLayer(map, `${api_url}streaming/v1/ogc/wms?`, {
      version: "1.3.0",
      format: "image/vnd.jpeg-png",
      maxar_api_key: myKey,
      layers: "Maxar:Imagery",
      transparent: true,
      crs: CRS.EPSG3857,
      tileSize: 512,
      cql_filter: appStore.cqlFilter,
      sortBy: appStore.sortBy,
  });

  // Fit the map to the current WMS layer's bounds
  map.whenReady(() => {
       const bounds = map.getBounds();
       map.fitBounds(bounds);
   });

  try {
    appStore.setWfsResultClose();
    appStore.setValidFilter(appStore.cqlFilter);
    appStore.setValidSortBy(appStore.sortBy);
  } catch (error: any) {
    const errorInfo = "Error fetching results";
    appStore.setRecentError({ 
      timestamp: new Date().toISOString(), 
      info: errorInfo, 
      error: error.message || error 
    });
  }

};
</script>

  