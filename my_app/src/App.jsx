import "./App.css";
import React, { useState, useEffect } from "react";
import WorldMap from "./WorldMap";
import InfoPanel from "./InfoPanel";
import Papa from "papaparse";
import emissionsDataLocal from "./data/emissions_data3.csv"; // Local CSV file
import newEmissionsData from "./data/emissions_data_new.csv"; // New emissions data file

function App() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [emissionsData, setEmissionsData] = useState([]);
  const [newEmissionsData, setNewEmissionsData] = useState([]);
  const [selectedCountryEmissions, setSelectedCountryEmissions] = useState([]);

  const newEmissionsDataUrl = process.env.PUBLIC_URL + "/emissions_data_new.csv";

  useEffect(() => {
    // Filter emissions data for selected country

    const filteredData = newEmissionsData.filter((row) => row["countries"] === selectedCountry);
    console.log("Trying to filter for!: ", selectedCountry);
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

    fetch(newEmissionsDataUrl)
      .then((res) => res.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        setNewEmissionsData(parsed.data);
      })
      .catch((err) => {
        console.error("Error fetching or parsing new emissions CSV:", err);
      });
  }, []);

  return (
    <div className="App">
      <div className="pageWrapper">
        <InfoPanel selectedCountry={selectedCountry} selectEmissions={selectedCountryEmissions} />
        <WorldMap selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} emissionsData={newEmissionsData} />
      </div>
    </div>
  );
}

export default App;
