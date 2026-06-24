/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { Seller, Sale, ServiceOrder, Product, Client, ProtectorCompatibility, AppSettings, Appointment } from './types';

const firebaseConfig = {
  projectId: "planar-agent-j8gvj",
  appId: "1:991722274808:web:13f0c61ee46d484399200d",
  apiKey: "AIzaSyACHo1E9ZT2dGSzexRKfIwQSbK6c_nl728",
  authDomain: "planar-agent-j8gvj.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-3196c3b8-d083-4ad9-9e03-56b1b5efdab4",
  storageBucket: "planar-agent-j8gvj.firebasestorage.app",
  messagingSenderId: "991722274808"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence for PWA support
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed-precondition: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence unimplemented: Browser does not support it');
    }
  });
} catch (e) {
  console.error('Error enabling offline persistence:', e);
}

// Collection references
const sellersCol = collection(db, 'sellers');
const salesCol = collection(db, 'sales');
const osCol = collection(db, 'serviceOrders');
const productsCol = collection(db, 'products');

// 1. SELLERS (Vendedores)
export function subscribeSellers(onUpdate: (sellers: Seller[]) => void) {
  return onSnapshot(sellersCol, (snapshot) => {
    const list: Seller[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Seller);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error listening to sellers:', err);
  });
}

export async function dbSaveSeller(seller: Seller) {
  await setDoc(doc(db, 'sellers', seller.id), seller);
}

export async function dbDeleteSeller(id: string) {
  await deleteDoc(doc(db, 'sellers', id));
}

// 2. SALES (Lançamentos de Vendas)
export function subscribeSales(onUpdate: (sales: Sale[]) => void) {
  return onSnapshot(salesCol, (snapshot) => {
    const list: Sale[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Sale);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error listening to sales:', err);
  });
}

export async function dbSaveSale(sale: Sale) {
  await setDoc(doc(db, 'sales', sale.id), sale);
}

export async function dbDeleteSale(id: string) {
  await deleteDoc(doc(db, 'sales', id));
}

// 3. SERVICE ORDERS (Ordens de Serviço)
export function subscribeServiceOrders(onUpdate: (orders: ServiceOrder[]) => void) {
  return onSnapshot(osCol, (snapshot) => {
    const list: ServiceOrder[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as ServiceOrder);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error listening to service orders:', err);
  });
}

export async function dbSaveServiceOrder(order: ServiceOrder) {
  await setDoc(doc(db, 'serviceOrders', order.id), order);
}

export async function dbDeleteServiceOrder(id: string) {
  await deleteDoc(doc(db, 'serviceOrders', id));
}

// 4. PRODUCTS (Mercadorias)
export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  return onSnapshot(productsCol, (snapshot) => {
    const list: Product[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Product);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error listening to products:', err);
  });
}

export async function dbSaveProduct(product: Product) {
  await setDoc(doc(db, 'products', product.id), product);
}

export async function dbDeleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}

// 5. CLIENTS
const clientsCol = collection(db, 'clients');
export function subscribeClients(onUpdate: (clients: Client[]) => void) {
  return onSnapshot(clientsCol, (snapshot) => {
    const list: Client[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Client);
    });
    onUpdate(list);
  }, (err) => console.error('Error listening to clients:', err));
}
export async function dbSaveClient(client: Client) {
  await setDoc(doc(db, 'clients', client.id), client);
}
export async function dbDeleteClient(id: string) {
  await deleteDoc(doc(db, 'clients', id));
}

// 6. PROTECTORS
const protectorsCol = collection(db, 'protectors');
export function subscribeProtectors(onUpdate: (protectors: ProtectorCompatibility[]) => void) {
  return onSnapshot(protectorsCol, (snapshot) => {
    const list: ProtectorCompatibility[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as ProtectorCompatibility);
    });
    onUpdate(list);
  }, (err) => console.error('Error listening to protectors:', err));
}
export async function dbSaveProtector(protector: ProtectorCompatibility) {
  await setDoc(doc(db, 'protectors', protector.id), protector);
}
export async function dbDeleteProtector(id: string) {
  await deleteDoc(doc(db, 'protectors', id));
}

// 7. SETTINGS
const settingsCol = collection(db, 'settings');
export function subscribeSettings(onUpdate: (settings: AppSettings | null) => void) {
  return onSnapshot(doc(settingsCol, 'main'), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as AppSettings);
    } else {
      onUpdate(null);
    }
  }, (err) => console.error('Error listening to settings:', err));
}
export async function dbSaveSettings(settings: AppSettings) {
  await setDoc(doc(db, 'settings', settings.id), settings);
}

// ==========================================
// APPOINTMENTS
// ==========================================
const appointmentsCol = collection(db, 'appointments');

export function subscribeAppointments(onUpdate: (appointments: Appointment[]) => void) {
  return onSnapshot(appointmentsCol, (snapshot) => {
    const list: Appointment[] = [];
    snapshot.forEach(doc => list.push(doc.data() as Appointment));
    onUpdate(list);
  }, (err) => console.error('Error listening to appointments:', err));
}
export async function dbSaveAppointment(appointment: Appointment) {
  await setDoc(doc(db, 'appointments', appointment.id), appointment);
}
export async function dbDeleteAppointment(id: string) {
  await deleteDoc(doc(db, 'appointments', id));
}

export { db };
