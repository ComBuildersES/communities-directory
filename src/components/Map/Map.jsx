const communities_old = [
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
    "thumbnailUrl": "images/net-foundation-meetups.webp",
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
    "thumbnailUrl": "images/devnull-talks.webp",
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
    "thumbnailUrl": "images/rootedcon.webp",
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
    "thumbnailUrl": "images/eslibre.webp",
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
    "thumbnailUrl": "images/licorcaconf.webp",
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
    "thumbnailUrl": "images/a-industriosa.webp",
    "latLon": {
      "lat": 42.2313601,
      "lon": -8.7124252
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
    "thumbnailUrl": "images/adalaberfest.webp",
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
    "thumbnailUrl": "images/adopta-un-junior.webp",
    "latLon": {
      "lat": 56.8946671,
      "lon": 14.8215526
    }
  },
  {
    "id": "10",
    "name": "Agile Alliance",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Organización paraguas",
    "eventFormat": "Desconocido",
    "location": "n/a",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.agilealliance.org/resources/initiatives/",
    "thumbnailUrl": "images/agile-alliance.webp",
    "latLon": {
      "lat": 56.8946671,
      "lon": 14.8215526
    }
  },
  {
    "id": "11",
    "name": "Agile Aragón",
    "status": "Activa",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Zaragoza",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/es-ES/agilearagon/",
    "thumbnailUrl": "images/agile-aragon.webp",
    "latLon": {
      "lat": 41.656837,
      "lon": -0.8794245
    }
  },
  {
    "id": "12",
    "name": "Agile Delivery",
    "status": "Inactiva",
    "lastReviewed": "18/12/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Online",
    "location": "Sin completar",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://x.com/AgileDeliveryES",
    "thumbnailUrl": "images/agile-delivery.webp",
    "latLon": {
      "lat": 1.3607359,
      "lon": 103.8395958
    }
  },
  {
    "id": "13",
    "name": "Agile Open Spain (AOS)",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Presencial",
    "location": "Itinerante",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://aos.agile-spain.org/",
    "thumbnailUrl": "images/agile-open-spain-aos.webp",
    "latLon": {
      "lat": -20.1578377,
      "lon": -40.184541
    }
  },
  {
    "id": "14",
    "name": "Agile Spain",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Organización paraguas",
    "eventFormat": "Desconocido",
    "location": "n/a",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://agile-spain.org/",
    "thumbnailUrl": "images/agile-spain.webp",
    "latLon": {
      "lat": 56.8946671,
      "lon": 14.8215526
    }
  },
  {
    "id": "15",
    "name": "Agile Sur",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Sevilla",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/es-ES/agile-sur/?eventOrigin=event_home_page",
    "thumbnailUrl": "images/agile-sur.webp",
    "latLon": {
      "lat": 37.38264,
      "lon": -5.9962951
    }
  },
  {
    "id": "16",
    "name": "agileVigo",
    "status": "Desconocido",
    "lastReviewed": "27/11/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Vigo",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://twitter.com/agilevigo",
    "thumbnailUrl": "images/agilevigo.webp",
    "latLon": {
      "lat": 42.2313601,
      "lon": -8.7124252
    }
  },
  {
    "id": "17",
    "name": "AgileGirls",
    "status": "Inactiva",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Desconocido",
    "location": "Sin completar",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://twitter.com/agilegirls",
    "thumbnailUrl": "images/agilegirls.webp",
    "latLon": {
      "lat": 1.3607359,
      "lon": 103.8395958
    }
  },
  {
    "id": "18",
    "name": "AgileValencia",
    "status": "Inactiva",
    "lastReviewed": "18/12/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Desconocido",
    "location": "Sin completar",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://x.com/AgileValencia",
    "thumbnailUrl": "images/agilevalencia.webp",
    "latLon": {
      "lat": 1.3607359,
      "lon": 103.8395958
    }
  },
  {
    "id": "19",
    "name": "AI4MED - IA para medicina",
    "status": "Activa",
    "lastReviewed": "15/11/2024",
    "communityType": "Grupo colaborativo",
    "eventFormat": "Híbridos",
    "location": "Madrid, Valencia, Barcelona, Bilbao",
    "topics": "IA aplicada al ámbito sanitario y a la investigación clínica. Divulgación y desmitificación de esta tecnología aplicada a la medicina",
    "contactInfo": "president@ai4med.org",
    "communityUrl": "https://www.ai4med.org/ ",
    "thumbnailUrl": "images/ai4med-ia-para-medicina.webp",
    "latLon": {
      "lat": 40.42913,
      "lon": -3.70114
    }
  },
  {
    "id": "20",
    "name": "AiBirras",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Granada",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://aibirras.org/",
    "thumbnailUrl": "images/aibirras.webp",
    "latLon": {
      "lat": 12.151965053,
      "lon": -61.659644959
    }
  },
  {
    "id": "21",
    "name": "AKASHA Hub",
    "status": "Activa",
    "lastReviewed": "15/10/2024",
    "communityType": "Hacklab",
    "eventFormat": "Presencial",
    "location": "Barcelona",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://akasha.barcelona/",
    "thumbnailUrl": "images/akasha-hub.webp",
    "latLon": {
      "lat": 41.387917,
      "lon": 2.1699187
    }
  },
  {
    "id": "22",
    "name": "Alhambra Hub",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Granada",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://alhambrahub.es/",
    "thumbnailUrl": "images/alhambra-hub.webp",
    "latLon": {
      "lat": 12.151965053,
      "lon": -61.659644959
    }
  },
  {
    "id": "23",
    "name": "Almería R users",
    "status": "Inactiva",
    "lastReviewed": "18/10/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Almería",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://x.com/AlmeriaRUsers",
    "thumbnailUrl": "images/almeria-r-users.webp",
    "latLon": {
      "lat": 36.8400939,
      "lon": -2.4679043
    }
  },
  {
    "id": "24",
    "name": "AlmeríaJS",
    "status": "Inactiva",
    "lastReviewed": "25/10/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Almería",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://twitter.com/AlmeriaJs",
    "thumbnailUrl": "images/almeriajs.webp",
    "latLon": {
      "lat": 36.8400939,
      "lon": -2.4679043
    }
  },
  {
    "id": "25",
    "name": "AlmeríaTech",
    "status": "Activa",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Almería",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.almeriatech.es/",
    "thumbnailUrl": "images/almeriatech.webp",
    "latLon": {
      "lat": 36.8400939,
      "lon": -2.4679043
    }
  },
  {
    "id": "26",
    "name": "Andalucía Startup Founder",
    "status": "Activa",
    "lastReviewed": "25/10/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Presencial",
    "location": "Córdoba",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/andalucia-startup-founder/",
    "thumbnailUrl": "images/andalucia-startup-founder.webp",
    "latLon": {
      "lat": -31.405059,
      "lon": -64.171896
    }
  },
  {
    "id": "27",
    "name": "Angular Madrid",
    "status": "Inactiva",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Desconocido",
    "location": "Madrid",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/es-ES/angular_madrid/",
    "thumbnailUrl": "images/angular-madrid.webp",
    "latLon": {
      "lat": 40.4166909,
      "lon": -3.7003454
    }
  },
  {
    "id": "28",
    "name": "Angular Málaga",
    "status": "Activa",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Desconocido",
    "location": "Málaga",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.meetup.com/es-ES/angular-malaga/",
    "thumbnailUrl": "images/angular-malaga.webp",
    "latLon": {
      "lat": 36.7196292,
      "lon": -4.4200007
    }
  },
  {
    "id": "29",
    "name": "APIAddicts",
    "status": "Activa",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Híbridos",
    "location": "Madrid, Valencia, Barcelona, Medellín, Lima, México D.F",
    "topics": "APIs, Cloud, MIcroservicios",
    "contactInfo": "contacta@apiaddicts.org",
    "communityUrl": "https://www.meetup.com/es-ES/apiaddicts/",
    "thumbnailUrl": "images/apiaddicts.webp",
    "latLon": {
      "lat": 19.4326773,
      "lon": -99.1342112
    }
  },
  {
    "id": "30",
    "name": "APIAddictsDays",
    "status": "Activa",
    "lastReviewed": "18/10/2024",
    "communityType": "Conferencia",
    "eventFormat": "Presencial",
    "location": "Madrid",
    "topics": "APIs, Cloud, MIcroservicios",
    "contactInfo": "contacta@apiaddicts.org",
    "communityUrl": "https://www.apiaddicts.org/apiaddictsdays/",
    "thumbnailUrl": "images/apiaddictsdays.webp",
    "latLon": {
      "lat": 40.4166909,
      "lon": -3.7003454
    }
  },
  {
    "id": "31",
    "name": "Arcasiles Community Madrid",
    "status": "Activa",
    "lastReviewed": "31/05/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Híbridos",
    "location": "Madrid",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.linkedin.com/company/arcasiles-community-madrid",
    "thumbnailUrl": "images/arcasiles-community-madrid.webp",
    "latLon": {
      "lat": 40.4166909,
      "lon": -3.7003454
    }
  },
  {
    "id": "32",
    "name": "Area UR-Maker",
    "status": "Activa",
    "lastReviewed": "16/10/2024",
    "communityType": "Hacklab",
    "eventFormat": "Presencial",
    "location": "Logrono",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://www.unirioja.es/urmaker/",
    "thumbnailUrl": "images/area-ur-maker.webp",
    "latLon": {
      "lat": 42.46569,
      "lon": -2.44998
    }
  },
  {
    "id": "33",
    "name": "Asociación Atlantics",
    "status": "Activa",
    "lastReviewed": "22/10/2024",
    "communityType": "Grupo colaborativo",
    "eventFormat": "Presencial",
    "location": "Coruña",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://asociacionatlantics.org/",
    "thumbnailUrl": "images/asociacion-atlantics.webp",
    "latLon": {
      "lat": 43.3707332,
      "lon": -8.3958532
    }
  },
  {
    "id": "34",
    "name": "Asociación Ciberseguridad Y Hacking Ético Asturias",
    "status": "Activa",
    "lastReviewed": "18/12/2024",
    "communityType": "Tech Meetup",
    "eventFormat": "Híbridos",
    "location": "Asturias",
    "topics": "",
    "contactInfo": "",
    "communityUrl": "https://x.com/asocchea",
    "thumbnailUrl": "images/asociacion-ciberseguridad-y-hacking-etico-asturias.webp",
    "latLon": {
      "lat": 10.5679998,
      "lon": 123.7171998
    }
  }]

