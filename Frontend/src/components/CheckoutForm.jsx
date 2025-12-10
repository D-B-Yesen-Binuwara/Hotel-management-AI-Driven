import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ bookingId }) => {
  const { getToken } = useAuth();
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const fetchClientSecret = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      
      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5080"}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error("Session expired. Please sign in again.");
        } else if (response.status === 404) {
          throw new Error("Booking not found. Please try creating a new booking.");
        } else if (response.status === 400) {
          throw new Error(errorData.message || "Invalid booking data.");
        } else {
          throw new Error(errorData.message || `Server error (${response.status})`);
        }
      }

      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error("Invalid response from payment service.");
      }

      return data.clientSecret;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError(error.message);
      toast.error(error.message);
      throw error;
    }
  }, [bookingId, getToken]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryKey(prev => prev + 1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
      setError(null);
    } catch (err) {
      // Error will be handled by fetchClientSecret
    } finally {
      setIsRetrying(false);
    }
  };

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Payment Setup Failed
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error}
          </p>
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              "Try Again"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <EmbeddedCheckoutProvider 
        key={retryKey} 
        stripe={stripePromise} 
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;