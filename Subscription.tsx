import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { simulatePayment } from './subscriptionService';
import { getUserByUid } from './repos/firestoreUsers';
import { getCompanyById } from './companyService';
import { getSubscriptionById } from './repos/firestoreSubscriptions';
import { RefreshCcw } from 'lucide-react';

interface SubscriptionProps {
  refreshAuth?: () => Promise<void>;
}

const Subscription = ({ refreshAuth }: SubscriptionProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Pro' | 'Enterprise'>('Pro');
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async (user: any) => {
      if (user) {
        const userData = await getUserByUid(user.uid);
        if (userData?.companyId) {
          setCompanyId(userData.companyId);
        }
      }
    };

    if (auth.currentUser) {
      fetchUserData(auth.currentUser);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      fetchUserData(user);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckStatus = async () => {
    if (!companyId || !auth.currentUser) return;
    
    setIsChecking(true);
    try {
      const company = await getCompanyById(companyId);
      
      if (company?.status === 'active' && company?.subscriptionId) {
        const subscription = await getSubscriptionById(company.subscriptionId);
        
        if (subscription?.status === 'active') {
          setApprovalMessage('✅ Your account has been approved! Redirecting to your dashboard...');
          if (refreshAuth) await refreshAuth();
          setTimeout(() => {
            navigate('/');
          }, 800);
          return;
        }
      }
      
      setApprovalMessage('⏳ Waiting for super admin approval. Please check again shortly.');
      setTimeout(() => setApprovalMessage(null), 5000);
    } catch (error) {
      console.error('Error checking status:', error);
      setApprovalMessage('❌ Error checking status. Please try again.');
      setTimeout(() => setApprovalMessage(null), 5000);
    } finally {
      setIsChecking(false);
    }
  };

  const plans = {
    Basic: { 
      monthly: 80, 
      yearly: 800,
      description: 'For most businesses that want to optimize web queries',
      features: ['All limited links', 'Own analytics platform', 'Chat support', 'Optimize hashtags', 'Unlimited users'] 
    },
    Pro: { 
      monthly: 120, 
      yearly: 1200,
      description: 'For most businesses that want to optimize web queries',
      features: ['All limited links', 'Own analytics platform', 'Chat support', 'Optimize hashtags', 'Unlimited users'] 
    },
    Enterprise: { 
      monthly: 260, 
      yearly: 2600,
      description: 'For most businesses that want to optimize web queries',
      features: ['All limited links', 'Own analytics platform', 'Chat support', 'Optimize hashtags', 'Unlimited users'] 
    },
  };

  const getPrice = (planName: 'Basic' | 'Pro' | 'Enterprise') => {
    return isYearly ? plans[planName].yearly : plans[planName].monthly;
  };

  const handleSubscribe = async () => {
    if (!companyId) {
      alert('Company not found. Please ensure you registered as an admin.');
      return;
    }

    setIsProcessing(true);
    try {
      await simulatePayment(selectedPlan, companyId);
      setApprovalMessage('✅ Upgrade submitted successfully! Waiting for Super Admin approval.');
    } catch (error: any) {
      console.error("Payment failed:", error);
      setApprovalMessage('❌ Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-600 mb-2">No contracts. No surprise fees.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 text-sm text-slate-500">
            <Link to="/login" className="underline hover:text-slate-900 transition">Back to login</Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/register" className="underline hover:text-slate-900 transition">Create an account</Link>
          </div>

          {/* Approval Message / Status Check */}
          {approvalMessage && (
            <div className={`mb-8 p-4 rounded-lg max-w-2xl mx-auto ${
              approvalMessage.includes('✅') ? 'bg-emerald-100 text-emerald-800' :
              approvalMessage.includes('❌') ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {approvalMessage}
            </div>
          )}

          {/* Check Status Button */}
          <div className="mb-8">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <RefreshCcw size={18} className={isChecking ? 'animate-spin' : ''} />
              {isChecking ? 'Checking...' : 'Check Approval Status'}
            </button>
            <p className="text-sm text-slate-600 mt-3">Waiting for super admin approval? Click above to check status.</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>MONTHLY</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-300"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>YEARLY</span>
          </div>
        </div>

        {!companyId && (
          <div className="bg-yellow-100 text-yellow-800 p-4 mb-6 rounded-lg max-w-2xl mx-auto">
            Loading user company information...
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(plans).map(([name, details]) => {
            const isSelected = selectedPlan === name;
            const isPopular = name === 'Pro';
            const price = getPrice(name as 'Basic' | 'Pro' | 'Enterprise');

            return (
              <div
                key={name}
                className={`relative rounded-2xl transition-all duration-300 ${
                  isPopular
                    ? 'md:scale-105 md:z-10 bg-gradient-to-br from-indigo-600 to-blue-600 p-8 text-white shadow-2xl'
                    : 'bg-white/95 p-8 border border-slate-200'
                } ${isSelected && !isPopular ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPlan(name as 'Basic' | 'Pro' | 'Enterprise')}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h2 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                  {name}
                </h2>
                
                <p className={`text-4xl font-bold mb-1 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                  ${price}
                  <span className={`text-lg font-normal ${isPopular ? 'text-white/70' : 'text-slate-700'}`}>
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </p>

                <p className={`text-sm mb-6 ${isPopular ? 'text-white/80' : 'text-slate-600'}`}>
                  {details.description}
                </p>

                <div className="space-y-3 mb-8">
                  {details.features.map((feature, idx) => (
                    <div key={idx} className={`text-sm flex items-center ${isPopular ? 'text-white/90' : 'text-slate-700'}`}>
                      <span className={`mr-3 text-lg ${isPopular ? 'text-blue-300' : 'text-emerald-600'}`}>✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(name as 'Basic' | 'Pro' | 'Enterprise');
                      return;
                    }
                    handleSubscribe();
                  }}
                  disabled={isProcessing || !companyId || !isSelected}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-all ${
                    isPopular
                      ? 'bg-white text-indigo-600 hover:bg-white/90'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isProcessing && isSelected ? 'Processing Payment...' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
