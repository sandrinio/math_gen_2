import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveResults(results) {
  try {
    const resultsCollection = collection(db, 'results');
    await addDoc(resultsCollection, {
      ...results,
      timestamp: serverTimestamp()
    });
    console.log("Results saved successfully!");
  } catch (error) {
    console.error("Error saving results: ", error);
  }
}

export { saveResults };