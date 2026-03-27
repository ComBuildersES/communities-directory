import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// ArcGIS SDK Imports
import '@arcgis/map-components/dist/components/arcgis-map'
import '@arcgis/map-components/dist/components/arcgis-search'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol"
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer"
import Point from "@arcgis/core/geometry/Point"
import Graphic from "@arcgis/core/Graphic"
import Popup from "@arcgis/core/widgets/Popup"
import * as clusterLabelCreator from "@arcgis/core/smartMapping/labels/clusters.js";
import * as pieChartRendererCreator from "@arcgis/core/smartMapping/renderers/pieChart.js";
import { useCommunitiesFiltered } from "../../stores/community.store.js";
// import { MapCard } from "../MapCard.jsx"
import { CommunityCard } from "../CommunityCard.jsx"

// import communities from "/public/data/communities.json"
//import communities from "/public/data/communities.geojson"

// Css Imports
import './Map.css'

// React Imports
import { useEffect, useState, useRef } from 'react'

function Map ({ showListView = null, onOpenCommunity = null, initialFocus = null, initialMapState = null, onMapStateChange = null }) {
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState(null)
  const [provincesFeatures, setProvincesFeatures] = useState([])
  const [provincesCenter, setProvincesCenter] = useState()
  const [visibleCommunities, setVisibleCommunities] = useState([]);
  const [mapCollapsed, setMapCollapsed] = useState(false);

  const popupRef = useRef(null)
  const communityLayerRef = useRef(null);
  const mapStateDebounceRef = useRef(null);
  const searchRef = useRef(null);


  {/* <  const communities = useCommunitiesFiltered().filter((community) => {

    let comunidad = community.displayOnMap ? <CommunityCard key={community.id} community={community} /> : null

    return comunidad
  });> */}
  const rawCommunities = useCommunitiesFiltered(); // already filtered by sidebar
  const communities = useMemo(() => {
    return rawCommunities.filter(c => c.displayOnMap);
  }, [rawCommunities]);
  const hiddenFromMapCount = useMemo(
    () => rawCommunities.filter((community) => !community.displayOnMap).length,
    [rawCommunities]
  );




  useEffect(() => {
    if (!searchRef.current) return;
    searchRef.current.setAttribute('popup-disabled', '');
    searchRef.current.setAttribute('result-graphic-disabled', '');
  }, []);

  // Setup Effect for the Provinces Feature Layer
  useEffect(() => {
    if (activeView) {
      const provincesSymbol = new SimpleFillSymbol({
        color: [0, 0, 0, 0],
        outline: {
          cap: "round",
          color: [88, 118, 165, 0.5],
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
          value: "tech-meetup",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#ff595e" },
        },
        {
          value: "conference",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#ffca3a" },
        },
        {
          value: "collaborative-group",
          symbol: { type: "simple-marker", style: "circle", size: "8px", color: "#8ac926" },
        },
        {
          value: "hacklab",
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
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false,
          position: "top-left",
        },
      })

      view.popup = popupRef.current
    }

    // Build conditional info rows
    const infoRows = [
      { label: t("map.popup.status"), value: community.status },
      { label: t("map.popup.lastReviewed"), value: community.lastReviewed },
      { label: t("map.popup.communityType"), value: community.communityType },
      { label: t("map.popup.eventFormat"), value: community.eventFormat },
      { label: t("map.popup.location"), value: community.location },
      { label: t("map.popup.topics"), value: community.topics },
      { label: t("map.popup.contact"), value: community.contactInfo },
      { label: t("map.popup.website"), value: community.communityUrl ? `<a href="${community.communityUrl}" target="_blank">${t("map.popup.visit")}</a>` : null }
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
                  src="${community.thumbnailUrl}"
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
    const view = activeViewEvent.target.view;
    view.map.basemap.referenceLayers.removeAll();
    setActiveView(() => view);
  }

  async function generarConfiguracionCluster (layer, view) {
    // Genera la labelingInfo default

    const { labelingInfo, clusterMinSize } = await clusterLabelCreator
      .getLabelSchemes({ layer, view })
      .then((labelSchemes) => labelSchemes?.primaryScheme);

    const labelSymbol = labelingInfo[0].symbol;
    labelSymbol.color = [255, 255, 255, 1];
    labelSymbol.haloColor = [33, 50, 74, 0.9];
    labelSymbol.haloSize = 1.5;
    labelSymbol.font.size = 10;
    labelingInfo[0].labelPlacement = "center-center";

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
      <th style="text-align: left; padding: 6px; color: #ffff">${t("map.cluster.type")}</th>
      <th style="text-align: right; padding: 6px; color: #ffff">${t("map.cluster.total")}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #ff595e; border-radius: 50%; margin-right: 6px;"></span>
        ${t("communityType.tech-meetup")}
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_tech_meetup}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #ffca3a; border-radius: 50%; margin-right: 6px;"></span>
        ${t("communityType.conference")}
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_conference}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #8ac926; border-radius: 50%; margin-right: 6px;"></span>
        ${t("communityType.collaborative-group")}
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_collaborative_group}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #1982c4; border-radius: 50%; margin-right: 6px;"></span>
        ${t("communityType.hacklab")}
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_hacklab}</b></td>
    </tr>
    <tr>
      <td style="padding: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: #6a4c93; border-radius: 50%; margin-right: 6px;"></span>
        ${t("map.cluster.other")}
      </td>
      <td style="padding: 6px; text-align: right;"><b>{SUM_Otro}</b></td>
    </tr>
  </tbody>
