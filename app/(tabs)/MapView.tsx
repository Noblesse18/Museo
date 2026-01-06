import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

// Remplace par ta propre clé API
const GOOGLE_API_KEY = 'AIzaSyA4buoivkEWkl0101yHf4axnUEp1TdaY2s';

interface Museum {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
  }>;
}

const radiusOptions = [5, 10, 20, 30]; // en km

export default function MapSearchScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [location, setLocation] = useState<Region | null>(null);
  const [address, setAddress] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'L\'app a besoin de votre position pour fonctionner.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setLocation(coords);
      setRegion(coords);
      setAddress('Ma position actuelle');
      mapRef.current?.animateToRegion(coords, 1000);
      
      // Recherche automatique des musées après obtention de la position
      await findMuseumsAtLocation(coords);
    } catch (error) {
      console.error('Erreur position :', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre position. Vérifiez vos paramètres de localisation.');
    } finally {
      setLoading(false);
    }
  };

  const geocodeAddress = async (inputAddress: string) => {
    if (!inputAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse valide.');
      return;
    }

    try {
      setLoading(true);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        inputAddress
      )}&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== 'OK' || data.results.length === 0) {
        Alert.alert('Adresse introuvable', 'Veuillez entrer une adresse valide.');
        return;
      }

      const loc = data.results[0].geometry.location;
      const coords: Region = {
        latitude: loc.lat,
        longitude: loc.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setLocation(coords);
      setRegion(coords);
      mapRef.current?.animateToRegion(coords, 1000);
      
      // Recherche automatique des musées après géocodage
      await findMuseumsAtLocation(coords);
    } catch (err) {
      console.error('Erreur géocodage :', err);
      Alert.alert('Erreur', 'Impossible de géocoder l\'adresse. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const findMuseumsAtLocation = async (targetLocation: Region) => {
    const radiusMeters = radius * 1000;

    try {
      // Utilisation de textSearch pour de meilleurs résultats
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${targetLocation.latitude},${targetLocation.longitude}&radius=${radiusMeters}&type=museum&key=${GOOGLE_API_KEY}`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'ZERO_RESULTS') {
        Alert.alert('Aucun résultat', `Aucun musée trouvé dans un rayon de ${radius} km.`);
        setMuseums([]);
        return;
      }

      if (data.status !== 'OK') {
        Alert.alert('Erreur', `Erreur API: ${data.status}`);
        return;
      }

      // Filtrage supplémentaire pour s'assurer qu'on a bien des musées
      const filteredMuseums = (data.results || []).filter((place: any) => 
        place.types?.includes('museum') || 
        place.name?.toLowerCase().includes('musée') ||
        place.name?.toLowerCase().includes('museum')
      );

      setMuseums(filteredMuseums);
      
      if (filteredMuseums.length === 0) {
        Alert.alert('Aucun musée', `Aucun musée trouvé dans un rayon de ${radius} km.`);
      }
    } catch (err) {
      console.error('Erreur recherche musées :', err);
      Alert.alert('Erreur', 'Impossible de récupérer les musées. Vérifiez votre connexion internet.');
    }
  };

  const findMuseums = async () => {
    if (!location) {
      Alert.alert('Position manquante', 'Veuillez d\'abord définir une position de recherche.');
      return;
    }

    setLoading(true);
    await findMuseumsAtLocation(location);
    setLoading(false);
  };

  const onMarkerPress = (museum: Museum) => {
    setSelectedMuseum(museum);
    // Centrer la carte sur le musée sélectionné
    mapRef.current?.animateToRegion({
      latitude: museum.geometry.location.lat,
      longitude: museum.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const resetView = () => {
    if (location) {
      mapRef.current?.animateToRegion(location, 1000);
      setSelectedMuseum(null);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Recharger les musées quand le rayon change
  useEffect(() => {
    if (location) {
      findMuseums();
    }
  }, [radius]);

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Entrez une adresse (ex: Paris, France)"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          onSubmitEditing={() => geocodeAddress(address)}
          returnKeyType="search"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonHalf]} 
            onPress={() => geocodeAddress(address)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Chercher</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.buttonHalf]} 
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Ma position</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sélection du rayon */}
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>Rayon de recherche :</Text>
        <View style={styles.radiusButtonsContainer}>
          {radiusOptions.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusButton, radius === r && styles.radiusSelected]}
              onPress={() => setRadius(r)}
              disabled={loading}
            >
              <Text style={[
                styles.radiusButtonText,
                { color: radius === r ? '#fff' : '#1E90FF' }
              ]}>
                {r} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.museumCount}>
          {museums.length} musée{museums.length > 1 ? 's' : ''} trouvé{museums.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Carte */}
      {region && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {location && (
            <Circle
              center={location}
              radius={radius * 1000}
              strokeColor="#1E90FF"
              strokeWidth={2}
              fillColor="rgba(30, 144, 255, 0.1)"
            />
          )}

          {/* Marqueur pour la position de recherche */}
          {location && (
            <Marker
              coordinate={location}
              title="Position de recherche"
              pinColor="blue"
            />
          )}

          {/* Marqueurs des musées */}
          {museums.map((museum) => (
            <Marker
              key={museum.place_id}
              title={museum.name}
              description={`${museum.vicinity}${museum.rating ? ` • ⭐ ${museum.rating}` : ''}`}
              coordinate={{
                latitude: museum.geometry.location.lat,
                longitude: museum.geometry.location.lng,
              }}
              pinColor="red"
              onPress={() => onMarkerPress(museum)}
            />
          ))}
        </MapView>
      )}

      {/* Bouton pour recentrer la vue */}
      {location && (
        <TouchableOpacity style={styles.resetButton} onPress={resetView}>
          <Text style={styles.resetButtonText}>⌖</Text>
        </TouchableOpacity>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonText: { 
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  radiusContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  radiusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  radiusButton: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E90FF',
    minWidth: 60,
    alignItems: 'center',
  },
  radiusSelected: {
    backgroundColor: '#1E90FF',
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  museumCount: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  map: {
    flex: 1,
  },
  resetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  resetButtonText: {
    fontSize: 24,
    color: '#1E90FF',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1E90FF',
  },
});