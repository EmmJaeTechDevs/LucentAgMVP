import { useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function JointDeliveryRequest() {
  useSessionValidation();
  
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [crop, setCrop] = useState("");
  const [totalOrder, setTotalOrder] = useState("");
  const [amountHave, setAmountHave] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [date, setDate] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const communityId = params.communityId || "comm-1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!crop || !totalOrder || !amountHave || !state || !lga || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Calculate the need
    const totalOrderNum = parseFloat(totalOrder);
    const amountHaveNum = parseFloat(amountHave);
    const needAmount = totalOrderNum - amountHaveNum;

    // Create the joint delivery request object
    const newRequest = {
      id: `jd-${Date.now()}`,
      communityId,
      crop,
      totalNeeded: totalOrderNum,
      have: amountHaveNum,
      need: needAmount,
      location: `${lga} ${state}`,
      dueDate: date,
      additionalDetails,
      progress: 0,
      helpingFarmers: [],
      createdAt: new Date().toISOString(),
    };

    // Get existing requests from localStorage
    const existingRequests = JSON.parse(localStorage.getItem("jointDeliveryRequests") || "[]");
    
    // Add new request
    existingRequests.push(newRequest);
    
    // Save to localStorage
    localStorage.setItem("jointDeliveryRequests", JSON.stringify(existingRequests));

    toast({
      title: "Request Posted",
      description: "Your joint delivery request has been posted successfully",
    });

    setLocation(`/community/${communityId}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <button
          onClick={() => setLocation(`/community/${communityId}`)}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        </button>
      </div>

      {/* Form Content */}
      <div className="px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Create Joint Delivery Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* What crop? */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">
              What crop?
            </label>
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger 
                className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                data-testid="select-crop"
              >
                <SelectValue placeholder="Select a crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cassava">Cassava</SelectItem>
                <SelectItem value="yam">Yam</SelectItem>
                <SelectItem value="rice">Rice</SelectItem>
                <SelectItem value="maize">Maize</SelectItem>
                <SelectItem value="tomatoes">Tomatoes</SelectItem>
                <SelectItem value="peppers">Peppers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Order from Buyer */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">
              Total Order from Buyer (kg)
            </label>
            <input
              type="number"
              value={totalOrder}
              onChange={(e) => setTotalOrder(e.target.value)}
              placeholder="e.g 25"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700 dark:focus:ring-green-600"
              data-testid="input-total-order"
            />
          </div>

          {/* How much do you have? */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">
              How much do you have? (kg)
            </label>
            <input
              type="number"
              value={amountHave}
              onChange={(e) => setAmountHave(e.target.value)}
              placeholder="e.g 10"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700 dark:focus:ring-green-600"
              data-testid="input-amount-have"
            />
          </div>

          {/* Delivery Location */}
          <div>
            <h3 className="text-gray-900 dark:text-gray-100 font-semibold mb-3">
              Delivery Location
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* State */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  State (e.g Lagos)
                </label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger 
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    data-testid="select-state"
                  >
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lagos">Lagos</SelectItem>
                    <SelectItem value="ogun">Ogun</SelectItem>
                    <SelectItem value="oyo">Oyo</SelectItem>
                    <SelectItem value="abuja">Abuja</SelectItem>
                    <SelectItem value="rivers">Rivers</SelectItem>
                    <SelectItem value="kano">Kano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* LGA */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                  LGA (e.g Ikeja)
                </label>
                <Select value={lga} onValueChange={setLga}>
                  <SelectTrigger 
                    className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                    data-testid="select-lga"
                  >
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ikeja">Ikeja</SelectItem>
                    <SelectItem value="lekki">Lekki</SelectItem>
                    <SelectItem value="surulere">Surulere</SelectItem>
                    <SelectItem value="yaba">Yaba</SelectItem>
                    <SelectItem value="ikoyi">Ikoyi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* When is it needed? */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">
              When is it needed?
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700 dark:focus:ring-green-600"
                data-testid="input-date"
              />
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any other information..."
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-700 dark:focus:ring-green-600 resize-none"
              data-testid="textarea-additional-details"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-800 text-white py-4 rounded-xl font-semibold transition-colors"
            data-testid="button-post-request"
          >
            Post Request
          </button>
        </form>
      </div>
    </div>
  );
}
