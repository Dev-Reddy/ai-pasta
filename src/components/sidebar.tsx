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
  Menu,
  Key,
  ChevronFirst,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project, Chat } from "@/lib/types";

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
        "flex h-full flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
          {!isCollapsed && (
            <h1 className="text-lg font-semibold text-white">AI Pasta</h1>
          )}
        </div>

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 text-white hover:bg-gray-800 cusor-pointer"
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
            className="h-10 w-10 bg-purple-600 text-white hover:bg-purple-700"
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="h-10 w-10 text-gray-400 hover:bg-gray-800 hover:text-white"
            title="Settings"
          >
            <Key className="h-4 w-4" />
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
              className="w-full justify-start gap-2 text-white bg-black/50 hover:bg-gray-800 hover:text-white"
            >
              API Keys
              <Key className="h-4 w-4" />
            </Button>

            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg"
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
