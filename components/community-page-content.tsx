"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare, Plus, Search, ThumbsUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { communityPostsQuery } from "@/lib/queries"
import LoadingSpinner from "@/components/common/loading-spinner"
import ErrorState from "@/components/common/error-state"
import EmptyState from "@/components/common/empty-state"

export default function CommunityPageContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: posts, isLoading, error } = useQuery(communityPostsQuery())

  // Filtrado seguro (con fallback vacío)
  const filteredPosts = posts?.filter((post) => {
    const title = post?.title ?? ""
    const content = post?.content ?? ""
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="No se pudieron cargar las publicaciones de la comunidad" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunidad</h1>
          <p className="text-muted-foreground">
            Comparte ideas, participa en discusiones y conecta con otros usuarios
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Post
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar publicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Community Tabs */}
      <Tabs defaultValue="discussions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discussions">
            <MessageSquare className="mr-2 h-4 w-4" />
            Discusiones
          </TabsTrigger>
          <TabsTrigger value="popular">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Populares
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Miembros
          </TabsTrigger>
        </TabsList>

        {/* Discussions */}
        <TabsContent value="discussions" className="space-y-4">
          {!filteredPosts || filteredPosts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Sin publicaciones"
              description="No se encontraron publicaciones en este momento"
            />
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const title = post?.title ?? "Sin título"
                const content = post?.content ?? "Sin contenido"
                const authorName = post?.author?.name ?? "Usuario"
                const authorAvatar = post?.author?.avatar ?? "/placeholder.svg"
                const category = post?.category ?? ""
                const createdAt = post?.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : "Fecha desconocida"
                const likes = post?.likes ?? 0
                const replies = post?.replies ?? 0

                return (
                  <Card key={post?.id ?? Math.random()}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={authorAvatar} alt={authorName} />
                          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{title}</CardTitle>
                            {category && <Badge variant="secondary">{category}</Badge>}
                          </div>
                          <CardDescription>
                            {authorName} • {createdAt}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{replies}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Popular */}
        <TabsContent value="popular">
          <EmptyState
            icon={ThumbsUp}
            title="Muy pronto"
            description="Sección de publicaciones populares en desarrollo"
          />
        </TabsContent>

        {/* Members */}
        <TabsContent value="members">
          <EmptyState
            icon={Users}
            title="Muy pronto"
            description="Sección de miembros de la comunidad en desarrollo"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
