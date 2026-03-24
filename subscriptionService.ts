import { createSubscription } from './repos/firestoreSubscriptions';
import { updateCompanyStatus } from './repos/firestoreCompanies';

export const simulatePayment = async (planName: string, companyId: string) => {
  return new Promise<void>((resolve, reject) => {
    // Simulate payment processing time
    setTimeout(async () => {
      try {
        const subscriptionId = crypto.randomUUID();
        // Create the subscription doc
        await createSubscription({
          subscriptionId,
          companyId,
          planName,
          price: planName === 'Basic' ? 9.99 : planName === 'Pro' ? 29.99 : 99.99,
          paymentMethod: 'credit_card_dummy',
        }); // default status is pending_approval inside createSubscription

        // Update company status to pending_approval
        await updateCompanyStatus(companyId, 'pending_approval');
        
        resolve();
      } catch (error) {
        reject(error);
      }
    }, 2000); // 2 second delay
  });
};
