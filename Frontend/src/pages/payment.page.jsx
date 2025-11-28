import { useSearchParams } from "react-router";
import CheckoutForm from "@/components/CheckoutForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Invalid booking ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CreditCard className="w-6 h-6" />
              Complete Your Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckoutForm bookingId={bookingId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;