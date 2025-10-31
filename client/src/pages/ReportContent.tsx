import { useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function ReportContent() {
  useSessionValidation();
  
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock resource data - in real app, fetch based on params
  const resource = {
    id: params.resourceId || "res-1",
    title: "Optimizing Cassava Yields: A Comprehensive Guide",
    image: "🌾",
    fileType: "PDF"
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this content.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping us keep the community safe. We'll review this content shortly.",
      });
      setIsSubmitting(false);
      setLocation(`/community/${params.communityId || 'comm-1'}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <button 
          onClick={() => setLocation(`/community/${params.communityId || 'comm-1'}`)}
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Report This Content
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Tell us what's wrong with this content. Your report will help us keep the community safe
        </p>

        {/* Resource Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-800 to-amber-950 dark:from-amber-900 dark:to-black rounded-lg flex items-center justify-center flex-shrink-0 text-3xl relative overflow-hidden">
            {resource.image}
            <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1">
              <FileText className="w-3 h-3 text-gray-700 dark:text-gray-300" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
              {resource.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {resource.fileType}
            </p>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Why are you reporting this content?
          </label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger 
              className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              data-testid="select-reason"
            >
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spam">Spam or misleading</SelectItem>
              <SelectItem value="inappropriate">Inappropriate content</SelectItem>
              <SelectItem value="harassment">Harassment or bullying</SelectItem>
              <SelectItem value="copyright">Copyright violation</SelectItem>
              <SelectItem value="inaccurate">Inaccurate information</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Comments */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Additional Comments (Optional)
          </label>
          <Textarea
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="Briefly describe what's wrong..."
            className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-none"
            data-testid="textarea-comments"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-submit-report"
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
