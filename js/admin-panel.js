// js/admin-panel.js
import { db, collection, getDocs, doc, updateDoc } from "./firebase-config.js";

export function renderAdminPanel(containerId) {
  const container = document.getElementById(containerId);

  container.innerHTML = `
    <div class="bg-emerald-900 border border-emerald-700 p-6 rounded-2xl space-y-6">
      <div class="flex justify-between items-center border-b border-emerald-800 pb-4">
        <h2 class="text-2xl font-bold text-rose-300"><i class="fa-solid fa-user-shield mr-2"></i>Admin Dashboard</h2>
        <span class="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1 rounded-full">Owner Access</span>
      </div>

      <!-- Pricing and Image Updates -->
      <div class="bg-emerald-950 p-4 rounded-xl border border-emerald-800 space-y-3">
        <h3 class="text-lg font-bold text-amber-300">Product Prices & Images Update</h3>
        <div id="adminProductsControl" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Dynamically populated -->
        </div>
      </div>

      <!-- Orders Management -->
      <div class="bg-emerald-950 p-4 rounded-xl border border-emerald-800 space-y-3">
        <h3 class="text-lg font-bold text-sky-300">Customer Orders & Speed Post Tracking</h3>
        <div id="adminOrdersTableContainer" class="overflow-x-auto text-xs">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>
  `;

  loadAdminData();
}

async function loadAdminData() {
  const prodContainer = document.getElementById('adminProductsControl');
  if (prodContainer && window.productsList) {
    prodContainer.innerHTML = window.productsList.map(p => `
      <div class="bg-emerald-900 p-3 rounded-lg border border-emerald-700 space-y-2">
        <p class="font-bold text-white">${p.title}</p>
        <div>
          <label class="text-xs text-emerald-300">Price (₹):</label>
          <input type="number" id="admPrice_${p.id}" value="${p.price}" class="w-full p-1.5 rounded bg-emerald-950 border border-emerald-700 text-white text-xs">
        </div>
        <div>
          <label class="text-xs text-emerald-300">Image URL:</label>
          <input type="text" id="admImg_${p.id}" value="${p.img}" class="w-full p-1.5 rounded bg-emerald-950 border border-emerald-700 text-white text-xs">
        </div>
        <button onclick="window.saveAdminProduct('${p.id}')" class="w-full py-1.5 bg-amber-600 hover:bg-amber-500 font-bold rounded text-white text-xs">Update Item</button>
      </div>
    `).join('');
  }

  const ordersContainer = document.getElementById('adminOrdersTableContainer');
  if (ordersContainer) {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      if (snapshot.empty) {
        ordersContainer.innerHTML = `<p class="text-emerald-400 p-2">Abhi koi orders nahi hain.</p>`;
        return;
      }

      let html = `<table class="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr class="border-b border-emerald-700 bg-emerald-900 text-emerald-200">
            <th class="p-2">Customer</th>
            <th class="p-2">Address & Contact</th>
            <th class="p-2">Product</th>
            <th class="p-2">Payment Status</th>
            <th class="p-2">Speed Post Tracking</th>
            <th class="p-2">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-emerald-800 text-emerald-100">`;

      snapshot.forEach(docSnap => {
        const o = docSnap.data();
        html += `
          <tr>
            <td class="p-2"><b>${o.userName || 'N/A'}</b><br>${o.userEmail}</td>
            <td class="p-2">Ph: ${o.userPhone}<br>WA: ${o.userWhatsapp}<br>${o.deliveryAddress}</td>
            <td class="p-2">${o.productTitle}<br><b>₹${o.amountPaid}</b></td>
            <td class="p-2"><span class="px-2 py-0.5 bg-green-950 text-green-300 border border-green-800 rounded">PAID (Online)</span></td>
            <td class="p-2"><input type="text" id="trackNo_${docSnap.id}" value="${o.speedPostTrackingNo || ''}" class="p-1 rounded bg-emerald-950 border border-emerald-700 text-white w-32"></td>
            <td class="p-2"><button onclick="window.updateSpeedPostNo('${docSnap.id}')" class="px-2 py-1 bg-sky-600 rounded text-white font-bold">Save No.</button></td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      ordersContainer.innerHTML = html;
    } catch(e) {
      ordersContainer.innerHTML = `<p class="text-rose-400">Error loading orders: ${e.message}</p>`;
    }
  }
}

window.saveAdminProduct = function(pId) {
  const p = window.productsList.find(x => x.id === pId);
  if (p) {
    p.price = parseInt(document.getElementById(`admPrice_${pId}`).value);
    p.img = document.getElementById(`admImg_${pId}`).value;
    window.renderProducts();
    alert("Product details update ho gayi hain!");
  }
};

window.updateSpeedPostNo = async function(orderDocId) {
  const trackNo = document.getElementById(`trackNo_${orderDocId}`).value;
  await updateDoc(doc(db, "orders", orderDocId), {
    speedPostTrackingNo: trackNo,
    orderStatus: "Dispatched via Speed Post"
  });
  alert("Speed Post Tracking Number Update Ho Gaya!");
};
