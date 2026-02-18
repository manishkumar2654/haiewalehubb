const axios = require("axios");

// Simple in-memory cache
const geocodeCache = new Map();

// Helper: normalize Indian addresses
const normalizeAddress = (address) => {
  return address
    .replace(/\s+/g, " ") // extra spaces
    .replace(/\s*,\s*/g, ", ") // clean commas
    .replace(/madhya\s*pradesh/i, "Madhya Pradesh")
    .replace(/india$/i, "")
    .trim();
};

const geocodeAddress = async (rawAddress) => {
  const address = normalizeAddress(rawAddress);

  if (geocodeCache.has(address)) {
    console.log(`✅ Using cached location for: ${address}`);
    return geocodeCache.get(address);
  }

  // Respect Nominatim rate limit
  await new Promise((r) => setTimeout(r, 1100));

  try {
    console.log(`🌍 Geocoding (primary): ${address}`);

    // 🔹 PRIMARY ATTEMPT (Structured + India bias)
    let response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
          countrycodes: "in", // 🇮🇳 India only
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "SpaBookingApp/1.0 (developer: Aman Raj)",
        },
      }
    );

    // 🔁 FALLBACK ATTEMPT (city + state only)
    if (!response.data || response.data.length === 0) {
      console.log("⚠️ Primary failed, trying fallback...");

      const fallbackQuery = `${address}, Indore, Madhya Pradesh, India`;

      response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: fallbackQuery,
          format: "json",
          limit: 1,
          countrycodes: "in",
        },
        headers: {
          "User-Agent": "SpaBookingApp/1.0 (developer: Aman Raj)",
        },
      });
    }

    if (!response.data || response.data.length === 0) {
      throw new Error(`Could not geocode address: ${address}`);
    }

    const location = {
      lat: Number(response.data[0].lat),
      lng: Number(response.data[0].lon),
    };

    geocodeCache.set(address, location);

    console.log(`✅ Geocoded: ${address} → [${location.lat}, ${location.lng}]`);

    return location;
  } catch (error) {
    console.error("❌ Geocoding error:", error.message);
    throw new Error(`Failed to geocode address: ${address}`);
  }
};

module.exports = geocodeAddress;
