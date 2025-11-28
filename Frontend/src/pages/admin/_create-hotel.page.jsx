import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateHotelMutation } from "@/lib/api";
import { useState } from "react";
import { z } from "zod";

function CreateHotelPage() {
  const [createHotel, { isLoading }] = useCreateHotelMutation();

  const [formData, setFormData] = useState({
    name: { value: "John Doe", error: null },
    description: {
      value:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
      error: null,
    },
    image: { value: "kajsdhajk", error: null },
    location: { value: "Paris", error: null },
    price: { value: "100", error: null },
  });

  const formSchema = z.object({
    name: z.object({
      value: z.string().min(1, { message: "Name is required" }),
    }),
    description: z.object({
      value: z.string().min(1, { message: "Description is required" }),
    }),
    image: z.object({
      value: z.string().min(1, { message: "Image is required" }),
    }),
    location: z.object({
      value: z.string().min(1, { message: "Location is required" }),
    }),
    price: z.object({
      value: z.string().min(1, { message: "Price is required" }),
    }),
  });

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        setFormData((prev) => {
          return {
            ...prev,
            [issue.path[0]]: { ...prev[issue.path[0]], error: issue.message },
          };
        });
      });
      return;
    }
    setFormData({
      ...formData,
      name: { ...formData.name, error: null },
      description: { ...formData.description, error: null },
      image: { ...formData.image, error: null },
      location: { ...formData.location, error: null },
      price: { ...formData.price, error: null },
    });
    console.log(result.data);
  };

  const handleValueChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: {
        ...formData[e.target.name],
        value: e.target.value,
      },
    });
  };

  return (
    <main className="px-4 py-8">
      <h1 className="text-3xl font-bold">Create Hotel</h1>
      <form
        onSubmit={handleCreateHotel}
        className="mt-4 w-1/4 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name.value}
            onChange={handleValueChange}
            name="name"
            className="block"
          />
          <span className="text-red-500">{formData.name.error}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description.value}
            onChange={handleValueChange}
            name="description"
            className="block"
          />
          <span className="text-red-500">{formData.description.error}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            value={formData.image.value}
            onChange={handleValueChange}
            name="image"
            className="block"
          />
          <span className="text-red-500">{formData.image.error}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location.value}
            onChange={handleValueChange}
            name="location"
            className="block"
          />
          <span className="text-red-500">{formData.location.error}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price.value}
            onChange={handleValueChange}
            name="price"
            className="block"
          />
          <span className="text-red-500">{formData.price.error}</span>
        </div>
        <Button type="submit">Create Hotel</Button>
      </form>
    </main>
  );
}

export default CreateHotelPage;
