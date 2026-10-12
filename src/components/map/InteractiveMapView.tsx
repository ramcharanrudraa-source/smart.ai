import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Truck,
  RotateCcw,
  Maximize2,
  Navigation,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PriorityLevel } from '../../types';

export const InteractiveMapView: React.FC = () => {
  const {
    bins,
    trucks,
    depots,
    selectedDepotId,
    activeRoutePlan,
    baselineRoute,
    markBinCollected,
    updateBinFill,
    setActiveView,
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [showBaselineRoute, setShowBaselineRoute] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [tileError, setTileError] = useState(false);

  const activeDepot = useMemo(
    () => depots.find((d) => d.id === selectedDepotId) || depots[0],
    [depots, selectedDepotId]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [17.442, 78.375], // HITEC City / Gachibowli center
          zoom: 13,
          zoomControl: true,
        });

        const tileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }
        );

        tileLayer.on('tileerror', () => {
          // If OSM tile server is blocked in sandbox, flag tileError for fallback warning
          setTileError(true);
        });

        tileLayer.addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        const routeLayer = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = markersLayer;
        routeLayerRef.current = routeLayer;
      } catch (err) {
        console.warn('Leaflet map initialization fallback:', err);
        setTileError(true);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fit bounds helper
  const fitAllMarkers = () => {
    if (!mapInstanceRef.current) return;
    const allCoords: [number, number][] = [
      [activeDepot.lat, activeDepot.lng],
      ...bins.map((b) => [b.lat, b.lng] as [number, number]),
    ];
    const bounds = L.latLngBounds(allCoords);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Re-render markers and routes whenever state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    // 1. Draw Depot Marker
    const depotIcon = L.divIcon({
      className: 'custom-depot-marker',
      html: `
        <div style="background-color: #0284C7; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const depotMarker = L.marker([activeDepot.lat, activeDepot.lng], { icon: depotIcon });
    depotMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <div style="color: #38BDF8; font-weight: 700; text-transform: uppercase; font-size: 10px;">Municipal Depot Base</div>
        <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${activeDepot.name}</div>
        <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">${activeDepot.address}</div>
        <div style="margin-top: 6px; font-family: monospace; font-size: 10px; color: #64748B;">Coords: ${activeDepot.lat}, ${activeDepot.lng}</div>
      </div>
    `);
    markersLayer.addLayer(depotMarker);

    // 2. Draw Truck Markers
    trucks.forEach((truck) => {
      const truckIcon = L.divIcon({
        className: 'custom-truck-marker',
        html: `
          <div style="background-color: #06B6D4; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const truckMarker = L.marker([truck.currentLat, truck.currentLng], { icon: truckIcon });
      truckMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px;">
          <div style="color: #22D3EE; font-weight: 700; text-transform: uppercase; font-size: 10px;">Collection Vehicle</div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${truck.name}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">Plate: ${truck.plateNumber} · Driver: ${truck.driverName}</div>
          <div style="margin-top: 4px; font-size: 11px; color: #E2E8F0;">Payload: <b>${truck.currentLoadKg} / ${truck.maxCapacityKg} kg</b></div>
          <div style="color: #38BDF8; font-size: 10px; margin-top: 2px; text-transform: uppercase;">Status: ${truck.status}</div>
        </div>
      `);
      markersLayer.addLayer(truckMarker);
    });

    // 3. Draw Bin Markers colored by priority
    bins.forEach((bin) => {
      let markerColor = '#10B981'; // Green for low
      if (bin.priorityLevel === 'critical') markerColor = '#EF4444'; // Red
      else if (bin.priorityLevel === 'high') markerColor = '#F97316'; // Orange
      else if (bin.priorityLevel === 'medium') markerColor = '#FBBF24'; // Yellow

      const isStopInRoute = activeRoutePlan?.stops.some((s) => s.binId === bin.id);
      const stopIdx = activeRoutePlan?.stops.findIndex((s) => s.binId === bin.id);

      const binIcon = L.divIcon({
        className: 'custom-bin-marker',
        html: `
          <div style="
            background-color: ${markerColor}; 
            width: ${bin.fillPercentage >= 85 ? '32px' : '26px'}; 
            height: ${bin.fillPercentage >= 85 ? '32px' : '26px'}; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border: 2px solid #FFFFFF; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            font-size: 11px;
            font-weight: 800;
            color: #000000;
            font-family: monospace;
          ">
            ${isStopInRoute && stopIdx !== undefined && stopIdx >= 0 ? `#${stopIdx + 1}` : `${bin.fillPercentage}%`}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([bin.lat, bin.lng], { icon: binIcon });

      marker.on('click', () => {
        setSelectedBinId(bin.id);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 4px; min-width: 170px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: monospace; font-weight: 700; color: #FFFFFF;">${bin.id}</span>
            <span style="color: ${markerColor}; font-weight: 700; text-transform: uppercase; font-size: 10px;">${bin.priorityLevel}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${bin.name}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">${bin.area} · ${bin.wasteType}</div>
          <div style="margin-top: 6px; padding: 4px 6px; background: #1E293B; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; color: #CBD5E1; font-size: 11px;">
              <span>Fill Level:</span>
              <b style="color: ${markerColor}; font-family: monospace;">${bin.fillPercentage}%</b>
            </div>
            <div style="display: flex; justify-content: space-between; color: #CBD5E1; font-size: 11px; margin-top: 2px;">
              <span>Priority Score:</span>
              <b style="color: #FFFFFF; font-family: monospace;">${bin.priorityScore} / 100</b>
            </div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #94A3B8; line-height: 1.3;">
            ${bin.scoreBreakdown.explanation}
          </div>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // 4. Draw Polylines for Baseline vs Optimized
    if (showBaselineRoute && baselineRoute && baselineRoute.stopCoordinates.length > 0) {
      const baselinePolyline = L.polyline(baselineRoute.stopCoordinates, {
        color: '#94A3B8',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.7,
      });
      routeLayer.addLayer(baselinePolyline);
    }

    if (activeRoutePlan && activeRoutePlan.routeCoordinates.length > 0) {
      const optimizedPolyline = L.polyline(activeRoutePlan.routeCoordinates, {
        color: '#10B981',
        weight: 4,
        opacity: 0.95,
      });
      routeLayer.addLayer(optimizedPolyline);
    }
  }, [bins, trucks, activeDepot, activeRoutePlan, baselineRoute, showBaselineRoute]);

  const selectedBin = bins.find((b) => b.id === selectedBinId);

  return (
    <div className="relative flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden bg-[#0B1220]">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto rounded-xl border border-slate-800 bg-slate-900/90 p-2 shadow-xl backdrop-blur-md text-xs">
          <div className="flex items-center gap-2 px-2 text-slate-300 font-medium">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span>Hyderabad Smart Grid</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Fit all markers button */}
          <button
            onClick={fitAllMarkers}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1.5 text-slate-300 hover:text-white transition-colors"
            title="Recenter and fit all markers in view"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Fit Markers</span>
          </button>

          {/* Toggle Baseline Route */}
          {baselineRoute && (
            <button
              onClick={() => setShowBaselineRoute((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
                showBaselineRoute
                  ? 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300'
                  : 'border-slate-800 bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
              title="Show unoptimized baseline tour line"
            >
              {showBaselineRoute ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>Baseline Tour (Dashed)</span>
            </button>
          )}

          {activeRoutePlan ? (
            <span className="rounded bg-emerald-500/20 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-400">
              Active TSP Tour: {activeRoutePlan.stops.length} stops ({activeRoutePlan.totalDistanceKm} km)
            </span>
          ) : (
            <button
              onClick={() => setActiveView('optimizer')}
              className="rounded bg-emerald-500 px-3 py-1 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Generate Route
            </button>
          )}
        </div>

        {/* Legend Panel */}
        <div className="pointer-events-auto rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 hidden md:block">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-slate-300">Critical (&ge;85% fill)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-slate-300">High Priority (&ge;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-slate-300">Medium Priority (&ge;45%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Low Priority (Nominal)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="h-3 w-3 rounded-full bg-sky-500" />
            <span className="text-slate-300">Depot Transfer Yard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-cyan-500" />
            <span className="text-slate-300">Compactor Truck</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Fallback Vector Overlay Notice if tiles fail or slow */}
        {tileError && (
          <div className="absolute top-20 left-4 z-20 max-w-sm rounded-xl border border-amber-500/40 bg-slate-950/90 p-3 text-xs text-amber-300 shadow-xl">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span>Tile Network Fallback Mode</span>
            </div>
            <p className="mt-1 text-slate-400 text-[11px]">
              OpenStreetMap tile server access is restricted in this sandbox. Geospatial markers, coordinates, and TSP routing vectors continue to operate normally.
            </p>
          </div>
        )}

        {/* Bottom Drawer for Selected Bin Quick Action */}
        {selectedBin && (
          <div className="absolute bottom-6 left-6 right-6 z-20 max-w-lg mx-auto rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{selectedBin.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      selectedBin.priorityLevel === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : selectedBin.priorityLevel === 'high'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {selectedBin.priorityLevel}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{selectedBin.name}</h4>
                <p className="text-xs text-slate-400">
                  {selectedBin.area} · Type: <span className="capitalize text-slate-200">{selectedBin.wasteType}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedBinId(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-3">
              <div>
                <span className="text-slate-400">Fill Level:</span>
                <p className="font-mono font-bold text-white text-sm">{selectedBin.fillPercentage}%</p>
              </div>
              <div>
                <span className="text-slate-400">Priority Score:</span>
                <p className="font-mono font-bold text-emerald-400 text-sm">{selectedBin.priorityScore} / 100</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 pt-2">
              <input
                type="range"
                min="0"
                max="100"
                value={selectedBin.fillPercentage}
                onChange={(e) => updateBinFill(selectedBin.id, Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-emerald-500"
              />
              <button
                onClick={() => markBinCollected(selectedBin.id)}
                className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                Collect Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
