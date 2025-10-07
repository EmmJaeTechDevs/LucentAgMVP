import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Check, ChevronRight, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

// Extended question interface to include plant context
interface QuestionWithContext extends Question {
  plantId: string;
  plantName: string;
}

export function CropProcessing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [plantQuestions, setPlantQuestions] = useState<PlantQuestions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cropAnswers, setCropAnswers] = useState<{
    [plantId: string]: { [questionId: string]: string | string[] };
  }>({});
  const [customAnswers, setCustomAnswers] = useState<{
    [plantId: string]: { [questionId: string]: string };
  }>({});
  
  // Step-by-step questionnaire states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState(0);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionWithContext[]>([]);

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
            
            // Flatten all questions from all plants into a single array with plant context
            const flattenedQuestions: QuestionWithContext[] = [];
            parsedData.questions.forEach((plant) => {
              plant.questions.forEach((question) => {
                flattenedQuestions.push({
                  ...question,
                  plantId: plant.plantId,
                  plantName: plant.plantName
                });
              });
            });
            
            console.log(`📋 Total questions flattened: ${flattenedQuestions.length}`);
            setAllQuestions(flattenedQuestions);
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

    const wasAnswered = !!cropAnswers[plantId]?.[questionId];
    const isNowAnswered = Array.isArray(answer) ? answer.length > 0 : !!answer;

    // Update crop-specific answers only
    setCropAnswers((prev) => ({
      ...prev,
      [plantId]: {
        ...prev[plantId],
        [questionId]: answer,
      },
    }));

    // Update answered count
    if (!wasAnswered && isNowAnswered) {
      setAnsweredQuestionsCount(prev => prev + 1);
    } else if (wasAnswered && !isNowAnswered) {
      setAnsweredQuestionsCount(prev => Math.max(0, prev - 1));
    }
  };
  
  // Handle Next button - move to next question
  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question - save answers and go to dashboard
      handleSave();
    }
  };
  
  // Handle Skip button - show dialog then go to dashboard
  const handleSkip = () => {
    setShowSkipDialog(true);
  };
  
  // Navigate to dashboard after skip confirmation
  const proceedToDashboard = () => {
    setShowSkipDialog(false);
    
    toast({
      title: "You can complete your preferences anytime!",
      description: "Visit Settings to finish answering crop questions.",
    });
    
    // Navigate to dashboard
    setTimeout(() => {
      setLocation("/farmer-dashboard");
    }, 500);
  };

  const handleCheckboxChange = (
    plantId: string,
    questionId: string,
    optionValue: string,
    checked: boolean,
  ) => {
    // Use plant-scoped state instead of global userAnswers
    const currentAnswers = (cropAnswers[plantId]?.[questionId] as string[]) || [];
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

  const handleCustomAnswerChange = (plantId: string, questionId: string, customAnswer: string) => {
    console.log(`📝 Custom answer for plant ${plantId}, question ${questionId}:`, customAnswer);
    setCustomAnswers((prev) => ({
      ...prev,
      [plantId]: {
        ...prev[plantId],
        [questionId]: customAnswer,
      },
    }));
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
        const customAnswer = customAnswers[plantId]?.[questionId];
        answers.push({
          plantId, // Use the generic plant ID directly from questions API
          questionId,
          answer,
          ...(customAnswer && customAnswer.trim() !== '' && { customAnswer: customAnswer.trim() })
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
    console.log("Crop Answers (By Plant):", cropAnswers);

    // Validate required questions are answered for each plant
    const missingAnswers = plantQuestions.flatMap((plant) =>
      plant.questions.filter((q) => {
        if (!q.isRequired) return false;
        
        const answer = cropAnswers[plant.plantId]?.[q.id];
        if (Array.isArray(answer)) {
          return answer.length === 0;
        }
        return !answer || answer.toString().trim() === "";
      })
    );

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

  if (plantQuestions.length === 0 || allQuestions.length === 0) {
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

  // Get current question
  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  const canShowSkip = answeredQuestionsCount >= 3;

  // Helper function to render question input based on type
  const renderQuestionInput = (question: QuestionWithContext) => {
    const plantId = question.plantId;
    const questionId = question.id;

    switch (question.questionType) {
      case "text":
        return (
          <input
            type="text"
            value={(cropAnswers[plantId]?.[questionId] as string) || ""}
            onChange={(e) => handleAnswerChange(plantId, questionId, e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
            placeholder="Enter your answer..."
            data-testid={`input-${questionId}`}
          />
        );

      case "boolean":
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={`${plantId}-${questionId}`}
                value="yes"
                checked={cropAnswers[plantId]?.[questionId] === "yes"}
                onChange={(e) => handleAnswerChange(plantId, questionId, e.target.value)}
                className="w-5 h-5 text-green-600 focus:ring-green-500"
                data-testid={`radio-${questionId}-yes`}
              />
              <span className="text-base text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={`${plantId}-${questionId}`}
                value="no"
                checked={cropAnswers[plantId]?.[questionId] === "no"}
                onChange={(e) => handleAnswerChange(plantId, questionId, e.target.value)}
                className="w-5 h-5 text-green-600 focus:ring-green-500"
                data-testid={`radio-${questionId}-no`}
              />
              <span className="text-base text-gray-700">No</span>
            </label>
          </div>
        );

      case "number":
        return (
          <input
            type="number"
            value={(cropAnswers[plantId]?.[questionId] as string) || ""}
            onChange={(e) => handleAnswerChange(plantId, questionId, e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
            placeholder="Enter a number..."
            data-testid={`number-${questionId}`}
          />
        );

      case "textarea":
        return (
          <textarea
            value={(cropAnswers[plantId]?.[questionId] as string) || ""}
            onChange={(e) => handleAnswerChange(plantId, questionId, e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
            rows={4}
            placeholder="Enter your detailed answer..."
            data-testid={`textarea-${questionId}`}
          />
        );

      case "checkbox":
      case "multiple_choice":
        if (!question.options) return null;
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-3">
              Select all that apply:
            </div>
            {question.options.map((option) => {
              const selectedOptions = (cropAnswers[plantId]?.[questionId] as string[]) || [];
              const isChecked = selectedOptions.includes(option.value);

              return (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(plantId, questionId, option.value, e.target.checked)}
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    data-testid={`checkbox-${questionId}-${option.value}`}
                  />
                  <span className="text-base text-gray-900">{option.label}</span>
                </label>
              );
            })}
            {(cropAnswers[plantId]?.[questionId] as string[])?.includes("Other") && (
              <input
                type="text"
                value={customAnswers[plantId]?.[questionId] || ""}
                onChange={(e) => handleCustomAnswerChange(plantId, questionId, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                placeholder="Please specify..."
                data-testid={`custom-${questionId}`}
              />
            )}
          </div>
        );

      case "radio":
        if (!question.options) return null;
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`${plantId}-${questionId}`}
                  value={option.value}
                  checked={cropAnswers[plantId]?.[questionId] === option.value}
                  onChange={() => handleRadioChange(plantId, questionId, option.value)}
                  className="w-5 h-5 text-green-600 focus:ring-green-500"
                  data-testid={`radio-${questionId}-${option.value}`}
                />
                <span className="text-base text-gray-900">{option.label}</span>
              </label>
            ))}
            {cropAnswers[plantId]?.[questionId] === "Other" && (
              <input
                type="text"
                value={customAnswers[plantId]?.[questionId] || ""}
                onChange={(e) => handleCustomAnswerChange(plantId, questionId, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                placeholder="Please specify..."
                data-testid={`custom-${questionId}`}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress indicator */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {allQuestions.length}
            </span>
            <span className="text-sm font-medium text-green-600">
              {answeredQuestionsCount} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / allQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Plant name badge */}
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Leaf className="w-4 h-4" />
              {currentQuestion.plantName}
            </span>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.question}
              {currentQuestion.isRequired && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Category: {currentQuestion.category}
            </p>

            {/* Question input */}
            <div className="mt-6">
              {renderQuestionInput(currentQuestion)}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-4 justify-center">
            {canShowSkip && (
              <Button
                onClick={handleSkip}
                variant="outline"
                className="px-8 py-6 text-lg font-medium rounded-xl border-2 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                data-testid="button-skip"
              >
                <SkipForward className="w-5 h-5" />
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="px-12 py-6 text-lg font-medium rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              data-testid="button-next"
            >
              {isLastQuestion ? "Finish" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Skip Dialog */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Later in Settings</AlertDialogTitle>
            <AlertDialogDescription>
              You can return to answer these crop preference questions anytime from your Settings page. This will help us serve you better!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSkipDialog(false)}
              className="px-6 py-3"
            >
              Continue Answering
            </Button>
            <AlertDialogAction
              onClick={proceedToDashboard}
              className="px-6 py-3 bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
