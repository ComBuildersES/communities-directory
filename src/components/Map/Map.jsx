// ArcGIS SDK Imports

import '@arcgis/map-components/dist/components/arcgis-map'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";

// Css Imports

import './Map.css'

// React Imports

import { useEffect, useState } from 'react'

function Map () {

  const [activeView, setActiveView] = useState(null)
  const [provincesCenter, setProvincesCenter] = useState()

  // Setup Effect for the Provinces Feature Layer

  useEffect(() => {
    if (activeView) {

      // Add the provinces Feature Layer to the map

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

      // Function that takes the centers of every province and their nameunit once the layer loads.

      activeView
        .whenLayerView(provincesFL)
        .then(() => {
          provincesFL
            .queryFeatures()
            .then((queryResult) => {
              const featureSetResults = queryResult.features
              const arrayResultsFormatted = featureSetResults.map((feature)=>{
                return {
                  center:feature.geometry.extent.center,
                  NAMEUNIT:feature.attributes.NAMEUNIT
                }
              })
              
              setProvincesCenter(()=> arrayResultsFormatted)

            })
        })

    }
  }, [activeView])

  // PopUp Setting

  

  function activeViewChange (activeViewEvent) {

    // Set the view to the state.

    setActiveView(() => activeViewEvent.target.view)
  }

  return (
    <>
      <arcgis-map
        basemap="dark-gray"
        center="-4, 40"
        zoom='4'
        onarcgisViewReadyChange={activeViewChange}
      ></arcgis-map>
    </>
  )
}

export default Map