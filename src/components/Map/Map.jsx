/* eslint-disable react/prop-types */
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import * as clusterLabelCreator from "@arcgis/core/smartMapping/labels/clusters.js";
import * as pieChartRendererCreator from "@arcgis/core/smartMapping/renderers/pieChart.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-search";

import {
  useCBMemberIds,
  useCommunitiesFiltered,
  useCommunityActions,
} from "../../stores/community.store.js";
import { CommunityCard } from "../CommunityCard.jsx";

import "./Map.css";

const COMMUNITY_TYPE_CONFIG = [
  {
    key: "tech-meetup",
    labelKey: "communityType.tech-meetup",
    color: "#ff595e",
    textColor: "#ffffff",
  },
  {
    key: "conference",
    labelKey: "communityType.conference",
    color: "#ffca3a",
    textColor: "#21324a",
  },
  {
    key: "collaborative-group",
    labelKey: "communityType.collaborative-group",
    color: "#8ac926",
    textColor: "#21324a",
  },
  {
    key: "mutual-aid",
    labelKey: "communityType.mutual-aid",
    color: "#2ec4b6",
    textColor: "#21324a",
  },
  {
    key: "hacklab",
    labelKey: "communityType.hacklab",
    color: "#1982c4",
    textColor: "#ffffff",
  },
  {
    key: "umbrella-org",
    labelKey: "communityType.umbrella-org",
    color: "#6a4c93",
    textColor: "#ffffff",
  },
  {
    key: "meta-community",
    labelKey: "communityType.meta-community",
    color: "#f15bb5",
    textColor: "#ffffff",
  },
];

const COMMUNITY_TYPE_FALLBACK = {
  color: "#64748b",
  textColor: "#ffffff",
};

const MARKER_SYMBOL_BASE = {
  type: "simple-marker",
  style: "circle",
  size: "10px",
  outline: {
    color: "#ffffff",
    width: 1.4,
  },
};

function buildMarkerSymbol(style) {
  return {
    ...MARKER_SYMBOL_BASE,
    color: style.color,
  };
}

function buildCommunityPoint(community) {
  return new Point({
    latitude: community.latLon.lat,
    longitude: community.latLon.lon,
  });
}

async function zoomToCluster(view, layerView, graphic) {
  const aggregateId =
    typeof graphic?.getObjectId === "function"
      ? graphic.getObjectId()
      : graphic?.attributes?.aggregateId;

  if (!aggregateId || !layerView) {
    return;
  }

  try {
    const query = layerView.createQuery();
    query.aggregateIds = [aggregateId];
    const { extent } = await layerView.queryExtent(query);

    if (extent) {
      await view.goTo(extent.expand(1.35));
      return;
    }
  } catch {
    // Fall back to a simple zoom when the aggregate extent can't be resolved.
  }

  if (graphic?.geometry) {
    await view.goTo({
      target: graphic.geometry,
      zoom: Math.min((view.zoom ?? 4) + 2, 12),
    });
  }
}

async function generateClusterConfiguration(layer, view) {
  const primaryScheme = await clusterLabelCreator
    .getLabelSchemes({ layer, view })
    .then((labelSchemes) => labelSchemes?.primaryScheme);

  const { labelingInfo, clusterMinSize } = primaryScheme;
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

  return {
    type: "cluster",
    popupEnabled: false,
    labelingInfo,
    clusterMinSize,
    fields,
    renderer,
  };
}

