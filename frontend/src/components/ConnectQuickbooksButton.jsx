// // src/components/ConnectQuickbooksButton.jsx
// import React, { useEffect, useState } from "react";

// export default function ConnectQuickbooksButton() {
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     // Check status on mount
//     fetch("https://backend.lipsempirebyarielle.store/api/v1/status/")
//       .then(r => r.json())
//       .then(data => setConnected(Boolean(data.connected)))
//       .catch(() => setConnected(false));

//     // Listener for popup auth result
//     function onMessage(e) {
//       // Security: check origin if needed
//       // if (e.origin !== window.location.origin) return;
//       const { provider, status, message } = e.data || {};
//       if (provider === "quickbooks") {
//         if (status === "success") {
//           setConnected(true);
//           window.alert("QuickBooks connecté");
//         } else {
//           window.alert("Erreur QuickBooks: " + (message || "unknown"));
//         }
//       }
//     }
//     window.addEventListener("message", onMessage, false);
//     return () => window.removeEventListener("message", onMessage);
//   }, []);

//   const openConnectPopup = () => {
//     // Ouvre la page qui redirige vers Intuit (backend)
//     const width = 600, height = 700;
//     const left = (window.screen.width / 2) - (width / 2);
//     const top = (window.screen.height / 2) - (height / 2);
//    window.open("https://backend.lipsempirebyarielle.store/api/v1/connect/", "quickbooks_connect", `width=${width},height=${height},top=${top},left=${left}`);

//   };

//   const handleDisconnect = async () => {
//     try {
//       const res = await fetch("https://backend.lipsempirebyarielle.store/api/v1/disconnect/", { method: "POST" });
//       if (res.ok) {
//         setConnected(false);
//         alert("Déconnecté de QuickBooks");
//       } else {
//         alert("Impossible de déconnecter QuickBooks");
//       }
//     } catch (err) {
//       alert("Erreur réseau");
//     }
//   };

//   return (
//     <>
//       {connected ? (
//         <div className="d-flex align-items-center">
//           <button className="btn btn-sm btn-outline-success me-2" onClick={() => alert("QuickBooks déjà connecté")}>QuickBooks connecté</button>
//           <button className="btn btn-sm btn-outline-danger" onClick={handleDisconnect}>Déconnecter</button>
//         </div>
//       ) : (
//         <button className="btn btn-sm btn-primary" onClick={openConnectPopup}>Connecter QuickBooks</button>
//       )}
//     </>
//   );
// }
