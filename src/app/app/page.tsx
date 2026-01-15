"use client";

import { useState, useCallback, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trash2, Clock, LogIn, Zap, Sparkles, PanelRightOpen, PanelRightClose, Share2, Download, Upload, Users, AlertCircle } from "lucide-react";
import { UserDropdown } from "@/components/user-dropdown";
import { LiveVoiceRecorder } from "@/components/live-voice-recorder";
import { AnimatedMindMap } from "@/components/animated-mind-map";
import { TopicInsightsPanel } from "@/components/topic-insights-panel";
import { ShareDialog } from "@/components/share-dialog";
import { ExportImportDialog } from "@/components/export-import-dialog";
import { MindMapSkeleton } from "@/components/mind-map-skeleton";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { Id } from "@/../convex/_generated/dataModel";

export default function HomePage() {
  const { isSignedIn, user } = useUser();
  
  const [selectedMapId, setSelectedMapId] = useState<Id<"mindMaps"> | null>(null);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [mockUserId, setMockUserId] = useState<Id<"users"> | null>(null);
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportImportDialog, setShowExportImportDialog] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );

  const mindMaps = useQuery(
    api.mindMaps.getByUser,
    (currentUser || mockUserId) ? { userId: (currentUser?._id || mockUserId)! } : "skip"
  );

  const mindMapData = useQuery(
    api.mindMaps.getWithData,
    selectedMapId && !isLiveSession ? { id: selectedMapId } : "skip"
  );

  const liveData = useQuery(
    api.liveSession.getLiveData,
    selectedMapId && isLiveSession ? { mindMapId: selectedMapId } : "skip"
  );

  const liveSessionMap = useQuery(
    api.mindMaps.getById,
    selectedMapId && isLiveSession ? { id: selectedMapId } : "skip"
  );

  const selectedMap = mindMapData?.mindMap || liveSessionMap;

  const deleteMindMap = useMutation(api.mindMaps.remove);

  useEffect(() => {
    if (isSignedIn && user && !currentUser) {
      getOrCreateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || undefined,
        imageUrl: user.imageUrl || undefined,
      });
    } else if (!isSignedIn && !mockUserId) {
      getOrCreateUser({
        clerkId: "demo-user-" + Date.now(),
        email: "demo@mindrei.app",
        name: "Demo User",
      }).then((userId) => setMockUserId(userId as Id<"users">));
    }
  }, [isSignedIn, user, currentUser, mockUserId, getOrCreateUser]);

  const handleSessionStart = (mindMapId: Id<"mindMaps">, rootNodeId: Id<"nodes">) => {
    setIsLoadingMap(true);
    setSelectedMapId(mindMapId);
    setIsLiveSession(true);
    setTimeout(() => setIsLoadingMap(false), 500);
  };

  const handleSelectMap = (mapId: Id<"mindMaps">) => {
    setIsLoadingMap(true);
    setSelectedMapId(mapId);
    setIsLiveSession(false);
    setTimeout(() => setIsLoadingMap(false), 800);
  };

  const handleSessionEnd = () => {
    setIsLiveSession(false);
  };

  const handleDeleteMap = async (mapId: Id<"mindMaps">) => {
    if (selectedMapId === mapId) {
      setSelectedMapId(null);
      setIsLiveSession(false);
    }
    await deleteMindMap({ id: mapId });
  };

  const animatedNodes = (isLiveSession ? liveData?.nodes : mindMapData?.nodes)?.map((n) => ({
    id: n._id,
    label: n.label,
    content: n.content,
    x: n.positionX,
    y: n.positionY,
    level: n.level,
    color: n.color || "#c4b5fd",
    parentId: n.parentId,
  })) || [];

  const animatedEdges = (isLiveSession ? liveData?.edges : mindMapData?.edges)?.map((e) => ({
    id: e._id,
    sourceId: e.sourceId,
    targetId: e.targetId,
  })) || [];

  const isDataLoading = selectedMapId && (isLoadingMap || (!isLiveSession && !mindMapData) || (isLiveSession && !liveData));
  const hasData = animatedNodes.length > 0;

  const activeUserId = currentUser?._id || mockUserId;

  const sharedMindMaps = useQuery(
    api.collaboration.getSharedMindMaps,
    activeUserId ? { userId: activeUserId } : "skip"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              MindRei
            </h1>
            {isLiveSession && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-500"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {activeUserId && (
              <LiveVoiceRecorder
                userId={activeUserId}
                onSessionStart={handleSessionStart}
                onSessionEnd={handleSessionEnd}
                activeMindMapId={selectedMapId}
              />
            )}

            <PixelCard>
              <PixelCardHeader>
                <PixelCardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    My Maps
                  </span>
                  <PixelBadge variant="secondary">
                    {mindMaps?.length || 0}
                  </PixelBadge>
                </PixelCardTitle>
              </PixelCardHeader>
              <PixelCardContent className="space-y-2 max-h-[350px] overflow-y-auto">
                <AnimatePresence>
                  {mindMaps?.map((map, index) => (
                    <motion.div
                      key={map._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedMapId === map._id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                      }`}
                      onClick={() => handleSelectMap(map._id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">
                            {map.title}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(map.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMap(map._id);
                          }}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {(!mindMaps || mindMaps.length === 0) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Brain className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No maps yet</p>
                    <p className="text-xs mt-1 opacity-70">
                      Start a live session to create one
                    </p>
                  </motion.div>
                )}
              </PixelCardContent>
            </PixelCard>

            {sharedMindMaps && sharedMindMaps.length > 0 && (
              <PixelCard>
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Shared with Me
                    </span>
                    <PixelBadge variant="secondary">
                      {sharedMindMaps.length}
                    </PixelBadge>
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                  <AnimatePresence>
                    {sharedMindMaps.map((map, index) => (
                      <motion.div
                        key={map._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedMapId === map._id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                        }`}
                        onClick={() => {
                          if (map._id) handleSelectMap(map._id);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate text-sm">
                              {map.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{map.owner?.name || "Unknown"}</span>
                              <PixelBadge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {map.role}
                              </PixelBadge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </PixelCardContent>
              </PixelCard>
            )}

            <PixelButton
              variant="outline"
              className="w-full"
              onClick={() => setShowExportImportDialog(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Mind Map
            </PixelButton>
          </div>

          <div className={showInsightsPanel && selectedMapId ? "lg:col-span-6" : "lg:col-span-9"}>
            <AnimatePresence mode="wait">
              {isDataLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-220px)] min-h-[500px]"
                >
                  <MindMapSkeleton />
                </motion.div>
              ) : selectedMapId && hasData ? (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-semibold text-foreground">
                        {selectedMap?.title || "Mind Map"}
                      </h2>
                      {isLiveSession && (
                        <PixelBadge variant="default" className="text-xs">
                          Recording
                        </PixelBadge>
                      )}
                      {selectedMap?.mainTopic && (
                        <PixelBadge variant="secondary" className="text-xs flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {selectedMap.mainTopic}
                        </PixelBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <PixelButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowShareDialog(true)}
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </PixelButton>
                      <PixelButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExportImportDialog(true)}
                        title="Export/Import"
                      >
                        <Download className="w-4 h-4" />
                      </PixelButton>
                      <PixelButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInsightsPanel(!showInsightsPanel)}
                      >
                        {showInsightsPanel ? (
                          <PanelRightClose className="w-4 h-4" />
                        ) : (
                          <PanelRightOpen className="w-4 h-4" />
                        )}
                      </PixelButton>
                      <PixelButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMapId(null);
                          setIsLiveSession(false);
                        }}
                      >
                        Close
                      </PixelButton>
                    </div>
                  </div>
                  <motion.div 
                    className="h-[calc(100vh-220px)] min-h-[500px]"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <AnimatedMindMap
                      nodes={animatedNodes}
                      edges={animatedEdges}
                      isLive={isLiveSession}
                      mindMapId={selectedMapId}
                      onNodeHover={setHoveredNodeId}
                      mainTopic={selectedMap?.mainTopic}
                    />
                  </motion.div>
                </motion.div>
              ) : selectedMapId && !hasData ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-220px)] min-h-[500px] flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-gradient-to-br from-muted/20 to-transparent"
                >
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive/50" />
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm mt-2 opacity-70">
                      This mind map appears to be empty
                    </p>
                    <PixelButton
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSelectedMapId(null);
                        setIsLiveSession(false);
                      }}
                    >
                      Go Back
                    </PixelButton>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-220px)] min-h-[500px] flex items-center justify-center border border-dashed border-border/50 rounded-2xl bg-gradient-to-br from-muted/20 to-transparent"
                >
                  <div className="text-center text-muted-foreground">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    </motion.div>
                    <p className="text-lg font-medium">Ready to create</p>
                    <p className="text-sm mt-2 opacity-70">
                      Start a live session or select an existing map
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {showInsightsPanel && selectedMapId && (
            <div className="lg:col-span-3">
              <div className="h-[calc(100vh-180px)] min-h-[500px]">
                <TopicInsightsPanel
                  mindMapId={selectedMapId}
                  isLive={isLiveSession}
                  onClose={() => setShowInsightsPanel(false)}
                  focusedNodeId={hoveredNodeId}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showShareDialog && selectedMapId && activeUserId && (
          <ShareDialog
            mindMapId={selectedMapId}
            userId={activeUserId}
            mindMapTitle={selectedMap?.title || "Mind Map"}
            isOwner={selectedMap?.userId === activeUserId}
            onClose={() => setShowShareDialog(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExportImportDialog && activeUserId && (
          <ExportImportDialog
            mindMapId={selectedMapId}
            userId={activeUserId}
            onClose={() => setShowExportImportDialog(false)}
            onImportSuccess={(newMapId) => {
              setSelectedMapId(newMapId);
              setShowExportImportDialog(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
