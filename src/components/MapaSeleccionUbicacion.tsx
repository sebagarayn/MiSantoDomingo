import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corregir los íconos de los marcadores en Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const iconoMarcador = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapaSeleccionUbicacionProps {
  latitud: number | null;
  longitud: number | null;
  onSeleccionarUbicacion?: (latitud: number, longitud: number) => void;
  soloLectura?: boolean;
}

// Detecta cuando el usuario hace clic en el mapa
const SelectorUbicacion = ({
  onSeleccionarUbicacion,
}: {
  onSeleccionarUbicacion?: (latitud: number, longitud: number) => void;
}) => {
  useMapEvents({
    click(evento) {
      onSeleccionarUbicacion?.(evento.latlng.lat, evento.latlng.lng);
    },
  });

  return null;
};

const CentrarMapa = ({
  latitud,
  longitud,
}: {
  latitud: number | null;
  longitud: number | null;
}) => {
  const mapa = useMap();

  useEffect(() => {
    // Recalcula las dimensiones del mapa dentro de Ionic (IonContent / IonModal)
    const actualizarVista = () => {
      mapa.invalidateSize();
      if (latitud !== null && longitud !== null) {
        mapa.setView([latitud, longitud], 16);
      }
    };

    actualizarVista();
    const t1 = setTimeout(actualizarVista, 150);
    const t2 = setTimeout(actualizarVista, 450);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        actualizarVista();
      });
      observer.observe(mapa.getContainer());
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer?.disconnect();
    };
  }, [latitud, longitud, mapa]);

  return null;
};

const MapaSeleccionUbicacion = ({
  latitud,
  longitud,
  onSeleccionarUbicacion,
  soloLectura = false,
}: MapaSeleccionUbicacionProps) => {
  // Centro inicial: Santo Domingo, Región de Valparaíso
  const centroInicial: [number, number] = [-33.636, -71.63];

  const tieneUbicacion = latitud !== null && longitud !== null;

  return (
    <div
      style={{
        height: "320px",
        width: "100%",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #CBD5E1",
        position: "relative",
        zIndex: 0,
      }}
    >
      <MapContainer
        center={centroInicial}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CentrarMapa latitud={latitud} longitud={longitud} />

        {!soloLectura && (
          <SelectorUbicacion onSeleccionarUbicacion={onSeleccionarUbicacion} />
        )}

        {tieneUbicacion && (
          <Marker position={[latitud, longitud]} icon={iconoMarcador} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapaSeleccionUbicacion;
