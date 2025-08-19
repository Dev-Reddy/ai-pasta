// components/ui/chat-interface.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "./sidebar"
import { MultiProviderChat } from "./multi-provider-chat"
import { SettingsDialog } from "./settings-dialog"
import { NewProjectDialog } from "./new-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { db } from "@/lib/database"
import type { Project, Chat, AIProvider } from "@/lib/types"

export function ChatInterface() {
  const [projects, setProjects] = useState<Project[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string>()
  const [currentProjectId, setCurrentProjectId] = useState<string>()
  const [showSettings, setShowSettings] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [showEditProject, setShowEditProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const multiProviderChatRef = useRef<{ handleApiKeySaved: (provider: AIProvider) => void }>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [projectsData, chatsData, apiKeys] = await Promise.all([db.getProjects(), db.getChats(), db.getApiKeys()])

    setProjects(projectsData)
    setChats(chatsData)
    setAvailableProviders(apiKeys.map((key) => key.provider))

    // Ensure we have an active chat selected
    if (!currentChatId) {
      if (chatsData.length > 0) {
        setCurrentChatId(chatsData[0].id)
        setCurrentProjectId(undefined)
      } else {
        const newChat = await db.createChat("New Chat")
        setChats((prev) => [newChat, ...prev])
        setCurrentChatId(newChat.id)
        setCurrentProjectId(undefined)
      }
    }
  }

  const handleApiKeySaved = (provider: AIProvider) => {
    multiProviderChatRef.current?.handleApiKeySaved(provider)
  }

  const handleNewChat = async () => {
    const chat = await db.createChat("New Chat")
    setChats((prev) => [chat, ...prev])
    setCurrentChatId(chat.id)
    setCurrentProjectId(undefined)
  }

  const handleNewProject = async (name: string, systemContext: string) => {
    const project = await db.createProject(name, systemContext)
    setProjects((prev) => [project, ...prev])
    setCurrentProjectId(project.id)
    setCurrentChatId(undefined)
    setShowNewProject(false)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowEditProject(true)
  }

  const handleUpdateProject = async (id: string, name: string, systemContext: string) => {
    await db.updateProject(id, { name, systemContext })
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name, systemContext, updatedAt: new Date() } : p)))
    setShowEditProject(false)
    setEditingProject(null)
  }

  const handleDeleteProject = async (id: string) => {
    await db.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setChats((prev) => prev.filter((c) => c.projectId !== id))

    // Clear current project if it was deleted
    if (currentProjectId === id) {
      setCurrentProjectId(undefined)
    }

    setShowEditProject(false)
    setEditingProject(null)
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setCurrentProjectId(undefined)
  }

  const handleSelectProject = async (projectId: string) => {
    setCurrentProjectId(projectId)
    // Create and select a new chat for this project to enable sending immediately
    const chat = await db.createChat("New Chat", projectId)
    setChats((prev) => [chat, ...prev])
    setCurrentChatId(chat.id)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        projects={projects}
        chats={chats}
        currentChatId={currentChatId}
        currentProjectId={currentProjectId}
        onNewChat={handleNewChat}
        onNewProject={() => setShowNewProject(true)}
        onSelectChat={handleSelectChat}
        onSelectProject={handleSelectProject}
        onEditProject={handleEditProject}
        onOpenSettings={() => setShowSettings(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1">
        <MultiProviderChat
          ref={multiProviderChatRef}
          currentChatId={currentChatId}
          currentProjectId={currentProjectId}
          availableProviders={availableProviders}
        />
      </div>

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        onApiKeysUpdated={loadData}
        onApiKeySaved={handleApiKeySaved}
      />

      <NewProjectDialog open={showNewProject} onOpenChange={setShowNewProject} onCreateProject={handleNewProject} />

      <EditProjectDialog
        open={showEditProject}
        onOpenChange={setShowEditProject}
        project={editingProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  )
}
