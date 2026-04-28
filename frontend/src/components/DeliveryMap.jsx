import React, { useState, useEffect, useRef } from "react";
import { MapPin, Crosshair, Search, Navigation, Package, Truck, CheckCircle, Phone, Star, Clock } from "lucide-react";

export default function DeliveryMap({ 
  orderId = "ORD-2024-8821", 
  sellerLocation = { lat: 26.8467, lng: 80.9462, label: "Seller Warehouse" },
  customerLocation: initialCustomerLocation = null,
  onAddressConfirm,
  defaultTab = "checkout" 
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const routingLayerRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const animationRef = useRef(null);

  // Address & Checkout State
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [coords, setCoords] = useState(initialCustomerLocation || sellerLocation); // Default to seller or customer
  const [gettingLocation, setGettingLocation] = useState(false);

  // Tracking State
  const [trackingStatus, setTrackingStatus] = useState("Out for Delivery");
  const [eta, setEta] = useState("45 mins");

  // Reverse Geocoding via Nominatim
  const handlePinMove = async (lat, lng) => {
    setCoords({ lat, lng });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        setSearchQuery(data.display_name);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  // Search Address via Nominatim
  const searchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCoords({ lat, lng });
    setAddress(result.display_name);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // GPS Location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGettingLocation(false);
          handlePinMove(latitude, longitude);
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 16);
            markerRef.current.setLatLng([latitude, longitude]);
          }
        },
        (error) => {
          console.error(error);
          setGettingLocation(false);
          alert("Could not get your location. Please allow location access.");
        }
      );
    } else {
      setGettingLocation(false);
      alert("Geolocation is not supported by your browser.");
    }
  };
  
  // Load Leaflet dynamically
  useEffect(() => {
    if (window.L) {
      if (!leafletLoaded) setTimeout(() => setLeafletLoaded(true), 0);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";

    document.head.appendChild(link);
    document.head.appendChild(script);

    script.onload = () => setLeafletLoaded(true);

    return () => {
      // Cleanup omitted to keep leaflet cached
    };
  }, [leafletLoaded]);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    
    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 13);
      mapInstanceRef.current = map;

      // Dark theme tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Add pin for checkout
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #4f46e5; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center; position: relative; top: -12px; left: -12px;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [0, 0]
      });

      if (activeTab === "checkout") {
        const marker = L.marker([coords.lat, coords.lng], { 
          icon: customIcon,
          draggable: true 
        }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', function () {
          const position = marker.getLatLng();
          handlePinMove(position.lat, position.lng);
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          handlePinMove(e.latlng.lat, e.latlng.lng);
        });
        
        // Initial reverse geocode
        if (!initialCustomerLocation) setTimeout(() => handlePinMove(coords.lat, coords.lng), 0);
      }
    } else {
      // Update existing map view
      if (activeTab === "checkout") {
        mapInstanceRef.current.setView([coords.lat, coords.lng]);
        if (markerRef.current) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        }
      }
    }

  }, [leafletLoaded, activeTab, coords.lat, coords.lng, initialCustomerLocation]); // Dependencies

  // Order Tracking Logic (OSRM Routing & Animation)
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || activeTab !== "tracking") return;
    
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear previous tracking layers
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (routingLayerRef.current) {
      map.removeLayer(routingLayerRef.current);
    }
    if (deliveryMarkerRef.current) {
      map.removeLayer(deliveryMarkerRef.current);
    }

    const startLat = sellerLocation.lat;
    const startLng = sellerLocation.lng;
    const endLat = coords.lat;
    const endLng = coords.lng;

    // Fetch Route from OSRM
    const fetchRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map(c => [c[1], c[0]]); // GeoJSON is [lng, lat]

          // Draw Route
          const polyline = L.polyline(coordinates, { color: '#4f46e5', weight: 5, opacity: 0.7, dashArray: '10, 10' }).addTo(map);
          routingLayerRef.current = polyline;

          // Add Seller Marker
          L.circleMarker([startLat, startLng], { color: '#10b981', radius: 8, fillOpacity: 1 }).addTo(map).bindPopup(sellerLocation.label || "Seller");
          
          // Add Customer Marker
          L.circleMarker([endLat, endLng], { color: '#ef4444', radius: 8, fillOpacity: 1 }).addTo(map).bindPopup("Delivery Address");

          // Fit bounds
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

          // Add Animated Delivery Bike
          const bikeIcon = L.divIcon({
            className: 'bike-icon',
            html: `<div style="background-color: white; padding: 4px; border-radius: 50%; border: 2px solid #f59e0b; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); font-size: 16px;">🛵</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const bikeMarker = L.marker(coordinates[0], { icon: bikeIcon }).addTo(map);
          deliveryMarkerRef.current = bikeMarker;

          // Animation Loop
          let currentIndex = 0;
          const animate = () => {
            if (currentIndex < coordinates.length - 1) {
              currentIndex += 1; // Speed factor
              if(currentIndex >= coordinates.length) currentIndex = coordinates.length - 1;
              
              bikeMarker.setLatLng(coordinates[currentIndex]);
              
              // Simulate ETA update
              const progress = currentIndex / coordinates.length;
              const remainingMins = Math.max(1, Math.round((1 - progress) * 60));
              setEta(`${remainingMins} mins`);

              if (progress > 0.95) setTrackingStatus("Arriving Soon");
              if (progress === 1) setTrackingStatus("Delivered");

              animationRef.current = requestAnimationFrame(animate);
            }
          };
          
          // Start animation slowly (setTimeout to give map time to render)
          setTimeout(() => {
             animationRef.current = requestAnimationFrame(animate);
          }, 1000);
        }
      } catch (err) {
        console.error("OSRM Route fetching failed", err);
      }
    };

    fetchRoute();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [leafletLoaded, activeTab, coords.lat, coords.lng, sellerLocation.lat, sellerLocation.lng, sellerLocation.label]);




  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-inter">
      
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-max mb-6">
        <button 
          onClick={() => setActiveTab("checkout")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'checkout' ? 'bg-white dark:bg-[#0A101D] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          📍 Checkout Address
        </button>
        <button 
          onClick={() => setActiveTab("tracking")}
          className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'tracking' ? 'bg-white dark:bg-[#0A101D] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          🚚 Order Tracking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar / Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {activeTab === "checkout" ? (
            <div className="bg-white dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Delivery Address</h2>
              
              {/* Search Bar */}
              <form onSubmit={searchAddress} className="relative mb-4">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location..."
                  className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 py-3 pl-11 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((res, i) => (
                      <div 
                        key={i} 
                        onClick={() => selectSearchResult(res)}
                        className="p-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 cursor-pointer line-clamp-2"
                      >
                        <MapPin className="inline w-3 h-3 mr-2 text-indigo-500" />
                        {res.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </form>

              <button 
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-medium py-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-sm mb-6"
              >
                <Crosshair className={`w-4 h-4 ${gettingLocation ? 'animate-spin' : ''}`} />
                {gettingLocation ? 'Locating...' : 'Use My Current Location'}
              </button>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Selected Address</p>
                <p className="text-sm text-slate-900 dark:text-white font-medium leading-relaxed">
                  {address || "Drag the pin to select an address..."}
                </p>
                {coords && (
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <button 
                onClick={() => onAddressConfirm && onAddressConfirm({ address, coords })}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Delivery Address
              </button>
            </div>
          ) : (
            // Tracking Sidebar
            <div className="bg-white dark:bg-[#0A101D] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Order ID</p>
                  <p className="font-bold text-slate-900 dark:text-white">{orderId}</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {trackingStatus}
                </div>
              </div>

              {/* ETA Bar */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">Estimated Arrival</p>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">{eta}</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4 mb-6 pl-2">
                {[
                  { label: "Order Placed", icon: <Package className="w-4 h-4"/>, done: true },
                  { label: "Packed & Picked", icon: <CheckCircle className="w-4 h-4"/>, done: true },
                  { label: "Out for Delivery", icon: <Truck className="w-4 h-4"/>, done: true, active: trackingStatus === "Out for Delivery" },
                  { label: "Delivered", icon: <MapPin className="w-4 h-4"/>, done: trackingStatus === "Delivered" }
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    {i !== 3 && <div className={`absolute top-6 left-3 w-0.5 h-6 -ml-px ${step.done ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${step.active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/50' : step.done ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {step.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${step.active ? 'text-indigo-600 dark:text-indigo-400' : step.done ? 'text-slate-900 dark:text-slate-300' : 'text-slate-500'}`}>{step.label}</p>
                      {step.active && <p className="text-xs text-slate-500 mt-0.5">Your package is on the way.</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Agent */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Agent" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Rahul Kumar</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8 Delivery Partner</p>
                  </div>
                </div>
                <button className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm h-[500px] lg:h-[600px] bg-slate-100 dark:bg-slate-900">
           {!leafletLoaded && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 z-50">
               <div className="flex flex-col items-center gap-3">
                 <Navigation className="w-8 h-8 text-indigo-500 animate-bounce" />
                 <p className="text-sm font-medium text-slate-500">Loading map...</p>
               </div>
             </div>
           )}
           <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }}></div>
           
           {/* Crosshair target overlay for visual centering indicator */}
           {activeTab === "checkout" && (
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[2]">
               <div className="w-48 h-48 border-2 border-indigo-500/20 rounded-full opacity-50"></div>
             </div>
           )}
        </div>

      </div>

      <style jsx global>{`
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
