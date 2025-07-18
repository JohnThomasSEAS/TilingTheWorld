import "./App.css";
import React, { useState, useEffect } from "react";
import WorldMap from "./WorldMap";
import InfoPanel from "./InfoPanel";
import Papa from "papaparse";
import emissionsDataLocal from "./data/emissions_data3.csv"; // Local CSV file

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
    fetch(emissionsDataLocal)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        setEmissionsData(parsed.data);
      })
      .catch((err) => {
        console.error("Error fetching or parsing CSV:", err);
      });
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
