import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl, Layers } from "react-leaflet";
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

  const baseLayerRef = useRef();
  const hoverLayerRef = useRef();

  const mapRef = useRef();

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
    return value > 4
      ? "#800026" // Dark red
      : value > 3
      ? "#BD0026" // Red
      : value > 2
      ? "#E31A1C" // Light red
      : value > 1
      ? "#FC4E2A" // Orange
      : "#FFEDA0"; // Light yellow
  };

  const getPercentDiffColor = (value) => {
    return value > 1
      ? "#800026" // Dark red
      : value > 0.5
      ? "#BD0026" // Red
      : value > 0.25
      ? "#E31A1C" // Light red
      : value > 0.1
      ? "#FC4E2A" // Orange
      : value > -0.1
      ? "#FFFFFF" // White
      : value > -0.25
      ? "#ADD8E6" // Light blue
      : value > -0.5
      ? "#87CEEB" // Sky blue
      : value > -1
      ? "#4682B4" // Steel blue
      : "#00008B"; // Dark blue
  };

  // Dynamic style function
  const dynamicStyle = (feature, type) => {
    const emissions = getEmissionsForCountry(feature.properties.SOVEREIGNT, type);

    return {
      fillColor: type !== "percentDiff" ? getChoroColor(emissions) : getPercentDiffColor(emissions),
      color: "rgba(200,200,200,0.7)", // Border color
      weight: 1,
      fillOpacity: 0.5,
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
    weight: 1,
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

  return (
    <div
      className="mapContainer tileShadow"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "700px", width: "50%", position: "relative" }}
      onMouseLeave={() => {
        setHoveredGeojson(null); // Clear hover state
      }}
    >
      <Icon id="searchIcon" name={!searchBarVisible ? "search" : "close"} color="grey" circular inverted onClick={() => setSearchBarVisible(!searchBarVisible)} />
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
            <LayersControl.Overlay name="Total Anth. Emissions (Posterior)" checked={false}>
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
                      "<strong>Posterior Emissions:</strong><br /><strong>Region:</strong>",
                      { permanent: true, direction: "top" } // Tooltip configuration
                    );
                  }
                }}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Total Anth. Emissions (Prior)" checked={false}>
              <GeoJSON
                data={geojsonData}
                style={(e) => dynamicStyle(e, "prior")}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature),
                  });
                  // Add a tooltip for hover
                  if (feature.properties) {
                    layer.bindTooltip(
                      `<strong>Prior Emissions:</strong><br />
               <strong>Region:</strong>`,
                      { permanent: false, direction: "top" }
                    );
                  }
                }}
              />
            </LayersControl.Overlay>
            <LayersControl.Overlay name="Percent Change (Posterior/Prior)" checked={false}>
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
                      `<strong>Percent Change:</strong>%<br />
               <strong>Region:</strong>`,
                      { permanent: false, direction: "top" }
                    );
                  }
                }}
              />
            </LayersControl.Overlay>
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
          />
        )}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