const BASE_URL = import.meta.env.BASE_URL

// ArcGIS SDK Imports
import '@arcgis/map-components/dist/components/arcgis-map'
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol"
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer"
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Point from "@arcgis/core/geometry/Point"
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol"
import Graphic from "@arcgis/core/Graphic"
import * as containsOperator from "@arcgis/core/geometry/operators/containsOperator.js"
import Popup from "@arcgis/core/widgets/Popup"
import * as clusterLabelCreator from "@arcgis/core/smartMapping/labels/clusters.js";
import * as pieChartRendererCreator from "@arcgis/core/smartMapping/renderers/pieChart.js";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";


import communities from "/public/data/communities.json"

// Css Imports
import './Map.css'

// React Imports
import { useEffect, useState, useRef } from 'react'

function Map () {
  const [activeView, setActiveView] = useState(null)
  const [provincesFeatures, setProvincesFeatures] = useState([])
  const [provincesCenter, setProvincesCenter] = useState()
  const popupRef = useRef(null)

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

  // Communities Layer with filtering and popups
  useEffect(() => {
    if (!activeView || provincesFeatures.length === 0) return


    const graphics = communities
      .map((community) => {
        const geometry = new Point({
          latitude: community.latLon.lat,
          longitude: community.latLon.lon
        })


        // const symbology = new PictureMarkerSymbol({

        //   url: `${BASE_URL}/${community.thumbnailUrl}`,
        //   width: 10,
        //   height: 10
        // })

        const graphic = new Graphic({
          geometry: geometry,
          // symbol: symbology,
          attributes: community
        })

        // Attach popup handler (deferred style)
        graphic.popupTemplate = {
          title: community.name,
          content: () => {
            abrirPopupArcGIS(community, activeView, geometry)
            return null
          }
        }

        return graphic
      })
      .filter(Boolean)

    const fields = [
      {
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
      }, {
        name: "id",
        alias: "id",
        type: "integer"
      }, {
        name: "name",
        alias: "name",
        type: "string"
      },
      {
        name: "lastReviewed",
        alias: "lastReviewed",
        type: "date"
      },
      {
        name: "communityType",
        alias: "communityType",
        type: "string"
      },
      {
        name: "eventFormat",
        alias: "eventFormat",
        type: "string"
      },
      {
        name: "location",
        alias: "location",
        type: "string"
      },
      {
        name: "topics",
        alias: "topics",
        type: "string"
      },
      {
        name: "contactInfo",
        alias: "contactInfo",
        type: "string"
      },
      {
        name: "communityUrl",
        alias: "communityUrl",
        type: "string"
      },
      {
        name: "topics",
        alias: "topics",
        type: "string"
      },
      {
        name: "thumbnailUrl",
        alias: "thumbnailUrl",
        type: "string"
      },
      {
        name: "latLon",
        alias: "latLon",
        type: "geometry"
      }
    ]

    const communityBuildersRenderer = {
      type: "unique-value",
      field: "Tipo_de_comunidad",
      defaultSymbol: {
        type: "simple-marker",
        style: "circle",
        color: "white",
        size: "8px",
      },
      uniqueValueInfos: [
        {
          value: "Tech Meetup",
          symbol: {
            type: "simple-marker",
            style: "circle",
            size: "8px",
            color: "#09ff00",
          },
        },
        {
          value: "Conferencia",
          symbol: {
            type: "simple-marker",
            style: "circle",
            size: "8px",
            color: "#00fff2",
          },
        },
        {
          value: "Grupo colaborativo",
          symbol: {
            type: "simple-marker",
            style: "circle",
            size: "8px",
            color: "#ddff00",
          },
        },
        {
          value: "Hacklab",
          symbol: {
            type: "simple-marker",
            style: "circle",
            size: "8px",
            color: "#ff1100",
          },
        },
      ],
    };

    //const communityBuildersFl = new GraphicsLayer({ graphics })
    const communityBuildersFl = new FeatureLayer({
      source: graphics,
      fields: fields,
      renderer: communityBuildersRenderer
    })

    console.log(communityBuildersFl)

    // Creacion del Pie Chart Renderer

    communityBuildersFl.when().then(() => {
      generarConfiguracionCluster(communityBuildersFl, activeView.view).then(
        (featureReduction) => {
          communityBuildersFl.featureReduction = featureReduction;
        }
      )
    })


    activeView.map.add(communityBuildersFl)

    activeView.whenLayerView(communityBuildersFl).then(() => {
      communityBuildersFl.queryFeatures({ f: 'pbf', where: "1=1", returnGeometry: true, outFields: ["*"] })
        .then((queryResult) => {
          const featureSetResults = queryResult.features

          console.log(featureSetResults)
        })
    })

  }, [activeView, provincesFeatures])

  // function abrirPopupArcGIS (community, view, geometry) {
  //   if (!popupRef.current) {
  //     popupRef.current = new Popup({
  //       view,
  //       title: community.name,
  //       content: `
  //         <div style="text-align: center ">
  //           <img src="${BASE_URL}/${community.thumbnailUrl}" style="width: 100%  max-width: 250px  border-radius: 10px " />
  //           <p><a href="${community.communityUrl}" target="_blank" style="color: blue  text-decoration: underline ">Visit Website</a></p>
  //         </div>
  //       `
  //     }) 

  //     view.popup = popupRef.current 
  //   }

  //   popupRef.current.open({
  //     location: geometry
  //   }) 
  // }

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

  function normalize (str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
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

    const popupTemplate = {
      content: [
        {
          type: "text",
          text: "<b>{cluster_count}</b> Comunidades.",
        },
        {
          type: "media",
          mediaInfos: [
            {
              title: "Tipo de comunidad",
              type: "pie-chart",
              value: {
                fields: fieldNames,
              },
            },
          ],
        },
        {
          type: "fields",
        },
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



  return (
    <>
      <arcgis-map
        basemap="dark-gray"
        center="-4, 40"
        zoom="4"
        onarcgisViewReadyChange={activeViewChange}
      ></arcgis-map>
    </>
  )
}

export default Map 
