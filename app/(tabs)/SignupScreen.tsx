import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authService } from "../../context/AuthContext1"; // Ajustez le chemin selon votre structure

export default function SignupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    Nom: "",
    Prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    acceptTerms: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    color: "gray",
  });

  const checkPasswordStrength = (pass: string) => {
    setFormData(prev => ({ ...prev, password: pass }));
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

  const validateForm = () => {
    if (!formData.Nom.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom");
      return false;
    }
    
    if (!formData.Prenom.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre prénom");
      return false;
    }

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return false;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Erreur", "Format d'email invalide");
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return false;
    }

    if (!formData.acceptTerms) {
      Alert.alert("Erreur", "Vous devez accepter les termes et conditions");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Créer le nom complet pour Appwrite
      const fullName = `${formData.Prenom} ${formData.Nom}`;
      
      // Inscription avec Appwrite
      const user = await authService.register(
        formData.email, 
        formData.password, 
        fullName
      );
      
      console.log("Inscription réussie:", user);
      
      Alert.alert(
        "Inscription réussie !",
        "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        [
          {
            text: "Se connecter",
            onPress: () => router.push("/LoginScreen")
          }
        ]
      );
      
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      
      let errorMessage = "Une erreur s'est produite lors de l'inscription";
      
      if (error.code === 409) {
        errorMessage = "Un compte avec cet email existe déjà";
      } else if (error.code === 400) {
        errorMessage = "Données invalides. Vérifiez vos informations";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Erreur d'inscription", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Inscription</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={formData.Nom}
                onChangeText={(text) => setFormData(prev => ({ ...prev, Nom: text }))}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Prénom *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={formData.Prenom}
                onChangeText={(text) => setFormData(prev => ({ ...prev, Prenom: text }))}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="exemple@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                keyboardType="phone-pad"
                value={formData.telephone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, telephone: text }))}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Minimum 8 caractères"
                secureTextEntry
                value={formData.password}
                onChangeText={checkPasswordStrength}
                editable={!isLoading}
              />
            </View>
            {formData.password.length > 0 && (
              <Text style={{ color: passwordStrength.color, marginTop: 4 }}>
                Force : {passwordStrength.label}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Switch
              value={formData.acceptTerms}
              onValueChange={(value) => setFormData(prev => ({ ...prev, acceptTerms: value }))}
              disabled={isLoading}
            />
            <Text style={styles.switchText}>J'accepte les termes et conditions *</Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Inscription..." : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.push("/LoginScreen")}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  switchText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
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
});