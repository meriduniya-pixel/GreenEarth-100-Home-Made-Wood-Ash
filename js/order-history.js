// js/order-history.js
import { auth, db, collection, query, where, getDocs } from "./firebase-config.js";

export async function renderOrderHistory(containerId) {
  const container = document.getElementById(containerId);
  const user = auth.currentUser;

  if (!user) {
    container.innerHTML = `<div class="bg-emerald-900 p-6 rounded-xl text-center text-amber-300">Tracking dekhne ke liye login karein.</div>`;
    return;
  }

  container.innerHTML = `<p class="text-emerald-300">Loading Tracking...</p>`;
  const q = query(collection(db, "orders"), where("userId", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    container.innerHTML = `<div class="bg-emerald-900 p-6 rounded-xl text-center text-emerald-200">Aapne abhi tak koi order nahi kiya hai.</div>`;
    return;
  }

  let html = `<div class="max-w-2xl mx-auto space-y-4"><h2 class="text-xl font-bold text-sky-300">📦 Aapke Orders & Speed Post Tracking</h2>`;
  snap.forEach(docSnap => {
    const o = docSnap.data();
    html += `
      <div class="bg-emerald-900 border border-emerald-700 p-4 rounded-xl space-y-2 text-xs">
        <div class="flex justify-between font-bold text-amber-300"><span>${o.productTitle}</span><span>₹${o.amountPaid}</span></div>
        <p>Status: <b class="text-green-300">${o.orderStatus}</b></p>
        <p>Speed Post Tracking No: <b class="text-white">${o.speedPostTrackingNo}</b></p>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}
