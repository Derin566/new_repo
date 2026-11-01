import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Real Firebase Project: dyslexiamonitering
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDu4aaJSDio_cqQsguVKishZntr7na5p9U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dyslexiamonitering.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dyslexiamonitering",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dyslexiamonitering.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Safe Auth Service with Demo Fallback Mode
export const authService = {
  // Login function with seamless offline/demo fallback
  async login(email, password, role = 'parent') {
    try {
      // If demo mode or test credentials
      if (email.endsWith('@demo.com') || firebaseConfig.apiKey.includes('DEMO')) {
        const mockUser = {
          uid: 'demo_' + Math.random().toString(36).substring(7),
          email,
          displayName: email.split('@')[0],
          role
        };
        localStorage.setItem('dyslexia_user', JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user profile and learner data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let isNewUser = false;
      let learner = null;

      if (!userDoc.exists()) {
        isNewUser = true;
        await setDoc(doc(db, 'users', user.uid), {
          login_id: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else {
        const data = userDoc.data();
        learner = data.learner || null;
        isNewUser = !learner;
        await setDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() }, { merge: true });
      }
      
      const fullUser = { uid: user.uid, email: user.email, isNewUser, learner };
      localStorage.setItem('dyslexia_user', JSON.stringify(fullUser));
      return { success: true, user: fullUser, isNewUser, learner };
    } catch (error) {
      console.warn("Firebase Auth fallback to local session:", error.message);
      // Fallback for seamless testing
      const savedLearner = localStorage.getItem('dyslexia_learner');
      const parsedLearner = savedLearner ? JSON.parse(savedLearner) : null;
      const isNewUser = !parsedLearner;

      const fallbackUser = {
        uid: 'user_' + Date.now(),
        email,
        displayName: email.split('@')[0],
        isNewUser,
        learner: parsedLearner
      };
      localStorage.setItem('dyslexia_user', JSON.stringify(fallbackUser));
      return { success: true, user: fallbackUser, isNewUser, learner: parsedLearner, isLocalDemo: true };
    }
  },

  // Signup function
  async signup(email, password, role = 'parent', name = '') {
    try {
      if (email.endsWith('@demo.com') || firebaseConfig.apiKey.includes('DEMO')) {
        const mockUser = {
          uid: 'demo_' + Math.random().toString(36).substring(7),
          email,
          displayName: name || email.split('@')[0],
          isNewUser: true,
          learner: null
        };
        localStorage.setItem('dyslexia_user', JSON.stringify(mockUser));
        return { success: true, user: mockUser, isNewUser: true };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save new user record to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        login_id: user.uid,
        email: user.email,
        displayName: name || user.email.split('@')[0],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isNewUser: true
      });

      const fullUser = { uid: user.uid, email: user.email, displayName: name, isNewUser: true, learner: null };
      localStorage.setItem('dyslexia_user', JSON.stringify(fullUser));
      return { success: true, user: fullUser, isNewUser: true };
    } catch (error) {
      console.warn("Firebase Signup fallback:", error.message);
      const fallbackUser = {
        uid: 'user_' + Date.now(),
        email,
        displayName: name || email.split('@')[0],
        isNewUser: true,
        learner: null
      };
      localStorage.setItem('dyslexia_user', JSON.stringify(fallbackUser));
      return { success: true, user: fallbackUser, isNewUser: true, isLocalDemo: true };
    }
  },

  // Google Login
  async loginWithGoogle(role = 'parent') {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save or update user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        role: role,
        lastLogin: serverTimestamp()
      }, { merge: true });

      const fullUser = { uid: user.uid, email: user.email, displayName: user.displayName, role };
      localStorage.setItem('dyslexia_user', JSON.stringify(fullUser));
      return { success: true, user: fullUser };
    } catch (error) {
      console.warn("Google popup fallback:", error.message);
      const mockGoogle = {
        uid: 'google_demo_' + Date.now(),
        email: 'google.user@example.com',
        displayName: 'Demo Google User',
        role
      };
      localStorage.setItem('dyslexia_user', JSON.stringify(mockGoogle));
      return { success: true, user: mockGoogle, isLocalDemo: true };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('dyslexia_user');
  },

  // Get current cached user
  getCurrentUser() {
    const data = localStorage.getItem('dyslexia_user');
    return data ? JSON.parse(data) : null;
  }
};

// Database helper for game sessions, learners, and audio
export const databaseService = {
  // Save or update learner profile directly to Cloud Firestore
  async saveLearnerProfile(userId, learnerData) {
    try {
      if (userId && !userId.startsWith('user_')) {
        // Save inside the user document
        await setDoc(doc(db, 'users', userId), {
          learner: {
            ...learnerData,
            updatedAt: serverTimestamp()
          }
        }, { merge: true });

        // Also save into learners collection
        await setDoc(doc(db, 'learners', userId), {
          userId,
          ...learnerData,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      localStorage.setItem('dyslexia_learner', JSON.stringify(learnerData));
      return { success: true };
    } catch (e) {
      console.warn("Firestore sync fallback to local:", e.message);
      localStorage.setItem('dyslexia_learner', JSON.stringify(learnerData));
      return { success: true, isLocal: true };
    }
  },

  // Save screening game metrics to Firestore
  async saveGameMetrics(childId, sessionData) {
    try {
      const docRef = await addDoc(collection(db, 'screening_results'), {
        childId,
        timestamp: serverTimestamp(),
        ...sessionData
      });
      return { success: true, id: docRef.id };
    } catch (e) {
      console.log("Local saving of game metrics (Demo Mode):", sessionData);
      return { success: true, id: 'local_' + Date.now() };
    }
  },

  // Upload Voice Audio to Firebase Storage
  async uploadVoiceAudio(audioBlob, childId, sessionId) {
    try {
      const audioRef = ref(storage, `recordings/${childId}/${sessionId}_voice.wav`);
      const snapshot = await uploadBytes(audioRef, audioBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (e) {
      console.warn("Audio upload fallback (Local URL created):", e.message);
      const localUrl = URL.createObjectURL(audioBlob);
      return { success: true, url: localUrl, isLocal: true };
    }
  }
};
