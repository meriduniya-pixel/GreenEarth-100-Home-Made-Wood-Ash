// js/app.js
import { auth, onAuthStateChanged } from "./firebase-config.js";
import { renderUserDashboard } from "./user-dashboard.js";
import { renderAdminPanel } from "./admin-panel.js";
import { processOnlinePayment } from "./payment.js";
import { renderOrderHistory } from "./order-history.js";
import { initAshAnimation } from "./animation.js";

// Global Products List
window.productsList = [
  { id: "500g", title: "Green Earth Pure Wood Ash (500g)", price: 199, weight: "500 Gram", img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" },
  { id: "1kg", title: "Green Earth Pure Wood Ash (1 Kg)", price: 299, weight: "1 Kilogram", img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" },
  { id: "2kg", title: "Green Earth Pure Wood Ash (2 Kg Jumbo Pack)", price: 499, weight: "2 Kilogram", img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" }
];

window.showSection = function(sectionId) {
  const sections = ['homeSection', 'userDashboardSection', 'adminPanelSection', 'paymentSection', 'orderHistorySection', 'royaltySection'];
  sections.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.add('hidden');
  });

  const active = document.getElementById(sectionId);
  if (active) active.classList.remove('hidden');

  if (sectionId === 'userDashboardSection') renderUserDashboard('dashboardContainer');
  if (sectionId === 'adminPanelSection') renderAdminPanel('adminContainer');
  if (sectionId === 'orderHistorySection') renderOrderHistory('orderHistoryContainer');
};

window.renderProducts = function() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.innerHTML = window.productsList.map(p => `
    <div class="bg-emerald-900 border border-emerald-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-emerald-600 transition">
      <div class="space-y-3">
        <img src="${p.img}" class="w-full h-48 object-cover rounded-xl" alt="${p.title}">
        <h3 class="font-bold text-lg text-emerald-200">${p.title}</h3>
        <p class="text-xs text-emerald-300">• Gamlon & Kheti Ke Liye Natural Khad<br>• Speed Post Direct Delivery</p>
        <p class="text-xl font-black text-amber-300">₹${p.price}</p>
      </div>

      <div class="mt-4 space-y-2">
        <button onclick="window.triggerPayment('${p.id}')" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-lg transition">
          Online Payment Se Kharidein
        </button>
        <p class="text-[10px] text-center text-red-300">Strict Policy: No Cancellation / No Refund</p>
      </div>
    </div>
  `).join('');
};

window.triggerPayment = function(productId) {
  processOnlinePayment(productId);
};

window.openAdminModal = function() {
  document.getElementById('adminAuthModal').classList.remove('hidden');
};

window.closeAdminModal = function() {
  document.getElementById('adminAuthModal').classList.add('hidden');
};

window.verifyAdminPasscode = function() {
  const code = document.getElementById('adminPasscode').value;
  if (code === "5555") {
    closeAdminModal();
    window.showSection('adminPanelSection');
  } else {
    alert("Galat Admin Passcode!");
  }
};

window.submitRoyaltyClaim = function() {
  const url = document.getElementById('royaltyVideoUrl').value;
  if (!url) { alert("Pehle Video URL Daalein!"); return; }
  alert("Claim successfully submit ho gaya hai! Verification ke baad hamari team aapse sampark karegi.");
  document.getElementById('royaltyVideoUrl').value = "";
};

// App Init
onAuthStateChanged(auth, (user) => {
  const btn = document.getElementById('navUserBtn');
  if (btn) {
    btn.innerHTML = user ? `<i class="fa-solid fa-user-check mr-1"></i> My Account` : `<i class="fa-solid fa-user-circle mr-1"></i> User Dashboard`;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  window.renderProducts();
  initAshAnimation();
});
