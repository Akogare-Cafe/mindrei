"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  ArrowLeft,
  Bell,
  Globe,
  Palette,
  Volume2,
  Monitor,
  Moon,
  Sun,
  Mic,
  Brain,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle, PixelCardDescription } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { useTheme } from "@/components/providers/theme-provider";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { mode, toggleMode } = useTheme();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sessionReminders: true,
      weeklyDigest: false,
    },
    voice: {
      autoStart: false,
      continuousMode: true,
      language: "en-US",
      sensitivity: "medium",
    },
    ai: {
      autoInsights: true,
      detailedAnalysis: false,
      suggestRelated: true,
    },
    appearance: {
      compactMode: false,
      animations: true,
      showTips: true,
    },
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isLoaded || !user) {
    router.push("/");
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const ToggleSwitch = ({ 
    enabled, 
    onChange 
  }: { 
    enabled: boolean; 
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? "calc(100% - 20px)" : "4px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/app">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </PixelButton>
          </Link>
          <PixelButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saveSuccess ? "Saved!" : "Save Settings"}
          </PixelButton>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-7 h-7 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize your MindRei experience
            </p>
          </div>

          {/* Appearance */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </PixelCardTitle>
              <PixelCardDescription>
                Customize how MindRei looks
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  {mode === "dark" ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      {mode === "dark" ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => mode === "dark" && toggleMode()}
                    className={`p-2 rounded-lg transition-colors ${
                      mode === "light" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => mode === "light" && toggleMode()}
                    className={`p-2 rounded-lg transition-colors ${
                      mode === "dark" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Use smaller UI elements
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.appearance.compactMode}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, compactMode: !settings.appearance.compactMode },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Animations</p>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.appearance.animations}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, animations: !settings.appearance.animations },
                    })
                  }
                />
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Voice Settings */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" />
                Voice Recording
              </PixelCardTitle>
              <PixelCardDescription>
                Configure voice recognition settings
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Auto-start Recording</p>
                    <p className="text-sm text-muted-foreground">
                      Start recording when opening a session
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.voice.autoStart}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      voice: { ...settings.voice, autoStart: !settings.voice.autoStart },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Continuous Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Keep recording after pauses
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.voice.continuousMode}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      voice: { ...settings.voice, continuousMode: !settings.voice.continuousMode },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Language</p>
                    <p className="text-sm text-muted-foreground">
                      Voice recognition language
                    </p>
                  </div>
                </div>
                <select
                  value={settings.voice.language}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      voice: { ...settings.voice, language: e.target.value },
                    })
                  }
                  className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                </select>
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* AI Settings */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI & Insights
              </PixelCardTitle>
              <PixelCardDescription>
                Configure AI-powered features
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Auto-generate Insights</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically research topics as you speak
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.ai.autoInsights}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, autoInsights: !settings.ai.autoInsights },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Detailed Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Get more in-depth topic analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PixelBadge variant="secondary" className="text-xs">Pro</PixelBadge>
                  <ToggleSwitch
                    enabled={settings.ai.detailedAnalysis}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        ai: { ...settings.ai, detailedAnalysis: !settings.ai.detailedAnalysis },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Suggest Related Topics</p>
                    <p className="text-sm text-muted-foreground">
                      Show related concepts while mapping
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.ai.suggestRelated}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, suggestRelated: !settings.ai.suggestRelated },
                    })
                  }
                />
              </div>
            </PixelCardContent>
          </PixelCard>

          {/* Notifications */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </PixelCardTitle>
              <PixelCardDescription>
                Manage how you receive updates
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.email}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: !settings.notifications.email },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Session Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Remind me to continue sessions
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.sessionReminders}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sessionReminders: !settings.notifications.sessionReminders },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Summary of your activity
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.notifications.weeklyDigest}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, weeklyDigest: !settings.notifications.weeklyDigest },
                    })
                  }
                />
              </div>
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </div>
    </div>
  );
}
