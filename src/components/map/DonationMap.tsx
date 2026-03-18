'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRandomSpotlight, type SpotlightDonation } from '@/lib/donationSpotlight';
import { formatCurrency } from '@/lib/formatters';
import type { AnalyticsEventType } from '@/data/types';

// ── US center for initial view ──
const US_CENTER: [number, number] = [39.8, -98.5];
const US_ZOOM = 4;
const CITY_ZOOM = 8;

// ── Custom green pin icon (SVG-based DivIcon) ──
// IMPORTANT: animation goes on an INNER wrapper, not the DivIcon className,
// because Leaflet uses `transform` on the icon element for positioning
// and a CSS animation with `transform` would override it.
function createPinIcon() {
  return L.divIcon({
    className: 'donation-pin-icon',
    html: `<div class="pin-drop-animate">
      <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 14.667 20 32 20 32s20-17.333 20-32C40 8.954 31.046 0 20 0z" fill="#00b964"/>
        <circle cx="20" cy="18" r="8" fill="white"/>
        <text x="20" y="22" text-anchor="middle" fill="#00b964" font-size="12" font-weight="bold">$</text>
      </svg>
    </div>`,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -56],
  });
}

// ── Popup card content ──
function createPopupContent(spotlight: SpotlightDonation) {
  return `
    <div class="popup-reveal-animate" style="
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 20px;
      min-width: 280px;
      max-width: 320px;
      border: 1px solid rgba(0, 185, 100, 0.3);
      box-shadow: 0 0 20px rgba(0, 185, 100, 0.15);
    ">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <div style="
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #00b964, #00d474);
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; color: white; font-size: 16px;
          flex-shrink: 0;
        ">${spotlight.donorName.charAt(0)}</div>
        <div>
          <a href="/profile/${spotlight.donorId}" style="color: white; font-weight: 600; font-size: 15px; text-decoration: none; transition: color 0.2s; display: flex; align-items: center; gap: 4px;" onmouseover="this.style.color='#00b964'" onmouseout="this.style.color='white'">${spotlight.donorName}${spotlight.donorVerified ? '<svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0"><path d="M12 1L9.5 3.5 6 3l-.5 3.5L2 9l1.5 2.5L2 14l3.5 2.5L6 20l3.5-.5L12 22l2.5-2.5L18 20l.5-3.5L22 14l-1.5-2.5L22 9l-3.5-2.5L18 3l-3.5.5L12 1z" fill="#4A90D9"/><path d="M10 15.17l-3.17-3.17 1.41-1.41L10 12.34l5.66-5.66 1.41 1.41L10 15.17z" fill="white"/></svg>' : ''}</a>
          <div style="color: #9ca3af; font-size: 12px;">${spotlight.donorLocation}</div>
        </div>
      </div>
      <div style="
        font-size: 28px; font-weight: 800; color: #00b964;
        margin-bottom: 8px; letter-spacing: -0.5px;
      ">${formatCurrency(spotlight.donation.amount)}</div>
      <div style="color: #e5e7eb; font-size: 14px; font-weight: 500; margin-bottom: 6px;">
        ${spotlight.fundraiserTitle}
      </div>
      <div style="color: #9ca3af; font-size: 12px; line-height: 1.4; margin-bottom: 14px;">
        ${spotlight.fundraiserStorySnippet}
      </div>
      <a href="/fundraiser/${spotlight.fundraiserId}" style="
        display: inline-block; color: #00b964; font-weight: 600;
        font-size: 13px; text-decoration: none;
      ">Learn more &rarr;</a>
    </div>
  `;
}

// ── Animation controller (must be inside MapContainer) ──
function AnimationController({
  spotlight,
  phase,
  onFlyComplete,
}: {
  spotlight: SpotlightDonation;
  phase: 'idle' | 'flying' | 'dropping' | 'showing';
  onFlyComplete: () => void;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const popupRef = useRef<L.Popup | null>(null);

  // Clean up previous markers/popups
  const cleanup = useCallback(() => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (popupRef.current) {
      map.removeLayer(popupRef.current);
      popupRef.current = null;
    }
  }, [map]);

  useEffect(() => {
    if (phase === 'flying') {
      cleanup();
      const coords: [number, number] = [spotlight.coordinates.lat, spotlight.coordinates.lng];
      map.flyTo(coords, CITY_ZOOM, { duration: 2 });

      // Detect when fly animation ends
      const timer = setTimeout(() => {
        onFlyComplete();
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [phase, spotlight, map, cleanup, onFlyComplete]);

  useEffect(() => {
    if (phase === 'dropping') {
      const coords: [number, number] = [spotlight.coordinates.lat, spotlight.coordinates.lng];
      const marker = L.marker(coords, { icon: createPinIcon() });
      marker.addTo(map);
      markerRef.current = marker;

      // Show popup after pin lands
      const popupTimer = setTimeout(() => {
        const popup = L.popup({
          closeButton: false,
          closeOnClick: false,
          autoClose: false,
          className: 'donation-spotlight-popup',
          offset: [0, -56],
        })
          .setLatLng(coords)
          .setContent(createPopupContent(spotlight))
          .openOn(map);
        popupRef.current = popup;
      }, 900);

      return () => clearTimeout(popupTimer);
    }
  }, [phase, spotlight, map]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return null;
}

// ── Main component ──
interface DonationMapProps {
  onTrack?: (event: AnalyticsEventType, data?: Record<string, unknown>) => void;
}

export default function DonationMap({ onTrack }: DonationMapProps) {
  const [spotlight, setSpotlight] = useState<SpotlightDonation>(() => getRandomSpotlight());
  const [phase, setPhase] = useState<'idle' | 'flying' | 'dropping' | 'showing'>('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Start the initial fly animation after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('flying');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFlyComplete = useCallback(() => {
    setPhase('dropping');
    // After pin drop animation + popup reveal
    setTimeout(() => {
      setPhase('showing');
      setIsTransitioning(false);
    }, 1400);
  }, []);

  const handleReroll = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    onTrack?.('spotlight_reroll');

    const newSpotlight = getRandomSpotlight(spotlight.donation.id);
    setSpotlight(newSpotlight);
    setPhase('flying');
  }, [isTransitioning, spotlight.donation.id, onTrack]);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 64px)' }}>
      <MapContainer
        center={US_CENTER}
        zoom={US_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={true}
        style={{ background: '#1a1a2e' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <AnimationController
          spotlight={spotlight}
          phase={phase}
          onFlyComplete={handleFlyComplete}
        />
      </MapContainer>

      {/* "See another story" button */}
      <button
        onClick={handleReroll}
        disabled={isTransitioning}
        className={`absolute bottom-8 right-8 z-[1000] flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg ${
          isTransitioning
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-[#00b964] hover:bg-[#00d474] text-white hover:shadow-xl hover:scale-105 pulse-glow'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {isTransitioning ? 'Finding a story...' : 'See another story'}
      </button>

      {/* Subtle branding overlay */}
      <div className="absolute top-6 left-6 z-[1000]">
        <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-[#00b964] animate-pulse" />
          <span className="text-white/80 text-xs font-medium tracking-wide">
            DONATION SPOTLIGHT
          </span>
        </div>
      </div>
    </div>
  );
}
