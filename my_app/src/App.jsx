import "./App.css";
import React, { useState, useEffect } from "react";
import WorldMap from "./WorldMap";
import InfoPanel from "./InfoPanel";
import Papa from "papaparse";

function App() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [emissionsData, setEmissionsData] = useState([]);
  const [selectedCountryEmissions, setSelectedCountryEmissions] = useState([]);

  useEffect(() => {
    // Filter emissions data for selected country
    const filteredData = emissionsData.filter((row) => row["countries"] === selectedCountry);
    setSelectedCountryEmissions(filteredData[0]);
  }, [selectedCountry]);

  useEffect(() => {
    // Fetch and parse CSV
    const csvPath = `${process.env.PUBLIC_URL}/emissions_data3.csv`;

    fetch(csvPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((csvText) => {
        const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
        setEmissionsData(parsedData); // Save parsed data
      })
      .catch((error) => console.error("Error fetching CSV:", error));
  }, []);

  return (
    <div className="App">
      <div className="pageWrapper">
        <InfoPanel selectedCountry={selectedCountry} selectEmissions={selectedCountryEmissions} />
        <WorldMap selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} emissionsData={emissionsData} />
      </div>
    </div>
  );
}

export default App;
