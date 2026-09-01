// ============================================================
//  EO EXECUTIVE OPTICAL – Authentication + Role Module
// ============================================================

import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { logActivity } from './logs.js';

export function getBasePath() {
  const p = window.location.pathname;
  return p.substring(0, p.lastIndexOf('/') + 1);
}

export async function getUserRole(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return snap.data().role || 'Staff';
    return 'Admin'; // No doc = manually created admin
  } catch { return 'Admin'; }
}

export async function cacheUserRole(uid) {
  const role = await getUserRole(uid);
  sessionStorage.setItem('eo_role', role);
  return role;
}

export function getCachedRole() {
  return sessionStorage.getItem('eo_role') || 'Admin';
}

export function requireAuth() {
  document.body.style.visibility = 'hidden';
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.replace(getBasePath() + 'index.html');
    } else {
      if (!sessionStorage.getItem('eo_role')) await cacheUserRole(user.uid);
      applyRoleUI(sessionStorage.getItem('eo_role') || 'Admin');
      document.body.style.visibility = 'visible';
    }
  });
}

export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.replace(getBasePath() + 'dashboard.html');
  });
}

export async function registerUser(email, password, name, role) {
  if (!['Staff','Optometrist','Manager'].includes(role)) throw new Error('Invalid role.');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    name, email, role, status: 'Active',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  logActivity('AUTH', `New ${role} registered: ${email}`, cred.user.uid).catch(() => {});
  await signOut(auth);
  return cred.user.uid;
}

export async function logoutUser() {
  const user = auth.currentUser;
  if (user) logActivity('AUTH', `Logged out: ${user.email}`, user.uid).catch(() => {});
  sessionStorage.clear();
  try { await signOut(auth); } catch (e) {}
  window.location.replace(getBasePath() + 'index.html');
}

export function populateSidebarUser() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    let role = sessionStorage.getItem('eo_role');
    if (!role) role = await cacheUserRole(user.uid);
    const nameEl   = document.getElementById('sidebar-user-name');
    const roleEl   = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const displayName = user.displayName || user.email.split('@')[0];
    if (nameEl)   nameEl.textContent   = displayName;
    if (roleEl)   roleEl.textContent   = role;
    if (avatarEl) avatarEl.textContent = displayName.substring(0,2).toUpperCase();
    applyRoleUI(role);
  });
}

export function applyRoleUI(role) {
  const h = { Admin: 4, Manager: 3, Optometrist: 2, Staff: 1 };
  document.querySelectorAll('[data-role]').forEach(el => {
    const allowed = el.getAttribute('data-role').split(',').map(r => r.trim());
    if (!allowed.includes(role)) el.style.display = 'none';
  });
  document.querySelectorAll('[data-min-role]').forEach(el => {
    const min = el.getAttribute('data-min-role');
    if ((h[role]||0) < (h[min]||0)) el.style.display = 'none';
  });
}

export function getCurrentUser() { return auth.currentUser; }
