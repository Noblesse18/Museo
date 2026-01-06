import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  const handlePress = () => {
    Alert.alert('Navigation', 'Bouton cliqué !');
  };

  return (
    <LinearGradient 
      colors={['#db6633', '#f9d374','#2c2a33' ]}
      style={styles.container}
    
    >
    <View>
      <Text style={styles.title}>Bienvenue dans TravelApp 🌍</Text>
      <Text style={styles.subtitle}>Explorez vos prochaines destinations</Text>

      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Text style={styles.buttonText}>Voir les destinations</Text>
      </TouchableOpacity>
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#199203d6',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#607d8b',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
