// app.js
import { 
  auth, db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged,
  doc, setDoc, getDoc, getDocs, collection, addDoc, updateDoc, query, where 
} from "./firebase-config.js";

// Global Store State
let currentUser = null;
let isLoginMode = false;
let productsData = [
  { id: "500g", title: "Green Earth Pure Wood Ash (500g)", price: 199, weight: "500 Gram", img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" },
  { id: "1kg", title: "Green Earth Pure Wood Ash (1 Kg)", price: 299, weight: "1 Kilogram", img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" },
  { id: "2kg", title: "Green Earth Pure Wood Ash (2 Kg Jumbo Pack)", price: 499, weight: "2 Kilogram", img: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2f?auto=format&fit=crop&w=600&q=80" }
];

window.showSection = function(sectionId) {
  document.getElementById('shopSection').style.display = 'none';
  document.getElementById('referralSection').style.display = 'none';
  document.getElementById('trackOrderSection').style.display = 'none';
  document.getElementById('adminPanelSection').style.display = 'none';
  document.getElementById(sectionId).style.display = 'flex';
};

window.openModal = function(id) { document.getElementById(id).style.display = 'flex'; };
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };

window.togglePasswordVisibility = function() {
  const pField = document.getElementById('authPassword');
  pField.type = pField.type === 'password' ? 'text' : 'password';
};

window.toggleAuthMode = function() {
  isLoginMode = !isLoginMode;
  document.getElementById('authTitle').innerText = isLoginMode ? "Account Login Karein" : "Naya Account Banayein";
  document.getElementById('registerFields').style.display = isLoginMode ? "none" : "block";
  document.getElementById('authSubmitBtn').innerText = isLoginMode ? "Login" : "Register & Verify Gmail";
  document.getElementById('authToggleText').innerText = isLoginMode ? "Naya account banana hai? Register karein" : "Pehle se account hai? Login karein";
};

// Render Products
function renderProducts() {
  const container = document.getElementById('shopSection');
  container.innerHTML = "";
  productsData.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.img}" class="product-img" alt="${p.title}">
        <h3 style="margin:10px 0;">${p.title}</h3>
        <p style="color:#2d6a4f; font-weight:bold; font-size:1.2rem;">₹${p.price}</p>
        <p style="color:#666; font-size:0.9rem;">Mode: Direct Speed Post Delivery</p>
        <button onclick="buyProduct('${p.id}')" class="btn-green">Online Payment Se Kharidein</button>
      </div>
    `;
  });
}

// Single Mobile Check & Registration
window.handleAuthSubmit = async function() {
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  if (isLoginMode) {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if(!res.user.emailVerified) {
        alert("Pehle apne Gmail par jaakar verification link par click karein!");
        return;
      }
      alert("Login Saphal Raha!");
      closeModal('loginModal');
    } catch(err) { alert("Error: " + err.message); }
  } else {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const address = document.getElementById('regAddress').value.trim();

    if(!name || !phone || !whatsapp || !email || !address || !password) {
      alert("Kripya saare mandatory fields bharein!");
      return;
    }

    // Check if phone number already exists in Firestore
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert("Yeh Mobile Number pehle se kisi dusre account ke sath registered hai! Ek mobile par sirf 1 account allowed hai.");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(res.user);
      
      // Save User Data in Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name, phone, whatsapp, email, address,
        createdAt: new Date().toISOString()
      });

      alert("Aapke Gmail par Verification Link bheja gaya hai. Gmail par jaakar click karein aur account activate karein!");
      closeModal('loginModal');
    } catch(err) { alert("Error: " + err.message); }
  }
};

// Purchase / Payment Gateway Trigger
window.buyProduct = async function(productId) {
  if (!auth.currentUser) {
    alert("Kharidne se pehle account Login ya Register karein!");
    openModal('loginModal');
    return;
  }
  if (!auth.currentUser.emailVerified) {
    alert("Aapka Gmail Verified nahi hai. Kripya Gmail inbox check karke verify karein!");
    return;
  }

  const prod = productsData.find(p => p.id === productId);
  
  // Instant Razorpay/UPI Direct Payment Simulation
  const confirmPay = confirm(`Total Amount: ₹${prod.price}\n\nStrictly Online Payment Only (UPI/Card/Netbanking).\n\nKya aap payment complete karke order confirm karna chahte hain?`);
  
  if (confirmPay) {
    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const uData = userDoc.data();

    await addDoc(collection(db, "orders"), {
      userId: auth.currentUser.uid,
      userName: uData.name,
      userPhone: uData.phone,
      userWhatsapp: uData.whatsapp,
      userEmail: uData.email,
      deliveryAddress: uData.address,
      productTitle: prod.title,
      amountPaid: prod.price,
      paymentMethod: "Online UPI/Prepaid",
      paymentStatus: "CONFIRMED",
      orderStatus: "Packed & Ready for Speed Post",
      speedPostTrackingNo: "Pending",
      orderDate: new Date().toLocaleDateString('hi-IN')
    });

    alert("Payment Successful! Aapka order book ho gaya hai. Aap 'My Orders' section mein ise track kar sakte hain.");
  }
};

// Admin Panel Access
window.openAdminCheck = function() {
  const pin = prompt("Admin Security Passcode Enter Karein:");
  if (pin === "5555") { // Custom Admin Password
    showSection('adminPanelSection');
    loadAdminDashboard();
  } else {
    alert("Galat Admin Password!");
  }
};

async function loadAdminDashboard() {
  // Render Price Change Box
  const priceBox = document.getElementById('adminPriceChangeBox');
  priceBox.innerHTML = "";
  productsData.forEach(p => {
    priceBox.innerHTML += `
      <div style="border:1px solid #ddd; padding:10px; border-radius:8px;">
        <b>${p.weight} Pack</b><br>
        Price: ₹<input type="number" id="price_${p.id}" value="${p.price}" style="width:80px;"><br>
        Image URL: <input type="text" id="img_${p.id}" value="${p.img}" style="width:150px;"><br>
        <button onclick="updateProductAdmin('${p.id}')" class="btn-green" style="margin-top:5px;">Update</button>
      </div>
    `;
  });

  // Render Orders Table
  const ordersTable = document.getElementById('adminOrdersTable');
  ordersTable.innerHTML = "Loading Orders...";
  const querySnapshot = await getDocs(collection(db, "orders"));
  
  let html = `<table border="1" cellpadding="8" style="width:100%; border-collapse:collapse; text-align:left;">
    <tr style="background:#f2f2f2;">
      <th>Customer & Contact</th>
      <th>Address</th>
      <th>Product & Paid Amount</th>
      <th>Speed Post Tracking No.</th>
      <th>Action</th>
    </tr>`;

  querySnapshot.forEach((docSnap) => {
    const o = docSnap.data();
    html += `
      <tr>
        <td><b>${o.userName}</b><br>Ph: ${o.userPhone}<br>WA: ${o.userWhatsapp}<br>${o.userEmail}</td>
        <td>${o.deliveryAddress}</td>
        <td>${o.productTitle}<br><b style="color:green;">₹${o.amountPaid} (${o.paymentStatus})</b></td>
        <td><input type="text" id="track_${docSnap.id}" value="${o.speedPostTrackingNo}"></td>
        <td><button onclick="saveTracking('${docSnap.id}')" class="btn-green">Tracking Save</button></td>
      </tr>
    `;
  });
  html += `</table>`;
  ordersTable.innerHTML = html;
}

window.updateProductAdmin = function(pId) {
  const newPrice = document.getElementById(`price_${pId}`).value;
  const newImg = document.getElementById(`img_${pId}`).value;
  
  let p = productsData.find(prod => prod.id === pId);
  p.price = parseInt(newPrice);
  p.img = newImg;
  
  renderProducts();
  alert(`${p.weight} pack ki nai price ₹${newPrice} update ho gayi hai!`);
};

window.saveTracking = async function(orderDocId) {
  const trackNo = document.getElementById(`track_${orderDocId}`).value;
  await updateDoc(doc(db, "orders", orderDocId), {
    speedPostTrackingNo: trackNo,
    orderStatus: "Dispatched via Speed Post"
  });
  alert("Speed Post Tracking Number Customer ke liye update kar diya gaya hai!");
};

// Video Royalty Form Submit
window.submitCreatorVideo = async function() {
  const url = document.getElementById('videoUrlInput').value.trim();
  if(!url) { alert("Pehle video link dalein!"); return; }

  if(!auth.currentUser) {
    alert("Claim submit karne ke liye account login hona zaroori hai!");
    openModal('loginModal');
    return;
  }

  await addDoc(collection(db, "creator_claims"), {
    userId: auth.currentUser.uid,
    userEmail: auth.currentUser.email,
    videoUrl: url,
    status: "Pending Verification",
    submittedAt: new Date().toISOString()
  });

  alert("Aapka 1M Views Video Claim Administrator ke paas chala gaya hai. Verification ke baad aapko call/mail aayega!");
  document.getElementById('videoUrlInput').value = "";
};

// On App Initialization
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user && user.emailVerified) {
    document.getElementById('userControls').innerHTML = `
      <span style="color:white; margin-right:10px;">Hi, ${user.email.split('@')[0]}</span>
      <button onclick="signOutAuth()" class="btn-green" style="width:auto; background:#e63946;">Logout</button>
    `;
  }
});

window.signOutAuth = function() {
  signOut(auth).then(() => {
    alert("Logout ho gaye!");
    location.reload();
  });
};

renderProducts();
