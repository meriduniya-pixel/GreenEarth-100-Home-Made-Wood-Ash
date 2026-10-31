// js/admin.js
import { db, collection, getDocs, doc, updateDoc } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('adminPanelContainer');
  if(!container) return;

  const pass = prompt("Admin Passcode Enter Karein (Default: 5555):");
  if(pass !== "5555") {
    alert("Galat Password!");
    window.location.href = "index.html";
    return;
  }

  loadAdminOrders();
});

async function loadAdminOrders() {
  const container = document.getElementById('adminPanelContainer');
  const snapshot = await getDocs(collection(db, "orders"));

  if(snapshot.empty) {
    container.innerHTML = `<p class="text-slate-400">Abhi koi orders nahi hain.</p>`;
    return;
  }

  let html = `<h2 class="text-lg font-bold text-sky-400">Customer Orders & Speed Post Management</h2>
  <div class="overflow-x-auto"><table class="w-full text-left text-xs border-collapse">
    <tr class="border-b border-slate-700 bg-slate-800 text-slate-300">
      <th class="p-2">Customer</th><th class="p-2">Address</th><th class="p-2">Product</th><th class="p-2">Tracking No.</th><th class="p-2">Action</th>
    </tr>`;

  snapshot.forEach(docSnap => {
    const o = docSnap.data();
    html += `
      <tr class="border-b border-slate-800">
        <td class="p-2">${o.userName}<br>${o.userPhone}</td>
        <td class="p-2">${o.deliveryAddress}</td>
        <td class="p-2">${o.productTitle} (₹${o.amountPaid})</td>
        <td class="p-2"><input type="text" id="tr_${docSnap.id}" value="${o.speedPostTrackingNo || ''}" class="p-1 rounded bg-slate-950 border border-slate-700 text-white w-28"></td>
        <td class="p-2"><button onclick="window.saveTrack('${docSnap.id}')" class="px-2 py-1 bg-sky-600 rounded text-white font-bold">Save</button></td>
      </tr>
    `;
  });
  html += `</table></div>`;
  container.innerHTML = html;
}

window.saveTrack = async function(id) {
  const num = document.getElementById(`tr_${id}`).value;
  await updateDoc(doc(db, "orders", id), { speedPostTrackingNo: num, orderStatus: "Dispatched via Speed Post" });
  alert("Tracking number update ho gaya!");
};