</table>
`

    const popupTemplate = {
      title: t("map.cluster.title"),
      content: [
        {
          type: "text",
          text: t("map.cluster.countText"),
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

        if (onMapStateChange) {
          clearTimeout(mapStateDebounceRef.current);
          mapStateDebounceRef.current = setTimeout(() => {
            onMapStateChange({
              lat: activeView.center.latitude,
              lon: activeView.center.longitude,
              zoom: activeView.zoom,
            });
          }, 500);
        }
      });
    };

    // Initial filter run
    handleExtentChange();

    // Listen to extent changes
    const handle = activeView.watch("extent", handleExtentChange);

    return () => {
      handle.remove();
      cancelAnimationFrame(rafId);
      clearTimeout(mapStateDebounceRef.current);
    };
  }, [activeView, communities, onMapStateChange]);

  const numVisible = visibleCommunities.length;
  return (
    <div id="map" className="column" style={{ display: "flex", flexDirection: "column" }}>
      <div className={`map-canvas${mapCollapsed ? " map-canvas--collapsed" : ""}`}>
      <arcgis-map
        basemap="gray"
        center={
          initialFocus
            ? `${initialFocus.lon}, ${initialFocus.lat}`
            : initialMapState
              ? `${initialMapState.lon}, ${initialMapState.lat}`
              : "-4, 40"
        }
        zoom={
          initialFocus
            ? "8"
            : initialMapState
              ? String(Math.round(initialMapState.zoom))
              : "4"
        }
        onarcgisViewReadyChange={activeViewChange}
      >
        <arcgis-search slot="top-right" ref={searchRef}></arcgis-search>
      </arcgis-map>
      </div>
      <button className="map-toggle-btn" onClick={() => setMapCollapsed(c => !c)}>
        <i className={`fas ${mapCollapsed ? "fa-chevron-down" : "fa-chevron-up"}`}></i>
        {mapCollapsed ? t("map.showMap") : t("map.hideMap")}
      </button>
      <div className="map-results-note">
        <strong>{numVisible}</strong>{" "}{t("map.visibleInArea")}
        {hiddenFromMapCount > 0 && (
          <>
            {" "}
            <span className="map-hidden-hint">
              +{hiddenFromMapCount} {t("map.noFixedLocation")}
              <span className="map-hidden-tooltip" role="tooltip">
                {t("map.hiddenTooltip", { count: hiddenFromMapCount })}{" "}
                <button
                  type="button"
                  className="map-results-link"
                  onClick={() => showListView?.()}
                >
                  {t("map.viewInList")}
                </button>
              </span>
              <i className="fa-solid fa-circle-info map-hidden-icon" aria-hidden="true"></i>
            </span>
          </>
        )}
      </div>
      <div className="communitieslist">
        {/* {communities.map((community) => {

          let comunidad = community.displayOnMap ? <CommunityCard key={community.id} community={community} /> : null

          return comunidad
        })} */}


        {/* {communities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))} */}
        {visibleCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} onOpen={onOpenCommunity} />
        ))}



      </div>
    </div>
  )
}

export default Map 
