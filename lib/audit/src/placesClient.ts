const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACE_DETAILS_BASE = "https://places.googleapis.com/v1/places/";

const placeIdCache = new Map<string, string | null>();

export interface ResolvedPlace {
  placeId: string;
  displayName: string;
  formattedAddress: string;
}

export interface PlaceDetails {
  id: string;
  displayName: string;
  formattedAddress: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  primaryType?: string;
  types?: string[];
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: unknown[];
    weekdayDescriptions?: string[];
  };
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  photos?: { name: string }[];
  location?: { latitude: number; longitude: number };
}

function getApiKey(): string {
  const k = process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!k) throw new Error("GOOGLE_PLACES_API_KEY (or GOOGLE_API_KEY) not set");
  return k;
}

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "rating",
  "userRatingCount",
  "businessStatus",
  "primaryType",
  "types",
  "regularOpeningHours",
  "currentOpeningHours",
  "photos",
  "location",
].join(",");

export async function resolvePlace(
  name: string,
  city: string | null | undefined,
): Promise<ResolvedPlace | null> {
  const query = city ? `${name} ${city}` : name;
  const cacheKey = query.toLowerCase().trim();
  if (placeIdCache.has(cacheKey)) {
    const cachedId = placeIdCache.get(cacheKey);
    if (!cachedId) return null;
    const details = await getPlaceDetails(cachedId).catch(() => null);
    if (!details) return null;
    return {
      placeId: cachedId,
      displayName: details.displayName,
      formattedAddress: details.formattedAddress,
    };
  }

  const res = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: query, pageSize: 1 }),
  });

  if (!res.ok) {
    throw new Error(
      `Places searchText failed: ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    places?: {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
    }[];
  };

  const top = data.places?.[0];
  if (!top) {
    placeIdCache.set(cacheKey, null);
    return null;
  }

  placeIdCache.set(cacheKey, top.id);
  return {
    placeId: top.id,
    displayName: top.displayName?.text ?? name,
    formattedAddress: top.formattedAddress ?? "",
  };
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const res = await fetch(`${PLACE_DETAILS_BASE}${placeId}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Place details failed: ${res.status} ${await res.text()}`,
    );
  }

  const raw = (await res.json()) as PlaceDetails & {
    displayName?: { text: string };
  };

  return {
    ...raw,
    displayName:
      typeof raw.displayName === "object" && raw.displayName !== null
        ? (raw.displayName as { text: string }).text
        : (raw.displayName as unknown as string) ?? "",
  };
}
