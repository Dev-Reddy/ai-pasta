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
import { AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
          <DialogDescription>
            Configure your API keys and application settings.
            {/* warning div here to tell user that api keys are stored in local storage. use incognito mode to avoid extensions from snooping */}
            <Alert className="border-red-200 text-red-400 my-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">
                Security Notice
              </AlertTitle>
              <AlertDescription className="text-amber-700 mt-2">
                <div className="space-y-2">
                  <p>
                    API keys are stored locally in your browser and can be
                    accessed by browser extensions or anyone with access to your
                    device.
                  </p>
                  <div className="text-sm">
                    <strong>For better security:</strong>
                    <ul className="mt-1 space-y-1 ml-4 list-disc">
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
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => {
                const hasExistingKey = existingKeys.some(
                  (key) => key.provider === providerId
                );
                const currentKey = apiKeys[providerId as AIProvider];
                const isShowingKey = showKeys[providerId as AIProvider];

                return (
                  <Card key={providerId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-medium bg-white"
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
                          <CardTitle className="text-base">
                            {provider.name}
                          </CardTitle>
                          <CardDescription>
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
                            placeholder={`Enter ${provider.name} API key`}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
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
                          className="cursor-pointer"
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
                            className="cursor-pointer hover:bg-red-800 hover:text-white"
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
