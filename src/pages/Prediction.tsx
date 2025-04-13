import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Heart, AlertCircle, Droplets, Gauge, HeartPulse as Pulse, Dumbbell, Scale, Ruler, Wine, Cigarette, Info, Loader2 } from 'lucide-react';
import { predictHeartDisease, calculateBMI, calculateBPCategory } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Prediction() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    bmi: '',
    systolic_bp: '',
    diastolic_bp: '',
    bp_category: '',
    smoking_status: '',
    alcohol_consumption: '',
    physical_activity: '',
    cholesterol_level: '',
    blood_sugar: '',
    family_history: false
  });

  // Load profile data if user is logged in
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData(prev => ({
              ...prev,
              ...data
            }));
          }
        } catch (err) {
          console.error('Error loading profile:', err);
        }
      }
    };

    loadProfile();
  }, [user]);

  // Calculate BMI
  useEffect(() => {
    if (formData.height_cm && formData.weight_kg) {
      const bmi = calculateBMI(Number(formData.weight_kg), Number(formData.height_cm));
      setFormData(prev => ({ ...prev, bmi: bmi.toString() }));
    }
  }, [formData.height_cm, formData.weight_kg]);

  // Calculate BP Category
  useEffect(() => {
    if (formData.systolic_bp && formData.diastolic_bp) {
      const bpCategory = calculateBPCategory(Number(formData.systolic_bp), Number(formData.diastolic_bp));
      setFormData(prev => ({ ...prev, bp_category: bpCategory.toString() }));
    }
  }, [formData.systolic_bp, formData.diastolic_bp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const getBPCategoryLabel = (category: string) => {
    switch (Number(category)) {
      case 0: return 'Normal';
      case 1: return 'Elevated';
      case 2: return 'Stage 1 Hypertension';
      case 3: return 'Stage 2 Hypertension';
      case 4: return 'Hypertensive Crisis';
      default: return 'Not calculated';
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 25) return "Normal weight";
    if (bmi >= 25 && bmi < 30) return "Overweight";
    if (bmi >= 30) return "Obese";
    return "Unknown";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await saveProfileData();
      const result = await predictHeartDisease(formData);
      setPrediction(result.risk_score);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileData = async () => {
    if (!user) return;

    try {
      const profileData = {
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Heart Disease Risk Prediction</h1>
        <p className="text-xl text-gray-600 mt-2">
          Enter your health metrics for an AI-powered heart disease risk assessment
        </p>
      </div>

      {!user && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Not logged in</h3>
              <p className="text-blue-700">
                You're using the prediction tool as a guest. Log in or create an account to save your results.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Health Parameters</CardTitle>
              <CardDescription>Enter your health information to get a personalized risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Parameters</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information Fields */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Body Measurements */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                          <div className="relative">
                            <Ruler className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              name="height_cm"
                              value={formData.height_cm}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                          <div className="relative">
                            <Scale className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              name="weight_kg"
                              value={formData.weight_kg}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={formData.bmi}
                              className="w-full rounded-md border-gray-300 bg-gray-50"
                              disabled
                            />
                            <span className="text-sm text-gray-500">
                              {formData.bmi && getBMICategory(Number(formData.bmi))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab("advanced")}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Next: Advanced Parameters
                      </button>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Blood Pressure */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Systolic BP (mmHg)
                          </label>
                          <div className="relative">
                            <Gauge className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              name="systolic_bp"
                              value={formData.systolic_bp}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Diastolic BP (mmHg)
                          </label>
                          <div className="relative">
                            <Gauge className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              name="diastolic_bp"
                              value={formData.diastolic_bp}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">BP Category</label>
                          <div className={`p-2 rounded-md ${
                            Number(formData.bp_category) <= 1
                              ? "bg-green-50 text-green-700"
                              : Number(formData.bp_category) === 2
                              ? "bg-yellow-50 text-yellow-700"
                              : Number(formData.bp_category) === 3
                              ? "bg-orange-50 text-orange-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {formData.bp_category ? getBPCategoryLabel(formData.bp_category) : 'Not calculated'}
                          </div>
                        </div>
                      </div>

                      {/* Lifestyle Factors */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Smoking Status
                          </label>
                          <div className="relative">
                            <Cigarette className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                              name="smoking_status"
                              value={formData.smoking_status}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            >
                              <option value="">Select</option>
                              <option value="never">Never Smoked</option>
                              <option value="former">Former Smoker</option>
                              <option value="current">Current Smoker</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alcohol Consumption
                          </label>
                          <div className="relative">
                            <Wine className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                              name="alcohol_consumption"
                              value={formData.alcohol_consumption}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            >
                              <option value="">Select</option>
                              <option value="none">None</option>
                              <option value="moderate">Moderate</option>
                              <option value="heavy">Heavy</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Physical Activity Level
                          </label>
                          <div className="relative">
                            <Dumbbell className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                              name="physical_activity"
                              value={formData.physical_activity}
                              onChange={handleChange}
                              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            >
                              <option value="">Select</option>
                              <option value="sedentary">Sedentary</option>
                              <option value="moderate">Moderate</option>
                              <option value="active">Active</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Medical History */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cholesterol Level (mg/dL)
                          </label>
                          <input
                            type="number"
                            name="cholesterol_level"
                            value={formData.cholesterol_level}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Blood Sugar (mg/dL)
                          </label>
                          <input
                            type="number"
                            name="blood_sugar"
                            value={formData.blood_sugar}
                            onChange={handleChange}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="family_history"
                            checked={formData.family_history}
                            onChange={handleChange}
                            className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-700">
                            Family History of Heart Disease
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveTab("basic")}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Back: Basic Information
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-500 text-white px-8 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Activity className="h-5 w-5" />
                            <span>Get Prediction</span>
                          </>
                        )}
                      </button>
                    </div>
                  </TabsContent>
                </Tabs>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
              <CardDescription>
                {prediction === null ? 'Your results will appear here' : 'Your heart disease risk assessment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prediction === null ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No prediction results yet</p>
                  <p className="text-sm mt-2">Complete the form to see your results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Risk Level:</span>
                    <span className={`font-bold ${
                      prediction > 0.5 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {prediction > 0.5 ? 'High' : 'Low'} ({(prediction * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About This Tool</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-4">
              <p>
                This prediction tool uses machine learning to assess your risk of heart disease based on your health parameters.
              </p>
              <p>
                The assessment takes into account various factors including age, blood pressure, cholesterol levels, and lifestyle choices.
              </p>
              <p className="font-medium text-gray-700">
                Note: This tool is for informational purposes only and should not replace professional medical advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}