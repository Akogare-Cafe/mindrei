"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  Save,
  ArrowLeft,
  Shield,
  Key,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle, PixelCardDescription } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push("/");
    return null;
  }

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await user.delete();
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/app">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </PixelButton>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Header Card */}
          <PixelCard className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
            <PixelCardContent className="-mt-16 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="relative group">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "Profile"}
                      className="w-28 h-28 rounded-2xl object-cover ring-4 ring-background shadow-xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold ring-4 ring-background shadow-xl">
                      {user.firstName?.[0] || "U"}
                    </div>
                  )}
                  <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left pb-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {user.fullName || "User"}
                  </h1>
                  <p className="text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <PixelBadge variant="secondary">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </PixelBadge>
                    <PixelBadge variant="default">Free Plan</PixelBadge>
                  </div>
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Personal Information */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </PixelCardTitle>
              <PixelCardDescription>
                Update your personal details here
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <PixelInput
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <PixelInput
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <PixelInput
                    id="email"
                    value={user.primaryEmailAddress?.emailAddress || ""}
                    disabled
                    className="pl-10 opacity-60"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <PixelButton onClick={handleUpdateProfile} disabled={isUpdating}>
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : updateSuccess ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {updateSuccess ? "Saved!" : "Save Changes"}
                </PixelButton>
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Security */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Security
              </PixelCardTitle>
              <PixelCardDescription>
                Manage your account security settings
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never
                  </p>
                </div>
                <PixelButton variant="outline" size="sm">
                  Change Password
                </PixelButton>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <PixelButton variant="outline" size="sm">
                  Enable 2FA
                </PixelButton>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Connected Accounts</p>
                  <p className="text-sm text-muted-foreground">
                    {user.externalAccounts?.length || 0} connected
                  </p>
                </div>
                <PixelButton variant="outline" size="sm">
                  Manage
                </PixelButton>
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Danger Zone */}
          <PixelCard className="border-destructive/30">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </PixelCardTitle>
              <PixelCardDescription>
                Irreversible actions for your account
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent>
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="font-medium text-foreground">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <PixelButton
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </PixelButton>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl border border-destructive bg-destructive/10"
                >
                  <p className="font-medium text-destructive mb-2">
                    Are you absolutely sure?
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    This action cannot be undone. All your mind maps, settings, and data will be permanently deleted.
                  </p>
                  <div className="flex items-center gap-3">
                    <PixelButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={handleDeleteAccount}
                    >
                      Yes, Delete My Account
                    </PixelButton>
                  </div>
                </motion.div>
              )}
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </div>
    </div>
  );
}
