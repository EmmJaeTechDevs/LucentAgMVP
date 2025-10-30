import { useState } from "react";
import { ArrowLeft, MessageCircle, Heart, MoreVertical } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";

interface Comment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  content: string;
  likes: number;
}

export function PostDetail() {
  useSessionValidation();
  
  const params = useParams();
  const [, setLocation] = useLocation();
  const [commentText, setCommentText] = useState("");

  // Mock post data - in real app, fetch based on params.postId
  const post = {
    id: params.postId || "post-1",
    communityName: "Cassava Growers Network",
    authorName: "Emmanuel Oshuporu",
    timestamp: "10m ago",
    fullTimestamp: "16 Oct 2025 • 4:35 PM",
    content: "Weather forecast shows rain next week. Perfect timing for planting winter wheat. Anyone else planning to start seeding soon?",
    comments: 24,
    likes: 118
  };

  // Mock comments data
  const comments: Comment[] = [
    {
      id: "comment-1",
      authorName: "Peter Ajanlekoko",
      timestamp: "5m ago",
      content: "Yes, I'm planning to start in 3 days!",
      likes: 256
    }
  ];

  const handleAddComment = () => {
    if (commentText.trim()) {
      // Handle comment submission
      console.log("Adding comment:", commentText);
      setCommentText("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-h-screen">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-center relative">
          <button 
            onClick={() => setLocation(`/communities/${params.communityId || 'comm-1'}`)}
            className="absolute left-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
            {post.communityName}
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Original Post */}
        <div className="bg-white dark:bg-gray-800 border-b-8 border-gray-100 dark:border-gray-900 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                  {post.authorName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.timestamp}
                </p>
              </div>
            </div>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              data-testid="button-post-menu"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-base mb-4 leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                data-testid="button-comment"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>
              <button 
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                data-testid="button-like-post"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {post.fullTimestamp}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 p-4 space-y-4">
          {comments.map((comment) => (
            <div 
              key={comment.id}
              className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              data-testid={`comment-${comment.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {comment.authorName}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.timestamp}
                    </p>
                  </div>
                </div>
                <button 
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  data-testid={`button-comment-menu-${comment.id}`}
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 ml-13">
                {comment.content}
              </p>

              <div className="flex items-center gap-4 ml-13">
                <button 
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  data-testid={`button-reply-${comment.id}`}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button 
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  data-testid={`button-like-comment-${comment.id}`}
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{comment.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Comment Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          <input
            type="text"
            placeholder="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500 text-sm"
            data-testid="input-add-comment"
          />
        </div>
      </div>
    </div>
  );
}
