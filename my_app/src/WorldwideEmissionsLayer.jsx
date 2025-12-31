// import { useEffect, useRef } from "react";
// import { useMap } from "react-leaflet";
// import * as GeoTIFF from "geotiff";
// import L from "leaflet";

// const GeoTiffLayer = ({ url }) => {
//   const map = useMap();
//   const layerRef = useRef(null);

//   useEffect(() => {
//     if (!url) return;

//     const loadGeoTiff = async () => {
//       try {
//         // Load the GeoTIFF
//         const response = await fetch(url);
//         const arrayBuffer = await response.arrayBuffer();
//         const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
//         const image = await tiff.getImage();
//         const rasters = await image.readRasters();
        
//         // Get geospatial metadata
//         const bbox = image.getBoundingBox();
//         const [west, south, east, north] = bbox;
//         const width = image.getWidth();
//         const height = image.getHeight();

//         // Create canvas to render the raster
//         const canvas = document.createElement("canvas");
//         canvas.width = width;
//         canvas.height = height;
//         const ctx = canvas.getContext("2d");
//         const imageData = ctx.createImageData(width, height);

//         // Convert raster values to RGB
//         const data = rasters[0];

// // First, find the actual data range (excluding null/0)
// const validValues = data.filter(v => v !== null && !isNaN(v) && v !== 0);
// const minVal = Math.min(...validValues);
// const maxVal = Math.max(...validValues);

// console.log("Data range:", { minVal, maxVal, sampleValues: validValues.slice(0, 20) });

// for (let i = 0; i < data.length; i++) {
//   const val = data[i];
//   const pixelIndex = i * 4;

//   // Handle no-data values
//   if (val === null || isNaN(val) || val === 0) {
//     imageData.data[pixelIndex + 3] = 0; // Transparent
//   } else {
//     // Normalize value to 0-1 range
//     const normalized = (val - minVal) / (maxVal - minVal);
    
//     // Create a color gradient (blue -> yellow -> red for emissions)
//     let r, g, b;
    
//     if (normalized < 0.5) {
//       // Blue to yellow
//       const t = normalized * 2;
//       r = Math.floor(t * 255);
//       g = Math.floor(t * 255);
//       b = Math.floor((1 - t) * 255);
//     } else {
//       // Yellow to red
//       const t = (normalized - 0.5) * 2;
//       r = 255;
//       g = Math.floor((1 - t) * 255);
//       b = 0;
//     }
    
//     imageData.data[pixelIndex] = r;
//     imageData.data[pixelIndex + 1] = g;
//     imageData.data[pixelIndex + 2] = b;
//     imageData.data[pixelIndex + 3] = 178; // 0.7 opacity
//   }
// }

//         ctx.putImageData(imageData, 0, 0);

//         // Remove existing layer
//         if (layerRef.current) {
//           map.removeLayer(layerRef.current);
//         }

//         // Add as image overlay
//         const bounds = L.latLngBounds(
//           [south, west],
//           [north, east]
//         );
        
//         const layer = L.imageOverlay(canvas.toDataURL(), bounds, {
//           opacity: 0.7,
//           zIndex: 1000,
//         });
        
//         layer.addTo(map);
//         layerRef.current = layer;

//         // Optionally fit bounds
//         map.fitBounds(bounds);

//       } catch (error) {
//         console.error("Failed to load GeoTIFF:", error);
//       }
//     };

//     loadGeoTiff();

//     return () => {
//       if (layerRef.current) {
//         map.removeLayer(layerRef.current);
//       }
//     };
//   }, [url, map]);

//   return null;
// };

// export default GeoTiffLayer;

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import proj4 from "proj4";

// 1. Pointing directly to the minified bundle bypasses the ESM 'Envelope' and 'georaster-stack' errors
const GeoRasterLayer = window.GeoRasterLayer;

// 2. Make proj4 global - the library looks for it on the window object
if (typeof window !== "undefined") {
  window.proj4 = proj4;
}

const GeoTiffLayer = ({ url }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Basic guard: ensure we have a URL and the map instance
    if (!url || !map) return;

    let isMounted = true;

    const loadRaster = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const georaster = await parseGeoraster(arrayBuffer);

        // If the component unmounted while we were fetching, stop here
        if (!isMounted) return;

        // Cleanup any previous instance of this layer
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }

        // 3. Initialize the layer
        const layer = new GeoRasterLayer({
          georaster: georaster,
          opacity: 0.8,
          // resolution 128 is a good balance for web performance
          resolution: 128, 
          pixelValuesToColorFn: (values) => {
            const val = values[0];
            
            // Handle NoData (adjust '0' if your TIFF uses a specific NoData value like -9999)
            if (val === null || isNaN(val) || val === 0) return null;

            /** * Implementation Note: 
             * You can pass your 'getChoroColor' function as a prop to this component 
             * to keep your styling consistent across GeoJSON and GeoTIFF layers.
             */
            return val > 5 ? "#b30202" : "#ffffff";
          },
        });

        layer.addTo(map);
        layerRef.current = layer;

      } catch (error) {
        console.error("GeoTiffLayer Error:", error);
      }
    };

    loadRaster();

    // 4. Proper Cleanup
    return () => {
      isMounted = false;
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [url, map]);

  return null;
};

export default GeoTiffLayer;