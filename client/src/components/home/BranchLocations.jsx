import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  Maximize2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

/* ================= LEAFLET ================= */
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ---------- FIX LEAFLET MARKER ICONS ---------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------- AUTO RECENTER WHEN BRANCH CHANGES ---------- */
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);

  return null;
};

/* ---------- FIX MAP SIZING ISSUES ---------- */
const FixMapSize = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

const BranchLocations = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Force map re-render if needed

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/branches");

      if (res.data && res.data.length > 0) {
        setBranches(res.data);
        setSelectedBranch(res.data[0]);
      } else {
        setError("No branches available");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError("Failed to load branches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = (branch) => {
    if (!branch?.location?.lat || !branch?.location?.lng) {
      alert("Location coordinates not available");
      return;
    }
    const { lat, lng } = branch.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    // Force map update
    setMapKey((prev) => prev + 1);
  };

  const filteredBranches = branches.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "premium") return b.premium;
    if (activeTab === "standard") return !b.premium;
    return true;
  });

  // LOADING STATE
  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
        </div>
      </section>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchBranches}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // NO BRANCHES STATE
  if (branches.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">No branches available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`py-16 bg-gradient-to-b from-white to-rose-50 ${
        isFullscreen ? "fixed inset-0 z-50 bg-white overflow-auto" : ""
      }`}
    >
      <div
        className={`${isFullscreen ? "h-full p-4" : "max-w-7xl mx-auto px-4"}`}
      >
        {/* HEADER */}
        {!isFullscreen && (
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold font-[philosopher] text-gray-900">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-amber-600">
                Branch Locations
              </span>
            </h2>
            <p className="text-gray-600 mt-2">
              Find our premium spa locations across the city
            </p>
          </div>
        )}

        {/* FILTER TABS */}
        {!isFullscreen && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-white p-1 shadow-md border border-rose-100">
              {["all", "premium", "standard"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white"
                      : "text-gray-600 hover:text-rose-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={`grid ${
            isFullscreen
              ? "grid-cols-1 h-[calc(100vh-8rem)]"
              : "grid-cols-1 lg:grid-cols-3"
          } gap-6`}
        >
          {/* LEFT LIST */}
          {!isFullscreen && (
            <div className="space-y-4 lg:overflow-y-auto lg:max-h-[600px]">
              {filteredBranches.map((branch) => (
                <div
                  key={branch._id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                    selectedBranch?._id === branch._id
                      ? "border-rose-500 bg-rose-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-rose-300 hover:shadow"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {branch.name} Branch
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {branch.address}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Phone className="h-4 w-4 mr-1" />
                        {branch.phone}
                      </div>
                    </div>
                    {branch.premium && (
                      <span className="px-2 py-1 text-xs bg-amber-500 text-white rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAP + DETAILS */}
          <div
            className={`${
              isFullscreen ? "col-span-1 h-full" : "lg:col-span-2"
            } bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col`}
          >
            {/* MAP CONTAINER - CRITICAL: Fixed height and proper styling */}
            <div
              className={`${
                isFullscreen ? "h-[70%]" : "h-[400px]"
              } w-full relative`}
              style={{ minHeight: isFullscreen ? "400px" : "400px" }}
            >
              {selectedBranch?.location?.lat &&
              selectedBranch?.location?.lng ? (
                <MapContainer
                  key={mapKey} // Force re-render when needed
                  center={[
                    selectedBranch.location.lat,
                    selectedBranch.location.lng,
                  ]}
                  zoom={15}
                  scrollWheelZoom={true}
                  style={{
                    height: "100%",
                    width: "100%",
                    zIndex: 1,
                  }}
                  className="leaflet-container"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <FixMapSize />
                  <RecenterMap
                    lat={selectedBranch.location.lat}
                    lng={selectedBranch.location.lng}
                  />

                  {/* Render all branch markers */}
                  {branches.map(
                    (branch) =>
                      branch.location?.lat &&
                      branch.location?.lng && (
                        <Marker
                          key={branch._id}
                          position={[branch.location.lat, branch.location.lng]}
                          eventHandlers={{
                            click: () => handleBranchSelect(branch),
                          }}
                        >
                          <Popup>
                            <div className="text-center">
                              <strong className="text-base">
                                {branch.name} Branch
                              </strong>
                              <br />
                              <span className="text-sm text-gray-600">
                                {branch.address}
                              </span>
                            </div>
                          </Popup>
                        </Marker>
                      )
                  )}
                </MapContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Location data not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* BRANCH DETAILS */}
            {selectedBranch && (
              <div
                className={`p-6 ${isFullscreen ? "h-[30%] overflow-auto" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedBranch.name} Branch
                    </h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      {selectedBranch.address}
                    </p>
                  </div>
                  {selectedBranch.premium && (
                    <span className="px-3 py-1 text-sm bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Premium
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-rose-50 rounded-lg">
                    <Phone className="h-5 w-5 text-rose-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {selectedBranch.phone}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Mobile</p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg">
                    <Clock className="h-5 w-5 text-amber-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {selectedBranch.workingHours || "9:00 AM - 9:00 PM"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Working Hours</p>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {selectedBranch.rooms}
                    </div>
                    <p className="text-xs text-gray-500">Available Rooms</p>
                  </div>

                  <button
                    onClick={() => handleGetDirections(selectedBranch)}
                    className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    Get Directions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BranchLocations;
