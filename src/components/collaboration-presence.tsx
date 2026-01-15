"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Eye, Edit3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CollaboratorPresence {
  id: string;
  name: string;
  imageUrl?: string;
  status: "viewing" | "editing";
  color: string;
}

const PRESENCE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function getColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

interface CollaborationPresenceProps {
  mindMapId: Id<"mindMaps">;
  currentUserId: Id<"users">;
  currentUserName: string;
  currentUserImage?: string;
}

export function CollaborationPresence({
  mindMapId,
  currentUserId,
  currentUserName,
  currentUserImage,
}: CollaborationPresenceProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const collaboratorsData = useQuery(api.collaboration.getCollaborators, { mindMapId });

  useEffect(() => {
    if (collaboratorsData) {
      const presenceList: CollaboratorPresence[] = collaboratorsData
        .filter(c => c.userId !== currentUserId)
        .map(c => ({
          id: c.userId,
          name: c.user?.name || "Anonymous",
          imageUrl: c.user?.imageUrl,
          status: "viewing" as const,
          color: getColorForUser(c.userId),
        }));
      setCollaborators(presenceList);
    }
  }, [collaboratorsData, currentUserId]);

  const totalCount = collaborators.length;
  const displayedCollaborators = collaborators.slice(0, 3);
  const remainingCount = totalCount - displayedCollaborators.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{totalCount + 1}</span>
        </div>

        <div className="flex -space-x-2">
          <AnimatePresence mode="popLayout">
            {displayedCollaborators.map((collaborator) => (
              <Tooltip key={collaborator.id}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="relative"
                  >
                    <div
                      className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white overflow-hidden"
                      style={{ backgroundColor: collaborator.color }}
                    >
                      {collaborator.imageUrl ? (
                        <img
                          src={collaborator.imageUrl}
                          alt={collaborator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        collaborator.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background flex items-center justify-center"
                      style={{ backgroundColor: collaborator.status === "editing" ? "#22c55e" : "#6b7280" }}
                    >
                      {collaborator.status === "editing" ? (
                        <Edit3 className="w-1.5 h-1.5 text-white" />
                      ) : (
                        <Eye className="w-1.5 h-1.5 text-white" />
                      )}
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{collaborator.name}</p>
                  <p className="text-muted-foreground">
                    {collaborator.status === "editing" ? "Editing" : "Viewing"}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}

            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    +{remainingCount}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{remainingCount} more collaborator{remainingCount > 1 ? "s" : ""}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface PresenceAvatarProps {
  name: string;
  imageUrl?: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

export function PresenceAvatar({ name, imageUrl, color, size = "md" }: PresenceAvatarProps) {
  const sizeClasses = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white overflow-hidden`}
      style={{ backgroundColor: color }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
