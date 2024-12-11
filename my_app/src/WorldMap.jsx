import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl, Layers, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon, Dropdown } from "semantic-ui-react";
import "./InfoPanel.css";

const WorldMap = ({ setSelectedCountry, emissionsData }) => {
  const [geojsonData, setGeojsonData] = useState(null); // Base GeoJSON data
  const [hoveredGeojson, setHoveredGeojson] = useState(null); // Hovered GeoJSON feature
  const [highlightedGeojson, setHighlightedGeojson] = useState(null); // Highlighted GeoJSON feature
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [allAvailableCountries, setAllAvailableCountries] = useState([]);
  const [selectedCountrySearch, setSelectedCountrySearch] = useState("");
  const [activeLayer, setActiveLayer] = useState("Total Anth. Emissions (Posterior)");

  const baseLayerRef = useRef();
  const hoverLayerRef = useRef();
  const activateLayerRef = useRef("Total Anth. Emissions (Posterior)");

  const mapRef = useRef();

  const LayerChangeHandler = ({ onLayerChange }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      const handleBaseLayerChange = (e) => {
        onLayerChange(e.name);
        console.log("Active Layer:", e.name);
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
  }, [geojsonData]);

  useEffect(() => {
    // Fetch base GeoJSON
    fetch(`${process.env.PUBLIC_URL}/world-countries.geojson`)
      .then((response) => response.json())
      .then((data) => setGeojsonData(data));
  }, []);

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
    const countryData = emissionsData.find((row) => row.countries === countryName);
    if (["prior", "posterior"].includes(type)) {
      return countryData ? parseFloat(type === "posterior" ? countryData.Total_Anth_Post : countryData.Total_Anth_Prior) : 0; // Default to 0 if not found
    } else if (type === "percentDiff") {
      return countryData ? (((countryData.Total_Anth_Post - countryData.Total_Anth_Prior) / countryData.Total_Anth_Prior) * 100).toFixed(0) : 0;
    }
  };

  // Color scale based on emissions
  const getChoroColor = (value) => {
    const maxColor = [179, 2, 2]; // #b30202
    const minColor = [255, 255, 255]; // #ffffff

    const interpolateColor = (value, min, max) => {
      const ratio = (value - min) / (max - min);
      const r = Math.round(minColor[0] + ratio * (maxColor[0] - minColor[0]));
      const g = Math.round(minColor[1] + ratio * (maxColor[1] - minColor[1]));
      const b = Math.round(minColor[2] + ratio * (maxColor[2] - minColor[2]));
      return `rgb(${r},${g},${b})`;
    };

    const maxEmissionValue = 10;
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
      : value > 0.1
      ? "#ffffff" // White
      : value > -0.1
      ? "#a8c6e4" // Light blue
      : value > -0.25
      ? "#4788c5" // Medium blue
      : value > -0.5
      ? "#0057af" // Dark blue
      : "#00008b"; // Darker blue
  };

  // Dynamic style function
  const dynamicStyle = (feature, type) => {
    const emissions = getEmissionsForCountry(feature.properties.SOVEREIGNT, type);

    return {
      fillColor: type !== "percentDiff" ? getChoroColor(emissions) : getPercentDiffColor(emissions / 100),
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
    switch (activeLayer) {
      case "Percent Change (Posterior/Prior)":
        return (
          <div id="scaleBar">
            <div id="scaleBarLabel">
              <p>-100%</p>
              <p>0</p>
              <p>100%</p>
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
      case "Total Anth. Emissions (Prior)":
      case "Total Anth. Emissions (Posterior)":
        return (
          <div id="scaleBar">
            <div id="scaleBarLabel">
              <p>0</p>
              <p>5</p>
              <p>10+</p>
            </div>
            <div
              id="colorRamp"
              style={{
                background: `linear-gradient(
                  to left,
                  #b30202 0%,       /* Dark red */
                  #d94848 25%,    /* Medium red */
                  #e29f9f 50%,      /* Light red */
                  #f5dada 75%,    /* Very light red */
                  #ffffff 100%      /* White */
                )`,
              }}
            ></div>
          </div>
        );
      default:
        return null; // Return null if no match
    }
  };

  return (
    <div
      className="mapContainer tileShadow"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "700px", width: "50%", position: "relative" }}
      onMouseLeave={() => {
        setHoveredGeojson(null); // Clear hover state
      }}
    >
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
        whenCreated={(mapInstance) => {
          mapInstance.on("baselayerchange", (event) => {
            // Update the active layer state when the base layer changes
            setActiveLayer(event.name);
            console.log("Active Layer:", event.name);
          });
        }}
      >
        <LayerChangeHandler onLayerChange={setActiveLayer} />
        <TileLayer
          url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.REACT_APP_STADIA_API_KEY}`}
          attribution='&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> contributors &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> contributors &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Base GeoJSON layer */}
        {geojsonData && (
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
        )}

        {/* Layers control for Choropleth */}
        {geojsonData && (
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Total Anth. Emissions (Posterior)" checked={true}>
              <GeoJSON
                data={geojsonData}
                style={(e) => dynamicStyle(e, "posterior")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>Posterior Anth. Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "posterior")}`,
                      { permanent: false, direction: "top" } // Tooltip configuration
                    );
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Total Anth. Emissions (Prior)">
              <GeoJSON
                data={geojsonData}
                style={(e) => dynamicStyle(e, "prior")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(`<strong>Prior Anth. Emissions: </strong>${getEmissionsForCountry(feature.properties.SOVEREIGNT, "prior")}`, {
                      permanent: false,
                      direction: "top",
                    });
                  }
                }}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Percent Change (Posterior/Prior)">
              <GeoJSON
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
