import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { simulatePayment } from './subscriptionService';
import { getUserByUid } from './repos/firestoreUsers';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Pro' | 'Enterprise'>('Basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userData = await getUserByUid(auth.currentUser.uid);
        if (userData?.companyId) {
          setCompanyId(userData.companyId);
        }
      }
    };
    fetchUserData();
  }, [auth.currentUser]);

  const plans = {
    Basic: { price: 9.99, features: ['5 users', 'Basic tasks'] },
    Pro: { price: 29.99, features: ['20 users', 'Advanced tasks'] },
    Enterprise: { price: 99.99, features: ['Unlimited users', 'All features'] },
  };

  const handleSubscribe = async () => {
    if (!companyId) {
      alert('Company not found. Please ensure you registered as an admin.');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate payment which sets up subscription and updates company status
      await simulatePayment(selectedPlan, companyId);
      alert('Payment simulated successfully! Waiting for Super Admin approval.');
      navigate('/');
    } catch (error: any) {
      console.error("Payment failed:", error);
      alert('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Choose a Subscription Plan</h1>
      {!companyId && (
        <div className="bg-yellow-100 text-yellow-800 p-4 mb-6 rounded">
          Loading user company information...
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(plans).map(([name, details]) => (
          <div
            key={name}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedPlan === name ? 'border-blue-500 shadow-md ring-2 ring-blue-500' : 'border-gray-300'}`}
            onClick={() => setSelectedPlan(name as 'Basic' | 'Pro' | 'Enterprise')}
          >
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-2xl">${details.price}/month</p>
            <ul className="mt-4 space-y-2">
              {details.features.map((feature, idx) => (
                <li key={idx} className="text-gray-600">- {feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSubscribe}
        disabled={isProcessing || !companyId}
        className="w-full bg-blue-600 font-bold text-lg text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isProcessing ? 'Processing Payment...' : `Pay $${plans[selectedPlan].price}`}
      </button>
    </div>
  );
};

export default Subscription;