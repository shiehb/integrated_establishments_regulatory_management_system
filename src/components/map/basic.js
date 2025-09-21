import React, { useState } from "react";

import { Map, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-provider";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

const PolygonMap = () => {
  const [center, setCenter] = useState({ lat: 13.084622, lng: 80.248357 });
  const [mapLayers, setMapLayers] = useState([]);
  const ZOOM_LEVEL = 9;
  const mapRef = useRef();

  const _onCreate = (e) => {
    console.log(e);

    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const { _leflet_id } = layer;

      setMapLayers((layers) => [
        ...layers,
        { id: _leflet_id, latlngs: layer.getLatLngs()[0] },
      ]);
    }
  };
  const _onEdit = (e) => {
    console.log(e);
    const {
      layers: { _layers },
    } = e;
    Object.values(_layers).map(({ _leaflet_id, editing }) => {
      setMapLayers((layers) =>
        layers.map((l) =>
          l.id === _leaflet_id ? { ...l, latlngs: editing.latlngs[0] } : l
        )
      );
    });
  };
  const _onDelete = (e) => {
    console.log(e);
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).map(({ _leaflet_id }) => {
      setMapLayers((layers) => layers.filter((l) => l.id !== _leaflet_id));
    });
  };

  return (
    <>
      <Header title="React Leaflet Map Example" />
      <div className="row">
        <div className="text-center col">
          <h2>React-leaflet - Basic Openstreet Maps</h2>
          <p>Loading basic map using layer from maptiler</p>
          <div className="col">
            <Map center={center} zoom={ZOOM_LEVEL} ref={mapRef}>
              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={_onCreate}
                  onEdited={_onEdit}
                  onDeleted={_onDelete}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                  }}
                ></EditControl>
              </FeatureGroup>
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
            </Map>
            <pre className="text-left">{JSON.stringify(mapLayers, 0, 2)}</pre>
          </div>
        </div>
      </div>
    </>
  );
};
