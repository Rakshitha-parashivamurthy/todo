const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { Resend } = require("resend");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const resend = new Resend(process.env.RESEND_API_KEY);

const { db: clientDb } = require("./firebase");
const {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  addDoc,
} = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

// ── Firebase Admin Init ──────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();


// ── ROUTE: CREATE INVITE ─────────────────────────────
app.post("/api/users/invite", async (req, res) => {
  try {
    const { companyId, email } = req.body;
    const uid = req.headers["uid"];

    if (!uid || !companyId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // ✅ Store invite
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
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:3000";

    const inviteLink = `${frontendUrl}/magic-login?token=${token}`;

    // ✅ Send Email via Resend
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
              This link will expire in 30 minutes.
            </p>
          </div>
        `,
      });

      console.log(`✅ Email sent to ${email}`);
    } catch (err) {
      console.error("❌ Email failed:", err.message);
    }

    return res.status(200).json({
      success: true,
      inviteId: inviteRef.id,
      inviteLink,
    });

  } catch (error) {
    console.error("❌ Invite error:", error);
    return res.status(500).json({ error: error.message });
  }
});


// ── ROUTE: GET INVITES ─────────────────────────────
app.get("/api/users/invites", async (req, res) => {
  try {
    const email = req.query.email;

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

    return res.status(200).json({ invites });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


// ── ROUTE: COMPLETE INVITE (SET PASSWORD) ───────────
app.post("/api/users/complete-invite", async (req, res) => {
  try {
    const { token, password } = req.body;

    const q = query(collection(clientDb, "invites"), where("token", "==", token));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const inviteDoc = snapshot.docs[0];
    const invite = inviteDoc.data();

    let user;

    try {
      user = await admin.auth().getUserByEmail(invite.email);
      await admin.auth().updateUser(user.uid, { password });
    } catch {
      user = await admin.auth().createUser({
        email: invite.email,
        password,
      });
    }

    await updateDoc(inviteDoc.ref, {
      status: "accepted",
      token: null,
    });

    await setDoc(
      doc(clientDb, "users", user.uid),
      {
        uid: user.uid,
        email: invite.email,
        role: "user",
        companyId: invite.companyId,
        status: "active",
      },
      { merge: true }
    );

    const customToken = await admin.auth().createCustomToken(user.uid);

    return res.json({ customToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// ── START SERVER ─────────────────────────
app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});