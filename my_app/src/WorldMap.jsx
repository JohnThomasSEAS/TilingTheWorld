import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl, Layers, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon, Dropdown } from "semantic-ui-react";
import "./InfoPanel.css";
import geojsonDataLocal from "./data/world-countries.json";

const WorldMap = ({ setSelectedCountry, emissionsData }) => {
  console.log("Emissions Data in worldmap.jsx:", emissionsData);
  const [geojsonData, setGeojsonData] = useState(geojsonDataLocal); // Base GeoJSON data
  const [hoveredGeojson, setHoveredGeojson] = useState(null); // Hovered GeoJSON feature
  const [highlightedGeojson, setHighlightedGeojson] = useState(null); // Highlighted GeoJSON feature
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [allAvailableCountries, setAllAvailableCountries] = useState([]);
  const [selectedCountrySearch, setSelectedCountrySearch] = useState("");
  const [activeLayer, setActiveLayer] = useState("Base Layer");

  const baseLayerRef = useRef();
  const hoverLayerRef = useRef();

  const mapRef = useRef();

  const LayerChangeHandler = ({ onLayerChange }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      const handleBaseLayerChange = (e) => {
        onLayerChange(e.name);
      };

      map.on("baselayerchange", handleBaseLayerChange);

      // Cleanup listener on unmount
      return () => {
        map.off("baselayerchange", handleBaseLayerChange);
      };
    }, [map, onLayerChange]);

    return null;
  };

  useEffect(() => {
    if (emissionsData) {
      const countries = emissionsData.map((row) => row["countries"]);
      setAllAvailableCountries(countries);
    }
  }, [emissionsData]);

  const resetAllStyles = () => {
    if (baseLayerRef.current && hoverLayerRef.current) {
      baseLayerRef.current.eachLayer((layer) => {
        baseLayerRef.current.resetStyle(layer);
      });
      hoverLayerRef.current.clearLayers();
    }
  };

  // Match emissions data to a country in the GeoJSON
  const getEmissionsForCountry = (countryName, type) => {
    const countryData = emissionsData.find((row) => row.countries == countryName);

    if (!countryData) {
      return 0; // Return 0 if no data found for the country
    }

    if (["prior", "posterior"].includes(type)) {
      return countryData ? parseFloat(type === "posterior" ? countryData["UNFCCC_total_post"] : countryData["UNFCCC_total_prior"]).toFixed(2) : 0; // Default to 0 if not found
    } else if (type === "percentDiff") {
      return countryData ? (((countryData["UNFCCC_total_post"] - countryData["UNFCCC_total_prior"]) / countryData["UNFCCC_total_prior"]) * 100).toFixed(0) : 0;
    } else if (type === "absoluteDiff") {
      return countryData ? (countryData["UNFCCC_total_post"] - countryData["UNFCCC_total_prior"]).toFixed(2) : 0;
    } else if (type === "livestockPost") {
      return countryData ? parseFloat(countryData["Livestock_post"]).toFixed(2) : 0;
    } else if (type === "wastePost") {
      return countryData ? parseFloat(countryData["Waste_post"]).toFixed(2) : 0;
    } else if (type === "oilGasPost" || type === "OG_post") {
      return countryData ? parseFloat(countryData["OG_post"]).toFixed(2) : 0;
    } else if (type === "ricePost") {
      return countryData ? parseFloat(countryData["Rice_post"]).toFixed(2) : 0;
    } else if (type === "coalPost") {
      return countryData ? parseFloat(countryData["Coal_post"]).toFixed(2) : 0;
    } else if (type === "reservoirPost") {
      return countryData ? parseFloat(countryData["Reservoirs_post"]).toFixed(2) : 0;
    }
  };

  // Color scale based on emissions
  const getChoroColor = (value, maxEmissionValue = 10) => {
    const maxColor = [179, 2, 2]; // #b30202
    const minColor = [255, 255, 255]; // #ffffff

    const interpolateColor = (value, min, max) => {
      const ratio = (value - min) / (max - min);
      const r = Math.round(minColor[0] + ratio * (maxColor[0] - minColor[0]));
      const g = Math.round(minColor[1] + ratio * (maxColor[1] - minColor[1]));
      const b = Math.round(minColor[2] + ratio * (maxColor[2] - minColor[2]));
      return `rgb(${r},${g},${b})`;
    };

    if (value > maxEmissionValue) {
      return `rgb(${maxColor[0]},${maxColor[1]},${maxColor[2]})`;
    }
    return interpolateColor(value, 0, maxEmissionValue);
  };

  const getPercentDiffColor = (value) => {
    return value > 1
      ? "#b30202" // Dark red
      : value > 0.5
      ? "#c84949" // Medium red
      : value > 0.25
      ? "#e29f9f" // Light red
      : value > 0.0
      ? "rgb(255, 215, 215)" // White
      : value > -0.1
      ? "#a8c6e4" // Light blue
      : value > -0.25
      ? "#4788c5" // Medium blue
      : value > -0.5
      ? "#0057af" // Dark blue
      : "#00008b"; // Darker blue
  };

  const getAbsoluteDiffColor = (value) => {
    return value > 5
      ? "#b30202" // Dark red
      : value > 2.5
      ? "#c84949" // Medium red
      : value > 1
      ? "#e29f9f" // Light red
      : value > 0.0
      ? "rgb(255, 215, 215)" // White
      : value > -0.1
      ? "#a8c6e4" // Light blue
      : value > -1
      ? "#4788c5" // Medium blue
      : value > -2.5
      ? "#0057af" // Dark blue
      : "#00008b"; // Darker blue
  };

  // Dynamic style function
  const dynamicStyle = (feature, type) => {
    const emissions = getEmissionsForCountry(feature.properties.SOVEREIGNT, type);

    let fillColor;

    if (["prior", "posterior", "livestockPost", "wastePost", "oilGasPost", "ricePost", "coalPost", "reservoirPost"].includes(type)) {
      if (["livestockPost", "wastePost", "oilGasPost", "ricePost", "coalPost"].includes(type)) {
        fillColor = getChoroColor(emissions, 5); // Use a different max
      } else if (type === "reservoirPost") {
        fillColor = getChoroColor(emissions, 2); // Use a different max
      } else {
        fillColor = getChoroColor(emissions);
      }
    } else if (type === "percentDiff") {
      fillColor = getPercentDiffColor(emissions / 100);
    } else if (type === "absoluteDiff") {
      fillColor = getAbsoluteDiffColor(emissions);
    }

    return {
      fillColor: fillColor,
      color: "rgba(200,200,200,0.7)", // Border color
      weight: 1,
      fillOpacity: 0.7,
    };
  };

  const baseStyle = {
    color: "rgba(200,200,200,0.7)",
    weight: 1,
    fillColor: "rgba(10, 10, 10, 0.1)",
    fillOpacity: 0.8,
  };

  const hoverStyle = {
    color: "rgba(200,200,200,0.7)",
    weight: 1,
    fillColor: "rgba(100, 100, 100, 0.5)",
    fillOpacity: 0.8,
  };

  const highlightStyle = {
    weight: 2,
    color: "var(--turq-faint)",
    fillOpacity: 0.2,
  };

  // Handle click on base GeoJSON to highlight a feature
  const handleFeatureClick = (feature) => {
    resetAllStyles(); // Reset styles for all features

    setSelectedCountry(feature.properties.SOVEREIGNT); // Set selected country
    setHighlightedGeojson({
      type: "FeatureCollection",
      features: [feature], // Wrap feature in a FeatureCollection for GeoJSON compatibility
    });
  };

  const handleFeatureHover = (feature) => {
    setHoveredGeojson({
      type: "FeatureCollection",
      features: [feature],
    });
  };

  useEffect(() => {
    if (selectedCountrySearch) {
      setHoveredGeojson(null);
      const selectedFeature = geojsonData.features.find((feature) => feature.properties.SOVEREIGNT === selectedCountrySearch);
      if (selectedFeature) {
        setSelectedCountry(selectedCountrySearch);
        setHighlightedGeojson({
          type: "FeatureCollection",
          features: [selectedFeature],
        });
      }
    }
  }, [selectedCountrySearch]);

  useEffect(() => {
    if (highlightedGeojson) {
      setHoveredGeojson(null);
      const bounds = L.geoJSON(highlightedGeojson).getBounds();
      mapRef.current.fitBounds(bounds);
    }
  }, [highlightedGeojson]);

  const returnColorRamp = () => {
    // Determine the maxValue for the current activeLayer
    let maxValue = 10;
    if (
      ["Livestock Emissions (Posterior)", "Waste Emissions (Posterior)", "Oil and Gas Emissions (Posterior)", "Rice Emissions (Posterior)", "Coal Emissions (Posterior)"].includes(
        activeLayer
      )
    ) {
      maxValue = 5;
    } else if (activeLayer === "Reservoir Emissions (Posterior)") {
      maxValue = 2;
    } else if (
      activeLayer === "Total Anthropogenic Emissions (Prior)" ||
      activeLayer === "Total Anthropogenic Emissions (Posterior)" ||
      activeLayer === "Total UNFCCC Emissions (Prior)" ||
      activeLayer === "Total UNFCCC Emissions (Posterior)"
    ) {
      maxValue = 10;
    }

    // Percent Change (Posterior/Prior Anthropogenic) scale
    if (activeLayer === "Percent Change (Posterior/Prior Anthropogenic)" || activeLayer === "Percent Change (Posterior/Prior UNFCCC)") {
      return (
        <div id="scaleBar" style={{ color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>-100%</span>
            <span>0</span>
            <span>100%+</span>
          </div>
          <div
            id="colorRamp"
            style={{
              background: `linear-gradient(
                to left,
                #800026 0%,       /* Dark red */
                #BD0026 12.5%,    /* Red */
                #E31A1C 25%,      /* Light red */
                #FC4E2A 37.5%,    /* Orange */
                #FFFFFF 50%,      /* White */
                #ADD8E6 62.5%,    /* Light blue */
                #87CEEB 75%,      /* Sky blue */
                #4682B4 87.5%,    /* Steel blue */
                #00008B 100%      /* Dark blue */
              )`,
            }}
          ></div>
        </div>
      );
    }

    // Choro color scale for emissions layers
    if (
      [
        "Total Anthropogenic Emissions (Prior)",
        "Total Anthropogenic Emissions (Posterior)",
        "Total UNFCCC Emissions (Prior)",
        "Total UNFCCC Emissions (Posterior)",
        "Livestock Emissions (Posterior)",
        "Waste Emissions (Posterior)",
        "Oil and Gas Emissions (Posterior)",
        "Rice Emissions (Posterior)",
        "Coal Emissions (Posterior)",
        "Reservoir Emissions (Posterior)",
      ].includes(activeLayer)
    ) {
      return (
        <div id="scaleBar" style={{ color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>0</span>
            <span>{maxValue / 2}</span>
            <span>{maxValue}+</span>
          </div>
          <div
            id="colorRamp"
            style={{
              background: `linear-gradient(to right, ${getChoroColor(0, maxValue)}, ${getChoroColor(maxValue, maxValue)})`,
            }}
          ></div>
        </div>
      );
    }

    // Absolute/percent diff: could add custom ramps here as needed
    // Otherwise, return null
    return null;
  };

  return (
    <div
      className="mapContainer tileShadow"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "750px", width: "50%", position: "relative" }}
      onMouseLeave={() => {
        setHoveredGeojson(null); // Clear hover state
      }}
    >
      <div
        className="activeLayerLabel"
        style={{
          position: "absolute",
          top: "10px",
          left: "70px",
          zIndex: 1000,
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "5px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h1 style={{ fontSize: "1.5rem" }}>{activeLayer}</h1>
      </div>
      <Icon id="searchIcon" name={!searchBarVisible ? "search" : "close"} color="grey" circular inverted onClick={() => setSearchBarVisible(!searchBarVisible)} />
      {returnColorRamp()}
      {searchBarVisible && (
        <Dropdown
          id="searchBar"
          placeholder="Search for a country"
          search
          selection
          options={allAvailableCountries.map((country) => ({
            key: country,
            value: country,
            text: country,
          }))}
          onChange={(e, { value }) => setSelectedCountrySearch(value)}
        />
      )}
      <MapContainer
        center={[45.505, -0.09]}
        zoom={2}
        style={{ height: "100%", width: "100%", borderRadius: "15px" }}
        ref={mapRef}
        worldCopyJump={true} // Prevents panning to multiple worlds
        maxBounds={[
          [-90, -180], // Southwest corner
          [90, 180], // Northeast corner
        ]}
        maxBoundsViscosity={1.0}
      >
        <LayerChangeHandler onLayerChange={setActiveLayer} />
        <TileLayer
          url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.REACT_APP_STADIA_API_KEY}`}
          attribution='&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> contributors &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> contributors &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Layers control for Choropleth */}
        {geojsonData && (
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Base Layer" checked={true}>
              <GeoJSON
                ref={baseLayerRef}
                data={geojsonData}
                style={baseStyle}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    mouseover: () => handleFeatureHover(feature),
                    // click: () => handleFeatureClick(feature),
                  });
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Total UNFCCC Emissions (Posterior)">
              <GeoJSON
                key={`posterior-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "posterior")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>Posterior Anth. Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "posterior")} Tg/yr`,
                      { permanent: false, direction: "top" } // Tooltip configuration
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Total UNFCCC Emissions (Prior)">
              <GeoJSON
                key={`prior-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "prior")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(`<strong>Prior Anth. Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "prior")} Tg/yr`, {
                      permanent: false,
                      direction: "top",
                    });
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Percent Change (Posterior/Prior UNFCCC)">
              <GeoJSON
                key={`percent-diff-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "percentDiff")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>Percent Change: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "percentDiff") > 0 ? "+" : ""}${getEmissionsForCountry(
                        feature.properties.SOVEREIGNT,
                        "percentDiff"
                      )}%`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Absolute Difference (Posterior - Prior UNFCCC)">
              <GeoJSON
                key={`absolute-diff-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "absoluteDiff")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>Absolute difference: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "absoluteDiff") > 0 ? "+" : ""}${getEmissionsForCountry(
                        feature.properties.SOVEREIGNT,
                        "absoluteDiff"
                      )} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <hr />
            <LayersControl.BaseLayer name="Oil and Gas Emissions (Posterior)">
              <GeoJSON
                key={`oilGas-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "oilGasPost")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>${feature.properties.SOVEREIGNT} Oil Gas Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "oilGasPost")} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Livestock Emissions (Posterior)">
              <GeoJSON
                key={`livestock-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "livestockPost")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>${feature.properties.SOVEREIGNT} Livestock Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "livestockPost")} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Waste Emissions (Posterior)">
              <GeoJSON
                key={`waste-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "wastePost")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>${feature.properties.SOVEREIGNT} Waste Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "wastePost")} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Rice Emissions (Posterior)">
              <GeoJSON
                key={`rice-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "ricePost")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>${feature.properties.SOVEREIGNT} Rice Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "ricePost")} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Coal Emissions (Posterior)">
              <GeoJSON
                key={`coal-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "coalPost")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>${feature.properties.SOVEREIGNT} Coal Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "coalPost")} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Reservoir Emissions (Posterior)">
              <GeoJSON
                key={`reservoir-layer-${emissionsData.length}`}
                data={geojsonData}
                style={(e) => dynamicStyle(e, "reservoirPost")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>${feature.properties.SOVEREIGNT} Reservoir Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "reservoirPost")} Tg/yr`,
                      {
                        permanent: false,
                        direction: "top",
                      }
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
          </LayersControl>
        )}

        {/* Hovered GeoJSON layer */}
        {hoveredGeojson && (
          <GeoJSON
            ref={hoverLayerRef}
            key={JSON.stringify(hoveredGeojson)} // Force remount on data change
            data={hoveredGeojson}
            style={hoverStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => handleFeatureClick(feature),
              });
            }}
          />
        )}
        {/* Highlighted GeoJSON layer */}
        {highlightedGeojson && (
          <GeoJSON
            key={JSON.stringify(highlightedGeojson)} // Force remount on data change
            data={highlightedGeojson}
            style={highlightStyle}
            onCeachFeature={(feature, layer) => {
              if (feature.properties) {
                layer.bindTooltip(
                  `<strong>Posterior Anth. Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "posterior")}`,
                  { permanent: false, direction: "top" } // Tooltip configuration
                );
              }
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
