const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

const { db: clientDb } = require("./firebase");
const { 
  collection, query, where, getDocs, getDoc, doc, updateDoc, setDoc, addDoc 
} = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

// ── Firebase Admin Init ──────────────────────────────
// Download your service account key from:
// Firebase Console → Project Settings → Service Accounts → Generate new private key
// Save it as backend/serviceAccountKey.json
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── Transporter Config (Use Gmail app password or similar) ─────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ── ROUTE: Subscribe ────────────────────────────────
app.post("/api/payment/subscribe", async (req, res) => {
  try {
    const uid = req.headers["uid"];
    const { planName, price, paymentMethod, companyName } = req.body;

    // Validate inputs
    if (!uid) {
      return res.status(400).json({ error: "User not authenticated" });
    }
    if (!planName || !companyName) {
      return res.status(400).json({ error: "Plan and company name required" });
    }

    // Create new company
    const companyId = db.collection("companies").doc().id;

    try {
      // Create company (using Client SDK fallback)
      await clientSetDoc(doc(clientDb, "companies", companyId), {
        company_id:     companyId,
        name:           companyName,
        owner_uid:      uid,
        plan:           planName.toLowerCase(),
        status:         "pending_approval",
        employee_count: 1,
        created_at:     new Date(),
      });
    } catch (err) {
      console.error("Company creation error:", err.message);
      return res.status(500).json({ error: "Failed to create company: " + err.message });
    }

    try {
      // Update user with company_id and role
      await updateDoc(doc(clientDb, "users", uid), {
        company_id: companyId,
        role:       "admin",
        status:     "pending_approval",
      });
    } catch (err) {
      // User might not exist yet, try set instead
      try {
        await clientSetDoc(doc(clientDb, "users", uid), {
          uid:         uid,
          company_id:  companyId,
          role:        "admin",
          status:      "pending_approval",
          created_at:  new Date(),
        });
      } catch (setErr) {
        console.error("User set error:", setErr.message);
        return res.status(500).json({ error: "Failed to update user: " + setErr.message });
      }
    }

    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1000));

    // Set subscription period
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    try {
      // Write subscription to Firestore (using Client SDK fallback)
      await setDoc(doc(clientDb, "subscriptions", companyId), {
        company_id:         companyId,
        plan:               planName.toLowerCase(),
        status:             "pending_approval",
        payment_method:     paymentMethod || "dummy_card",
        amount_paid:        price,
        current_period_end: periodEnd,
        created_at:         new Date(),
      });
    } catch (subErr) {
      console.error("Subscription creation error:", subErr.message);
      return res.status(500).json({ error: "Failed to create subscription: " + subErr.message });
    }

    // Update company with subscription info
    try {
      await updateDoc(doc(clientDb, "companies", companyId), {
        plan:     planName.toLowerCase(),
        approved: false,
      });
    } catch (updateErr) {
      console.error("Company update error:", updateErr.message);
    }

    return res.status(200).json({
      success:   true,
      companyId,
      plan:      planName,
      message:   "Subscription created successfully",
    });

  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── ROUTE: Get Subscription ─────────────────────────
app.get("/api/subscription/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const subscriptionDoc = await getDoc(doc(clientDb, "subscriptions", companyId));

    if (!subscriptionDoc.exists()) {
      return res.status(404).json({ error: "No subscription found" });
    }

    return res.status(200).json({ subscription: subscriptionDoc.data() });
  } catch (error) {
    console.error("Get subscription error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── ROUTE: Cancel Subscription ──────────────────────
app.post("/api/subscription/cancel", async (req, res) => {
  try {
    const { companyId } = req.body;

    await updateDoc(doc(clientDb, "subscriptions", companyId), {
      status: "cancelled",
    });
    await updateDoc(doc(clientDb, "companies", companyId), {
      plan: "free",
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── ROUTE: Create User Directly ──────────────────────
app.post("/api/users/create", async (req, res) => {
  try {
    const { companyId, email, password, username } = req.body;
    const uid = req.headers["uid"];

    if (!uid || !companyId || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username || email.split('@')[0],
    });

    // 2. Create user document in Firestore (Now using Client SDK fallback)
    await setDoc(doc(clientDb, "users", userRecord.uid), {
      uid: userRecord.uid,
      email,
      username: username || email.split('@')[0],
      role: "user",
      companyId: companyId,
      status: "active",
      created_at: new Date(),
      last_login: new Date()
    });

    return res.status(200).json({
      success: true,
      userId: userRecord.uid,
      message: `User ${email} created successfully`,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── ROUTE: Create Invite ─────────────────────────────
app.post("/api/users/invite", async (req, res) => {
  try {
    const { companyId, email } = req.body;
    const uid = req.headers["uid"];

    if (!uid || !companyId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 mins expiry

    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Create invite
    const inviteRef = await addDoc(collection(clientDb, "invites"), {
      companyId,
      email,
      invitedBy: uid,
      status: "pending",
      token,
      createdAt: new Date(),
      expiresAt,
    });

    // ✅ Create invite link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteLink = `${frontendUrl}/magic-login?token=${token}`;

    // ✅ Send Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await resend.emails.send({
  from: "onboarding@resend.dev",
  to: email,
  subject: "You've been invited!",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #6366f1;">Welcome to ToDoS!</h2>
              
              <p>You have been invited to join a company workspace.</p>

              <a href="${inviteLink}" 
                 style="
                   display:inline-block;
                   margin-top:10px;
                   padding:10px 20px;
                   background:#6366f1;
                   color:white;
                   text-decoration:none;
                   border-radius:5px;
                   font-weight:bold;
                 ">
                 Accept Invitation
              </a>

              <p style="margin-top:20px; font-size:12px; color:gray;">
                This link will expire in 7 days.
              </p>
            </div>
          `,
        });

        console.log(`✅ Email sent to ${email}`);
      } catch (err) {
        console.error("❌ Email delivery failed:", err.message);
      }
    } else {
      console.warn("⚠️ Email config missing. Invite stored but email NOT sent.");
    }

    return res.status(200).json({
      success: true,
      inviteId: inviteRef.id,
      inviteLink, // 🔥 useful for testing
      message: `Invite sent to ${email}`,
    });

  } catch (error) {
    console.error("❌ Create invite error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── ROUTE: Get Pending Invites for Email ─────────────
app.get("/api/users/invites", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email parameter required" });
    }

    console.log(`🔍 Fetching invites for: ${email}`);

    const q = query(
      collection(clientDb, "invites"),
      where("email", "==", email),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    const invites = snapshot.docs.map((doc) => ({
      inviteId: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Found ${invites.length} pending invites`);

    return res.status(200).json({ invites });

  } catch (error) {
    console.error("❌ Get invites error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

// ── ROUTE: Accept Invite ──────────────────────────────
app.post("/api/users/accept-invite", async (req, res) => {
  try {
    const { inviteId } = req.body;
    const uid = req.headers["uid"];

    if (!inviteId || !uid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const inviteDocRef = doc(clientDb, "invites", inviteId);
    const inviteDoc = await getDoc(inviteDocRef);

    if (!inviteDoc.exists()) {
      return res.status(404).json({ error: "Invite not found" });
    }

    const invite = inviteDoc.data();
    const { companyId, email } = invite;

    // Update invite status
    await updateDoc(inviteDocRef, {
      status: "accepted",
      acceptedAt: new Date(),
    });

    // Update user with company info
    await updateDoc(doc(clientDb, "users", uid), {
      companyId,
      role: "user",
      status: "active",
    });

    return res.status(200).json({
      success: true,
      message: "Invite accepted successfully",
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ── ROUTE: Verify Invite Token ──────────────────────────
app.post("/api/users/verify-invite", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ error: "Missing token" });

    const q = query(collection(clientDb, "invites"), where("token", "==", token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Invalid or expired invite link" });
    }

    const inviteDoc = querySnapshot.docs[0];
    const invite = inviteDoc.data();

    if (invite.status === "accepted") {
      return res.status(400).json({ error: "This invite has already been used" });
    }

    const expiresAt = invite.expiresAt.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
    if (new Date() > expiresAt) {
      return res.status(400).json({ error: "This invite has expired" });
    }

    return res.status(200).json({
      success: true,
      email: invite.email,
      companyId: invite.companyId,
    });
  } catch (error) {
    console.error("Verify invite error:", error);
    return res.status(500).json({ error: "Server error checking invite" });
  }
});

// ── ROUTE: Complete Invite (Set Password) ──────────────────────
app.post("/api/users/complete-invite", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const q = query(collection(clientDb, "invites"), where("token", "==", token));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Invalid or expired invite link" });
    }

    const inviteDoc = querySnapshot.docs[0];
    const invite = inviteDoc.data();

    if (invite.status === "accepted") {
      return res.status(400).json({ error: "This invite has already been used" });
    }

    const expiresAt = invite.expiresAt.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
    if (new Date() > expiresAt) {
      return res.status(400).json({ error: "This invite has expired" });
    }

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(invite.email);
      await admin.auth().updateUser(userRecord.uid, { password });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        userRecord = await admin.auth().createUser({
          email: invite.email,
          password,
          displayName: invite.email.split("@")[0],
        });
      } else {
        throw err;
      }
    }

    // Update invite status
    await updateDoc(inviteDoc.ref, {
      status: "accepted",
      token: null, // Wipe token so it cannot be reused
      acceptedAt: new Date(),
    });

    // Save/update user in Firestore
    await setDoc(doc(clientDb, "users", userRecord.uid), {
      uid: userRecord.uid,
      email: invite.email,
      username: invite.email.split("@")[0],
      role: "user",
      companyId: invite.companyId,
      status: "active",
      created_at: new Date(),
      last_login: new Date()
    }, { merge: true });

    // Generate Firebase Custom Token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(200).json({
      success: true,
      customToken,
    });
  } catch (error) {
    console.error("Complete invite error:", error);
    return res.status(500).json({ error: "Server error completing invite" });
  }
});

// ── ROUTE: Test DB ───────────────────────────
app.get("/api/test-db", async (req, res) => {
  try {
    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);
    return res.status(200).json({ success: true, collections: collectionNames });
  } catch (error) {
    console.error("❌ DB Test error:", error);
    return res.status(500).json({ error: error.message, code: error.code });
  }
});

// ── ROUTE: Log errors ───────────────────────────────
app.post("/api/log", (req, res) => {
  console.log("Client log:", req.body);
  res.json({ message: "Log saved" });
});

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});