import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// ArcGIS SDK Imports
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js"
import Point from "@arcgis/core/geometry/Point"
import Graphic from "@arcgis/core/Graphic"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer"
import * as clusterLabelCreator from "@arcgis/core/smartMapping/labels/clusters.js"
import * as pieChartRendererCreator from "@arcgis/core/smartMapping/renderers/pieChart.js"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol"
import Popup from "@arcgis/core/widgets/Popup"
import '@arcgis/map-components/dist/components/arcgis-map'
import '@arcgis/map-components/dist/components/arcgis-search'
import {
  useCBMemberIds,
  useCommunitiesFiltered,
} from "../../stores/community.store.js"
// import { MapCard } from "../MapCard.jsx"
import { CommunityCard } from "../CommunityCard.jsx"

// import communities from "/public/data/communities.json"
//import communities from "/public/data/communities.geojson"

// Css Imports
import './Map.css'

// React Imports
import { useEffect, useRef, useState } from 'react'

const CLUSTER_SEGMENT_CONFIG = [
  {
    key: "tech-meetup",
    fieldName: "SUM_tech_meetup",
    labelKey: "communityType.tech-meetup",
    color: "#ff595e",
    textColor: "#ffffff",
  },
  {
    key: "conference",
    fieldName: "SUM_conference",
    labelKey: "communityType.conference",
    color: "#ffca3a",
    textColor: "#21324a",
  },
  {
    key: "collaborative-group",
    fieldName: "SUM_collaborative_group",
    labelKey: "communityType.collaborative-group",
    color: "#8ac926",
    textColor: "#21324a",
  },
  {
    key: "hacklab",
    fieldName: "SUM_hacklab",
    labelKey: "communityType.hacklab",
    color: "#1982c4",
    textColor: "#ffffff",
  },
]

const CLUSTER_OTHER_SEGMENT = {
  key: "other",
  color: "#6a4c93",
  textColor: "#ffffff",
}

const POPUP_VISIBLE_ELEMENTS_DEFAULT = {
  actionBar: true,
  closeButton: true,
  collapseButton: false,
  featureMenuHeading: true,
  featureNavigation: true,
  featureListLayerTitle: true,
  heading: true,
  spinner: true,
}

const POPUP_VISIBLE_ELEMENTS_CLUSTER = {
  actionBar: false,
  closeButton: true,
  collapseButton: false,
  featureMenuHeading: false,
  featureNavigation: false,
  featureListLayerTitle: false,
  heading: true,
  spinner: true,
}

const CLUSTER_DONUT = {
  size: 164,
  center: 82,
  radius: 46,
  strokeWidth: 26,
  badgeRadius: 56,
}

function toNumber (value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function createSvgElement (tagName) {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName)
}

function getClusterPopupSegments (fields, attributes, t) {
  const matchedFieldNames = new Set()

  const segments = CLUSTER_SEGMENT_CONFIG.map((config) => {
    const matchingField = fields.find((field) => field.name === config.fieldName)
    const value = matchingField
      ? toNumber(attributes?.[matchingField.name])
      : toNumber(attributes?.[config.fieldName])

    if (matchingField) {
      matchedFieldNames.add(matchingField.name)
    }

    return {
      ...config,
      label: t(config.labelKey),
      value,
    }
  })

  const otherValue = fields.reduce((sum, field) => {
    if (matchedFieldNames.has(field.name)) {
      return sum
    }

    return sum + toNumber(attributes?.[field.name])
  }, 0)

  return [
    ...segments,
    {
      ...CLUSTER_OTHER_SEGMENT,
      label: t("map.cluster.other"),
      value: otherValue,
    },
  ]
}

function buildClusterPopupAriaLabel (total, segments, t) {
  const parts = [`${t("map.cluster.total")}: ${total}`]

  segments
    .filter((segment) => segment.value > 0)
    .forEach((segment) => {
      parts.push(`${segment.label}: ${segment.value}`)
    })

  return parts.join(". ")
}

