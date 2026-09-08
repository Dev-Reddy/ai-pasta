"use client";

import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { db } from "@/lib/database";
import type { AIProvider, ApiKey } from "@/lib/types";
import Image from "next/image";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeysUpdated: () => void;
  onApiKeySaved?: (provider: AIProvider) => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  onApiKeysUpdated,
  onApiKeySaved,
}: SettingsDialogProps) {
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    openai: "",
    claude: "",
    gemini: "",
    grok: "",
    deepseek: "",
    perplexity: "",
  });
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    claude: false,
    gemini: false,
    grok: false,
    deepseek: false,
    perplexity: false,
  });
  const [existingKeys, setExistingKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    if (open) {
      loadApiKeys();
    }
  }, [open]);

  const loadApiKeys = async () => {
    const keys = await db.getApiKeys();
    setExistingKeys(keys);

    const keyMap: Record<AIProvider, string> = {
      openai: "",
      claude: "",
      gemini: "",
      grok: "",
      deepseek: "",
      perplexity: "",
    };

    keys.forEach((key) => {
      keyMap[key.provider] = key.key;
    });

    setApiKeys(keyMap);
  };

  const handleSaveKey = async (provider: AIProvider) => {
    const key = apiKeys[provider].trim();
    if (key) {
      await db.setApiKey(provider, key);
      onApiKeysUpdated();
      loadApiKeys();
      onApiKeySaved?.(provider);
    }
    toast.success(`${AI_PROVIDERS[provider].name} API key saved`);
  };

  const handleDeleteKey = async (provider: AIProvider) => {
    await db.deleteApiKey(provider);
    setApiKeys((prev) => ({ ...prev, [provider]: "" }));
    onApiKeysUpdated();
    loadApiKeys();
    toast.success(`${AI_PROVIDERS[provider].name} API key deleted`);
  };

  const toggleShowKey = (provider: AIProvider) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[88vh] overflow-y-auto border-white/[0.1] bg-[#0b1020] text-slate-100 shadow-2xl shadow-black/40">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">API Keys</DialogTitle>
          <DialogDescription className="text-slate-400">
            Connect your providers to unlock side-by-side multi-model chat.
            {/* warning div here to tell user that api keys are stored in local storage. use incognito mode to avoid extensions from snooping */}
            <Alert className="my-4 border-amber-400/20 bg-amber-400/[0.07] text-amber-100">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              <AlertTitle className="text-amber-100">
                Security Notice
              </AlertTitle>
              <AlertDescription className="mt-2 text-amber-100/70">
                <div className="space-y-2">
                  <p>
                    API keys are stored locally in your browser and can be
                    accessed by browser extensions or anyone with access to your
                    device.
                  </p>
                  <div className="text-sm">
                    <strong className="text-amber-100">For better security:</strong>
                    <ul className="mt-2 grid gap-1 sm:grid-cols-2 sm:ml-4 list-disc">
                      <li>Use incognito/private browsing mode</li>
                      <li>Create API keys with limited permissions</li>
                      <li>Regularly rotate your API keys</li>
                      <li>Avoid using on shared computers</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-1 border border-white/[0.08] bg-white/[0.04]">
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-200">Provider connections</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => {
                const hasExistingKey = existingKeys.some(
                  (key) => key.provider === providerId
                );
                const currentKey = apiKeys[providerId as AIProvider];
                const isShowingKey = showKeys[providerId as AIProvider];

                return (
                  <Card key={providerId} className="border-white/[0.08] bg-white/[0.035] transition-colors hover:bg-white/[0.055]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-medium bg-white shadow-inner"
                          )}
                        >
                          <Image
                            src={provider.icon}
                            alt={provider.name}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-sm text-slate-100">
                            {provider.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 text-xs text-slate-500">
                            {hasExistingKey && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                            {hasExistingKey
                              ? "API key configured"
                              : "No API key configured"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label
                            htmlFor={`${providerId}-key`}
                            className="sr-only"
                          >
                            {provider.name} API Key
                          </Label>
                          <Input
                            id={`${providerId}-key`}
                            type={isShowingKey ? "text" : "password"}
                            value={currentKey}
                            onChange={(e) =>
                              setApiKeys((prev) => ({
                                ...prev,
                                [providerId]: e.target.value,
                              }))
                            }
                            className="h-9 border-white/[0.1] bg-black/20 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500/50"
                            placeholder={`Enter ${provider.name} API key`}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-white/[0.1] bg-white/[0.04] text-slate-400 hover:bg-white/[0.1] hover:text-white"
                          onClick={() =>
                            toggleShowKey(providerId as AIProvider)
                          }
                        >
                          {isShowingKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            handleSaveKey(providerId as AIProvider)
                          }
                          disabled={!currentKey.trim()}
                          size="sm"
                          className="cursor-pointer bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400"
                        >
                          Save Key
                        </Button>
                        {hasExistingKey && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteKey(providerId as AIProvider)
                            }
                            className="cursor-pointer border-red-400/20 text-red-300 hover:bg-red-500/15 hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
