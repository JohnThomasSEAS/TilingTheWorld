import "./App.css";
import React, { useState, useEffect } from "react";
import WorldMap from "./WorldMap";
import InfoPanel from "./InfoPanel";
import Papa from "papaparse";
//import emissionsDataLocal from "./data/emissions_data3.csv"; // Local CSV file
import newEmissionsDataUrl from "./data/website_data_withranges.csv"; // New emissions data file

function App() {
  const [selectedCountry, setSelectedCountry] = useState("");
  //const [emissionsData, setEmissionsData] = useState([]);
  const [newEmissionsData, setNewEmissionsData] = useState([]);
  const [selectedCountryEmissions, setSelectedCountryEmissions] = useState([]);
  const [countryEmissionsData, setCountryEmissionsData] = useState({});

  //const newEmissionsDataUrl = process.env.PUBLIC_URL + "/emissions_data_new.csv";

  useEffect(() => {
    // Filter emissions data for selected country
    const filteredData = newEmissionsData.filter((row) => row["countries"] == selectedCountry);
    console.log("Trying to filter for!: ", selectedCountry);
    setSelectedCountryEmissions(filteredData[0]);

    if(!selectedCountry) return;

    
    let countryNameFixed = selectedCountry.replace(/ /g, '_').replace(/,/g, '').replace(/\./g, '').replace(/'/g, '');
    console.log("Fetching country emissions data for:", countryNameFixed + "_masked.json");

    fetch(`/data/country_emissions/${countryNameFixed}_masked.json`)
      .then((res) => res.json())
      .then((data) => {
        setCountryEmissionsData(data);
      })
      .catch((err) => {
        console.log("Error fetching country emissions data:", err);
      });


  }, [selectedCountry]);

  useEffect(() => {
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
        <WorldMap selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} emissionsData={newEmissionsData} countryEmissionsData={countryEmissionsData} />
      </div>
    </div>
  );
}

export default App;