function createClusterPopupContent (graphic, fields, t, popup, resolveClusterTitle) {
  const attributes = graphic?.attributes ?? {}
  const segments = getClusterPopupSegments(fields, attributes, t)
  const visibleSegments = segments.filter((segment) => segment.value > 0)
  const total = toNumber(attributes.cluster_count) || segments.reduce((sum, segment) => sum + segment.value, 0)
  const circumference = 2 * Math.PI * CLUSTER_DONUT.radius
  const detailId = `cluster-popup-detail-${Math.random().toString(36).slice(2, 9)}`

  if (popup) {
    popup.title = resolveClusterTitle?.(graphic?.geometry) ?? t("map.cluster.title")
  }

  const container = document.createElement("div")
  container.className = "map-cluster-popup"
  container.setAttribute("role", "group")
  container.setAttribute("aria-label", buildClusterPopupAriaLabel(total, segments, t))

  const chart = document.createElement("div")
  chart.className = "map-cluster-popup__chart"

  const detail = document.createElement("div")
  detail.className = "map-cluster-popup__detail"
  detail.id = detailId
  detail.setAttribute("aria-live", "polite")

  const detailLabel = document.createElement("span")
  detailLabel.className = "map-cluster-popup__detail-label"

  const detailValue = document.createElement("span")
  detailValue.className = "map-cluster-popup__detail-value"

  detail.append(detailLabel, detailValue)

  const svg = createSvgElement("svg")
  svg.classList.add("map-cluster-popup__svg")
  svg.setAttribute("viewBox", `0 0 ${CLUSTER_DONUT.size} ${CLUSTER_DONUT.size}`)
  svg.setAttribute("role", "presentation")

  const track = createSvgElement("circle")
  track.classList.add("map-cluster-popup__track")
  track.setAttribute("cx", String(CLUSTER_DONUT.center))
  track.setAttribute("cy", String(CLUSTER_DONUT.center))
  track.setAttribute("r", String(CLUSTER_DONUT.radius))
  track.setAttribute("stroke-width", String(CLUSTER_DONUT.strokeWidth))
  svg.append(track)

  const interactiveElements = []
  let activeSegmentKey = null

  const syncActiveSegment = () => {
    interactiveElements.forEach((element) => {
      element.classList.toggle("is-active", element.dataset.segmentKey === activeSegmentKey)
    })
  }

  const setDetail = (label, value) => {
    detailLabel.textContent = label
    detailValue.textContent = String(value)
  }

  const resetDetail = () => {
    activeSegmentKey = null
    syncActiveSegment()
    setDetail(t("map.cluster.total"), total)
  }

  const handleInteractionEnd = (event) => {
    const nextTarget = event.relatedTarget

    if (
      nextTarget instanceof Element &&
      container.contains(nextTarget) &&
      nextTarget.getAttribute("data-segment-key")
    ) {
      return
    }

    resetDetail()
  }

  const activateSegment = (segment) => {
    activeSegmentKey = segment.key
    syncActiveSegment()
    setDetail(segment.label, segment.value)
  }

  const registerInteractiveElement = (element, segment) => {
    element.dataset.segmentKey = segment.key
    element.setAttribute("aria-describedby", detailId)
    element.setAttribute("aria-label", `${segment.label}: ${segment.value}`)
    element.addEventListener("mouseenter", () => activateSegment(segment))
    element.addEventListener("mouseleave", handleInteractionEnd)
    element.addEventListener("focus", () => activateSegment(segment))
    element.addEventListener("blur", handleInteractionEnd)
    interactiveElements.push(element)
  }

  let currentOffset = 0
  let currentAngle = -Math.PI / 2

  visibleSegments.forEach((segment) => {
    if (segment.value <= 0 || total <= 0) {
      return
    }

    const segmentLength = (segment.value / total) * circumference
    const segmentAngle = (segment.value / total) * Math.PI * 2

    const circle = createSvgElement("circle")
    circle.classList.add("map-cluster-popup__segment")
    circle.setAttribute("cx", String(CLUSTER_DONUT.center))
    circle.setAttribute("cy", String(CLUSTER_DONUT.center))
    circle.setAttribute("r", String(CLUSTER_DONUT.radius))
    circle.setAttribute("stroke", segment.color)
    circle.setAttribute("stroke-width", String(CLUSTER_DONUT.strokeWidth))
    circle.setAttribute("stroke-dasharray", `${segmentLength} ${Math.max(circumference - segmentLength, 0)}`)
    circle.setAttribute("stroke-dashoffset", String(-currentOffset))
    circle.setAttribute("transform", `rotate(-90 ${CLUSTER_DONUT.center} ${CLUSTER_DONUT.center})`)
    circle.setAttribute("tabindex", "0")
    svg.append(circle)
    registerInteractiveElement(circle, segment)

    const badge = document.createElement("button")
    const midAngle = currentAngle + (segmentAngle / 2)
    const badgeX = CLUSTER_DONUT.center + Math.cos(midAngle) * CLUSTER_DONUT.badgeRadius
    const badgeY = CLUSTER_DONUT.center + Math.sin(midAngle) * CLUSTER_DONUT.badgeRadius

    badge.className = "map-cluster-popup__badge"
    badge.type = "button"
    badge.textContent = String(segment.value)
    badge.title = `${segment.label}: ${segment.value}`
    badge.style.left = `${badgeX}px`
    badge.style.top = `${badgeY}px`
    badge.style.backgroundColor = segment.color
    badge.style.color = segment.textColor

    chart.append(badge)
    registerInteractiveElement(badge, segment)

    currentOffset += segmentLength
    currentAngle += segmentAngle
  })

  const center = document.createElement("div")
  center.className = "map-cluster-popup__center"

  const totalValue = document.createElement("span")
  totalValue.className = "map-cluster-popup__total"
  totalValue.textContent = String(total)

  const totalLabel = document.createElement("span")
  totalLabel.className = "map-cluster-popup__total-label"
  totalLabel.textContent = t("map.cluster.total")

  const legend = document.createElement("div")
  legend.className = "map-cluster-popup__legend"

  visibleSegments.forEach((segment) => {
    const legendItem = document.createElement("button")
    const legendSwatch = document.createElement("span")
    const legendText = document.createElement("span")

    // legendItem.type = "button"
    // legendItem.className = "map-cluster-popup__legend-item"

    // legendSwatch.className = "map-cluster-popup__legend-swatch"
    // legendSwatch.style.backgroundColor = segment.color

    // legendText.className = "map-cluster-popup__legend-text"
    // legendText.textContent = segment.label

    legendItem.append(legendSwatch, legendText)
    legend.append(legendItem)
    registerInteractiveElement(legendItem, segment)
  })

  center.append(totalValue, totalLabel)
  chart.append(svg, center)
  container.append(chart, detail)

  if (visibleSegments.length > 0) {
    container.append(legend)
  }

  resetDetail()

  return container
}

