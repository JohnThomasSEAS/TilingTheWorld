import React, { useState, useEffect } from "react";
import { Icon, Grid, GridRow, GridColumn, Popup as PopupSemantic, Modal } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "./InfoPanel.css";
import Plot from "react-plotly.js";

function InfoPanel({ selectedCountry, selectEmissions }) {
  const [percentChange, setPercentChange] = useState(0);
  const [priorEmissionsSectors, setPriorEmissionsSectors] = useState([]);
  const [posteriorEmissionsSectors, setPosteriorEmissionsSectors] = useState([]);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const globalMethanePledgeSignatories = [
    "Albania",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belgium",
    "Belize",
    "Benin",
    "Bosnia and Herzegovina",
    "Brazil",
    "Bulgaria",
    "Burkina Faso",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "Colombia",
    "Comoros",
    "Congo, Democratic Republic of the",
    "Congo, Republic of the",
    "Cook Islands",
    "Costa Rica",
    "Cote d’Ivoire",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guinea",
    "Guyana",
    "Haiti",
    "Honduras",
    "Iceland",
    "Indonesia",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Luxembourg",
    "Malawi",
    "Malaysia",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mexico",
    "Micronesia, Federated States of",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Niger",
    "Nigeria",
    "Niue",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Panama",
    "Papua New Guinea",
    "Peru",
    "Philippines",
    "Portugal",
    "Qatar",
    "Romania",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Samoa",
    "San Marino",
    "São Tomé and Príncipe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Tajikistan",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkmenistan",
    "Tuvalu",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States of America",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vietnam",
    "Yemen",
    "Zambia",
  ];

  const sectors = ["Reservoirs", "Natural", "Wetlands", "BiomassBurn", "OtherAnth", "Rice", "Wastewater", "Landfills", "Livestock", "Coal", "OilAndGas"];

  useEffect(() => {
    if (selectEmissions) {
      setPercentChange((((selectEmissions.Total_posterior - selectEmissions.Total_prior) / selectEmissions.Total_prior) * 100).toFixed(0));

      setPriorEmissionsSectors(sectors.map((sector) => selectEmissions[`${sector}_prior`]));
      setPosteriorEmissionsSectors(sectors.map((sector) => selectEmissions[`${sector}_post`]));
    }
  }, [selectEmissions]);

  const downloadData = () => {
    const csvContent = [
      ["Sector", "Prior Emissions (Tg/yr)", "Posterior Emissions (Tg/yr)"],
      ["Total", Number(selectEmissions.Total_prior).toFixed(2), Number(selectEmissions.Total_posterior).toFixed(2)],
      ...sectors.map((sector, index) => [sector, Number(priorEmissionsSectors[index]).toFixed(2), Number(posteriorEmissionsSectors[index]).toFixed(2)]),
      ,
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedCountry}_emissions.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="leftInfo tileShadow">
      <h1 style={{ opacity: selectedCountry ? "0.4" : "1", textAlign: "center" }}>
        <Icon name="cloud" style={{ marginRight: "1.5rem" }} />
        Emissions by Country <span style={{ margin: "auto 15px auto 15px" }}>•</span> 2023
      </h1>
      <hr />
      {!selectedCountry ? (
        <div style={{ margin: "50% 8% auto 10%", display: "flex", justifyContent: "center", border: "dashed 2px grey", padding: "1.5rem" }}>
          <h1 style={{ color: "grey", opacity: "0.4" }}>
            <Icon name="mouse pointer" />
            Click on or search for a country to view its methane emissions data.
          </h1>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.2rem", marginTop: "1.2rem", zIndex: "1", position: "relative" }}>
            <div className="country-title">
              <h2 style={{ textAlign: "center", position: "relative" }}>
                {selectedCountry}
                {globalMethanePledgeSignatories.includes(selectedCountry) && (
                  <PopupSemantic
                    content={`${selectedCountry} has joined the Global Methane Pledge, aiming to reduce global methane emissions by at least 30% from 2020 levels by 2030.`}
                    trigger={
                      <Icon name="handshake outline" circular inverted size="small" style={{ backgroundColor: "var(--turq) !important", marginLeft: "1.01rem", opacity: "0.8" }} />
                    }
                  />
                )}
              </h2>
            </div>
          </div>
          {selectEmissions && (
            <>
              <div style={{ display: "flex", justifyContent: "center", gap: "20%" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative" }}>
                    Prior Emissions
                    <PopupSemantic
                      content="This is the prior emissions estimate taken from bottom-up inventories."
                      trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ position: "absolute", top: "-4px", right: "-24px" }} />}
                    />
                  </p>
                  <h4 style={{ marginTop: "0.5rem" }}>{Number(selectEmissions.Total_prior).toFixed(2)} Tg/yr</h4>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative" }}>
                    Posterior Emissions{" "}
                    <PopupSemantic
                      content="This is the corrected emissions calculated from TROPOMI observations."
                      trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ position: "absolute", top: "-4px", right: "-18px" }} />}
                    />
                  </p>
                  <h4 style={{ marginTop: "0.5rem" }}>
                    {Number(selectEmissions.Total_posterior).toFixed(2)} Tg/yr
                    <span style={{ marginLeft: "1.5rem" }}>
                      ({percentChange > 0 ? <Icon name="arrow up" /> : <Icon name="arrow down" />}
                      {Math.abs(percentChange)}% )
                    </span>
                  </h4>
                </div>
              </div>
              <hr id="smallBreak" />
              <div className="sectoralEmissionsContainer">
                <Plot
                  style={{ height: "100%", width: "100%" }}
                  data={[
                    {
                      x: posteriorEmissionsSectors, // Values for the bars
                      y: sectors, // Categories on the y-axis
                      type: "bar",
                      name: "Posterior Emissions",
                      marker: { color: "#1abc9c" },
                      orientation: "h", // Horizontal bars
                      hovertemplate: sectors.map((sector, index) => {
                        if (sector === "Natural") {
                          // Custom hover template for the specific category
                          return `Natural emissions come from termites and seeps.<br>Posterior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        } else if (sector === "OtherAnth") {
                          // Custom hover template for the specific category
                          return `Anthropogenic emissions come from varied sources.<br>Posterior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        } else {
                          // Default hover template
                          return `Posterior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        }
                      }),
                    },
                    {
                      x: priorEmissionsSectors, // Values for the bars
                      y: sectors, // Categories on the y-axis
                      type: "bar",
                      name: "Prior Emissions",
                      marker: { color: "rgb(130,130,130)" },
                      orientation: "h", // Horizontal bars
                      hovertemplate: sectors.map((sector, index) => {
                        if (sector === "Natural") {
                          // Custom hover template for the specific category
                          return `Natural emissions come from termites and seeps.<br>Prior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        } else if (sector === "OtherAnth") {
                          // Custom hover template for the specific category
                          return `Anthropogenic emissions come from varied sources.<br>Prior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        } else {
                          // Default hover template
                          return `Prior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        }
                      }),
                    },
                  ]}
                  layout={{
                    autoResize: true,
                    autosize: true,
                    title: null,
                    barmode: "group", // Group bars for side-by-side comparison
                    xaxis: { title: "Emissions (Tg/yr)" }, // X-axis title
                    font: { color: "white" }, // White text color
                    bargap: 0.2, // Adjust the gap between bars within a category group
                    bargroupgap: 0.1, // Adjust the gap between category groups
                    paper_bgcolor: "rgba(0, 0, 0, 0)", // Transparent background
                    plot_bgcolor: "rgba(0, 0, 0, 0)", // Transparent plot area
                    legend: {
                      x: 0.45, // Move to the left
                      y: 1.15, // Align to the top
                      xanchor: "center", // Anchor to the left of the legend box
                      yanchor: "top", // Anchor to the top of the legend box
                      orientation: "h", // Horizontal legend
                    },
                    margin: {
                      t: 10,
                      b: 80,
                      l: 100,
                      r: 50,
                    },
                  }}
                  config={{
                    modeBarButtonsToRemove: [
                      "zoom2d", // Remove zoom button
                      "pan2d", // Remove pan button
                      "resetScale2d", // Remove reset scale button
                      "autoScale2d", // Remove autoscale button
                      "lasso2d",
                    ],
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
      {selectedCountry && (
        <PopupSemantic
          content="Download emissions data in csv format"
          position="bottom center"
          trigger={<Icon className="downloadIcon" name="download" inverted color="grey" circular onClick={downloadData} />}
        />
      )}
      <PopupSemantic
        content="Learn more about the data driving this project"
        position="bottom center"
        trigger={<Icon className="projectInfoIcon" name="info" inverted color="grey" circular onClick={() => setInfoModalOpen(true)} />}
      />
      <Modal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} size="small">
        <Modal.Header>About the Data</Modal.Header>
        <Modal.Content>
          <p>
            This project uses methane emissions data from various sources, including bottom-up inventories and TROPOMI observations. The prior emissions are estimates from
            bottom-up inventories, while the posterior emissions are corrected values calculated from TROPOMI observations.
          </p>
          <p>
            The Global Methane Pledge aims to reduce global methane emissions by at least 30% from 2020 levels by 2030. Countries that have joined this pledge are indicated with a
            handshake icon.
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Icon name="close" onClick={() => setInfoModalOpen(false)} />
        </Modal.Actions>
      </Modal>
    </div>
  );
}

export default InfoPanel;
