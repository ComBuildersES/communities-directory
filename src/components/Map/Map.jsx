import { useMemo } from 'react'

// ArcGIS SDK Imports
import '@arcgis/map-components/dist/components/arcgis-map'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol"
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer"
import Point from "@arcgis/core/geometry/Point"
import Graphic from "@arcgis/core/Graphic"
import Popup from "@arcgis/core/widgets/Popup"
import * as clusterLabelCreator from "@arcgis/core/smartMapping/labels/clusters.js";
import * as pieChartRendererCreator from "@arcgis/core/smartMapping/renderers/pieChart.js";
import { useCommunitiesFiltered } from "../../stores/community.store";
// import { MapCard } from "../MapCard.jsx"
import { CommunityCard } from "../CommunityCard.jsx"

const BASE_URL = import.meta.env.BASE_URL

// import communities from "/public/data/communities.json"
//import communities from "/public/data/communities.geojson"

// Css Imports
import './Map.css'

// React Imports
import { useEffect, useState, useRef } from 'react'

function Map () {
  const [activeView, setActiveView] = useState(null)
  const [provincesFeatures, setProvincesFeatures] = useState([])
  const [provincesCenter, setProvincesCenter] = useState()
  const [visibleCommunities, setVisibleCommunities] = useState([]);

  const popupRef = useRef(null)
  const communityLayerRef = useRef(null);


  {/* <  const communities = useCommunitiesFiltered().filter((community) => {

    let comunidad = community.displayOnMap ? <CommunityCard key={community.id} community={community} /> : null

    return comunidad
  });> */}
  const rawCommunities = useCommunitiesFiltered(); // already filtered by sidebar
  const communities = useMemo(() => {
    return rawCommunities.filter(c => c.displayOnMap);
  }, [rawCommunities]);




  // Setup Effect for the Provinces Feature Layer
  useEffect(() => {
    if (activeView) {
      const provincesSymbol = new SimpleFillSymbol({
        outline: {
          cap: "round",
          color: [0, 255, 204, 0.3],
          join: "round",
          miterLimit: 1,
          style: "solid",
          width: 0.5,
        },
        style: "solid",
      })

      const provincesRenderer = new SimpleRenderer({
        symbol: provincesSymbol
      })

      const provincesFL = new FeatureLayer({
        portalItem: {
          id: "503ef1cb832f4e8bb4be7fc024ad9aa2"
        },
        renderer: provincesRenderer,
        effect: "bloom(1, 1px, 0.0)",
        popupEnabled: false,
      })

      activeView.map.add(provincesFL)

      activeView
        .whenLayerView(provincesFL)
        .then(() => {
          provincesFL
            .queryFeatures({ f: 'pbf', where: "1=1", returnGeometry: true, outFields: ["NAMEUNIT"] })
            .then((queryResult) => {
              const featureSetResults = queryResult.features

              setProvincesFeatures(featureSetResults)

              const arrayResultsFormatted = featureSetResults.map((feature) => ({
                center: feature.geometry.extent.center,
                NAMEUNIT: feature.attributes.NAMEUNIT
              }))

              setProvincesCenter(arrayResultsFormatted)
            })
        })
    }
  }, [activeView])

  useEffect(() => {
    if (!activeView || provincesFeatures.length === 0) return;

    // ✅ Remove the existing layer if it exists
    if (communityLayerRef.current) {
      activeView.map.remove(communityLayerRef.current);
      communityLayerRef.current.destroy(); // optional, good cleanup
    }

    // 🔁 Create graphics from communities
    const graphics = communities.map((community) => {
      const geometry = new Point({
        latitude: community.latLon.lat,
        longitude: community.latLon.lon
      });

      const graphic = new Graphic({
        geometry,
        attributes: community,
      });

      graphic.popupTemplate = {
        title: community.name,
        content: () => {
          abrirPopupArcGIS(community, activeView, geometry);
          return null;
        },
      };

      return graphic;
    });

    // 🧱 Define fields and renderer
    const fields = [
      { name: "ObjectID", alias: "ObjectID", type: "oid" },
      { name: "id", alias: "id", type: "integer" },
      { name: "name", alias: "name", type: "string" },
      { name: "lastReviewed", alias: "lastReviewed", type: "date" },
      { name: "communityType", alias: "communityType", type: "string" },
      { name: "eventFormat", alias: "eventFormat", type: "string" },
      { name: "location", alias: "location", type: "string" },
      { name: "topics", alias: "topics", type: "string" },
      { name: "contactInfo", alias: "contactInfo", type: "string" },
      { name: "communityUrl", alias: "communityUrl", type: "string" },
      { name: "thumbnailUrl", alias: "thumbnailUrl", type: "string" },
    ];

    const communityBuildersRenderer = {
      type: "unique-value",
      field: "communityType",
      defaultSymbol: {
        type: "simple-marker",
        style: "circle",
        color: "white",
        size: "8px",
      },
      uniqueValueInfos: [
        {
          value: "Tech Meetup",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#ff595e" },
        },
        {
          value: "Conferencia",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#ffca3a" },
        },
        {
          value: "Grupo colaborativo",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#8ac926" },
        },
        {
          value: "Hacklab",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#1982c4" },
        },
      ],
    };

    // 🗺️ Create the FeatureLayer
    const communityBuildersFl = new FeatureLayer({
      source: graphics,
      fields: fields,
      renderer: communityBuildersRenderer,
    });

    // Set clustering config
    communityBuildersFl.when().then(() => {
      generarConfiguracionCluster(communityBuildersFl, activeView).then((featureReduction) => {
        communityBuildersFl.featureReduction = featureReduction;
      });
    });

    // Add to map and track reference
    activeView.map.add(communityBuildersFl);
    communityLayerRef.current = communityBuildersFl;

    // Optional: query results for debug or additional logic
    activeView.whenLayerView(communityBuildersFl).then(() => {
      communityBuildersFl.queryFeatures({
        f: "pbf",
        where: "1=1",
        returnGeometry: true,
        outFields: ["*"],
      }).then((queryResult) => {
        const featureSetResults = queryResult.features;
        // console.log(featureSetResults);
      });
    });

  }, [activeView, provincesFeatures, communities]);

  // Effect for the change from cluster to single point symbols

  function abrirPopupArcGIS (community, view, geometry) {
    if (!popupRef.current) {
      popupRef.current = new Popup({
        view,
        alignment: "top-left",
        dockEnabled: false,
        dockOptions: {
          buttonEnabled: false
        }
      })

      view.popup = popupRef.current
    }

    // Build conditional info rows
    const infoRows = [
      { label: "Estado", value: community.status },
      { label: "Revisada", value: community.lastReviewed },
      { label: "Tipo de comunidad", value: community.communityType },
      { label: "Formato de evento", value: community.eventFormat },
      { label: "Localización", value: community.location },
      { label: "Temas", value: community.topics },
      { label: "Contacto", value: community.contactInfo },
      { label: "Website", value: community.communityUrl ? `<a href="${community.communityUrl}" target="_blank">Visitar</a>` : null }
    ]
      .filter((item) => item.value && item.value !== "Sin completar" && item.value !== "") // clean logic
      .map(
        (item) => `
      <div style="margin-bottom: 6px ">
        <span style="font-weight: 600  color: #ccc ">${item.label}:</span>
        <span style="color: #eee  margin-left: 4px ">${item.value}</span>
      </div>`
      )
      .join("")

    const img = `<img 
                  src="${BASE_URL}/${community.thumbnailUrl}" 
                  alt="${community.name}" 
                  style="width: 100%  border-radius: 8px  margin-bottom: 12px " 
                />`


    popupRef.current.open({
      location: geometry,
      title: `<span style="color: #00eaff ">${community.name}</span>`,
      content: `
      <div style="
        background-color: #1b1b1b 
        color: #eee 
        padding: 12px 
        border-radius: 10px 
        font-family: system-ui, sans-serif 
        max-width: 260px 
      ">

        ${img}

        ${infoRows}
      </div>
    `
    })
  }

  function activeViewChange (activeViewEvent) {
    setActiveView(() => activeViewEvent.target.view)
  }

  async function generarConfiguracionCluster (layer, view) {
    // Genera la labelingInfo default

    const { labelingInfo, clusterMinSize } = await clusterLabelCreator
      .getLabelSchemes({ layer, view })
      .then((labelSchemes) => labelSchemes?.primaryScheme);

    const labelSymbol = labelingInfo[0].symbol;
    labelSymbol.color = [255, 255, 255, 1];
    labelSymbol.haloColor = [255, 255, 255, 0.3];
    labelSymbol.font.size = 10;

    const { renderer, fields } =
      await pieChartRendererCreator.createRendererForClustering({
        layer,
        shape: "donut",
      });

    renderer.holePercentage = 0.66;

    const fieldInfos = fields.map((field) => {
      // console.log(field)
      return {
        fieldName: field.name,
        label: field.alias,
        format: {
          places: 0,
          digitSeparator: true,
        },
      };
    });

    const fieldNames = fieldInfos.map((field) => {
      return field.fieldName;
    });

    const tablaHtmlPopup = `<table style="width: 100%; font-family: sans-serif; font-size: 14px; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="text-align: left; padding: 6px; color: #ffff">Tipo</th>
      <th style="text-align: right; padding: 6px; color: #ffff">Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #ff595e; border-radius: 50%; margin-right: 6px;"></span>
        Tech Meetup
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_Tech_Meetup}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #ffca3a; border-radius: 50%; margin-right: 6px;"></span>
        Conferencia
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_Conferencia}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #8ac926; border-radius: 50%; margin-right: 6px;"></span>
        Grupo colaborativo
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_Grupo_colaborativo}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #1982c4; border-radius: 50%; margin-right: 6px;"></span>
        Hacklab
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_Hacklab}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #6a4c93; border-radius: 50%; margin-right: 6px;"></span>
        Otro
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_Otro}</b></td>
    </tr>
  </tbody>
</table>
`

    const popupTemplate = {
      title: "Comunidades",
      content: [
        {
          type: "text",
          text: "<b>{cluster_count}</b> Comunidades.",
        },
        {
          type: "media",
          mediaInfos: [
            {
              //title: "Tipo de comunidad",
              type: "pie-chart",
              value: {
                fields: fieldNames,
              },
            },
          ],
        },
        // {
        //   type: "fields",
        // },
        {
          type: "text",
          text: tablaHtmlPopup
        }
      ],
      fieldInfos,
    };

    return {
      type: "cluster",
      popupTemplate,
      labelingInfo,
      clusterMinSize,

      fields,
      renderer,
    };
  }

  // useEffect(() => {
  //   if (!activeView) return;

  //   const handleExtentChange = () => {
  //     const extent = activeView.extent;

  //     const filteredCommunities = communities//useCommunitiesFiltered(); // sidebar filtered ones

  //     const visible = filteredCommunities.filter((c) => {
  //       const { lon, lat } = c.latLon;
  //       return extent.contains(new Point({ latitude: lat, longitude: lon }));
  //     });

  //     setVisibleCommunities(visible);


  //   };

  //   // Initial run
  //   handleExtentChange();

  //   // React to panning/zooming
  //   const handle = activeView.watch("extent", handleExtentChange);

  //   return () => {
  //     handle.remove();
  //   };
  // }, [activeView, communities]);

  useEffect(() => {
    if (!activeView) return;

    let rafId;

    const handleExtentChange = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;

        const extent = activeView.extent;
        const visible = communities.filter((c) => {
          const { lon, lat } = c.latLon;
          return extent.contains(new Point({ latitude: lat, longitude: lon }));
        });

        setVisibleCommunities(visible);
      });
    };

    // Initial filter run
    handleExtentChange();

    // Listen to extent changes
    const handle = activeView.watch("extent", handleExtentChange);

    return () => {
      handle.remove();
      cancelAnimationFrame(rafId);
    };
  }, [activeView, communities]);

  const numVisible = visibleCommunities.length;
  return (
    <div id="map" className="column" style={{ display: "flex", flexDirection: "column" }}>
      <arcgis-map
        basemap="gray"
        center="-4, 40"
        zoom="4"
        onarcgisViewReadyChange={activeViewChange}
      ></arcgis-map>
      <div className="mb-2 has-text-centered	">Encontradas: {numVisible} comunidades en este área<br /><small>⚠️ <i>Para ver comunidades online ir a "Ver lista"</i></small></div>
      <div className="communitieslist">
        {/* {communities.map((community) => {

          let comunidad = community.displayOnMap ? <CommunityCard key={community.id} community={community} /> : null

          return comunidad
        })} */}


        {/* {communities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))} */}
        {visibleCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}



      </div>
    </div>
  )
}

export default Map 
