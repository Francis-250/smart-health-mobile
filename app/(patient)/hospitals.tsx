import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/colors";

type Hospital = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  distanceMeters?: number;
};

const KIGALI_REGION: Region = {
  latitude: -1.9441,
  longitude: 30.0619,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function Hospitals() {
  const [region, setRegion] = useState<Region>(KIGALI_REGION);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHospitals = async () => {
    setLoading(true);
    setError("");

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError("Location permission is needed to find nearby hospitals.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
      setRegion(nextRegion);

      const apiKey = String(
        Constants.expoConfig?.extra?.googleMapsApiKey ?? "",
      );
      if (!apiKey) throw new Error("Google Maps API key is not configured.");

      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchNearby",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber",
          },
          body: JSON.stringify({
            includedTypes: ["hospital"],
            maxResultCount: 10,
            rankPreference: "DISTANCE",
            locationRestriction: {
              circle: {
                center: {
                  latitude: nextRegion.latitude,
                  longitude: nextRegion.longitude,
                },
                radius: 20000,
              },
            },
          }),
        },
      );
      if (!response.ok) throw new Error("Hospital service is unavailable.");
      const data = (await response.json()) as {
        places?: {
          id?: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          location?: { latitude?: number; longitude?: number };
          nationalPhoneNumber?: string;
        }[];
      };
      const nearbyHospitals = (data.places ?? [])
        .filter(
          (place) =>
            typeof place.location?.latitude === "number" &&
            typeof place.location?.longitude === "number",
        )
        .map((place) => {
          const latitude = place.location?.latitude ?? nextRegion.latitude;
          const longitude = place.location?.longitude ?? nextRegion.longitude;
          return {
            id: place.id ?? `${latitude}-${longitude}`,
            name: place.displayName?.text ?? "Hospital",
            address: place.formattedAddress ?? "Address unavailable",
            latitude,
            longitude,
            phone: place.nationalPhoneNumber,
            distanceMeters: distanceInMeters(
              nextRegion.latitude,
              nextRegion.longitude,
              latitude,
              longitude,
            ),
          };
        });
      setHospitals(nearbyHospitals);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load nearby hospitals.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  const navigate = async (hospital: Hospital) => {
    const destination = `${hospital.latitude},${hospital.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    await Linking.openURL(url);
  };

  const openMapSearch = async () => {
    const query = encodeURIComponent(
      `hospitals near ${region.latitude},${region.longitude}`,
    );
    await Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>GPS HEALTHCARE SERVICES</Text>
          <Text style={styles.title}>Nearby Hospitals</Text>
        </View>
        <Pressable onPress={loadHospitals} style={styles.refreshButton}>
          <Ionicons name="locate" size={21} color={COLORS.PRIMARY} />
        </Pressable>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation
        style={styles.map}
      >
        {hospitals.map((hospital) => (
          <Marker
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            description={hospital.address}
            key={hospital.id}
            pinColor={COLORS.ERROR}
            title={hospital.name}
          />
        ))}
      </MapView>

      <View style={styles.results}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Finding nearby hospitals…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={openMapSearch} style={styles.mapsButton}>
              <Text style={styles.mapsButtonText}>OPEN GOOGLE MAPS</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.hospitalList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {hospitals.map((hospital) => (
              <View key={hospital.id} style={styles.hospitalCard}>
                <Text numberOfLines={1} style={styles.hospitalName}>
                  {hospital.name}
                </Text>
                <Text numberOfLines={2} style={styles.address}>
                  {hospital.address}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.distance}>
                    {hospital.distanceMeters
                      ? `${(hospital.distanceMeters / 1000).toFixed(1)} km`
                      : "Nearby"}
                  </Text>
                  <Pressable
                    onPress={() => navigate(hospital)}
                    style={styles.navigateButton}
                  >
                    <Ionicons name="navigate" size={15} color="#FFFFFF" />
                    <Text style={styles.navigateText}>Route</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
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

  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.BACKGROUND, flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  eyebrow: {
    color: COLORS.PRIMARY,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  map: { flex: 1 },
  results: {
    backgroundColor: COLORS.BACKGROUND,
    minHeight: 165,
    paddingVertical: 10,
  },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 8,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  mapsButton: {
    backgroundColor: COLORS.PRIMARY_DARK,
    borderRadius: 7,
    marginTop: 12,
    paddingHorizontal: 17,
    paddingVertical: 10,
  },
  mapsButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  hospitalList: { paddingHorizontal: 12 },
  hospitalCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 9,
    borderWidth: 1,
    marginRight: 10,
    padding: 13,
    width: 260,
  },
  hospitalName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "900",
  },
  address: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  distance: { color: COLORS.PRIMARY, fontSize: 12, fontWeight: "800" },
  navigateButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    flexDirection: "row",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  navigateText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 5,
  },
});
