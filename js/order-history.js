// js/order-history.js
import { auth, db, collection, query, where, getDocs } from "./firebase-config.js";

export async function renderOrderHistory(containerId) {
  const container = document.getElementById(containerId);
  const user = auth.currentUser;

  if (!user) {
    container.innerHTML = `
      <div class="bg-emerald-900 border border-emerald-700 p-6 rounded-2xl text-center">
        <p class="text-amber-300">Apne Purane Orders aur Speed Post Tracking dekhne ke liye Login karein.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `<p class="text-emerald-300">Loading Order History...</p>`;

  try {
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `
        <div class="bg-emerald-900 border border-emerald-700 p-6 rounded-2xl text-center space-y-2">
          <p class="text-emerald-200">Aapne abhi tak koi order nahi kiya hai.</p>
        </div>
      `;
      return;
    }

    let html = `<div class="max-w-3xl mx-auto space-y-4">
      <h2 class="text-2xl font-bold text-sky-300"><i class="fa-solid fa-truck-fast mr-2"></i>Aapke Orders & Speed Post Status</h2>`;

    snap.forEach(docSnap => {
      const o = docSnap.data();
      html += `
        <div class="bg-emerald-900 border border-emerald-700 p-5 rounded-xl space-y-3 shadow-lg">
          <div class="flex justify-between items-center border-b border-emerald-800 pb-2">
            <h3 class="font-bold text-amber-300">${o.productTitle}</h3>
            <span class="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700">₹${o.amountPaid} Paid</span>
          </div>

          <div class="text-xs text-emerald-200 space-y-1">
            <p>• Date: ${o.orderDate}</p>
            <p>• Address: ${o.deliveryAddress}</p>
            <p>• Status: <b class="text-green-300">${o.orderStatus}</b></p>
            <p>• Speed Post Tracking No: <b class="text-amber-200 font-mono text-sm">${o.speedPostTrackingNo}</b></p>
          </div>

          <!-- Policy Reminder Badge -->
          <div class="no-policy-badge p-2 rounded text-[10px]">
            No Cancellation / Non-Refundable Item. Direct Speed Post Delivery.
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = `<p class="text-rose-400">Error loading orders: ${e.message}</p>`;
  }
}
