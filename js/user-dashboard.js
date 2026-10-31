// js/user-dashboard.js
import { auth, db, doc, setDoc, getDoc, sendEmailVerification, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, query, collection, where, getDocs, addDoc } from "./firebase-config.js";

export function renderUserDashboard(containerId) {
  const container = document.getElementById(containerId);
  const user = auth.currentUser;

  if (!user) {
    container.innerHTML = `
      <div class="max-w-md mx-auto bg-emerald-900 border border-emerald-700 p-6 rounded-2xl shadow-xl text-center space-y-4">
        <h2 class="text-xl font-bold text-amber-300">User Login / Registration</h2>
        <p class="text-xs text-emerald-200">Kharidne aur Royalty program join karne ke liye login karein.</p>
        
        <div class="space-y-3 text-left">
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

  getDoc(doc(db, "users", user.uid)).then((docSnap) => {
    const data = docSnap.exists() ? docSnap.data() : {};
    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="bg-emerald-900 border border-emerald-700 p-6 rounded-2xl shadow-xl space-y-4">
          <div class="flex justify-between items-center border-b border-emerald-800 pb-3">
            <div>
              <h2 class="text-lg font-bold text-emerald-300">Aapka Profile Dashboard</h2>
              <p class="text-xs text-emerald-400">Gmail: ${user.email}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold ${user.emailVerified ? 'bg-emerald-800 text-emerald-200 border border-emerald-500' : 'bg-amber-900 text-amber-200 border border-amber-600'}">
              ${user.emailVerified ? '✅ Verified' : '⚠️ Pending Verification'}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-emerald-100">
            <div class="bg-emerald-950 p-3 rounded-lg border border-emerald-800">
              <p class="text-xs text-emerald-400">Naam:</p><p class="font-bold">${data.name || 'N/A'}</p>
            </div>
            <div class="bg-emerald-950 p-3 rounded-lg border border-emerald-800">
              <p class="text-xs text-emerald-400">Mobile Number:</p><p class="font-bold">${data.phone || 'N/A'}</p>
            </div>
          </div>

          <button onclick="window.userLogout()" class="w-full py-2 bg-rose-700 font-bold rounded-lg text-white text-xs">Logout</button>
        </div>

        <!-- 1M Creator Royalty Program Inside Dashboard -->
        <div class="bg-emerald-900 border border-emerald-700 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 class="text-xl font-bold text-amber-300"><i class="fa-solid fa-award mr-2"></i>1 Million Views Creator Royalty Scheme</h2>
          <p class="text-xs text-emerald-100">Agar aapne Green Earth Organic Ash par video banayi hai aur usme <b>1M+ views, 10K+ comments, 1K+ shares</b> aaye hain, toh yahan link submit karein:</p>
          <input type="url" id="royaltyVideoUrl" placeholder="https://instagram.com/reel/..." class="w-full p-2.5 rounded bg-emerald-950 border border-emerald-700 text-sm text-white">
          <button onclick="window.submitRoyaltyClaim()" class="w-full py-2.5 bg-amber-600 hover:bg-amber-500 font-bold rounded-lg text-white text-sm">Submit Video Claim</button>
        </div>
      </div>
    `;
  });
}

window.toggleDashboardPass = function() {
  const p = document.getElementById('authPass');
  if(p) p.type = p.type === 'password' ? 'text' : 'password';
};

window.registerUserAccount = async function() {
  const name = document.getElementById('authName').value.trim();
  const phone = document.getElementById('authPhone').value.trim();
  const whatsapp = document.getElementById('authWhatsapp').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const address = document.getElementById('authAddress').value.trim();
  const password = document.getElementById('authPass').value;

  if(!name || !phone || !whatsapp || !email || !address || !password) {
    alert("Kripya saare fields bharein!");
    return;
  }

  const q = query(collection(db, "users"), where("phone", "==", phone));
  const snap = await getDocs(q);
  if (!snap.empty) {
    alert("Yeh mobile number pehle se registered hai! Ek mobile par 1 hi account ban sakta hai.");
    return;
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(res.user);
    await setDoc(doc(db, "users", res.user.uid), { uid: res.user.uid, name, phone, whatsapp, email, address });
    alert("Account ban gaya! Gmail par verification link bheja gaya hai.");
    renderUserDashboard('dashboardContainer');
  } catch(e) { alert("Error: " + e.message); }
};

window.loginUserAccount = async function() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Login Safal Raha!");
    renderUserDashboard('dashboardContainer');
  } catch(e) { alert("Error: " + e.message); }
};

window.userLogout = function() {
  signOut(auth).then(() => { renderUserDashboard('dashboardContainer'); });
};

window.submitRoyaltyClaim = async function() {
  const url = document.getElementById('royaltyVideoUrl').value.trim();
  if(!url) { alert("Video link daalein!"); return; }
  const user = auth.currentUser;
  if(!user) { alert("Pehle login karein!"); return; }

  await addDoc(collection(db, "creator_claims"), {
    userId: user.uid, email: user.email, videoUrl: url, status: "Pending Verification"
  });
  alert("Claim successfully submit ho gaya!");
  document.getElementById('royaltyVideoUrl').value = "";
};
