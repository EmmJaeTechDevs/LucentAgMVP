import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Users, Info, BookOpen, ShoppingBag, Camera, MessageCircle, Heart, MoreVertical, MoreHorizontal, Menu } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";

// Helper function to detect user type
function getUserType(): "buyer" | "farmer" {
  const buyerSession = sessionStorage.getItem("buyerSession");
  const farmerSession = sessionStorage.getItem("farmerSession");
  
  if (buyerSession) {
    return "buyer";
  } else if (farmerSession) {
    return "farmer";
  }
  
  return "buyer";
}

interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: string;
  content: string;
  comments: number;
  likes: number;
}

export function CommunityDetail() {
  useSessionValidation();
  
  const params = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"posts" | "resources" | "joint-delivery" | "targets">("posts");
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [showMenuIcon, setShowMenuIcon] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const hasAnimatedOnce = useRef(false);
  
  const userType = getUserType();
  const backRoute = "/communities";

  // Mock community data
  const community = {
    id: params.id || "comm-1",
    name: "Cassava Growers Network",
    memberCount: 16,
    avatar: "🌾"
  };

  // Mock posts data
  const posts: Post[] = [
    {
      id: "post-1",
      authorName: "Emmanuel Oshuporu",
      timestamp: "10m ago",
      content: "Weather forecast shows rain next week. Perfect timing for planting winter wheat. Anyone else planning to start seeding soon?",
      comments: 24,
      likes: 118
    },
    {
      id: "post-2",
      authorName: "Peter Ajanlekoko",
      timestamp: "5m ago",
      content: "Just finished reading an inspiring book on sustainable farming practices. It's incredible how much we can learn from nature! Anyone read anything good lately?",
      comments: 32,
      likes: 256
    },
    {
      id: "post-3",
      authorName: "Susan Agbata",
      timestamp: "2m ago",
      content: "I've been experimenting with crop rotation techniques this year. The results are promising! Curious to hear others' experiences with it.",
      comments: 15,
      likes: 98
    },
    {
      id: "post-4",
      authorName: "James Adeyemi",
      timestamp: "1m ago",
      content: "Looking into organic pest control methods. Has anyone tried using beneficial insects? I'd love to share insights and tips!",
      comments: 22,
      likes: 134
    }
  ];

  // Handle scroll to collapse header (only once)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || hasAnimatedOnce.current) return;
      
      const currentScrollY = scrollContainerRef.current.scrollTop;
      
      // Only trigger once if scrolled more than 50px
      if (currentScrollY > 50) {
        // Scrolling down - collapse
        if (currentScrollY > lastScrollY.current && isHeaderExpanded) {
          setIsHeaderExpanded(false);
          setShowMenuIcon(true);
          hasAnimatedOnce.current = true; // Mark that animation has happened
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    const container = scrollContainerRef.current;
    if (container && !hasAnimatedOnce.current) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isHeaderExpanded]);

  const toggleHeaderExpansion = () => {
    setIsHeaderExpanded(!isHeaderExpanded);
    setShowMenuIcon(!isHeaderExpanded ? false : true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-h-screen">
      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => setLocation(backRoute)} data-testid="button-back">
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">
                {community.name}
              </h1>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Users className="w-3 h-3" />
                <span>{community.memberCount} Members</span>
              </div>
            </div>
          </div>

          {showMenuIcon && (
            <button 
              onClick={toggleHeaderExpansion}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              data-testid="button-toggle-menu"
            >
              <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {/* Collapsible Header Sections */}
        <div 
          className={`bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${
            isHeaderExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-4 space-y-3">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                data-testid="button-about-community"
              >
                <Info className="w-4 h-4" />
                About the Community
              </button>
              
              <button 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-sm font-medium"
                data-testid="button-community-rules"
              >
                <BookOpen className="w-4 h-4" />
                Community Rules
              </button>
            </div>

            {/* Joint Delivery Banner */}
            <div className="bg-gradient-to-br from-green-800 to-yellow-700 dark:from-green-900 dark:to-yellow-800 rounded-xl p-4 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-20">
                <ShoppingBag className="w-32 h-32 -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="w-5 h-5" />
                  <h3 className="font-semibold">Need Help Fulfilling an Order?</h3>
                </div>
                <button 
                  className="bg-white text-green-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                  data-testid="button-request-joint-delivery"
                >
                  Request Joint Delivery
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="flex px-4">
            {[
              { key: "posts" as const, label: "Posts" },
              { key: "resources" as const, label: "Resources" },
              { key: "joint-delivery" as const, label: "Joint Delivery" },
              { key: "targets" as const, label: "Targets" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? "text-green-700 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                data-testid={`tab-${tab.key}`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700 dark:bg-green-400"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4">
          {/* Create Post */}
          {activeTab === "posts" && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                  <input
                    type="text"
                    placeholder="Create a post..."
                    className="flex-1 bg-transparent text-gray-600 dark:text-gray-400 placeholder:text-gray-500 dark:placeholder:text-gray-500 outline-none"
                    data-testid="input-create-post"
                  />
                  <button 
                    className="w-10 h-10 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                    data-testid="button-add-photo"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Posts Feed */}
              {posts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                  data-testid={`post-${post.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {post.authorName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {post.timestamp}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "resources" && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No resources available yet</p>
            </div>
          )}

          {activeTab === "joint-delivery" && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No joint delivery requests</p>
            </div>
          )}

          {activeTab === "targets" && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No targets set yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
