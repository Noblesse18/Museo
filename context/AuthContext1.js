import { Client, Account } from "react-native-appwrite";
import { Platform } from "react-native";

// Configuration du client Appwrite
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);

// Détection de la plateforme
switch (Platform.OS) {
  case 'android':
    client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME);
    break;
}

const account = new Account(client);

// Fonctions d'authentification
export const authService = {
  // Connexion
  async login(email, password) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  },

  // Inscription
  async register(email, password, name) {
    try {
      return await account.create('unique()', email, password, name);
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  async logout() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      throw error;
    }
  },

  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }
};

export { account };
