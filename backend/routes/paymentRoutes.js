const express = require('express');
const { createSubscription, updateSubscriptionStatus, getSubscriptionById } = require('../repos/firestoreSubscriptions');
const { createCompany, updateCompanyStatus, getPendingCompanies, getCompanyById } = require('../repos/firestoreCompanies');
const { updateUserCompany, updateUserStatus } = require('../repos/firestoreUsers');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Dummy payment gateway
const processPayment = async (amount, paymentMethod) => {
  // Simulate payment success
  return { success: true, transactionId: 'dummy_' + Date.now() };
};

// Create subscription (admin only)
router.post('/subscribe', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { planName, price, paymentMethod, companyName } = req.body;
  const companyId = req.user.companyId || 'comp_' + Date.now();

  try {
    // Process payment
    const paymentResult = await processPayment(price, paymentMethod);
    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Create subscription
    const subId = 'sub_' + Date.now();
    await createSubscription({ subscriptionId: subId, companyId, planName, price, paymentMethod });

    // Create company (pending approval)
    if (!req.user.companyId) {
      await createCompany({ companyId, companyName, adminId: req.user.uid, subscriptionId: subId });
      await updateUserCompany(req.user.uid, companyId);
    }

    // Update company to pending_approval
    await updateCompanyStatus(companyId, 'pending_approval');

    res.json({ message: 'Subscription created, awaiting approval', subscriptionId: subId, companyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
router.get('/status', authMiddleware, async (req, res) => {
  // Assume user has subscriptionId
  const sub = await getSubscriptionById(req.user.subscriptionId);
  res.json(sub);
});

// Get pending companies (super admin only)
router.get('/pending-companies', authMiddleware, roleMiddleware('super_admin'), async (req, res) => {
  const companies = await getPendingCompanies();
  res.json(companies);
});

// Approve company (super admin only)
router.post('/approve-company/:companyId', authMiddleware, roleMiddleware('super_admin'), async (req, res) => {
  const { companyId } = req.params;
  try {
    const company = await getCompanyById(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    await updateCompanyStatus(companyId, 'active');
    await updateSubscriptionStatus(company.subscriptionId, 'active');
    await updateUserStatus(company.adminId, 'active');
    res.json({ message: 'Company approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;