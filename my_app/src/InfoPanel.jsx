import React, { useState, useEffect } from "react";
import { Icon, Popup as PopupSemantic, Modal, Grid, Popup, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "./InfoPanel.css";
import Plot from "react-plotly.js";

function InfoPanel({ selectedCountry, selectEmissions }) {
  const [percentChange, setPercentChange] = useState(0);
  const [anthroPercentChange, setAnthroPercentChange] = useState(0);
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

  // Removed landfills, separated natural into termites and seeps, renamed OilAndGas to OG
  const initialSectors = ["Reservoirs", "Termites", "Seeps", "Wetlands", "BiomassBurn", "OtherAnth", "Rice", "Waste", "Livestock", "Coal", "OG"];
  const [orderedSectors, setOrderedSectors] = useState([]);

  useEffect(() => {
    if (selectEmissions) {
      setPercentChange((((selectEmissions.UNFCCC_total_post - selectEmissions.UNFCCC_total_prior) / selectEmissions.UNFCCC_total_prior) * 100).toFixed(0));
      setAnthroPercentChange((((selectEmissions.AnthroTotal_post - selectEmissions.AnthroTotal_prior) / selectEmissions.AnthroTotal_prior) * 100).toFixed(0));

      // Sort sectors and emission arrays in descending order of posterior emissions
      const prior = initialSectors.map((sector) => selectEmissions[`${sector}_prior`]);
      const post = initialSectors.map((sector) => selectEmissions[`${sector}_post`]);

      const combined = initialSectors.map((sector, i) => ({
        sector,
        prior: prior[i],
        post: post[i],
      }));

      combined.sort((a, b) => a.post - b.post);

      setPriorEmissionsSectors(combined.map((d) => d.prior));
      setPosteriorEmissionsSectors(combined.map((d) => d.post));
      setOrderedSectors(combined.map((d) => d.sector));
    }
  }, [selectEmissions]);

  const downloadData = () => {
    const csvContent = [
      ["Sector", "Prior Emissions (Tg/yr)", "Posterior Emissions (Tg/yr)"],
      ["Total", Number(selectEmissions.UNFCCC_total_prior).toFixed(2), Number(selectEmissions.UNFCCC_total_post).toFixed(2)],
      ...orderedSectors.map((sector, index) => [sector, Number(priorEmissionsSectors[index]).toFixed(2), Number(posteriorEmissionsSectors[index]).toFixed(2)]),
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
      {selectEmissions?.__parsed_extra && (
        <div style={{ position: "relative" }}>
          <div id="sentivitiyTile">
            Sensitivity: <span>{Number(selectEmissions.__parsed_extra).toFixed(2)}</span>
            <PopupSemantic
              content="The sensitivity of the
                      inversion results to the TROPOMI observations is measured by the
                      trace of the averaging kernel matrix."
              position="top left"
              trigger={<Icon name="info" size="small" color="grey" inverted circular style={{ position: "absolute", transform: "scale(0.9)", top: "-8px", right: "-13px" }} />}
            />
          </div>
        </div>
      )}
      <h1 style={{ opacity: selectedCountry ? "0.4" : "1", textAlign: "center" }}>
        <Icon name="cloud" style={{ marginRight: "1.5rem" }} />
        Emissions by Country <span style={{ margin: "auto 15px auto 15px" }}>•</span> 2023
      </h1>
      <hr />
      {!selectedCountry ? (
        <div style={{ margin: "35% 8% auto 10%", display: "flex", justifyContent: "center", border: "dashed 2px grey", padding: "1.5rem" }}>
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
              {/* FIRST ROW */}
              <Grid columns={2} style={{ marginLeft: "1.8rem", marginRight: "1.8rem" }}>
                {/* <Grid.Row>
                  <Grid.Column width={8}>
                    <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                      UNFCCC Prior
                      <PopupSemantic
                        content="Prior taken from the United Nations Framework Convention on Global Change (UNFCCC) inventory. There are large uncertainties and missing observational constrains in this dataset."
                        trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                      />
                    </p>
                    <h4 style={{ marginTop: "0.4rem" }}>{Number(selectEmissions.UNFCCC_total_prior).toFixed(2)} Tg/yr</h4>
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                      UNFCCC Posterior{" "}
                      <PopupSemantic
                        content="Posterior taken from the United Nations Framework Convention on Global Change (UNFCCC) inventory. There are large uncertainties and missing observational constrains in this dataset."
                        trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                      />
                    </p>
                    <h4 style={{ marginTop: "0.4rem" }}>
                      {Number(selectEmissions.UNFCCC_total_post).toFixed(2)} Tg/yr
                      <span style={{ marginLeft: "1.5rem" }}>
                        ({percentChange > 0 ? <Icon name="arrow up" /> : <Icon name="arrow down" />}
                        {Math.abs(percentChange)}% )
                      </span>
                    </h4>
                  </Grid.Column>
                </Grid.Row> */}
                {/* SECOND ROW */}
                <Grid.Row style={{ borderTop: "none" }}>
                  <Grid.Column width={8}>
                    <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                      Anthropogenic Prior
                      <PopupSemantic
                        content="Prior emissions from UNFCCC reports and bottom-up inventories."
                        trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                      />
                    </p>
                    <h4 style={{ marginTop: "0.4rem" }}>{Number(selectEmissions.AnthroTotal_prior).toFixed(2)} Tg/yr</h4>
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                      Anthropogenic Posterior{" "}
                      <PopupSemantic
                        content="Posterior emissions calculated by inverse analysis using the IMI with TROPOMI observations."
                        trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                      />
                    </p>
                    <h4 style={{ marginTop: "0.4rem" }}>
                      {Number(selectEmissions.AnthroTotal_post).toFixed(2)} Tg/yr
                      <span style={{ marginLeft: "1.5rem" }}>
                        ({anthroPercentChange > 0 ? <Icon name="arrow up" /> : <Icon name="arrow down" />}
                        {Math.abs(anthroPercentChange)}% )
                      </span>
                    </h4>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              {/* SECOND ROW */}

              {/* <div style={{ display: "flex", justifyContent: "left", gap: "20%", marginTop: "1.2rem" }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                    Anthropogenic Prior
                    <PopupSemantic
                      content="Corrected prior emissions calculated using the IMI with TROPOMI observations."
                      trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                    />
                  </p>
                  <h4 style={{ marginTop: "0.4rem" }}>{Number(selectEmissions.AnthroTotal_prior).toFixed(2)} Tg/yr</h4>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                    Anthropogenic Posterior{" "}
                    <PopupSemantic
                      content="Corrected posterior emissions calculated using the IMI with TROPOMI observations."
                      trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                    />
                  </p>
                  <h4 style={{ marginTop: "0.4rem" }}>
                    {Number(selectEmissions.AnthroTotal_post).toFixed(2)} Tg/yr
                    <span style={{ marginLeft: "1.5rem" }}>
                      ({percentChange > 0 ? <Icon name="arrow up" /> : <Icon name="arrow down" />}
                      {Math.abs(percentChange)}% )
                    </span>
                  </h4>
                </div>
              </div> */}

              <hr id="smallBreak" style = {{margin: "2rem auto 1.5rem auto"}} />
              <div className="sectoralEmissionsContainer">
                <Plot
                  style={{ height: "100%", width: "100%" }}
                  data={[
                    {
                      x: posteriorEmissionsSectors,
                      y: orderedSectors,
                      type: "bar",
                      name: "Posterior Emissions",
                      marker: { color: "#1abc9c" },
                      orientation: "h",
                      hovertemplate: orderedSectors.map((sector, index) => {
                        if (sector === "OtherAnth") {
                          return `Anthropogenic emissions come from varied sources.<br>Posterior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        } else {
                          return `Posterior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        }
                      }),
                    },
                    {
                      x: priorEmissionsSectors,
                      y: orderedSectors,
                      type: "bar",
                      name: "Prior Emissions",
                      marker: { color: "rgb(130,130,130)" },
                      orientation: "h",
                      hovertemplate: orderedSectors.map((sector, index) => {
                        if (sector === "OtherAnth") {
                          return `Anthropogenic emissions come from varied sources.<br>Prior Emissions: %{x:.2f} Tg/yr<extra></extra>`;
                        } else {
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
                    displayModeBar: false,
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
        position="top right"
        trigger={<Icon className="projectInfoIcon" name="info" inverted color="grey" circular onClick={() => setInfoModalOpen(true)} />}
      />
      <PopupSemantic
        content="Paper currently awaiting publication. Check back soon!"
        position="top right"
        trigger={
          <Icon className="projectLinkIcon" name="newspaper" inverted color="grey" circular onClick={() => setInfoModalOpen(true)} />
          }
      />
      <Modal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} size="small">
        <Modal.Header>About the Project</Modal.Header>
        <Modal.Content>
          <strong>
            <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>
              <Icon name="linkify" style={{ textDecoration: "none" }} />
              National methane emissions at high resolution by inversion of satellite observations using UNFCCC prior estimates
            </a>
          </strong>
          <br />
          <br />
          <p>
            James D. East, Daniel J. Jacob , Dylan Jervis, Nicholas Balasus , Lucas A. Estrada , Sarah E. Hancock , Melissa P. Sulprizio , John Thomas , Xiaolin Wang , Zichong Chen
            , Daniel J. Varon , John Worden
          </p>
          <hr />
          <strong>Abstract</strong>
          <br />
          <br />
          <p>
            Meeting climate policy goals to reduce methane emissions under the Paris Agreement and the Global Methane Pledge requires national emission inventories to set targets
            and quantify reductions. Individual countries report emissions by sector to the United Nations Framework Convention on Global Change (UNFCCC) but there are large
            uncertainties and observational constraints are lacking.
            <br />
            <br />
            Here we apply a globally consistent analytical inversion of TROPOMI observations with the open-source Integrated Methane Inversion (IMI) to optimize national emissions
            at up to 25 km resolution for 161 countries, using UNFCCC reports together with point source information from GHGSat and other satellites. On average across countries,
            national emissions are 40% larger than UNFCCC reports, with global anthropogenic emissions 17% higher than implied by UNFCCC reporting (31% for oil-gas). Livestock
            methane emissions from Sub- Saharan Africa are 40% (9.1 Tg/yr ) larger than UNFCCC reports with the highest intensity of any region. Hydroelectric reservoirs not
            included in UNFCCC reporting contribute 6% of anthropogenic emissions globally (34% in Canada).
          </p>
          <Button as="a" href="https://zenodo.org/records/17245783" target = "#" primary>
            Download Data
          </Button>
        </Modal.Content>
        <Modal.Actions>
          <Icon name="close" onClick={() => setInfoModalOpen(false)} />
        </Modal.Actions>
      </Modal>
    </div>
  );
}

export default InfoPanel;
