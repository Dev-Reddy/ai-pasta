// components/ui/sidebar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MessageSquare,
  FolderOpen,
  MoreHorizontal,
  Edit,
  Key,
  ChevronFirst,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project, Chat } from "@/lib/types";
import Image from "next/image";

interface SidebarProps {
  projects: Project[];
  chats: Chat[];
  currentChatId?: string;
  currentProjectId?: string;
  onNewChat: () => void;
  onNewProject: () => void;
  onSelectChat: (chatId: string) => void;
  onSelectProject: (projectId: string) => void;
  onEditProject: (project: Project) => void;
  onOpenSettings: () => void;
  onOpenInfo: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  projects,
  chats,
  currentChatId,
  currentProjectId,
  onNewChat,
  onNewProject,
  onSelectChat,
  onSelectProject,
  onEditProject,
  onOpenSettings,
  onOpenInfo,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 3);
  const hiddenProjectsCount = Math.max(0, projects.length - 3);

  const recentChats = chats.filter((chat) => !chat.projectId).slice(0, 10);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-[#080b18]/95 border-r border-white/[0.08] transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-slate-400 hover:bg-white/[0.08] hover:text-white"
          >
            {isCollapsed ? (
              <Image src="/ai-pasta-logo.png" alt="AI Pasta" width={28} height={28} className="rounded-lg" />
            ) : (
              <Image src="/ai-pasta-logo.png" alt="AI Pasta" width={28} height={28} className="rounded-lg" />
            )}
          </Button>
          {!isCollapsed && (
            <div><h1 className="text-lg font-semibold tracking-tight text-white">AI Pasta</h1><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Multi-model studio</p></div>
          )}
        </div>

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-slate-400 hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <Button
            onClick={onNewChat}
            size="icon"
            className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/40 hover:from-violet-400 hover:to-fuchsia-400"
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-10 w-10 text-slate-400 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            title="Settings"
          >
            <Key className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onOpenInfo} className="h-10 w-10 text-gray-400 hover:bg-gray-800 hover:text-white" title="How it works">
            <Info className="h-4 w-4" />
          </Button>

          {projects.length > 0 && <div className="w-8 h-px bg-gray-700 my-2" />}

          {projects.slice(0, 3).map((project) => (
            <Button
              key={project.id}
              variant="ghost"
              size="icon"
              onClick={() => onSelectProject(project.id)}
              className={cn(
                "h-10 w-10 text-gray-400 hover:bg-gray-800 hover:text-white",
                currentProjectId === project.id && "bg-gray-800 text-white"
              )}
              title={project.name}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          ))}

          {recentChats.length > 0 && (
            <>
              <div className="w-8 h-px bg-gray-700 my-2" />
              {recentChats.slice(0, 3).map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "h-10 w-10 text-gray-400 hover:bg-gray-800 hover:text-white",
                    currentChatId === chat.id && "bg-gray-800 text-white"
                  )}
                  title={chat.title}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              ))}
            </>
          )}
        </div>
      ) : (
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-4 py-4">
            <Button
              variant="ghost"
              onClick={onOpenSettings}
              className="w-full justify-start gap-2 text-slate-200 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] hover:text-white cursor-pointer"
            >
              API Keys
              <Key className="h-4 w-4" />
            </Button>

            <Button variant="ghost" onClick={onOpenInfo} className="w-full justify-start gap-2 text-gray-300 hover:bg-gray-800 hover:text-white">
              How it works
              <Info className="h-4 w-4" />
            </Button>

            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400 rounded-xl cursor-pointer shadow-lg shadow-violet-950/30"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>

            <div className="space-y-2">
              <Collapsible
                open={isProjectsOpen}
                onOpenChange={setIsProjectsOpen}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-white hover:text-gray-300">
                  <span>Projects</span>
                  {isProjectsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {visibleProjects.map((project) => (
                    <div key={project.id} className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => onSelectProject(project.id)}
                        className={cn(
                          "flex-1 justify-start gap-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white",
                          currentProjectId === project.id &&
                            "bg-gray-800 text-white"
                        )}
                      >
                        <FolderOpen className="h-4 w-4" />
                        <span className="truncate">{project.name}</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:bg-gray-800 hover:text-white"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-gray-800 border-gray-700"
                        >
                          <DropdownMenuItem
                            onClick={() => onEditProject(project)}
                            className="text-gray-300 hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}

                  {hiddenProjectsCount > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllProjects(!showAllProjects)}
                      className="w-full justify-start text-sm text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      {showAllProjects
                        ? "Show Less"
                        : `Show ${hiddenProjectsCount} More`}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    onClick={onNewProject}
                    className="w-full justify-start gap-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white">Recent Chats</h3>
              <div className="space-y-1">
                {recentChats.length === 0 ? (
                  <p className="text-sm text-gray-500 px-2 py-1">
                    No recent chats
                  </p>
                ) : (
                  recentChats.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      onClick={() => onSelectChat(chat.id)}
                      className={cn(
                        "w-full justify-start gap-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white",
                        currentChatId === chat.id && "bg-gray-800 text-white"
                      )}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <div className="flex flex-col items-start min-w-0">
                        <span className="truncate">{chat.title}</span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(chat.updatedAt)}
                        </span>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
