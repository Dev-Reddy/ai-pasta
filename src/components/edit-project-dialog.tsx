"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Project } from "@/lib/types"

interface EditProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onUpdateProject: (id: string, name: string, systemContext: string) => void
  onDeleteProject: (id: string) => void
}

export function EditProjectDialog({
  open,
  onOpenChange,
  project,
  onUpdateProject,
  onDeleteProject,
}: EditProjectDialogProps) {
  const [name, setName] = useState("")
  const [systemContext, setSystemContext] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setSystemContext(project.systemContext)
    } else {
      setName("")
      setSystemContext("")
    }
    setShowDeleteConfirm(false)
  }, [project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (project && name.trim() && systemContext.trim()) {
      onUpdateProject(project.id, name.trim(), systemContext.trim())
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (project) {
      onDeleteProject(project.id)
      onOpenChange(false)
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project name and system context that will be used for all AI model conversations.
          </DialogDescription>
        </DialogHeader>

        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Web Development Assistant"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-context">System Context</Label>
                <Textarea
                  id="edit-context"
                  value={systemContext}
                  onChange={(e) => setSystemContext(e.target.value)}
                  placeholder="You are a helpful assistant specialized in..."
                  className="min-h-[120px]"
                  required
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete Project
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Project</Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone and will also delete all
                associated chats.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
