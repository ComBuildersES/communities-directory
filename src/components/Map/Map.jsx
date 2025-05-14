
const communities = [
  {
    "id": "0",
    "name": ".NET foundation meetups",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Organización paraguas",
    "eventFormat": "Desconocido",
    "location": "n/a",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://dotnetfoundation.org/community/.net-meetups",
    "thumbnailUrl": "images/net-foundation-meetups.jpg",
    "latLon": {
      "lat": 56.8946671,
      "lon": 14.8215526
    }
  },
  {
    "id": "1",
    "name": "/dev/null talks",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Presencial",
    "location": "Sevilla",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://devnulltalks.github.io/",
    "thumbnailUrl": "images/devnull-talks.svg",
    "latLon": {
      "lat": 37.38264,
      "lon": -5.9962951
    }
  },
  {
    "id": "2",
    "name": "/RootedCON",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Presencial",
    "location": "Itinerante",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.rootedcon.com/",
    "thumbnailUrl": "images/rootedcon.jpg",
    "latLon": {
      "lat": -20.1578377,
      "lon": -40.184541
    }
  },
  {
    "id": "3",
    "name": "#esLibre",
    "status": "Activa",
    "lastReviewed": "17/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Presencial",
    "location": "Itinerante",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://eslib.re",
    "thumbnailUrl": "images/eslibre.jpg",
    "latLon": {
      "lat": -20.1578377,
      "lon": -40.184541
    }
  },
  {
    "id": "4",
    "name": "🥃LicorcaConf",
    "status": "Inactiva",
    "lastReviewed": "17/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Presencial",
    "location": "Coruña (Santiago de Compostela)",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.youtube.com/playlist?list=PLKxa4AIfm4pUPtkq6rMt7hZkVR6doOLD1",
    "thumbnailUrl": "images/licorcaconf.jpg",
    "latLon": {
      "lat": 42.8806228,
      "lon": -8.5466071
    }
  },
  {
    "id": "5",
    "name": "A Industriosa",
    "status": "Activa",
    "lastReviewed": "27/11/2024",
    "communityType": "Hacklab",
    "eventFormat": "Presencial",
    "location": "Vigo, Galicia",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/es-ES/AIndustriosa/",
    "thumbnailUrl": "images/a-industriosa.png",
    "latLon": {
      "lat": 42.2313601,
      "lon": -8.7124252
    }
  },
  {
    "id": "6",
    "name": "Accesibilidad Spain",
    "status": "Inactiva",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Sin completar",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/es-ES/accesibilidad-spain/",
    "thumbnailUrl": "images/accesibilidad-spain.webp",
    "latLon": {
      "lat": 1.3607359,
      "lon": 103.8395958
    }
  },
  {
    "id": "7",
    "name": "AdaBcnJs",
    "status": "Desconocido",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Desconocido",
    "location": "Barcelona",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/adabcnjs/",
    "thumbnailUrl": "images/adabcnjs.webp",
    "latLon": {
      "lat": 41.387917,
      "lon": 2.1699187
    }
  },
  {
    "id": "8",
    "name": "AdalaberFest",
    "status": "Inactiva",
    "lastReviewed": "17/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Online",
    "location": "n/a",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://adalaberfest.adalab.es/",
    "thumbnailUrl": "images/adalaberfest.jpg",
    "latLon": {
      "lat": 56.8946671,
      "lon": 14.8215526
    }
  },
  {
    "id": "9",
    "name": "Adopta un Junior",
    "status": "Activa",
    "lastReviewed": "15/10/2024",
    "communityType": "Grupo colaborativo",
    "eventFormat": "Online",
    "location": "n/a",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://adoptaunjunior.es/",
    "thumbnailUrl": "images/adopta-un-junior.jpg",
    "latLon": {
      "lat": 56.8946671,
      "lon": 14.8215526
    }
  }
]

// ArcGIS SDK Imports

import '@arcgis/map-components/dist/components/arcgis-map'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from "@arcgis/core/geometry/Point"
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol"
import Graphic from "@arcgis/core/Graphic"

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
              const arrayResultsFormatted = featureSetResults.map((feature) => {
                return {
                  center: feature.geometry.extent.center,
                  NAMEUNIT: feature.attributes.NAMEUNIT
                }
              })

              setProvincesCenter(() => arrayResultsFormatted)

            })
        })

    }
  }, [activeView])

  // Communities Layer

  useEffect(() => {

    if (activeView) {

      const graphics = communities.map((community) => {

        const geometry = new Point({
          latitude: community.latLon.lat,
          longitude: community.latLon.lon
        })

        const symbology = new PictureMarkerSymbol({
          url: community.thumbnailUrl,
          width: '64px',
          height: '64px'
        })

        const attributes = {
          id: community.id,
          name: community.name,
          status: community.status,
          lastReviewed: community.lastReviewed,
          communityType: community.communityType,
          eventFormat: community.eventFormat,
          location: community.location,
          topics: community.topics,
          contactInfo: community.contactInfo,
          communityUrl: community.communityUrl,
        }

        const graphic = new Graphic({
          geometry: geometry,
          // symbol: symbology,
          attributes: attributes
        })

        return graphic

      })

      const communitiesGL = new GraphicsLayer({
        graphics: graphics
      })

      activeView.map.add(communitiesGL)

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