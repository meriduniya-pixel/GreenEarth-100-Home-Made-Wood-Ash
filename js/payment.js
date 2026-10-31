// js/payment.js
import { auth, db, doc, getDoc, collection, addDoc } from "./firebase-config.js";

export async function processOnlinePayment(productId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Kharidne se pehle User Dashboard mein Login karein!");
    window.showSection('userDashboardSection');
    return;
  }
  if (!user.emailVerified) {
    alert("Pehle apne Gmail inbox mein jaakar Email verify karein!");
    return;
  }

  const prod = window.productsList.find(p => p.id === productId);
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const uData = userDoc.exists() ? userDoc.data() : {};

  const confirmMsg = `Product: ${prod.title}\nAmount: ₹${prod.price}\n\nNotice:\n• Cash on Delivery (COD) Available Nahi Hai\n• Strict Prepaid Online Payment\n• No Refund / No Cancellation\n\nKya aap payment confirm karna chahte hain?`;

  if (confirm(confirmMsg)) {
    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      userName: uData.name || 'N/A',
      userPhone: uData.phone || 'N/A',
      userWhatsapp: uData.whatsapp || 'N/A',
      userEmail: user.email,
      deliveryAddress: uData.address || 'N/A',
      productTitle: prod.title,
      amountPaid: prod.price,
      paymentMethod: "Online UPI (COD Not Available)",
      paymentStatus: "CONFIRMED",
      orderStatus: "Packed & Ready for Speed Post",
      speedPostTrackingNo: "Pending Dispatch",
      orderDate: new Date().toLocaleDateString('hi-IN')
    });

    alert("Payment Successful! Order book ho gaya hai. Tracking section mein dekhein.");
    window.showSection('orderHistorySection');
  }
}
