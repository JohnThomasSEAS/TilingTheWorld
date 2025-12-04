import React, { useState, useEffect } from "react";
import { Icon, Popup as PopupSemantic, Modal, Grid, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import "./InfoPanel.css";
import Plot from "react-plotly.js";

function InfoPanel({ selectedCountry, selectEmissions }) {
  const [percentChange, setPercentChange] = useState(0);
  const [anthroPercentChange, setAnthroPercentChange] = useState(0);
  const [priorEmissionsSectors, setPriorEmissionsSectors] = useState([]);
  const [posteriorEmissionsSectors, setPosteriorEmissionsSectors] = useState([]);

  const [postEmissionsSectorsMin, setPostEmissionsSectorsMin] = useState([]);
  const [postEmissionsSectorsMax, setPostEmissionsSectorsMax] = useState([]);

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

  const [orderedSectors, setOrderedSectors] = useState([]);

  useEffect(() => {
    if (selectEmissions) {
      setPercentChange((((selectEmissions.UNFCCC_total_post - selectEmissions.UNFCCC_total_prior) / selectEmissions.UNFCCC_total_prior) * 100).toFixed(0));
      setAnthroPercentChange((((selectEmissions.AnthroTotal_post - selectEmissions.AnthroTotal_prior) / selectEmissions.AnthroTotal_prior) * 100).toFixed(0));

      // Sort sectors and emission arrays in descending order of posterior emissions
      const initialSectors = ["Reservoirs", "Other", "Rice", "Waste", "Livestock", "Coal", "Oil-Gas"];
      const prior = initialSectors.map((sector) => selectEmissions[`${sector}_prior`]);
      const post = initialSectors.map((sector) => selectEmissions[`${sector}_post`]);
      const post_min = initialSectors.map((sector) => selectEmissions[`${sector}_post_min`]);
      const post_max = initialSectors.map((sector) => selectEmissions[`${sector}_post_max`]);

      const combined = initialSectors.map((sector, i) => ({
        sector,
        prior: prior[i],
        post: post[i],
        post_min: post_min[i],
        post_max: post_max[i]
      }));

      combined.sort((a, b) => a.post - b.post);

      setPriorEmissionsSectors(combined.map((d) => d.prior));
      setPosteriorEmissionsSectors(combined.map((d) => d.post));
      setOrderedSectors(combined.map((d) => d.sector));
      setPostEmissionsSectorsMin(combined.map((d) => d.post_min));
      setPostEmissionsSectorsMax(combined.map((d) => d.post_max));
    }
  }, [selectEmissions]);


  const handleUrlOpenZenodo = () => {
    // Specify the URL you want to open
    const url = 'https://doi.org/10.5281/zenodo.17245782';
    // Open in a new tab/window
    window.open(url, '_blank');
  }

  const handleUrlOpenPaper = () => {
    // Specify the URL you want to open
    // before publication
    //const url = 'https://eartharxiv.org/repository/view/10387/';
    // after publication 
    const url = 'http://doi.org/10.1038/s41467-025-67122-8';
    // Open in a new tab/window
    window.open(url, '_blank');
  }

  return (
      {/*{selectEmissions?.__parsed_extra && (*/}
      {selectEmissions?.sensitivity && (
        <div style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div id="sentivitiyTile">
            Sensitivity: <span>{Number(selectEmissions.sensitivity).toFixed(2)}</span>
            <PopupSemantic
              content="The sensitivity of the
                      inversion results to the TROPOMI observations as measured by the
                      trace of the averaging kernel matrix."
              position="top left"
              trigger={<Icon name="info" size="small" color="grey" inverted circular style={{ position: "absolute", transform: "scale(0.9)", top: "-8px", right: "-13px" }} />}
            />
          </div>
        </div>
      )}
      <h1 style={{ opacity: selectedCountry ? "0.4" : "1", textAlign: "center" }}>
        <Icon name="cloud" style={{ marginRight: "1.5rem" }} />
        Methane Emissions by Country <span style={{ margin: "auto 15px auto 15px" }}>•</span> 2023
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
                <Grid.Row style={{ borderTop: "none", marginLeft: "1.7rem" }}>
                  <Grid.Column width={8}>
                    <p style={{ fontSize: "1.2rem", color: "rgb(210,210,210)", position: "relative", marginBottom: "0.1rem" }}>
                      Anthropogenic Prior
                      <PopupSemantic
                        content="Prior emissions from UNFCCC reports and bottom-up inventories."
                        trigger={<Icon name="info" size="tiny" color="grey" inverted circular style={{ transform: "translateY(-10px) translateX(4px)" }} />}
                      />
                    </p>
                    <h4 style={{ marginTop: "0.4rem" }}>{Number(selectEmissions.AnthroTotal_prior).toFixed(1)} Tg/yr</h4>
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
                      {Number(selectEmissions.AnthroTotal_post).toFixed(1)} Tg/yr
                      <span style={{ marginLeft: "1.5rem" }}>
                        ({anthroPercentChange > 0 ? <Icon name="arrow up" /> : <Icon name="arrow down" />}
                        {Math.abs(anthroPercentChange)}% )
                      </span>
                    </h4>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              {/* SECOND ROW */}

              {/*<hr id="smallBreak" style = {{margin: "2rem auto 1.5rem auto"}} />*/}
              <div className="sectoralEmissionsContainer">
                <Plot
                  style={{ height: "100%", width: "100%" }}
                  data={[
                    {
                      x: posteriorEmissionsSectors,
                      y: orderedSectors,
                      error_x: {
                        type: 'data',
                        symmetric: false,
                        array: postEmissionsSectorsMax,
                        arrayminus: postEmissionsSectorsMin,
                        visible: true,
                        width: 3,
                        color: 'dark-grey',
                      },
                      type: "bar",
                      name: "Posterior Emissions",
                      marker: { color: "#1abc9c" },
                      orientation: "h",
                      hovertemplate: orderedSectors.map((sector, index) => {
                        if (sector === "OtherAnth") {
                          return `Anthropogenic emissions come from varied sources.<br>Posterior Emissions: %{x:.1f} Tg/yr<extra></extra>`;
                        } else {
                          return `Posterior Emissions: %{x:.1f} Tg/yr<extra></extra>`;
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
                          return `Anthropogenic emissions come from varied sources.<br>Prior Emissions: %{x:.1f} Tg/yr<extra></extra>`;
                        } else {
                          return `Prior Emissions: %{x:.1f} Tg/yr<extra></extra>`;
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

      <div id="moreInfoTile">
        Emissions estimates come from inversions of TROPOMI satellite methane observations. Read about the methods and uncertainties in the <a href="http://doi.org/10.1038/s41467-025-67122-8" style={{ color: 'rgb(31,178,139)' }}>paper</a>.
      </div>

      {selectedCountry && (
        <PopupSemantic
          content="Download emissions data"
          position="bottom center"
          trigger={<Icon className="downloadIcon" name="download" inverted color="grey" circular onClick={handleUrlOpenZenodo} />}
        />
      )}
      <PopupSemantic
        content="Learn more about the data driving this project"
        position="top right"
        trigger={<Icon className="projectInfoIcon" name="info" inverted color="grey" circular onClick={() => setInfoModalOpen(true)} />}
      />
      <PopupSemantic
        content="Click to read the paper (East et al. 2025, Nature Communications)"
        position="top right"
        trigger={
          <Icon className="projectLinkIcon" name="newspaper" inverted color="grey" circular onClick={handleUrlOpenPaper} />
          }
      />
      <Modal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} size="small">
        <Modal.Header>About the Project</Modal.Header>
        <Modal.Content>
          <strong>
            <a href="http://doi.org/10.1038/s41467-025-67122-8" style={{ color: "inherit", textDecoration: "underline" }}>
              <Icon name="linkify" style={{ textDecoration: "none" }} />
              Worldwide inference of national methane emissions by inversionofsatellite observations with UNFCCC prior estimates
            </a>
          </strong>
          <br />
          <br />
          <p>
            James D. East, Daniel J. Jacob, Dylan Jervis, Nicholas Balasus, Lucas A. Estrada, Sarah E. Hancock, Melissa P. Sulprizio, John Thomas, Xiaolin Wang, Zichong Chen, Daniel J. Varon, John Worden
          </p>
          <br />
          <p>
            Published in <cite>Nature Communications</cite>
          </p>
          <hr />
          <strong>Abstract</strong>
          <br />
          <br />
          <p>
            Meeting climate policy goals to reduce methane emissions under the Paris Agreement and the Global Methane Pledge 
            requires nations to set targets and quantify reductions. Individual countries report emissions by sector to the 
            United Nations Framework Convention on Climate Change (UNFCCC) but there are large uncertainties. Here we optimize 
            2023 national emissions at up to 25 km grid resolution for 161 countries with a globally consistent open-source 
            framework for inverse analysis of Tropospheric Monitoring Instrument (TROPOMI) satellite observations, using UNFCCC 
            reports for prior estimates together with point source information from GHGSat and other satellites. We find global 
            anthropogenic emissions to be 15% higher than UNFCCC reporting (32% for oil-gas), with national emissions more than 
            50% higher than reporting for a quarter of the countries. Oil-gas emission intensities vary by two orders of magnitude 
            between countries. Sub-Saharan Africa has the highest livestock emission intensity of any region. Hydroelectric reservoirs, 
            generally not included in UNFCCC reporting, contribute 6% of anthropogenic emissions globally. The framework allows 
            updates for subsequent years, enabling monitoring of emission trends and support for improved reporting.
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
