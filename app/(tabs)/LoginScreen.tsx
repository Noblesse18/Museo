import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authService } from "../../context/AuthContext1"; // Ajustez le chemin selon votre structure

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkValidEmail, setCheckValidEmail] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "gray",
  });

  const handleCheckEmail = (text: string) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    setEmail(text);
    setCheckValidEmail(!emailRegex.test(text));
  };

  const checkPasswordStrength = (pass: string) => {
    setPassword(pass);

    if (pass.length === 0) {
      setPasswordStrength({ label: "", color: "gray" });
    } else if (pass.length < 4) {
      setPasswordStrength({ label: "Faible", color: "red" });
    } else if (pass.length < 8) {
      setPasswordStrength({ label: "Moyen", color: "orange" });
    } else {
      setPasswordStrength({ label: "Fort", color: "green" });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (checkValidEmail) {
      Alert.alert("Erreur", "Veuillez entrer un email valide");
      return;
    }

    setIsLoading(true);

    try {

      // 🔒 Déconnexion d'une éventuelle session active
      try {
        await authService.logout(); // supprime la session actuelle
        console.log("Ancienne session supprimée");
      } catch (logoutErr) {
        console.log("Pas de session existante à supprimer");
      }

      // Tentative de connexion avec Appwrite
      const session = await authService.login(email, password);
      
      console.log("Connexion réussie:", session);
      
      Alert.alert(
        "Succès", 
        "Connexion réussie !",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/HomeScreen")
              console.log("Redirection vers l'accueil");
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      console.error("Erreur brute de login:", error);
      Alert.alert("Erreur", JSON.stringify(error));
      
      // Gestion des différents types d'erreurs
      let errorMessage = "Une erreur s'est produite lors de la connexion";
      
      if (error.code === 401) {
        errorMessage = "Email ou mot de passe incorrect";
        console.log("Signup avec :", email, password);
        console.log("Login avec :", email, password);

      } else if (error.code === 429) {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Erreur de connexion", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Connexion</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              value={email}
              onChangeText={handleCheckEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {checkValidEmail && email.length > 0 && (
          <Text style={styles.textFailed}>Mauvais format d'email</Text>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              value={password}
              onChangeText={checkPasswordStrength}
              secureTextEntry={true}
              editable={!isLoading}
            />
          </View>
          {password.length > 0 && (
            <Text style={{ color: passwordStrength.color, marginTop: 4 }}>
              Force : {passwordStrength.label}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading || checkValidEmail}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push("/SignupScreen")}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => {
            // Vous pouvez ajouter une fonction de mot de passe oublié ici
            Alert.alert("Mot de passe oublié", "Fonctionnalité à implémenter");
          }}
          disabled={isLoading}
        >
          <Text style={[styles.linkText, { fontSize: 14, marginTop: 10 }]}>
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  textFailed: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
});