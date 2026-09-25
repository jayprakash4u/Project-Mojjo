import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Heading, Text, Caption } from '../common/Typography';
import { Badge } from '../common/Badge';
import { useTheme } from '../../theme';
import { LiveTrackingState } from '../../types/tracking';
import { KATHMANDU_SAMPLE_ROUTE } from '../../hooks/useOrderLiveTracking';

interface LiveDeliveryMapProps {
  trackingState: LiveTrackingState;
  onToggleSimulation?: () => void;
  orderNumber?: string;
  driverName?: string;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({
  trackingState,
  onToggleSimulation,
  orderNumber = 'MJ-8921',
  driverName = 'Bikash Maharjan',
}) => {
  const { theme } = useTheme();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [focusTarget, setFocusTarget] = useState<'rider' | 'store' | 'dest'>('rider');

  // Pulse animation for Rider Radar and Destination target
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const riderPosAnimX = useRef(new Animated.Value(0.2)).current;
  const riderPosAnimY = useRef(new Animated.Value(0.2)).current;
  const dashFlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous radar pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Continuous dash flow
    const dashLoop = Animated.loop(
      Animated.timing(dashFlowAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    dashLoop.start();

    return () => {
      pulseLoop.stop();
      dashLoop.stop();
    };
  }, []);

  // Map coordinate bounds to percentage of canvas
  // Bounds for Kathmandu sample region (Lat: 27.674 to 27.695, Lng: 85.338 to 85.354)
  const minLat = 27.672;
  const maxLat = 27.694;
  const minLng = 85.338;
  const maxLng = 85.353;

  const latToPercentY = (lat: number): number => {
    const clamped = Math.max(minLat, Math.min(maxLat, lat));
    return ((maxLat - clamped) / (maxLat - minLat)) * 100;
  };

  const lngToPercentX = (lng: number): number => {
    const clamped = Math.max(minLng, Math.min(maxLng, lng));
    return ((clamped - minLng) / (maxLng - minLng)) * 100;
  };

  const riderXPercent = lngToPercentX(trackingState.riderLocation.longitude);
  const riderYPercent = latToPercentY(trackingState.riderLocation.latitude);

  const storeXPercent = lngToPercentX(trackingState.storeLocation.longitude);
  const storeYPercent = latToPercentY(trackingState.storeLocation.latitude);

  const destXPercent = lngToPercentX(trackingState.destinationLocation.longitude);
  const destYPercent = latToPercentY(trackingState.destinationLocation.latitude);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 1.75));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));

  return (
    <View style={styles.outerContainer}>
      {/* Interactive Map Canvas */}
      <View
        style={[
          styles.mapViewport,
          {
            backgroundColor: '#0F172A',
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Animated Map Grid & Streets */}
        <View
          style={[
            styles.mapGridLayer,
            {
              transform: [{ scale: zoomLevel }],
            },
          ]}
        >
          {/* Simulated Geographic Roads & Landmarks in Kathmandu */}
          <View style={[styles.roadHorizontal, { top: '22%' }]} />
          <View style={[styles.roadHorizontal, { top: '50%' }]} />
          <View style={[styles.roadHorizontal, { top: '78%' }]} />
          <View style={[styles.roadVertical, { left: '25%' }]} />
          <View style={[styles.roadVertical, { left: '55%' }]} />
          <View style={[styles.roadVertical, { left: '80%' }]} />

          {/* Bagmati River Segment Simulation */}
          <View style={styles.riverCurve} />

          {/* Area Labels */}
          <View style={[styles.areaLabelContainer, { top: '15%', left: '8%' }]}>
            <Text style={styles.areaLabelText}>📍 New Baneshwor</Text>
          </View>
          <View style={[styles.areaLabelContainer, { top: '46%', left: '56%' }]}>
            <Text style={styles.areaLabelText}>📍 Tinkune Chowk</Text>
          </View>
          <View style={[styles.areaLabelContainer, { top: '80%', left: '42%' }]}>
            <Text style={styles.areaLabelText}>📍 Koteshwor Hub</Text>
          </View>

          {/* Route Polyline Nodes */}
          {KATHMANDU_SAMPLE_ROUTE.map((pt, idx) => {
            if (idx === KATHMANDU_SAMPLE_ROUTE.length - 1) return null;
            const nextPt = KATHMANDU_SAMPLE_ROUTE[idx + 1];
            const x1 = lngToPercentX(pt.longitude);
            const y1 = latToPercentY(pt.latitude);
            const x2 = lngToPercentX(nextPt.longitude);
            const y2 = latToPercentY(nextPt.latitude);

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const length = Math.hypot(x2 - x1, y2 - y1);
            const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

            return (
              <View
                key={`route-segment-${idx}`}
                style={[
                  styles.routeSegment,
                  {
                    left: `${midX}%`,
                    top: `${midY}%`,
                    width: `${length * 2.8}%`,
                    transform: [{ translateX: -length }, { rotate: `${angle}deg` }],
                    backgroundColor: theme.colors.accent,
                  },
                ]}
              />
            );
          })}

          {/* 1. Mojjo Dark Store Hub Pin */}
          <View
            style={[
              styles.markerWrapper,
              {
                left: `${storeXPercent}%`,
                top: `${storeYPercent}%`,
              },
            ]}
          >
            <View style={[styles.hubMarkerBadge, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="business" size={14} color="#FFFFFF" />
            </View>
            <View style={styles.pinLabelBubble}>
              <Text style={styles.pinLabelText}>Mojjo Hub</Text>
            </View>
          </View>

          {/* 2. Customer Destination Pin */}
          <View
            style={[
              styles.markerWrapper,
              {
                left: `${destXPercent}%`,
                top: `${destYPercent}%`,
              },
            ]}
          >
            {/* Target Pulse Halo */}
            <Animated.View
              style={[
                styles.targetHalo,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: theme.colors.success,
                },
              ]}
            />
            <View style={[styles.destMarkerBadge, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="home" size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.pinLabelBubble, { backgroundColor: '#059669' }]}>
              <Text style={styles.pinLabelText}>Your Location</Text>
            </View>
          </View>

          {/* 3. Live Moving Delivery Rider (Rohan/Bikash) */}
          <View
            style={[
              styles.markerWrapper,
              {
                left: `${riderXPercent}%`,
                top: `${riderYPercent}%`,
                zIndex: 50,
              },
            ]}
          >
            {/* Radar Pulse Wave */}
            <Animated.View
              style={[
                styles.radarPulse,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: theme.colors.accent,
                },
              ]}
            />

            {/* Rider Card with Orientation Heading */}
            <View
              style={[
                styles.riderCard,
                {
                  backgroundColor: theme.colors.accent,
                  shadowColor: theme.colors.accent,
                },
              ]}
            >
              <View
                style={{
                  transform: [{ rotate: `${trackingState.heading}deg` }],
                }}
              >
                <MaterialCommunityIcons name="motorbike" size={24} color="#0F172A" />
              </View>
            </View>

            <View style={styles.riderTooltip}>
              <Text style={styles.riderTooltipText}>
                {driverName} • {trackingState.speedKmH} km/h
              </Text>
            </View>
          </View>
        </View>

        {/* Floating Top Bar: SignalR Status & Demo Switcher */}
        <View style={styles.topControlBar}>
          <View style={styles.connectionStatusPill}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: trackingState.isSimulating
                    ? '#F59E0B'
                    : trackingState.isConnected
                    ? '#10B981'
                    : '#EF4444',
                },
              ]}
            />
            <Caption color="#F8FAFC" style={styles.statusText}>
              {trackingState.isSimulating
                ? '⚡ GPS Simulation Active'
                : trackingState.isConnected
                ? '🟢 Live GPS SignalR'
                : '🔴 Reconnecting Stream...'}
            </Caption>
          </View>

          {onToggleSimulation && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onToggleSimulation}
              style={[
                styles.simButton,
                {
                  backgroundColor: trackingState.isSimulating ? '#F59E0B' : 'rgba(15, 23, 42, 0.85)',
                },
              ]}
            >
              <Ionicons
                name={trackingState.isSimulating ? 'pause' : 'play'}
                size={14}
                color={trackingState.isSimulating ? '#0F172A' : '#F8FAFC'}
              />
              <Caption
                style={[
                  styles.simButtonText,
                  { color: trackingState.isSimulating ? '#0F172A' : '#F8FAFC' },
                ]}
              >
                {trackingState.isSimulating ? 'Pause GPS' : 'Test GPS Move'}
              </Caption>
            </TouchableOpacity>
          )}
        </View>

        {/* Floating Zoom & Centering Buttons */}
        <View style={styles.sideControls}>
          <TouchableOpacity onPress={handleZoomIn} style={styles.controlIconBtn}>
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={styles.controlIconBtn}>
            <Ionicons name="remove" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Telemetry HUD Bar */}
        <View style={styles.telemetryHud}>
          <View style={styles.telemetryItem}>
            <Caption color="#94A3B8">ESTIMATED TIME</Caption>
            <Heading level={4} color="#F8FAFC">
              ⏱️ {trackingState.estimatedMinutes} Mins
            </Heading>
          </View>

          <View style={styles.telemetryDivider} />

          <View style={styles.telemetryItem}>
            <Caption color="#94A3B8">DISTANCE</Caption>
            <Heading level={4} color="#F8FAFC">
              📍 {trackingState.distanceRemainingKm} km
            </Heading>
          </View>

          <View style={styles.telemetryDivider} />

          <View style={styles.telemetryItem}>
            <Caption color="#94A3B8">RIDER SPEED</Caption>
            <Heading level={4} color="#38BDF8">
              ⚡ {trackingState.speedKmH} km/h
            </Heading>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  mapViewport: {
    height: 310,
    width: '100%',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  mapGridLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B1120',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  riverCurve: {
    position: 'absolute',
    top: '35%',
    left: '-10%',
    width: '120%',
    height: 24,
    backgroundColor: 'rgba(14, 116, 144, 0.35)',
    transform: [{ rotate: '-12deg' }],
    borderRadius: 12,
  },
  areaLabelContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  areaLabelText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  routeSegment: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    opacity: 0.85,
    zIndex: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  hubMarkerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  destMarkerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  pinLabelBubble: {
    position: 'absolute',
    top: 34,
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pinLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  targetHalo: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    zIndex: 10,
  },
  radarPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    zIndex: 30,
  },
  riderCard: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    zIndex: 40,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  riderTooltip: {
    position: 'absolute',
    top: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    zIndex: 45,
  },
  riderTooltipText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  topControlBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  connectionStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  simButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  simButtonText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  sideControls: {
    position: 'absolute',
    right: 12,
    top: 60,
    zIndex: 90,
  },
  controlIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  telemetryHud: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 100,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
