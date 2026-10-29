// js/user-dashboard.js
import { auth, db, doc, setDoc, getDoc, sendEmailVerification, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, query, collection, where, getDocs } from "./firebase-config.js";

export function renderUserDashboard(containerId) {
  const container = document.getElementById(containerId);
  const user = auth.currentUser;

  if (!user) {
    container.innerHTML = `
      <div class="max-w-md mx-auto bg-emerald-900 border border-emerald-700 p-6 rounded-2xl shadow-xl text-center space-y-4">
        <h2 class="text-xl font-bold text-amber-300">User Login / Registration</h2>
        <p class="text-xs text-emerald-200">Kharidne aur tracking dekhne ke liye account login karein.</p>
        
        <div id="authForm" class="space-y-3 text-left">
          <input type="text" id="authName" placeholder="Poora Naam" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
          <input type="text" id="authPhone" placeholder="Mobile Number (1 Account Per Phone)" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
          <input type="text" id="authWhatsapp" placeholder="WhatsApp Number" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
          <input type="email" id="authEmail" placeholder="Gmail Address" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
          <textarea id="authAddress" placeholder="Poora Home Address (Village/City, Pin Code)" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white"></textarea>
          
          <div class="relative">
            <input type="password" id="authPass" placeholder="Password (Min 6 chars)" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
            <button type="button" onclick="window.toggleDashboardPass()" class="absolute right-3 top-2.5 text-xs text-emerald-400">Show/Hide</button>
          </div>

          <button onclick="window.registerUserAccount()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded text-white transition">Register & Verify Gmail</button>
          
          <hr class="border-emerald-800 my-3">
          
          <div class="space-y-2">
            <p class="text-xs text-emerald-300 text-center">Pehle se registered hain? Login karein:</p>
            <input type="email" id="loginEmail" placeholder="Gmail" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
            <input type="password" id="loginPass" placeholder="Password" class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
            <button onclick="window.loginUserAccount()" class="w-full py-2 bg-teal-600 hover:bg-teal-500 font-bold rounded text-white text-sm">Login</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Logged-in view
  getDoc(doc(db, "users", user.uid)).then((docSnap) => {
    const data = docSnap.exists() ? docSnap.data() : {};
    container.innerHTML = `
      <div class="max-w-2xl mx-auto bg-emerald-900 border border-emerald-700 p-6 rounded-2xl shadow-xl space-y-6">
        <div class="flex justify-between items-center border-b border-emerald-800 pb-4">
          <div>
            <h2 class="text-xl font-bold text-emerald-300">Aapka Profile Dashboard</h2>
            <p class="text-xs text-emerald-400">Gmail: ${user.email}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold ${user.emailVerified ? 'bg-emerald-800 text-emerald-200 border border-emerald-500' : 'bg-amber-900 text-amber-200 border border-amber-600'}">
            ${user.emailVerified ? '✅ Verified Account' : '⚠️ Verification Pending'}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-emerald-100">
          <div class="bg-emerald-950 p-3 rounded-lg border border-emerald-800">
            <p class="text-xs text-emerald-400">Naam:</p>
            <p class="font-bold">${data.name || 'N/A'}</p>
          </div>
          <div class="bg-emerald-950 p-3 rounded-lg border border-emerald-800">
            <p class="text-xs text-emerald-400">Mobile Number (1 Account Per Phone):</p>
            <p class="font-bold">${data.phone || 'N/A'}</p>
          </div>
          <div class="bg-emerald-950 p-3 rounded-lg border border-emerald-800">
            <p class="text-xs text-emerald-400">WhatsApp Number:</p>
            <p class="font-bold">${data.whatsapp || 'N/A'}</p>
          </div>
          <div class="bg-emerald-950 p-3 rounded-lg border border-emerald-800">
            <p class="text-xs text-emerald-400">Delivery Address:</p>
            <p class="font-bold">${data.address || 'N/A'}</p>
          </div>
        </div>

        <!-- Strict No Cancellation & No Refund Policy Banner -->
        <div class="no-policy-badge p-4 rounded-xl text-xs space-y-1">
          <p class="font-bold text-sm"><i class="fa-solid fa-ban mr-1"></i> Strict Order Policy:</p>
          <p>• Kharida hua product cancel nahi hoga.</p>
          <p>• Product ka koi refund/return nahi hoga.</p>
          <p>• Delivery Direct Speed Post se aapke diye address par bheji jayegi.</p>
        </div>

        <button onclick="window.userLogout()" class="w-full py-2.5 bg-rose-700 hover:bg-rose-600 font-bold rounded-lg text-white">Logout</button>
      </div>
    `;
  });
}

window.toggleDashboardPass = function() {
  const input = document.getElementById('authPass');
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
};

window.registerUserAccount = async function() {
  const name = document.getElementById('authName').value.trim();
  const phone = document.getElementById('authPhone').value.trim();
  const whatsapp = document.getElementById('authWhatsapp').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const address = document.getElementById('authAddress').value.trim();
  const password = document.getElementById('authPass').value;

  if (!name || !phone || !whatsapp || !email || !address || !password) {
    alert("Kripya saare mandatory fields bharein!");
    return;
  }

  // 1 Mobile = 1 Account Constraint Check
  const q = query(collection(db, "users"), where("phone", "==", phone));
  const snap = await getDocs(q);
  if (!snap.empty) {
    alert("Yeh mobile number pehle se registered hai! Ek mobile par sirf 1 account allowed hai.");
    return;
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(res.user);

    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      name, phone, whatsapp, email, address,
      createdAt: new Date().toISOString()
    });

    alert("Account ban gaya hai! Apni Gmail kholkar verification link par click karein.");
    renderUserDashboard('dashboardContainer');
  } catch(e) { alert("Error: " + e.message); }
};

window.loginUserAccount = async function() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;

  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (!res.user.emailVerified) {
      alert("Gmail par bheje gaye link par click karke email verify karein!");
    } else {
      alert("Login Saphal Raha!");
    }
    renderUserDashboard('dashboardContainer');
  } catch(e) { alert("Error: " + e.message); }
};

window.userLogout = function() {
  signOut(auth).then(() => {
    alert("Logout ho gaye!");
    renderUserDashboard('dashboardContainer');
  });
};
