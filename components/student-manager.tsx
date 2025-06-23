"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, User, Hash, Calendar, Users } from "lucide-react"

interface Student {
  matricula: string
  nombre: string
  created_at: string
}

interface StudentManagerProps {
  students: Student[]
  onStudentsChanged: () => void
  apiBase: string
}

export function StudentManager({ students, onStudentsChanged, apiBase }: StudentManagerProps) {
  const [newStudent, setNewStudent] = useState({ matricula: "", nombre: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudent.matricula || !newStudent.nombre) {
      setError("Todos los campos son obligatorios")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${apiBase}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      })

      if (response.ok) {
        setSuccess("Estudiante agregado exitosamente")
        setNewStudent({ matricula: "", nombre: "" })
        setDialogOpen(false)
        onStudentsChanged()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Error al agregar estudiante")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (matricula: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return

    try {
      const response = await fetch(`${apiBase}/students/${matricula}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Estudiante eliminado exitosamente")
        onStudentsChanged()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Error al eliminar estudiante")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h2>
          <p className="text-gray-600">Administra la lista de estudiantes del curso</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Estudiante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
              <DialogDescription>Completa la información del estudiante</DialogDescription>
            </DialogHeader>

            <form onSubmit={addStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  placeholder="Ej: 2024001"
                  value={newStudent.matricula}
                  onChange={(e) => setNewStudent({ ...newStudent, matricula: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan Pérez García"
                  value={newStudent.nombre}
                  onChange={(e) => setNewStudent({ ...newStudent, nombre: e.target.value })}
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Agregando..." : "Agregar Estudiante"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <Card key={student.matricula} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{student.nombre}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <Hash className="w-3 h-3" />
                      <span>{student.matricula}</span>
                    </CardDescription>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteStudent(student.matricula, student.nombre)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Registrado: {formatDate(student.created_at)}</span>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  Activo
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay estudiantes registrados</h3>
            <p className="text-gray-600 mb-4">Comienza agregando estudiantes para gestionar la asistencia</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Estudiante
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total de estudiantes registrados:</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {students.length}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
