import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Users, Info, BookOpen, ShoppingBag, Camera, MessageCircle, Heart, MoreVertical, MoreHorizontal, Menu, FileText, ChevronDown, Download, Flag, Truck, MapPin, Calendar, UserCheck, Leaf, Share2 } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

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

interface Resource {
  id: string;
  title: string;
  image: string;
  fileType: string;
}

interface JointDeliveryRequest {
  id: string;
  communityId: string;
  crop: string;
  totalNeeded: number;
  have: number;
  need: number;
  location: string;
  dueDate: string;
  additionalDetails?: string;
  progress: number;
  helpingFarmers: string[];
  createdAt: string;
}

export function CommunityDetail() {
  useSessionValidation();
  
  const params = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"posts" | "resources" | "joint-delivery" | "targets">("posts");
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [showMenuIcon, setShowMenuIcon] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [cropFilter, setCropFilter] = useState("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);
  const [jointDeliveryView, setJointDeliveryView] = useState<"me" | "others">("me");
  const [jointDeliveryRequests, setJointDeliveryRequests] = useState<JointDeliveryRequest[]>([]);
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

  // Mock resources data
  const resources: Resource[] = [
    {
      id: "res-1",
      title: "Optimizing Cassava Yields: A Comprehensive Guide",
      image: "🌾",
      fileType: "PDF"
    },
    {
      id: "res-2",
      title: "Sustainable Practices in Cassava Cultivation",
      image: "🌾",
      fileType: "PDF"
    },
    {
      id: "res-3",
      title: "The Economic Impact of Cassava Farming",
      image: "🌾",
      fileType: "PDF"
    }
  ];

  // Load joint delivery requests from localStorage
  useEffect(() => {
    const loadJointDeliveryRequests = () => {
      const saved = localStorage.getItem("jointDeliveryRequests");
      if (saved) {
        const allRequests = JSON.parse(saved);
        // Filter requests for this community
        const communityRequests = allRequests.filter(
          (req: JointDeliveryRequest) => req.communityId === community.id
        );
        setJointDeliveryRequests(communityRequests);
      }
    };

    loadJointDeliveryRequests();
    
    // Listen for changes to localStorage (from other tabs or after creating a request)
    window.addEventListener('storage', loadJointDeliveryRequests);
    return () => window.removeEventListener('storage', loadJointDeliveryRequests);
  }, [community.id, activeTab]);

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
    // Reset animation state when manually toggling
    if (!isHeaderExpanded) {
      hasAnimatedOnce.current = false;
    }
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
                <button 
                  key={post.id}
                  onClick={() => setLocation(`/community/${community.id}/post/${post.id}`)}
                  className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all text-left"
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
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {activeTab === "resources" && (
            <>
              {/* Filter Section */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Sort By Dropdown */}
                <div className="relative flex-1">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                    data-testid="select-sort-by"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>

                {/* Crop Filter Dropdown */}
                <div className="relative flex-1">
                  <select
                    value={cropFilter}
                    onChange={(e) => setCropFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                    data-testid="select-crop-filter"
                  >
                    <option value="all">All Crops</option>
                    <option value="cassava">Cassava</option>
                    <option value="rice">Rice</option>
                    <option value="maize">Maize</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Resources List */}
              <div className="space-y-3">
                {resources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => {
                      setSelectedResource(resource);
                      setIsResourceDrawerOpen(true);
                    }}
                    className="w-full bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all flex items-center gap-4 text-left"
                    data-testid={`resource-${resource.id}`}
                  >
                    {/* Resource Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-800 to-amber-950 dark:from-amber-900 dark:to-black rounded-lg flex items-center justify-center flex-shrink-0 text-3xl sm:text-4xl relative overflow-hidden">
                      {resource.image}
                      <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                        <FileText className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                      </div>
                    </div>

                    {/* Resource Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {resource.fileType}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {resources.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No resources available yet</p>
                </div>
              )}
            </>
          )}

          {activeTab === "joint-delivery" && (
            <>
              {/* View Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setJointDeliveryView("me")}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                    jointDeliveryView === "me"
                      ? "bg-green-800 dark:bg-green-700 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  data-testid="button-view-me"
                >
                  Me
                </button>
                <button
                  onClick={() => setJointDeliveryView("others")}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                    jointDeliveryView === "others"
                      ? "bg-green-800 dark:bg-green-700 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                  data-testid="button-view-others"
                >
                  Other Farmers
                </button>
              </div>

              {/* Joint Delivery Cards */}
              {jointDeliveryRequests.length > 0 ? (
                <div className="space-y-4">
                  {jointDeliveryRequests.map((request) => {
                    const formattedDate = new Date(request.dueDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <div
                        key={request.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5"
                        data-testid={`joint-delivery-${request.id}`}
                      >
                        {/* Header with crop name and icon */}
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                            {request.crop}
                          </h3>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-green-700 dark:text-green-500" />
                          </div>
                        </div>

                        {/* Order details */}
                        <div className="mb-3">
                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                            Total Needed: {request.totalNeeded}kg
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              Have: {request.have}kg
                            </span>
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              Need: {request.need}kg
                            </span>
                          </div>
                        </div>

                        {/* Location and Date */}
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {formattedDate}</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <UserCheck className="w-4 h-4" />
                          <span>
                            {request.helpingFarmers.length === 0
                              ? "No farmer helping yet"
                              : `${request.helpingFarmers.length} farmer${request.helpingFarmers.length > 1 ? 's' : ''} helping`
                            }
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{request.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-700 dark:bg-green-600 transition-all duration-300"
                              style={{ width: `${request.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            className="flex-1 bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition-colors"
                            data-testid={`button-manage-${request.id}`}
                          >
                            Manage Order
                          </button>
                          <button
                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2"
                            data-testid={`button-share-${request.id}`}
                          >
                            <Share2 className="w-5 h-5" />
                            Share
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-10 h-10 text-green-700 dark:text-green-400" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Joint Deliveries Yet
                  </h3>
                  
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-8 max-w-sm">
                    Got an order that's too big for you alone? Find other farmers to help you fulfil it together.
                  </p>

                  <button
                    onClick={() => setLocation(`/community/${community.id}/joint-delivery-request`)}
                    className="w-full max-w-sm bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3.5 rounded-xl font-semibold transition-colors mb-3"
                    data-testid="button-request-joint-delivery"
                  >
                    Request Joint Delivery
                  </button>

                  <button
                    onClick={() => setJointDeliveryView("others")}
                    className="text-gray-700 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    data-testid="button-view-requests-others"
                  >
                    View Requests by Other Farmers
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "targets" && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No targets set yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Resource Viewer Drawer */}
      <Drawer open={isResourceDrawerOpen} onOpenChange={setIsResourceDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left pb-4">
            <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 pr-8">
              {selectedResource?.title}
            </DrawerTitle>
            <button 
              onClick={() => {
                setIsResourceDrawerOpen(false);
                setLocation(`/community/${community.id}/report-resource/${selectedResource?.id}`);
              }}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 mt-2 text-sm font-medium hover:text-red-700 dark:hover:text-red-500 transition-colors"
              data-testid="button-report-content"
            >
              <Flag className="w-4 h-4" />
              Report Content
            </button>
          </DrawerHeader>
          
          <div className="px-4 pb-4 flex-1 overflow-y-auto">
            {/* Preview Area */}
            <div className="w-full h-[400px] sm:h-[500px] bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-2" />
                <p className="text-sm">PDF Preview</p>
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-4">
            <button 
              className="w-full bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              data-testid="button-download"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <DrawerClose asChild>
              <button 
                className="w-full text-gray-700 dark:text-gray-300 py-3 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                data-testid="button-close-drawer"
              >
                Close
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
