"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, UserPlus, Mail, Shield, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usersQuery } from "@/lib/queries"
import LoadingSpinner from "@/components/common/loading-spinner"
import ErrorState from "@/components/common/error-state"
import EmptyState from "@/components/common/empty-state"
import { db } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"

export default function UsersPageContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingUser, setEditingUser] = useState(null)
  const { data: users, isLoading, error } = useQuery(usersQuery())
  const { currentUser } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message="No se pudieron cargar los usuarios" />
  }

  const filteredUsers = users?.filter((user) => {
    const name = user?.name?.toLowerCase?.() || ""
    const email = user?.email?.toLowerCase?.() || ""
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase())
  })

  const isAdminVIP = currentUser?.role === "adminvip"

  const handleEdit = async (userId, updatedData) => {
    const ref = doc(db, "users", userId)
    await updateDoc(ref, updatedData)
    alert("Perfil actualizado correctamente.")
    setEditingUser(null)
  }

  const handleDelete = async (userId) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return
    await deleteDoc(doc(db, "users", userId))
    alert("Usuario eliminado correctamente.")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestión y administración de usuarios del sistema</p>
        </div>
        {isAdminVIP && (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar usuario
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {!filteredUsers || filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No hay usuarios"
          description="Aún no se han agregado usuarios al sistema"
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const canEdit = isAdminVIP || user.id === currentUser?.uid
                const canDelete = isAdminVIP && user.id !== currentUser?.uid

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name || "Usuario"} />
                          <AvatarFallback>{user?.name?.charAt?.(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || "Sin nombre"}</div>
                          <div className="text-sm text-muted-foreground">{user.email || "Sin correo"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role || "Sin rol"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" title="Enviar correo">
                          <Mail className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Editar perfil"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Eliminar usuario"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modal de Edición */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  )
}

/** Modal sencillo para editar datos */
function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || "",
    role: user.role || "user",
    status: user.status || "active",
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg space-y-4">
        <h2 className="text-xl font-bold">Editar perfil</h2>
        <Input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Rol (user / adminvip)"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <Input
          placeholder="Estado (active / inactive)"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(user.id, form)}>Guardar</Button>
        </div>
      </div>
    </div>
  )
}
