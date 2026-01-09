const geocodeAddress = require("./utils/geocodeAddress");

(async () => {
  const loc = await geocodeAddress(
    "32, Sector-F-B, Scheme No. 94, Indore , MadhyaPradesh"
  );
  console.log("📍 Location:", loc);
})();
