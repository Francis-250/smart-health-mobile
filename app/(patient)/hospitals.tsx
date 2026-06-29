import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";
import { api } from "@/lib/api";

type Hospital = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string | null;
  email?: string | null;
  isEmergency: boolean;
  distanceMeters?: number;
};

const KIGALI_REGION: Region = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.16,
  longitudeDelta: 0.16,
};

export default function Hospitals() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(KIGALI_REGION);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [mode, setMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return hospitals;
    return hospitals.filter((hospital) =>
      [
        hospital.name,
        hospital.address,
        hospital.phoneNumber ?? "",
        hospital.email ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [hospitals, search]);

  const selectedHospital =
    hospitals.find((hospital) => hospital.id === selectedId) ??
    filteredHospitals[0];

  const loadHospitals = async () => {
    setLoading(true);
    setError("");

    try {
      const [location, { data }] = await Promise.all([
        getOptionalLocation(),
        api.get<
          {
            id: string;
            name: string;
            address: string;
            latitude: number;
            longitude: number;
            phoneNumber?: string | null;
            email?: string | null;
            isEmergency: boolean;
          }[]
        >("/hospitals"),
      ]);

      const nextHospitals = data
        .map((hospital) => ({
          ...hospital,
          latitude: Number(hospital.latitude),
          longitude: Number(hospital.longitude),
          distanceMeters: location
            ? distanceInMeters(
                location.coords.latitude,
                location.coords.longitude,
                Number(hospital.latitude),
                Number(hospital.longitude),
              )
            : undefined,
        }))
        .sort((first, second) => {
          if (first.distanceMeters == null || second.distanceMeters == null) {
            return first.name.localeCompare(second.name);
          }
          return first.distanceMeters - second.distanceMeters;
        });

      setHospitals(nextHospitals);
      setSelectedId(nextHospitals[0]?.id);

      if (nextHospitals[0]) {
        const nextRegion = regionFromHospital(nextHospitals[0]);
        setRegion(nextRegion);
      } else {
        setError("No hospitals have been added by the admin yet.");
      }
    } catch {
      setError("Could not load hospitals from Smart Health. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const focusHospital = (hospital: Hospital) => {
    setSelectedId(hospital.id);
    const nextRegion = regionFromHospital(hospital);
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 450);
  };

  const openMap = async (hospital: Hospital) => {
    await Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`,
    );
  };

  const callHospital = async (hospital: Hospital) => {
    if (!hospital.phoneNumber) return;
    await Linking.openURL(`tel:${hospital.phoneNumber}`);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="business-outline" size={24} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>ADMIN HOSPITAL NETWORK</Text>
          <Text style={styles.title}>Hospitals</Text>
        </View>
        <Pressable onPress={loadHospitals} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={COLORS.PRIMARY} />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.TEXT_LIGHT} />
        <TextInput
          onChangeText={setSearch}
          placeholder="Search hospital, address, phone..."
          placeholderTextColor={COLORS.TEXT_LIGHT}
          style={styles.searchInput}
          value={search}
        />
      </View>

      <View style={styles.switcher}>
        <Pressable
          onPress={() => setMode("list")}
          style={[styles.switchButton, mode === "list" && styles.switchActive]}
        >
          <Text
            style={[
              styles.switchText,
              mode === "list" && styles.switchTextActive,
            ]}
          >
            List View
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("map")}
          style={[styles.switchButton, mode === "map" && styles.switchActive]}
        >
          <Text
            style={[
              styles.switchText,
              mode === "map" && styles.switchTextActive,
            ]}
          >
            Map View
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={COLORS.PRIMARY} />
          <Text style={styles.centerText}>Loading hospitals added by admin…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={32} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadHospitals} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Try again</Text>
          </Pressable>
        </View>
      ) : mode === "map" ? (
        <View style={styles.mapScreen}>
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapRef}
            region={region}
            showsUserLocation
            style={styles.map}
          >
            {filteredHospitals.map((hospital) => (
              <Marker
                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}
                description={hospital.address}
                key={hospital.id}
                onPress={() => focusHospital(hospital)}
                pinColor={hospital.isEmergency ? COLORS.ERROR : COLORS.PRIMARY}
                title={hospital.name}
              />
            ))}
          </MapView>

          {selectedHospital ? (
            <View style={styles.mapBottomCard}>
              <HospitalCard
                compact
                hospital={selectedHospital}
                onCall={() => callHospital(selectedHospital)}
                onMap={() => openMap(selectedHospital)}
                onPress={() => focusHospital(selectedHospital)}
              />
            </View>
          ) : null}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.countRow}>
            <Text style={styles.countText}>
              {filteredHospitals.length} hospital
              {filteredHospitals.length === 1 ? "" : "s"} available
            </Text>
            <Text style={styles.countHint}>Added from admin dashboard</Text>
          </View>

          {filteredHospitals.map((hospital) => (
            <HospitalCard
              hospital={hospital}
              key={hospital.id}
              onCall={() => callHospital(hospital)}
              onMap={() => openMap(hospital)}
              onPress={() => {
                focusHospital(hospital);
                setMode("map");
              }}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function HospitalCard({
  compact = false,
  hospital,
  onCall,
  onMap,
  onPress,
}: {
  compact?: boolean;
  hospital: Hospital;
  onCall: () => void;
  onMap: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, compact && styles.compactCard]}
    >
      <View style={styles.cardTop}>
        <View style={styles.hospitalMark}>
          <Ionicons name="medkit-outline" size={24} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.cardTitleRow}>
            <Text numberOfLines={2} style={styles.hospitalName}>
              {hospital.name}
            </Text>
            {hospital.isEmergency ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Emergency</Text>
              </View>
            ) : null}
          </View>

          <Text numberOfLines={2} style={styles.address}>
            {hospital.address}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.metaText}>
              {hospital.distanceMeters != null
                ? `${(hospital.distanceMeters / 1000).toFixed(1)} km away`
                : "Location available"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          disabled={!hospital.phoneNumber}
          onPress={onCall}
          style={[
            styles.callButton,
            !hospital.phoneNumber && styles.disabledAction,
          ]}
        >
          <Ionicons name="call-outline" size={20} color="#FFFFFF" />
          <Text style={styles.callText}>
            {hospital.phoneNumber ? "Call" : "No phone"}
          </Text>
        </Pressable>
        <Pressable onPress={onMap} style={styles.mapButton}>
          <Ionicons name="map-outline" size={18} color={COLORS.PRIMARY} />
          <Text style={styles.mapText}>View Map</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

async function getOptionalLocation() {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return null;
    return Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}

function regionFromHospital(hospital: Hospital): Region {
  return {
    latitude: hospital.latitude,
    longitude: hospital.longitude,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };
}

function distanceInMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(latitude2 - latitude1);
  const longitudeDelta = toRadians(longitude2 - longitude1);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return Math.round(
    earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    height: 46,
    justifyContent: "center",
    marginTop: 2,
    width: 46,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 5,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    height: 42,
    justifyContent: "center",
    marginTop: 2,
    width: 42,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 17,
    paddingHorizontal: 13,
  },
  searchInput: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    height: 48,
    marginLeft: 8,
  },
  switcher: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
    borderRadius: 6,
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 4,
  },
  switchButton: {
    alignItems: "center",
    borderRadius: 4,
    flex: 1,
    height: 38,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  switchText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "800",
  },
  switchTextActive: {
    color: COLORS.PRIMARY_DARK,
  },
  centerState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  centerText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    textAlign: "center",
  },
  primaryAction: {
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 6,
    marginTop: 18,
    paddingHorizontal: 17,
    paddingVertical: 10,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  countRow: {
    marginBottom: 12,
  },
  countText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: "800",
  },
  countHint: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 3,
  },
  card: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 11,
    padding: 13,
  },
  compactCard: {
    marginBottom: 0,
  },
  cardTop: {
    flexDirection: "row",
  },
  hospitalMark: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  cardCopy: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  hospitalName: {
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "#E8F6EF",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: COLORS.SUCCESS,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  address: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  metaText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 13,
  },
  callButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 6,
    flex: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "center",
  },
  disabledAction: {
    backgroundColor: COLORS.TEXT_LIGHT,
  },
  callText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },
  mapButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 6,
    flex: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "center",
  },
  mapText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 7,
  },
  mapScreen: {
    flex: 1,
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  mapBottomCard: {
    bottom: 12,
    left: 12,
    position: "absolute",
    right: 12,
  },
});
