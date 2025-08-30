import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";

interface CropFormData {
  cropType: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  priceUnit: string;
  harvestDate: string;
  state: string;
  lga: string;
}

export function AddNewCrop() {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState<CropFormData>({
    cropType: "",
    quantity: "",
    unit: "Bags",
    pricePerUnit: "",
    priceUnit: "Per Bag",
    harvestDate: "",
    state: "",
    lga: ""
  });

  const handleGoBack = () => {
    setLocation("/view-crops");
  };

  const handleInputChange = (field: keyof CropFormData, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset LGA when state changes
      if (field === 'state') {
        newData.lga = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Crop data:", formData);
    // TODO: API call to save crop
    // Navigate back to view crops or show success
    setLocation("/view-crops");
  };

  // Crop types
  const cropTypes = [
    "Rice", "Maize (Corn)", "Cassava", "Yam", "Sweet Potato", "Plantain", 
    "Beans (Cowpea)", "Groundnut", "Soybean", "Millet", "Sorghum", 
    "Tomatoes", "Pepper", "Onions", "Okra", "Spinach", "Cucumber",
    "Watermelon", "Pineapple", "Banana", "Orange", "Mango", "Cocoa", 
    "Oil Palm", "Cotton", "Sugar Cane"
  ];

  // Units
  const units = ["Bags", "Tonnes", "Kilograms", "Pieces", "Bunches", "Baskets"];

  // Price units
  const priceUnits = ["Per Bag", "Per Tonne", "Per Kilogram", "Per Piece", "Per Bunch", "Per Basket"];

  // Nigerian states
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
    "Yobe", "Zamfara"
  ];

  // Get LGAs based on state
  const getStateLGAs = (state: string): string[] => {
    switch (state) {
      case "Lagos":
        return ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"];
      case "Ogun":
        return ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Remo North", "Sagamu"];
      case "Kano":
        return ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Dala", "Dambatta", "Fagge", "Gabasawa", "Garko", "Gaya", "Gezawa", "Gwale", "Kano Municipal", "Karaye", "Kiru", "Kumbotso", "Madobi", "Nasarawa", "Rano", "Tarauni", "Ungogo"];
      case "FCT":
        return ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Municipal Area Council", "Kwali"];
      default:
        return ["Municipal", "Central", "North", "South", "East", "West"];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add a New Crop
            </h1>
            <p className="text-gray-600 text-base">
              Tell us what you're planting!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* What are you planting? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                What are you planting?
              </label>
              <select
                value={formData.cropType}
                onChange={(e) => handleInputChange("cropType", e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-gray-900"
                data-testid="select-crop-type"
                required
              >
                <option value="">Select a crop</option>
                {cropTypes.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* How much will you grow? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                How much will you grow?
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="e.g 25 Bags"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-quantity"
                  required
                />
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className="w-24 px-3 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  data-testid="select-unit"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* What's the price per unit? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                What's the price per unit?
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="e.g 2,500"
                  value={formData.pricePerUnit}
                  onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-price"
                  required
                />
                <select
                  value={formData.priceUnit}
                  onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                  className="w-28 px-3 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-sm"
                  data-testid="select-price-unit"
                >
                  {priceUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* When will it be ready to harvest? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                When will it be ready to harvest?
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-500"
                  data-testid="input-harvest-date"
                  placeholder="Tell us when your crop will be ready"
                  required
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Where is your crop growing? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Where is your crop growing?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    State (e.g Lagos)
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    data-testid="select-state"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    LGA (e.g Ikeja)
                  </label>
                  <select
                    value={formData.lga}
                    onChange={(e) => handleInputChange("lga", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    data-testid="select-lga"
                    required
                    disabled={!formData.state}
                  >
                    <option value="">Select LGA</option>
                    {formData.state && getStateLGAs(formData.state).map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                data-testid="button-save-crop"
              >
                Save My Crop
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-12">
            <button
              onClick={handleGoBack}
              className="p-3 -ml-3 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-8 h-8 text-gray-900" />
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Add a New Crop
              </h1>
              <p className="text-gray-600 text-xl">
                Tell us what you're planting!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* What are you planting? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  What are you planting?
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => handleInputChange("cropType", e.target.value)}
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-gray-900 text-lg"
                  data-testid="select-crop-type-desktop"
                  required
                >
                  <option value="">Select a crop</option>
                  {cropTypes.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              {/* How much will you grow? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  How much will you grow?
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="e.g 25 Bags"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="flex-1 px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-quantity-desktop"
                    required
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                    className="w-32 px-4 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                    data-testid="select-unit-desktop"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* What's the price per unit? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  What's the price per unit?
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="e.g 2,500"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                    className="flex-1 px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-price-desktop"
                    required
                  />
                  <select
                    value={formData.priceUnit}
                    onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                    className="w-36 px-4 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                    data-testid="select-price-unit-desktop"
                  >
                    {priceUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* When will it be ready to harvest? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  When will it be ready to harvest?
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                    className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-500 text-lg"
                    data-testid="input-harvest-date-desktop"
                    placeholder="Tell us when your crop will be ready"
                    required
                  />
                  <Calendar className="w-6 h-6 text-gray-400 absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Where is your crop growing? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  Where is your crop growing?
                </label>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      State (e.g Lagos)
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                      data-testid="select-state-desktop"
                      required
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      LGA (e.g Ikeja)
                    </label>
                    <select
                      value={formData.lga}
                      onChange={(e) => handleInputChange("lga", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                      data-testid="select-lga-desktop"
                      required
                      disabled={!formData.state}
                    >
                      <option value="">Select LGA</option>
                      {formData.state && getStateLGAs(formData.state).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-6 rounded-xl font-semibold text-xl transition-all hover:scale-105"
                  data-testid="button-save-crop-desktop"
                >
                  Save My Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}