function Map ({ showListView = null, onOpenCommunity = null, initialFocus = null, initialMapState = null, onMapStateChange = null }) {
  const { t, i18n } = useTranslation()
  const [activeView, setActiveView] = useState(null)
  const [provincesFeatures, setProvincesFeatures] = useState([])
  const [provincesCenter, setProvincesCenter] = useState()
  const [visibleCommunities, setVisibleCommunities] = useState([]);
  const [mapCollapsed, setMapCollapsed] = useState(false);

  const popupRef = useRef(null)
  const communityLayerRef = useRef(null);
  const mapStateDebounceRef = useRef(null);
  const popupSelectedFeatureHandleRef = useRef(null)

  {/* <  const communities = useCommunitiesFiltered().filter((community) => {

    let comunidad = community.displayOnMap ? <CommunityCard key={community.id} community={community} /> : null

    return comunidad
  });> */}
  const rawCommunities = useCommunitiesFiltered(); // already filtered by sidebar
  const cbMemberIds = useCBMemberIds();
  const communities = useMemo(() => {
    return rawCommunities.filter(c => c.displayOnMap);
  }, [rawCommunities]);
  const sortedVisibleCommunities = useMemo(
    () => [...visibleCommunities].sort((a, b) => {
      const aHasCB = cbMemberIds.has(a.id) ? 0 : 1;
      const bHasCB = cbMemberIds.has(b.id) ? 0 : 1;
      if (aHasCB !== bHasCB) return aHasCB - bHasCB;
      const aValidated = a.humanValidated ? 0 : 1;
      const bValidated = b.humanValidated ? 0 : 1;
      return aValidated - bValidated;
    }),
    [visibleCommunities, cbMemberIds]
  );
  const hiddenFromMapCount = useMemo(
    () => rawCommunities.filter((community) => !community.displayOnMap).length,
    [rawCommunities]
  );

  function resolveClusterPopupTitle (geometry) {
    if (!geometry) {
      return t("map.cluster.title")
    }

    const provinceName = provincesFeatures.find((feature) => {
      if (!feature?.geometry) {
        return false
      }

      try {
        return (
          geometryEngine.contains(feature.geometry, geometry) ||
          geometryEngine.intersects(feature.geometry, geometry)
        )
      } catch {
        const extent = feature.geometry.extent
        return typeof extent?.contains === "function" ? extent.contains(geometry) : false
      }
    })?.attributes?.NAMEUNIT

    if (provinceName) {
      return provinceName
    }

    const fallbackProvince = provincesCenter?.reduce((closestProvince, province) => {
      if (!province?.center || geometry.x == null || geometry.y == null) {
        return closestProvince
      }

      const distance =
        ((province.center.x ?? 0) - geometry.x) ** 2 +
        ((province.center.y ?? 0) - geometry.y) ** 2

      if (!closestProvince || distance < closestProvince.distance) {
        return {
          distance,
          name: province.NAMEUNIT,
        }
      }

      return closestProvince
    }, null)

    return fallbackProvince?.name || t("map.cluster.title")
  }

  function applyDefaultPopupChrome (popup) {
    popup.includeDefaultActions = true
    popup.visibleElements = POPUP_VISIBLE_ELEMENTS_DEFAULT
  }

  function applyClusterPopupChrome (popup) {
    popup.includeDefaultActions = false
    popup.featureMenuOpen = false
    popup.visibleElements = POPUP_VISIBLE_ELEMENTS_CLUSTER
  }

  function ensurePopup (view) {
    if (popupRef.current?.view === view) {
      return popupRef.current
    }

    popupSelectedFeatureHandleRef.current?.remove()
    popupSelectedFeatureHandleRef.current = null

    if (popupRef.current && popupRef.current.view !== view) {
      popupRef.current.destroy()
    }

    popupRef.current = new Popup({
      view,
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false,
        position: "top-left",
      },
      visibleElements: POPUP_VISIBLE_ELEMENTS_DEFAULT,
      includeDefaultActions: true,
    })

    popupSelectedFeatureHandleRef.current = popupRef.current.watch("selectedFeature", (selectedFeature) => {
      if (!popupRef.current) {
        return
      }

      if (selectedFeature?.isAggregate) {
        applyClusterPopupChrome(popupRef.current)
        return
      }

      if (selectedFeature) {
        applyDefaultPopupChrome(popupRef.current)
      }
    })

    view.popup = popupRef.current

    return popupRef.current
  }

  useEffect(() => {
    return () => {
      popupSelectedFeatureHandleRef.current?.remove()
      popupRef.current?.destroy()
    }
  }, [])



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
    const popup = ensurePopup(view)
    applyDefaultPopupChrome(popup)

    const hasCBMember = cbMemberIds.has(community.id);
    const cbBadge = hasCBMember
      ? `
        <div style="margin: 0 0 10px; display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 999px; background: #2e6be6; color: #fff; font-size: 12px; font-weight: 600;" title="${t("communityCard.cbBadgeTitle")}">
          <i class="fa-solid fa-people-group" aria-hidden="true"></i>
          <span>Community Builders</span>
        </div>
      `
      : "";

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


    popup.open({
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
        ${cbBadge}

        ${infoRows}
      </div>
    `
    })
  }

  function activeViewChange (activeViewEvent) {
    const view = activeViewEvent.target.view;
    view.map.basemap.referenceLayers.removeAll();
    ensurePopup(view)
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

    const fieldNames = fields.map((field) => field.name);

    const popupTemplate = {
      title: t("map.cluster.title"),
      overwriteActions: true,
      actions: [],
      content: [
        {
          type: "custom",
          outFields: ["cluster_count", ...fieldNames],
          creator: (event) => createClusterPopupContent(
            event?.graphic,
            fields,
            t,
            popupRef.current,
            resolveClusterPopupTitle
          ),
        }
      ],
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
          <arcgis-search
            key={i18n.resolvedLanguage}
            slot="top-right"
            popup-disabled
            result-graphic-disabled
            all-placeholder={t("map.searchPlaceholder")}
          ></arcgis-search>
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

        {sortedVisibleCommunities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            hasCBMember={cbMemberIds.has(community.id)}
            onOpen={onOpenCommunity}
          />
        ))}



      </div>
    </div>
  )
}

export default Map 
