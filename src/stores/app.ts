import { defineStore } from "pinia";
import type { FilterParam, SortParam } from "@/types/types";
import L, { Map, TileLayer, type WMSParams } from "leaflet";
import type { Order } from "@/types/enums";

export const useAppStore = defineStore("app", {
  state: () => ({
    filter: { param: "", example: "" } as FilterParam,
    sortItems: [] as Array<SortParam>,
    cqlFilter: '', // Filter for WMS layer
    sortBy: '', // Sorting parameter
    validCqlFilter: '', // Filter for WMS layer that has been successfully loaded
    validSortBy: '', // Sorting parameter that has been successfully loaded
    wmsLayer: null as TileLayer.WMS | null, // WMS layer reference
    featureInfo: null as any, // Feature information from GetFeatureInfo
    isLoading: false, // Loading state
    isWFSLoading: false,
    wfsResults: [] as any[],
    apiKeyExists: false,
    apiKey: '',
    apiURL: 'https://api.maxar.com/',
    map: null as L.Map | null,
    wmsUrl: "",
    isCopyPopupVisible: false,
    isWfsResultsVisible: false,
    recentError: null as { timestamp: string; info: string; error: any } | null,
    wfsLat: '',
    wfsLon: '',
  }),

  actions: {
    addFilterItem(param: string, example: string) {
      this.filter = { param, example };
    },
    addSortItem(param: string, order: Order) {
      const existingIndex = this.sortItems.findIndex(
        (item) => item.param === param
      );
      if (existingIndex !== -1) {
        this.sortItems[existingIndex] = { param, order };
      } else {
        this.sortItems.push({ param, order });
      }
    },
    removeSortItem(sortText: string) {
      this.sortItems = this.sortItems.filter((item) => item.param !== sortText);
    },
    setMap(map: L.Map) {
      this.map = map;
    },
    // Action to set the filter
    setFilter(filter: string) {
      this.cqlFilter = filter;
    },
    // Action to set the sorting parameter
    setSortBy(sort: string) {
      this.sortBy = sort;
    },
    // Action to set the filter
    setValidFilter(filter: string) {
      this.validCqlFilter = filter;
    },
    // Action to set the sorting parameter
    setValidSortBy(sort: string) {
      this.validSortBy = sort;
    },
    setWmsUrl(url: string) {
      this.wmsUrl = url;
    },
    // Action to initialize WMS layer
    initializeWmsLayer(map: Map, url: string, options: any) {
      if(!this.sortBy.length){
        delete options.sortBy;
      }
      if(!this.cqlFilter.length){
        delete options.cql_filter;
      }
      
      if (this.wmsLayer) {
        map.removeLayer(this.wmsLayer as TileLayer.WMS);
      }
      this.wmsLayer = L.tileLayer.wms(url, options)
      .on('load', () => {
          const wmsBounds = map.getBounds();
          map.fitBounds(wmsBounds);
      })
      .addTo(map);
    },
    // Action to update WMS parameters
    updateWmsParams(params: { CQL_FILTER?: string; sortBy?: string }) {
      this.wmsUrl = this.wmsUrl + params;
      if (this.wmsLayer) {
        this.wmsLayer.setParams(params as WMSParams);
      }
    },
    // Set the feature information
    setFeatureInfo(info: any) {
      this.featureInfo = info;
      this.isLoading = false;
    },
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
    setWFSLoading(loading: boolean) {
      this.isWFSLoading = loading;
    },
    // Set WFS results and sets data availability
    setWfsResults(features: any[]) {
      this.wfsResults = features;
      this.isWfsResultsVisible = true;
      
    },
    setWfsResultClose() {
      this.isWfsResultsVisible = false;
    },
    setCoordinates(lat: string, lon: string) {
      this.wfsLat = lat;
      this.wfsLon = lon;
    },
    async checkApiKey() {
      if (!this.apiKey.trim()) {
        console.error('API key is empty');
        this.apiKeyExists = false;
        return;
      }

      try {
        //API Endpoint workaround for checking if the API Key is valid
        const response = await fetch(`https://api.maxar.com/streaming/v1/ogc/ows?service=WFS&request=DescribeFeatureType&version=2.0.0&maxar_api_key=${this.apiKey}`, {
          method: 'HEAD'
        });

        if (response.status === 200) {
          this.apiKeyExists = true;
        } 
        else {
          console.error(`Failed response: ${response.status}`);
          this.apiKeyExists = false;
        }
      } catch (error) {
        console.error('Error checking API key:', error);
        this.apiKeyExists = false;
      }
    },
    saveApiKey(key: string) {
      this.apiKey = key;
    },
    getCompleteWmsUrl(): string {
      return this.wmsUrl;
    },
    openCopyPopup() {
      this.isCopyPopupVisible = true; // Set popup visible
    },
    closeCopyPopup() {
      this.isCopyPopupVisible = false; // Close the popup
    },
    setRecentError(error: { timestamp: string; info: string; error: any }) {
      this.recentError = error;
    },
    clearRecentError() {
      this.recentError = null;
    },
  },
});
