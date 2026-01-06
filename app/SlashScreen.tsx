import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../assets/images/Pathfinder-logo.jpg'; // Assure-toi que ce fichier existe bien
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <LinearGradient 
          colors={['#db6633', '#f9d374','#2c2a33' ]}
          style={styles.container}
        
        >
    <View>
      <Text style={styles.title}>Bienvenue !</Text>
      <Image source={Logo} style={styles.img} />
      <ActivityIndicator size="large" style={{ marginBottom: 20 }} />
      
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  img: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
});
