"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Link2,
  Copy,
  Check,
  X,
  UserPlus,
  Crown,
  Eye,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";

interface ShareDialogProps {
  mindMapId: Id<"mindMaps">;
  userId: Id<"users">;
  mindMapTitle: string;
  isOwner: boolean;
  onClose: () => void;
}

export function ShareDialog({
  mindMapId,
  userId,
  mindMapTitle,
  isOwner,
  onClose,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const collaborators = useQuery(api.collaboration.getCollaborators, { mindMapId });
  const pendingInvitations = useQuery(api.collaboration.getPendingInvitations, { mindMapId });

  const inviteByEmail = useMutation(api.collaboration.inviteByEmail);
  const removeCollaborator = useMutation(api.collaboration.removeCollaborator);
  const cancelInvitation = useMutation(api.collaboration.cancelInvitation);
  const generateShareLink = useMutation(api.collaboration.generateShareLink);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setIsInviting(true);
    setError(null);

    try {
      await inviteByEmail({
        mindMapId,
        email: email.trim(),
        role,
        invitedBy: userId,
      });
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const token = await generateShareLink({
        mindMapId,
        role,
        invitedBy: userId,
      });
      const link = `${window.location.origin}/join/${token}`;
      setShareLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate link");
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveCollaborator = async (collaboratorUserId: Id<"users">) => {
    try {
      await removeCollaborator({
        mindMapId,
        userId: collaboratorUserId,
        requestedBy: userId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove collaborator");
    }
  };

  const handleCancelInvitation = async (invitationId: Id<"invitations">) => {
    try {
      await cancelInvitation({
        invitationId,
        requestedBy: userId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel invitation");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCard>
          <PixelCardHeader className="flex flex-row items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Share Mind Map
            </PixelCardTitle>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </PixelCardHeader>

          <PixelCardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sharing</p>
              <p className="font-medium text-foreground">{mindMapTitle}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            {isOwner && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Invite by email
                  </label>
                  <div className="flex gap-2">
                    <PixelInput
                      type="email"
                      placeholder="colleague@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
                      className="px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>
                  <PixelButton
                    onClick={handleInvite}
                    disabled={!email.trim() || isInviting}
                    className="w-full"
                  >
                    {isInviting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Invitation
                  </PixelButton>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Share via link
                  </label>
                  {shareLink ? (
                    <div className="flex gap-2">
                      <PixelInput
                        value={shareLink}
                        readOnly
                        className="flex-1 text-xs"
                      />
                      <PixelButton variant="outline" onClick={handleCopyLink}>
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </PixelButton>
                    </div>
                  ) : (
                    <PixelButton variant="outline" onClick={handleGenerateLink} className="w-full">
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate Share Link
                    </PixelButton>
                  )}
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Collaborators
                </label>
                <PixelBadge variant="secondary">
                  {(collaborators?.length || 0) + 1}
                </PixelBadge>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Owner</p>
                      <p className="text-xs text-muted-foreground">You</p>
                    </div>
                  </div>
                  <PixelBadge>Owner</PixelBadge>
                </div>

                <AnimatePresence>
                  {collaborators?.map((collab) => (
                    <motion.div
                      key={collab._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                          {collab.role === "editor" ? (
                            <Edit3 className="w-4 h-4 text-secondary-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-secondary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {collab.user?.name || collab.user?.email || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {collab.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PixelBadge variant="secondary">
                          {collab.role === "editor" ? "Editor" : "Viewer"}
                        </PixelBadge>
                        {isOwner && (
                          <button
                            onClick={() => handleRemoveCollaborator(collab.userId)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {isOwner && pendingInvitations && pendingInvitations.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Pending Invitations
                </label>
                <div className="space-y-2">
                  <AnimatePresence>
                    {pendingInvitations.map((inv) => (
                      <motion.div
                        key={inv._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-foreground">
                            {inv.email || "Link invitation"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PixelBadge variant="secondary">
                            {inv.role === "editor" ? "Editor" : "Viewer"}
                          </PixelBadge>
                          <button
                            onClick={() => handleCancelInvitation(inv._id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}
