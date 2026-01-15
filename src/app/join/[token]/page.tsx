"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import { Brain, Loader2, Check, X, UserPlus } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "ready" | "joining" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isSignedIn && user ? { clerkId: user.id } : "skip"
  );

  const acceptShareLink = useMutation(api.collaboration.acceptShareLink);

  useEffect(() => {
    if (currentUser) {
      setStatus("ready");
    }
  }, [currentUser]);

  const handleJoin = async () => {
    if (!currentUser) return;

    setStatus("joining");
    setError(null);

    try {
      const result = await acceptShareLink({
        token,
        userId: currentUser._id,
      });

      if (result.isOwner) {
        setError("You are the owner of this mind map");
        setStatus("error");
        return;
      }

      if (result.alreadyCollaborator) {
        setError("You are already a collaborator on this mind map");
        setStatus("error");
        return;
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
      setStatus("error");
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-4">
        <PixelCard className="w-full max-w-md">
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Join Mind Map
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              You need to sign in to join this mind map collaboration.
            </p>
            <PixelButton
              onClick={() => router.push(`/sign-in?redirect_url=/join/${token}`)}
              className="w-full"
            >
              Sign In to Continue
            </PixelButton>
          </PixelCardContent>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Join Mind Map
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-6">
            {status === "loading" && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Loading...</p>
              </div>
            )}

            {status === "ready" && (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium mb-2">
                    You have been invited to collaborate
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Click below to join this mind map and start collaborating.
                  </p>
                </div>
                <PixelButton onClick={handleJoin} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Mind Map
                </PixelButton>
              </>
            )}

            {status === "joining" && (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-sm">Joining...</p>
              </div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-foreground font-medium mb-2">
                  Successfully joined!
                </p>
                <p className="text-muted-foreground text-sm">
                  Redirecting to your mind maps...
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-foreground font-medium mb-2">
                  Unable to join
                </p>
                <p className="text-destructive text-sm mb-4">
                  {error}
                </p>
                <PixelButton variant="outline" onClick={() => router.push("/")}>
                  Go to Home
                </PixelButton>
              </motion.div>
            )}
          </PixelCardContent>
        </PixelCard>
      </motion.div>
    </div>
  );
}