function Map({
  showListView = null,
  onOpenCommunity = null,
  initialFocus = null,
  initialMapState = null,
  onMapStateChange = null,
}) {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState(null);
  const [visibleCommunities, setVisibleCommunities] = useState([]);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [hoveredLegendKey, setHoveredLegendKey] = useState(null);
  const [isLegendSheetOpen, setIsLegendSheetOpen] = useState(false);

  const communityLayerRef = useRef(null);
  const communityLayerViewRef = useRef(null);

  const rawCommunities = useCommunitiesFiltered();
  const cbMemberIds = useCBMemberIds();
  const { filterComunities } = useCommunityActions();

  const communities = useMemo(
    () =>
      rawCommunities.filter(
        (community) =>
          community.displayOnMap && community.communityType !== "umbrella-org"
      ),
    [rawCommunities]
  );

  const mappableCommunities = useMemo(
    () =>
      communities.map((community) => ({
        community,
        point: buildCommunityPoint(community),
      })),
    [communities]
  );

  const highlightedCommunityIds = useMemo(() => {
    if (!hoveredLegendKey) {
      return new Set();
    }

    return new Set(
      visibleCommunities
        .filter((community) => community.communityType === hoveredLegendKey)
        .map((community) => community.id)
    );
  }, [hoveredLegendKey, visibleCommunities]);

  const legendItems = useMemo(
    () =>
      COMMUNITY_TYPE_CONFIG.map((item) => {
        const count = visibleCommunities.filter(
          (community) => community.communityType === item.key
        ).length;

        return {
          ...item,
          count,
          label: t(item.labelKey),
        };
      }).filter((item) => item.count > 0),
    [t, visibleCommunities]
  );

  const sortedVisibleCommunities = useMemo(
    () =>
      [...visibleCommunities].sort((a, b) => {
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

  function closeLegendSheet() {
    setHoveredLegendKey(null);
    setIsLegendSheetOpen(false);
  }

  function handleLegendItemClick(communityType) {
    filterComunities("communityType", communityType);
    closeLegendSheet();
  }

  useEffect(() => {
    if (!legendItems.length || mapCollapsed) {
      setHoveredLegendKey(null);
      setIsLegendSheetOpen(false);
    }
  }, [legendItems.length, mapCollapsed]);

  useEffect(() => {
    if (!activeView) {
      return undefined;
    }

    const provincesRenderer = new SimpleRenderer({
      symbol: new SimpleFillSymbol({
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
      }),
    });

    const provincesLayer = new FeatureLayer({
      portalItem: {
        id: "503ef1cb832f4e8bb4be7fc024ad9aa2",
      },
      renderer: provincesRenderer,
      effect: "bloom(1, 1px, 0.0)",
      popupEnabled: false,
    });

    activeView.map.add(provincesLayer);

    return () => {
      activeView.map.remove(provincesLayer);
      provincesLayer.destroy();
    };
  }, [activeView]);

  useEffect(() => {
    if (!activeView) {
      return undefined;
    }

    setHoveredLegendKey(null);

    if (communityLayerRef.current) {
      activeView.map.remove(communityLayerRef.current);
      communityLayerRef.current.destroy();
      communityLayerRef.current = null;
    }

    let cancelled = false;
    let clickHandle = null;

    const graphics = mappableCommunities.map(({ community, point }) =>
      new Graphic({
        geometry: point,
        attributes: community,
      })
    );

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
      defaultSymbol: buildMarkerSymbol(COMMUNITY_TYPE_FALLBACK),
      uniqueValueInfos: COMMUNITY_TYPE_CONFIG.map((item) => ({
        value: item.key,
        symbol: buildMarkerSymbol(item),
      })),
    };

    const communityLayer = new FeatureLayer({
      source: graphics,
      fields,
      renderer: communityBuildersRenderer,
      popupEnabled: false,
    });

    activeView.map.add(communityLayer);
    communityLayerRef.current = communityLayer;

    communityLayer.when().then(async () => {
      const featureReduction = await generateClusterConfiguration(
        communityLayer,
        activeView
      );

      if (!cancelled) {
        communityLayer.featureReduction = featureReduction;
      }
    });

    activeView.whenLayerView(communityLayer).then((layerView) => {
      if (cancelled) {
        return;
      }

      communityLayerViewRef.current = layerView;

      clickHandle = activeView.on("click", async (event) => {
        const hit = await activeView.hitTest(event, {
          include: [communityLayer],
        });

        const graphic = hit.results
          .map((result) => result.graphic)
          .find(
            (candidate) =>
              candidate?.layer === communityLayer ||
              candidate?.sourceLayer === communityLayer
          );

        if (!graphic) {
          return;
        }

        if (graphic.isAggregate) {
          await zoomToCluster(activeView, layerView, graphic);
          return;
        }

        const communityId = graphic.attributes?.id;

        if (communityId != null) {
          onOpenCommunity?.(communityId);
        }
      });
    });

    return () => {
      cancelled = true;
      clickHandle?.remove();
      communityLayerViewRef.current = null;

      if (communityLayerRef.current === communityLayer) {
        communityLayerRef.current = null;
      }

      activeView.map.remove(communityLayer);
      communityLayer.destroy();
    };
  }, [activeView, mappableCommunities, onOpenCommunity]);

  useEffect(() => {
    if (!activeView) return undefined;

    const syncVisibleCommunities = () => {
      const extent = activeView.extent;
      const center = activeView.center;

      if (!extent || !center) {
        return;
      }

      const visible = mappableCommunities
        .filter(({ point }) => extent.contains(point))
        .map(({ community }) => community);

      startTransition(() => {
        setVisibleCommunities(visible);
      });

      onMapStateChange?.({
        lat: center.latitude,
        lon: center.longitude,
        zoom: activeView.zoom,
      });
    };

    syncVisibleCommunities();

    const handle = activeView.watch("stationary", (isStationary) => {
      if (!isStationary) {
        return;
      }

      syncVisibleCommunities();
    });

    return () => {
      handle.remove();
    };
  }, [activeView, mappableCommunities, onMapStateChange]);

  function activeViewChange(activeViewEvent) {
    const view = activeViewEvent.target.view;
    view.map.basemap.referenceLayers.removeAll();
    setActiveView(() => view);
  }

  const numVisible = visibleCommunities.length;
  const hasHighlightedCards = highlightedCommunityIds.size > 0;

  return (
    <div
      id="map"
      className="column"
      style={{ display: "flex", flexDirection: "column" }}
    >
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

        {legendItems.length > 0 && (
          <>
            <button
              type="button"
              className={`map-legend-toggle${isLegendSheetOpen ? " is-hidden" : ""}`}
              aria-controls="map-legend-sheet"
              aria-expanded={isLegendSheetOpen}
              aria-label={t("map.legend.open")}
              onClick={() => setIsLegendSheetOpen(true)}
            >
              <span className="map-legend-toggle__preview" aria-hidden="true">
                {legendItems.slice(0, 3).map((item) => (
                  <span
                    key={item.key}
                    className="map-legend-toggle__dot"
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </span>
              <span className="map-legend-toggle__label">
                {t("map.legend.mobileSummary", { count: legendItems.length })}
              </span>
              <i className="fas fa-chevron-up" aria-hidden="true" />
            </button>

            {isLegendSheetOpen && (
              <button
                type="button"
                className="map-legend-backdrop is-open"
                aria-label={t("map.legend.close")}
                onClick={closeLegendSheet}
              />
            )}

            <aside
              id="map-legend-sheet"
              className={`map-legend${isLegendSheetOpen ? " is-open" : ""}`}
              aria-label={t("map.legend.title")}
              onMouseLeave={() => setHoveredLegendKey(null)}
            >
              <div className="map-legend__sheet-header">
                <span className="map-legend__sheet-handle" aria-hidden="true" />
                <div className="map-legend__sheet-bar">
                  <strong className="map-legend__sheet-title">{t("map.legend.title")}</strong>
                  <button
                    type="button"
                    className="map-legend__sheet-close"
                    aria-label={t("map.legend.close")}
                    onClick={closeLegendSheet}
                  >
                    {t("communityModal.close")}
                  </button>
                </div>
              </div>

              <div className="map-legend__items">
                {legendItems.map((item) => {
                  const isActive = hoveredLegendKey === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`map-legend__item${isActive ? " is-active" : ""}`}
                      onMouseEnter={() => setHoveredLegendKey(item.key)}
                      onFocus={() => setHoveredLegendKey(item.key)}
                      onBlur={(event) => {
                        if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
                          setHoveredLegendKey(null);
                        }
                      }}
                      onClick={() => handleLegendItemClick(item.key)}
                      title={t("map.legend.clickToFilter", { label: item.label })}
                    >
                      <span
                        className="map-legend__swatch"
                        style={{ backgroundColor: item.color, color: item.textColor }}
                        aria-hidden="true"
                      />
                      <span className="map-legend__label">{item.label}</span>
                      <span className="map-legend__count">{item.count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </>
        )}
      </div>
      <button className="map-toggle-btn" onClick={() => setMapCollapsed((current) => !current)}>
        <i className={`fas ${mapCollapsed ? "fa-chevron-down" : "fa-chevron-up"}`}></i>
        {mapCollapsed ? t("map.showMap") : t("map.hideMap")}
      </button>
      <div className="map-results-note">
        <strong>{numVisible}</strong> {t("map.visibleInArea")}
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
      <div className={`communitieslist${hasHighlightedCards ? " communitieslist--has-highlight" : ""}`}>
        {sortedVisibleCommunities.map((community) => {
          const isHighlighted = highlightedCommunityIds.has(community.id);

          return (
            <CommunityCard
              key={community.id}
              community={community}
              hasCBMember={cbMemberIds.has(community.id)}
              isHighlighted={isHighlighted}
              isMuted={hasHighlightedCards && !isHighlighted}
              onOpen={onOpenCommunity}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Map;
