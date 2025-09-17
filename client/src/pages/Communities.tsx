import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, MessageCircle, Calendar, TrendingUp, Search, Plus } from "lucide-react";
import { Link } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  imageUrl?: string;
  isJoined: boolean;
  lastActivity: string;
  posts: number;
}

interface Post {
  id: string;
  communityName: string;
  authorName: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export function Communities() {
  // Validate session (both buyers and farmers can access communities)
  useSessionValidation();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"discover" | "joined" | "posts">("discover");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for communities
  const mockCommunities: Community[] = [
    {
      id: "comm-1",
      name: "Urban Farmers Network",
      description: "Connect with urban farmers and learn about city farming techniques",
      memberCount: 1250,
      category: "Farming",
      isJoined: true,
      lastActivity: "2 hours ago",
      posts: 45
    },
    {
      id: "comm-2", 
      name: "Fresh Produce Buyers",
      description: "Tips for buying fresh produce, seasonal guides, and quality checks",
      memberCount: 890,
      category: "Buying Tips",
      isJoined: false,
      lastActivity: "1 hour ago",
      posts: 23
    },
    {
      id: "comm-3",
      name: "Sustainable Agriculture",
      description: "Discussing eco-friendly farming practices and organic methods",
      memberCount: 2100,
      category: "Sustainability",
      isJoined: true,
      lastActivity: "30 minutes ago",
      posts: 78
    },
    {
      id: "comm-4",
      name: "Lagos Farmers Market",
      description: "Local community for Lagos-based farmers and buyers",
      memberCount: 650,
      category: "Local",
      isJoined: false,
      lastActivity: "3 hours ago",
      posts: 34
    }
  ];

  // Mock data for recent posts
  const mockPosts: Post[] = [
    {
      id: "post-1",
      communityName: "Urban Farmers Network",
      authorName: "John Farmer",
      title: "Best practices for growing tomatoes in small spaces",
      content: "I've been growing tomatoes on my balcony for 3 years now...",
      timestamp: "2 hours ago",
      likes: 12,
      comments: 5
    },
    {
      id: "post-2",
      communityName: "Fresh Produce Buyers",
      authorName: "Mary Buyer",
      title: "How to identify fresh leafy greens at the market",
      content: "Here are some tips I've learned over the years...",
      timestamp: "4 hours ago",
      likes: 8,
      comments: 3
    },
    {
      id: "post-3",
      communityName: "Sustainable Agriculture",
      authorName: "David Green", 
      title: "Composting basics for beginners",
      content: "Starting your composting journey can seem overwhelming...",
      timestamp: "6 hours ago",
      likes: 15,
      comments: 7
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      // In a real app, you would fetch from your API
      setTimeout(() => {
        setCommunities(mockCommunities);
        setRecentPosts(mockPosts);
        setIsLoading(false);
      }, 800);
    };

    loadData();
  }, []);

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(comm =>
        comm.id === communityId
          ? { ...comm, isJoined: !comm.isJoined, memberCount: comm.isJoined ? comm.memberCount - 1 : comm.memberCount + 1 }
          : comm
      )
    );
  };

  const filteredCommunities = communities.filter(comm => {
    const matchesSearch = comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comm.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "joined") {
      return matchesSearch && comm.isJoined;
    }
    return matchesSearch;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-md mx-auto sm:max-w-none">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center gap-4 shadow-sm">
        <Link href="/buyer-home">
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" data-testid="button-back" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Communities</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {[
            { key: "discover" as const, label: "Discover", icon: TrendingUp },
            { key: "joined" as const, label: "Joined", icon: Users },
            { key: "posts" as const, label: "Recent Posts", icon: MessageCircle }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-green-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              data-testid={`tab-${tab.key}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      {(activeTab === "discover" || activeTab === "joined") && (
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-gray-100"
              data-testid="search-communities"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Communities List */}
        {!isLoading && (activeTab === "discover" || activeTab === "joined") && (
          <div className="space-y-4">
            {filteredCommunities.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {activeTab === "joined" ? "No joined communities" : "No communities found"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeTab === "joined" 
                    ? "Join some communities to connect with others"
                    : "Try a different search term"
                  }
                </p>
              </div>
            ) : (
              filteredCommunities.map((community) => (
                <div
                  key={community.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  data-testid={`community-${community.id}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Community Avatar */}
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>

                    {/* Community Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {community.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {community.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {community.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formatNumber(community.memberCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {community.posts}
                          </span>
                          <span>• {community.lastActivity}</span>
                        </div>
                        
                        <button
                          onClick={() => handleJoinCommunity(community.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            community.isJoined
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                          data-testid={`join-${community.id}`}
                        >
                          {community.isJoined ? "Joined" : "Join"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Recent Posts */}
        {!isLoading && activeTab === "posts" && (
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No recent posts
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Join some communities to see posts from other members
                </p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  data-testid={`post-${post.id}`}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {post.communityName}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {post.authorName}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {post.timestamp}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {post.title}
                    </h4>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <TrendingUp className="w-3 h-3" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}