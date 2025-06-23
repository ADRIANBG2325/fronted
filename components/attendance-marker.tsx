"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, UserX, Clock, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Student {
  matricula: string
  nombre: string
  created_at: string
}

interface AttendanceRecord {
  matricula: string
  nombre: string
  status: "presente" | "ausente" | "tardanza"
  fecha: string
  hora: string
  observaciones?: string
}

interface AttendanceMarkerProps {
  students: Student[]
  onAttendanceMarked: () => void
  apiBase: string
}

export function AttendanceMarker({ students, onAttendanceMarked, apiBase }: AttendanceMarkerProps) {
  const [selectedStudent, setSelectedStudent] = useState("")
  const [status, setStatus] = useState<"presente" | "ausente" | "tardanza">("presente")
  const [observaciones, setObservaciones] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    fetchTodayAttendance()
  }, [])

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch(`${apiBase}/attendance/today`)
      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data)
      }
    } catch (error) {
      console.error("Error fetching today attendance:", error)
    }
  }

  const markAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) {
      setError("Selecciona un estudiante")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${apiBase}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricula: selectedStudent,
          status,
          observaciones: observaciones || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Asistencia marcada para ${result.nombre}`)
        setSelectedStudent("")
        setObservaciones("")
        onAttendanceMarked()
        fetchTodayAttendance()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Error al marcar asistencia")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "presente":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "ausente":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "tardanza":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "presente":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Presente</Badge>
      case "ausente":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ausente</Badge>
      case "tardanza":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Tardanza</Badge>
      default:
        return null
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricula.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStudentAttendanceStatus = (matricula: string) => {
    return todayAttendance.find((record) => record.matricula === matricula)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Marcar Asistencia</span>
            </CardTitle>
            <CardDescription>Selecciona un estudiante y marca su asistencia para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={markAttendance} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-search">Buscar Estudiante</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="student-search"
                    placeholder="Buscar por nombre o matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-select">Estudiante</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => {
                      const attendanceStatus = getStudentAttendanceStatus(student.matricula)
                      return (
                        <SelectItem key={student.matricula} value={student.matricula}>
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {student.nombre} ({student.matricula})
                            </span>
                            {attendanceStatus && <div className="ml-2">{getStatusIcon(attendanceStatus.status)}</div>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-select">Estado de Asistencia</Label>
                <Select value={status} onValueChange={(value: "presente" | "ausente" | "tardanza") => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presente">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Presente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tardanza">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span>Tardanza</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ausente">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Ausente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Ej: Llegó 10 minutos tarde, participó activamente..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Marcando..." : "Marcar Asistencia"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>Asistencia de Hoy</span>
            </CardTitle>
            <CardDescription>Lista de estudiantes que han marcado asistencia hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserX className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aún no se ha marcado asistencia hoy</p>
                </div>
              ) : (
                todayAttendance.map((record) => (
                  <div key={record.matricula} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{record.nombre}</p>
                      <p className="text-sm text-gray-600">{record.matricula}</p>
                      {record.observaciones && <p className="text-xs text-gray-500 mt-1">{record.observaciones}</p>}
                    </div>
                    <div className="text-right">
                      {getStatusBadge(record.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.hora).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
