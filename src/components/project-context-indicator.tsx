"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, FileText } from "lucide-react"
import type { Project } from "@/lib/types"

interface ProjectContextIndicatorProps {
  project: Project | null
  onEditProject?: () => void
  className?: string
}

export function ProjectContextIndicator({ project, onEditProject, className }: ProjectContextIndicatorProps) {
  if (!project) {
    return (
      <div className={className}>
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-6">
            <div className="text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No project selected</p>
              <p className="text-xs text-muted-foreground">
                Select a project to use custom system context for all AI models
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{project.name}</CardTitle>
              <CardDescription>Project system context active</CardDescription>
            </div>
            {onEditProject && (
              <Button variant="ghost" size="icon" onClick={onEditProject}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge variant="secondary" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              System Context Applied
            </Badge>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-20 overflow-y-auto">
              {project.systemContext}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
