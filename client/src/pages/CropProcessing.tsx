import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  id: string;
  question: string;
  questionType: string;
  isRequired: boolean;
  category: string;
  options?: QuestionOption[]; // For checkbox/select questions
  answer?: string | string[]; // For storing user's answer (string for single, array for multiple)
}

interface PlantQuestions {
  plantId: string;
  plantName: string;
  questions: Question[];
}

interface QuestionsResponse {
  questions: PlantQuestions[];
}

interface AnswerSubmission {
  plantId: string;
  questionId: string;
  answer: string | string[];
  customAnswer?: string;
}

interface BulkAnswersRequest {
  answers: AnswerSubmission[];
}

interface SubmissionResult {
  plantId: string;
  questionId: string;
  status: string;
  message: string;
}

interface BulkAnswersResponse {
  message: string;
  processed: number;
  results: SubmissionResult[];
}

export function CropProcessing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [plantQuestions, setPlantQuestions] = useState<PlantQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    [questionId: string]: string | string[];
  }>({});
  const [cropAnswers, setCropAnswers] = useState<{
    [plantId: string]: { [questionId: string]: string | string[] };
  }>({});

  // Load questions data from sessionStorage on component mount
  useEffect(() => {
    const loadQuestionsData = () => {
      console.log("🔄 Loading questions data from sessionStorage...");

      try {
        const questionsData = sessionStorage.getItem("cropQuestionsData");

        if (questionsData) {
          const parsedData: QuestionsResponse = JSON.parse(questionsData);
          console.log("✅ Found questions data from API:", parsedData);

          if (parsedData.questions && Array.isArray(parsedData.questions)) {
            console.log(
              "📊 Mapping questions for",
              parsedData.questions.length,
              "plants:",
            );

            // Map the questions data
            parsedData.questions.forEach((plant) => {
              console.log(
                `🌱 Plant: ${plant.plantName} (${plant.plantId}) has ${plant.questions.length} questions`,
              );
            });

            setPlantQuestions(parsedData.questions);
          } else {
            console.error("❌ Invalid questions data structure:", parsedData);
            setPlantQuestions([]);
          }
        } else {
          console.log("❌ No questions data found in sessionStorage");
          // Navigate back to crop selection if no data
          setLocation("/crop-selection");
          return;
        }
      } catch (error) {
        console.error("❌ Error loading questions data:", error);
        setLocation("/crop-selection");
        return;
      } finally {
        setIsLoading(false);
        console.log("✅ Questions loading complete");
      }
    };

    loadQuestionsData();
  }, [setLocation]);

  const handleAnswerChange = (
    plantId: string,
    questionId: string,
    answer: string | string[],
  ) => {
    console.log(
      `📝 Answer updated for plant ${plantId}, question ${questionId}:`,
      answer,
    );

    // Update global userAnswers
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Update crop-specific answers
    setCropAnswers((prev) => ({
      ...prev,
      [plantId]: {
        ...prev[plantId],
        [questionId]: answer,
      },
    }));
  };

  const handleCheckboxChange = (
    plantId: string,
    questionId: string,
    optionValue: string,
    checked: boolean,
  ) => {
    const currentAnswers = (userAnswers[questionId] as string[]) || [];
    let newAnswers: string[];

    if (checked) {
      newAnswers = [...currentAnswers, optionValue];
    } else {
      newAnswers = currentAnswers.filter((value) => value !== optionValue);
    }

    console.log(
      `☑️ Checkbox updated for plant ${plantId}, question ${questionId}:`,
      newAnswers,
    );
    handleAnswerChange(plantId, questionId, newAnswers);
  };

  const handleRadioChange = (
    plantId: string,
    questionId: string,
    optionValue: string,
  ) => {
    console.log(
      `📻 Radio button selected for plant ${plantId}, question ${questionId}:`,
      optionValue,
    );
    handleAnswerChange(plantId, questionId, optionValue);
  };

  const getAuthToken = () => {
    try {
      const sessionData = sessionStorage.getItem("farmerSession");
      if (sessionData) {
        const encryptedData = JSON.parse(sessionData);
        const parsed = SessionCrypto.decryptSessionData(encryptedData);
        return parsed.token;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return null;
  };

  const transformAnswersForAPI = (): BulkAnswersRequest => {
    const answers: AnswerSubmission[] = [];

    // Transform cropAnswers object into array format expected by API
    Object.entries(cropAnswers).forEach(([plantId, plantAnswers]) => {
      Object.entries(plantAnswers).forEach(([questionId, answer]) => {
        answers.push({
          plantId, // Use the generic plant ID directly from questions API
          questionId,
          answer,
          // Add customAnswer field if needed (can be extended later)
        });
      });
    });

    console.log("🔄 Transformed answers for API:", answers);
    return { answers };
  };

  const submitAnswersToAPI = async (answersPayload: BulkAnswersRequest) => {
    const token = getAuthToken();

    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in again.",
      });
      setLocation("/login");
      return null;
    }

    try {
      console.log("📤 Submitting answers to bulk endpoint:", answersPayload);

      const response = await fetch(`${BaseUrl}/api/farmer/answers/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(answersPayload),
      });

      console.log("📊 Bulk answers API response status:", response.status);

      if (response.status === 200) {
        const responseData: BulkAnswersResponse = await response.json();
        console.log("✅ Bulk answers API success response:", responseData);

        toast({
          title: "Success!",
          description: responseData.message,
        });

        return responseData;
      } else if (response.status === 400) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Validation error",
        });
        return null;
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unauthorized - token required",
        });
        return null;
      } else if (response.status === 403) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Only farmers can submit answers",
        });
        return null;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit answers. Please try again.",
        });
        return null;
      }
    } catch (error) {
      console.error("❌ Error submitting answers:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
      return null;
    }
  };

  const handleSave = async () => {
    console.log("💾 Saving answers for crop processing questions:");
    console.log("User Answers (Global):", userAnswers);
    console.log("Crop Answers (By Plant):", cropAnswers);

    // Validate required questions are answered
    const requiredQuestions = plantQuestions.flatMap((plant) =>
      plant.questions.filter((q) => q.isRequired),
    );

    const missingAnswers = requiredQuestions.filter((q) => {
      const answer = userAnswers[q.id];
      if (Array.isArray(answer)) {
        return answer.length === 0;
      }
      return !answer || answer.toString().trim() === "";
    });

    if (missingAnswers.length > 0) {
      console.log(
        "⚠️ Missing required answers:",
        missingAnswers.map((q) => q.question),
      );
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: `Please answer all required questions before submitting.`,
      });
      return;
    }

    // Check if there are any answers to submit
    if (Object.keys(cropAnswers).length === 0) {
      toast({
        variant: "destructive",
        title: "No Answers",
        description: "Please answer at least one question before submitting.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Transform answers to API format
      const answersPayload = transformAnswersForAPI();

      // Submit to API
      const result = await submitAnswersToAPI(answersPayload);

      if (result) {
        console.log(
          "✅ All answers submitted successfully, proceeding to dashboard",
        );
        console.log("📊 Final submission result:", result);

        // Navigate to farmer dashboard on success
        setLocation("/farmer-dashboard");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (plantQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Questions Found
          </h2>
          <p className="text-gray-600 mb-4">
            No questions were found for your selected crops.
          </p>
          <Button
            onClick={() => setLocation("/crop-selection")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Back to Crop Selection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Plant icon */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Tell us about your crops
          </h1>

          <p className="text-gray-600 text-base leading-relaxed mb-8 text-center">
            Answer a few questions about your selected crops to help us serve
            you better.
          </p>

          {/* Questions sections for each plant */}
          <div className="space-y-8 mb-8">
            {plantQuestions.map((plant) => (
              <div key={plant.plantId} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Questions for {plant.plantName}
                </h2>

                <div className="space-y-4">
                  {plant.questions.map((question) => (
                    <div
                      key={question.id}
                      className="space-y-2"
                      data-testid={`question-${question.id}`}
                    >
                      <label className="block">
                        <span className="text-sm font-medium text-gray-900">
                          {question.question}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          Category: {question.category} | Type:{" "}
                          {question.questionType}
                        </span>

                        {question.questionType === "text" && (
                          <input
                            type="text"
                            value={(userAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                plant.plantId,
                                question.id,
                                e.target.value,
                              )
                            }
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter your answer..."
                            data-testid={`input-${question.id}`}
                          />
                        )}

                        {question.questionType === "boolean" && (
                          <div className="mt-2 flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={question.id}
                                value="yes"
                                checked={userAnswers[question.id] === "yes"}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    plant.plantId,
                                    question.id,
                                    e.target.value,
                                  )
                                }
                                className="text-green-600 focus:ring-green-500"
                                data-testid={`radio-${question.id}-yes`}
                              />
                              <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={question.id}
                                value="no"
                                checked={userAnswers[question.id] === "no"}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    plant.plantId,
                                    question.id,
                                    e.target.value,
                                  )
                                }
                                className="text-green-600 focus:ring-green-500"
                                data-testid={`radio-${question.id}-no`}
                              />
                              <span className="text-sm text-gray-700">No</span>
                            </label>
                          </div>
                        )}

                        {question.questionType === "number" && (
                          <input
                            type="number"
                            value={(userAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                plant.plantId,
                                question.id,
                                e.target.value,
                              )
                            }
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Enter a number..."
                            data-testid={`number-${question.id}`}
                          />
                        )}

                        {question.questionType === "textarea" && (
                          <textarea
                            value={(userAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                plant.plantId,
                                question.id,
                                e.target.value,
                              )
                            }
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            rows={3}
                            placeholder="Enter your detailed answer..."
                            data-testid={`textarea-${question.id}`}
                          />
                        )}

                        {question.questionType === "checkbox" &&
                          question.options && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Select all that apply:
                              </div>
                              {question.options.map((option) => {
                                const selectedOptions =
                                  (userAnswers[question.id] as string[]) || [];
                                const isChecked = selectedOptions.includes(
                                  option.value,
                                );

                                return (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          plant.plantId,
                                          question.id,
                                          option.value,
                                          e.target.checked,
                                        )
                                      }
                                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                      data-testid={`checkbox-${question.id}-${option.value}`}
                                    />
                                    <span className="text-sm text-gray-900">
                                      {option.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                        {question.questionType === "multiple_choice" &&
                          question.options && (
                            <div className="mt-3 space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Select all that apply:
                              </div>
                              {question.options.map((option) => {
                                const selectedOptions =
                                  (userAnswers[question.id] as string[]) || [];
                                const isChecked = selectedOptions.includes(
                                  option.value,
                                );

                                return (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-3 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          plant.plantId,
                                          question.id,
                                          option.value,
                                          e.target.checked,
                                        )
                                      }
                                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                      data-testid={`checkbox-${question.id}-${option.value}`}
                                    />
                                    <span className="text-sm text-gray-900">
                                      {option.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-save"
          >
            {isSaving ? "Submitting Answers..." : "Save Answers"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Plant icon */}
          <div className="mb-10 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Tell us about your crops
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-12 text-center max-w-md mx-auto">
            Answer a few questions about your selected crops to help us serve
            you better.
          </p>

          {/* Questions sections for each plant */}
          <div className="space-y-12 mb-12">
            {plantQuestions.map((plant) => (
              <div key={plant.plantId} className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-3">
                  Questions for {plant.plantName}
                </h2>

                <div className="space-y-6">
                  {plant.questions.map((question) => (
                    <div
                      key={question.id}
                      className="space-y-3 p-4 bg-gray-50 rounded-lg"
                      data-testid={`question-${question.id}-desktop`}
                    >
                      <label className="block">
                        <span className="text-lg font-medium text-gray-900">
                          {question.question}
                          {question.isRequired && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500 block mt-1">
                          Category: {question.category} | Type:{" "}
                          {question.questionType}
                        </span>

                        {question.questionType === "text" && (
                          <input
                            type="text"
                            value={(userAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                plant.plantId,
                                question.id,
                                e.target.value,
                              )
                            }
                            className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                            placeholder="Enter your answer..."
                            data-testid={`input-${question.id}-desktop`}
                          />
                        )}

                        {question.questionType === "boolean" && (
                          <div className="mt-3 flex gap-6">
                            <label className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={question.id}
                                value="yes"
                                checked={userAnswers[question.id] === "yes"}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    plant.plantId,
                                    question.id,
                                    e.target.value,
                                  )
                                }
                                className="w-4 h-4 text-green-600 focus:ring-green-500"
                                data-testid={`radio-${question.id}-yes-desktop`}
                              />
                              <span className="text-lg text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={question.id}
                                value="no"
                                checked={userAnswers[question.id] === "no"}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    plant.plantId,
                                    question.id,
                                    e.target.value,
                                  )
                                }
                                className="w-4 h-4 text-green-600 focus:ring-green-500"
                                data-testid={`radio-${question.id}-no-desktop`}
                              />
                              <span className="text-lg text-gray-700">No</span>
                            </label>
                          </div>
                        )}

                        {question.questionType === "number" && (
                          <input
                            type="number"
                            value={(userAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                plant.plantId,
                                question.id,
                                e.target.value,
                              )
                            }
                            className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                            placeholder="Enter a number..."
                            data-testid={`number-${question.id}-desktop`}
                          />
                        )}

                        {question.questionType === "textarea" && (
                          <textarea
                            value={(userAnswers[question.id] as string) || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                plant.plantId,
                                question.id,
                                e.target.value,
                              )
                            }
                            className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                            rows={4}
                            placeholder="Enter your detailed answer..."
                            data-testid={`textarea-${question.id}-desktop`}
                          />
                        )}

                        {question.questionType === "checkbox" &&
                          question.options && (
                            <div className="mt-4 space-y-3">
                              <div className="text-lg font-medium text-gray-700 mb-3">
                                Select all that apply:
                              </div>
                              {question.options.map((option) => {
                                const selectedOptions =
                                  (userAnswers[question.id] as string[]) || [];
                                const isChecked = selectedOptions.includes(
                                  option.value,
                                );

                                return (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-4 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          plant.plantId,
                                          question.id,
                                          option.value,
                                          e.target.checked,
                                        )
                                      }
                                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                      data-testid={`checkbox-${question.id}-${option.value}-desktop`}
                                    />
                                    <span className="text-lg text-gray-900">
                                      {option.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                        {question.questionType === "multiple_choice" &&
                          question.options && (
                            <div className="mt-4 space-y-3">
                              <div className="text-lg font-medium text-gray-700 mb-3">
                                Select all that apply:
                              </div>
                              {question.options.map((option) => {
                                const selectedOptions =
                                  (userAnswers[question.id] as string[]) || [];
                                const isChecked = selectedOptions.includes(
                                  option.value,
                                );

                                return (
                                  <label
                                    key={option.value}
                                    className="flex items-center gap-4 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) =>
                                        handleCheckboxChange(
                                          plant.plantId,
                                          question.id,
                                          option.value,
                                          e.target.checked,
                                        )
                                      }
                                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                      data-testid={`checkbox-${question.id}-${option.value}-desktop`}
                                    />
                                    <span className="text-lg text-gray-900">
                                      {option.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="text-center">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-16 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="button-save-desktop"
            >
              {isSaving ? "Submitting Answers..." : "Save Answers"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
