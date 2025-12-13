import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const bookingSchema = z.object({
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return checkIn >= today && checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date and check-in must be today or later",
  path: ["checkOut"],
});

const BookingDialog = ({ hotelName, hotelId, onSubmit, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      checkIn: "",
      checkOut: "",
    },
  });

  const handleSubmit = async (data) => {
    try {
      const result = await onSubmit({
        hotelId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      });
      toast.success("Booking created successfully!");
      setIsOpen(false);
      form.reset();
      // Navigate to payment page
      navigate(`/booking/payment?bookingId=${result.booking._id}`);
    } catch (error) {
      toast.error(error.message || "Failed to create booking");
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Calendar className="w-4 h-4 mr-2" />
        Book Now
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          Book {hotelName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-100">Check-in Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={getTodayDate()}
                      {...field}
                      className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-100">Check-out Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={form.watch("checkIn") || getTomorrowDate()}
                      {...field}
                      className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 dark:border-gray-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingDialog;