import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTestingOnly",
  projectId: "litte-pos"
};

async function check() {
  const res = await fetch('http://localhost:3000/api/auth/session').catch(() => null);
  console.log('Session endpoint status:', res ? res.status : 'no endpoint');
}
check();
