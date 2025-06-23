"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, FileText, TrendingUp, Users, AlertTriangle } from "lucide-react"

interface AttendanceRecord {
  matricula: string
  nombre: string
  status: "presente" | "ausente" | "tardanza"
  fecha: string
  hora: string
  observaciones?: string
}

interface MissingStudent {
  matricula: string
  nombre: string
  created_at: string
}

interface AttendanceReportsProps {
  apiBase: string
}

export function AttendanceReports({ apiBase }: AttendanceReportsProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [dateAttendance, setDateAttendance] = useState<AttendanceRecord[]>([])
  const [missingStudents, setMissingStudents] = useState<MissingStudent[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDateAttendance()
    fetchMissingStudents()
  }, [selectedDate])

  const fetchDateAttendance = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/attendance/date/${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setDateAttendance(data)
      }
    } catch (error) {
      console.error("Error fetching date attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMissingStudents = async () => {
    try {
      const response = await fetch(`${apiBase}/reports/missing-today`)
      if (response.ok) {
        const data = await response.json()
        setMissingStudents(data.estudiantes_faltantes || [])
      }
    } catch (error) {
      console.error("Error fetching missing students:", error)
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

  const exportToCSV = () => {
    const headers = ["Matrícula", "Nombre", "Estado", "Fecha", "Hora", "Observaciones"]
    const csvContent = [
      headers.join(","),
      ...dateAttendance.map((record) =>
        [
          record.matricula,
          `"${record.nombre}"`,
          record.status,
          record.fecha,
          record.hora,
          `"${record.observaciones || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `asistencia_${selectedDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = {
    total: dateAttendance.length,
    presente: dateAttendance.filter((r) => r.status === "presente").length,
    ausente: dateAttendance.filter((r) => r.status === "ausente").length,
    tardanza: dateAttendance.filter((r) => r.status === "tardanza").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes de Asistencia</h2>
          <p className="text-gray-600">Consulta y exporta reportes detallados de asistencia</p>
        </div>
        <Button onClick={exportToCSV} disabled={dateAttendance.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Seleccionar Fecha</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label htmlFor="date-select">Fecha</Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Presentes: {stats.presente}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Tardanzas: {stats.tardanza}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Ausentes: {stats.ausente}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Records */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Registros de Asistencia</span>
              </CardTitle>
              <CardDescription>
                Asistencia registrada para el{" "}
                {new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Cargando registros...</p>
                </div>
              ) : dateAttendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay registros de asistencia para esta fecha</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dateAttendance.map((record, index) => (
                    <div
                      key={`${record.matricula}-${index}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{record.nombre}</p>
                            <p className="text-sm text-gray-600">{record.matricula}</p>
                          </div>
                        </div>
                        {record.observaciones && (
                          <p className="text-sm text-gray-500 mt-2 italic">"{record.observaciones}"</p>
                        )}
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Missing Students */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Estudiantes Faltantes</span>
              </CardTitle>
              <CardDescription>Estudiantes que no han marcado asistencia hoy</CardDescription>
            </CardHeader>
            <CardContent>
              {missingStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">¡Todos los estudiantes han marcado asistencia!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missingStudents.map((student) => (
                    <div
                      key={student.matricula}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-orange-900">{student.nombre}</p>
                        <p className="text-sm text-orange-700">{student.matricula}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        Sin marcar
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Estadísticas Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total registros:</span>
                  <Badge variant="outline">{stats.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Presentes:</span>
                  <Badge className="bg-green-100 text-green-800">{stats.presente}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tardanzas:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{stats.tardanza}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ausentes:</span>
                  <Badge className="bg-red-100 text-red-800">{stats.ausente}</Badge>
                </div>
                {stats.total > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">% Asistencia:</span>
                      <Badge variant="outline" className="font-bold">
                        {Math.round(((stats.presente + stats.tardanza) / stats.total) * 100)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
