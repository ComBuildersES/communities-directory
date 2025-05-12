import "@arcgis/map-components/dist/components/arcgis-map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";

import './Map.css'
import { useEffect, useRef, useState } from "react";

function Map () {

  const [activeMap, setActiveMap] = useState(null) // MAP COMPONENT: https://developers.arcgis.com/javascript/latest/references/map-components/arcgis-map/#properties


  useEffect(()=>{

    if(activeMap){

      console.log(activeMap)
      
      // Create Provinces Feature Layer

        // Renderer

        const provinceSymbol = new SimpleFillSymbol({
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
          symbol:provinceSymbol
        })
      

        const provincesFL = new FeatureLayer({
          portalItem:{
            id:"503ef1cb832f4e8bb4be7fc024ad9aa2"
          },
          renderer:provincesRenderer
        })

        activeMap.add(provincesFL)
    }

  },[activeMap])

  // I've tried to do it with the onacgisViewReadyChange event and it doesnt work.
  // Setting view to State.

  const mapRef = useRef(null)

  useEffect(()=>{
    if(mapRef){
      const mapComponent = mapRef.current 
      setActiveMap((prevState) => mapComponent)
    }
  },[])

  // Once view is on State



  return(
    <>
      <arcgis-map
        basemap="dark-gray"
        center="-4, 40"
        zoom='4'
        ref={mapRef}
        ></arcgis-map>
    </>
  )
}

export default Map