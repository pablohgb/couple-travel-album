export async function geocodeLocation({ name, city, country }) {
  const query = [name, city, country].filter(Boolean).join(", ");

  if (!query.trim()) {
    return { error: "Escribe al menos el nombre o la ciudad." };
  }

  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "couple-travel-album/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { error: "No se pudo buscar la ubicación. Inténtalo de nuevo." };
  }

  const results = await response.json();

  if (!results.length) {
    return {
      error:
        "No encontramos ese lugar. Prueba con más detalle o haz clic en el mapa.",
    };
  }

  const [result] = results;

  return {
    latitude: Number.parseFloat(result.lat),
    longitude: Number.parseFloat(result.lon),
    displayName: result.display_name,
  };
}

export async function reverseGeocodeLocation(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    {
      headers: {
        "User-Agent": "couple-travel-album/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { error: "No se pudo obtener el nombre del lugar." };
  }

  const result = await response.json();
  const address = result.address ?? {};

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    null;

  const country = address.country ?? null;
  const name = city || result.display_name?.split(",")[0] || "Nuevo lugar";

  return {
    name,
    city,
    country,
    displayName: result.display_name ?? name,
  };
}

export function emptyToNull(value) {
  return value?.trim() ? value.trim() : null;
}

export function isValidStatus(status) {
  return ["visited", "planned", "favorite"].includes(status);
}
