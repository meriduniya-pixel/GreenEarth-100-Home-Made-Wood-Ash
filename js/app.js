// js/app.js
import { auth, onAuthStateChanged } from "./firebase-config.js";
import { renderUserDashboard } from "./user-dashboard.js";
import { processOnlinePayment } from "./payment.js";
import { renderOrderHistory } from "./order-history.js";

window.productsList = [
  { id: "500g", title: "Green Earth Pure Wood Ash (500g)", price: 199, img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" },
  { id: "1kg", title: "Green Earth Pure Wood Ash (1 Kg)", price: 299, img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" },
  { id: "2kg", title: "Green Earth Pure Wood Ash (2 Kg Jumbo Pack)", price: 499, img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" }
];

window.showSection = function(id) {
  ['homeSection', 'userDashboardSection', 'orderHistorySection'].forEach(s => {
    const el = document.getElementById(s);
    if(el) el.classList.add('hidden');
  });
  const target = document.getElementById(id);
  if(target) target.classList.remove('hidden');

  if(id === 'userDashboardSection') renderUserDashboard('dashboardContainer');
  if(id === 'orderHistorySection') renderOrderHistory('orderHistoryContainer');
};

window.renderProducts = function() {
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = window.productsList.map(p => `
    <div class="bg-emerald-900 border border-emerald-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
      <div>
        <img src="${p.img}" class="w-full h-40 object-cover rounded-lg mb-3">
        <h3 class="font-bold text-emerald-200">${p.title}</h3>
        <p class="text-xl font-black text-amber-300 mt-2">₹${p.price}</p>
      </div>
      <button onclick="window.triggerPayment('${p.id}')" class="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-lg text-sm">Online Pay (No COD)</button>
    </div>
  `).join('');
};

window.triggerPayment = function(id) { processOnlinePayment(id); };

onAuthStateChanged(auth, (user) => {
  const btn = document.getElementById('navUserBtn');
  if(btn) btn.innerHTML = user ? `<i class="fa-solid fa-user-check mr-1"></i> Dashboard & Royalty` : `<i class="fa-solid fa-user-circle mr-1"></i> Login / Register`;
});

document.addEventListener("DOMContentLoaded", () => {
  window.renderProducts();
});
