import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Search } from "lucide-react";
import { Link } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { HamburgerMenu } from "@/components/HamburgerMenu";

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

// Helper function to detect user type
function getUserType(): "buyer" | "farmer" {
  const buyerSession = sessionStorage.getItem("buyerSession");
  const farmerSession = sessionStorage.getItem("farmerSession");
  
  if (buyerSession) {
    return "buyer";
  } else if (farmerSession) {
    return "farmer";
  }
  
  // Default to buyer if neither found
  return "buyer";
}

export function Communities() {
  // Validate session (both buyers and farmers can access communities)
  useSessionValidation();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my-communities" | "discover">("my-communities");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Detect user type
  const userType = getUserType();
  const homeRoute = userType === "buyer" ? "/buyer-home" : "/farmer-dashboard";

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

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      // In a real app, you would fetch from your API
      setTimeout(() => {
        setCommunities(mockCommunities);
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
    
    if (activeTab === "my-communities") {
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

  const myCommunities = communities.filter(c => c.isJoined);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={homeRoute}>
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer" data-testid="button-back" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Communities</h1>
        </div>
        <HamburgerMenu userType={userType} />
      </div>

      {/* Main Content Container - max width for desktop */}
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 px-4 md:px-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("my-communities")}
              className={`flex-1 md:flex-initial px-4 md:px-8 py-4 text-sm md:text-base font-medium transition-colors relative ${
                activeTab === "my-communities"
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              data-testid="tab-my-communities"
            >
              My Communities
              {activeTab === "my-communities" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700 dark:bg-green-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`flex-1 md:flex-initial px-4 md:px-8 py-4 text-sm md:text-base font-medium transition-colors relative ${
                activeTab === "discover"
                  ? "text-green-700 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              data-testid="tab-discover"
            >
              Discover
              {activeTab === "discover" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700 dark:bg-green-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Search - Only show on Discover tab */}
        {activeTab === "discover" && (
          <div className="bg-white dark:bg-gray-800 px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
        <div className="p-4 md:p-6">
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

          {/* My Communities Tab Content */}
          {!isLoading && activeTab === "my-communities" && (
            <>
              {myCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 text-center">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 mb-6 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <Users className="w-10 h-10 md:w-12 md:h-12 text-green-600 dark:text-green-400" />
                  </div>

                  {/* Empty State Text */}
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    You don't belong to any community yet
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                    Join a community to connect with other farmers, share knowledge, and sell together.
                  </p>

                  {/* Action Buttons */}
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="w-full md:w-auto px-8 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors mb-4"
                    data-testid="button-discover-communities"
                  >
                    Discover Communities
                  </button>

                  <button
                    className="text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors"
                    data-testid="button-create-community"
                  >
                    Create My Own Community
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCommunities.map((community) => (
                    <div
                      key={community.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
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
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                              {community.name}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full ml-2">
                              {community.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {community.description}
                          </p>

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatNumber(community.memberCount)} members</span>
                              <span>•</span>
                              <span>{community.posts} posts</span>
                            </div>
                            
                            <button
                              onClick={() => handleJoinCommunity(community.id)}
                              className="px-4 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                              data-testid={`leave-${community.id}`}
                            >
                              Joined
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Discover Tab Content */}
          {!isLoading && activeTab === "discover" && (
            <div className="space-y-4">
              {filteredCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No communities found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try a different search term
                  </p>
                </div>
              ) : (
                filteredCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
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
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {community.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full ml-2">
                            {community.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {community.description}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatNumber(community.memberCount)} members</span>
                            <span>•</span>
                            <span>{community.posts} posts</span>
                          </div>
                          
                          <button
                            onClick={() => handleJoinCommunity(community.id)}
                            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
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
        </div>
      </div>
    </div>
  );
}
