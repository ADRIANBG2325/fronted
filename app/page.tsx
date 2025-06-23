
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentManager } from "@/components/student-manager"
import { AttendanceMarker } from "@/components/attendance-marker"
import { AttendanceReports } from "@/components/attendance-reports"
import { Users, UserCheck, BarChart3, RefreshCw } from "lucide-react"

interface Student {
  matricula: string
  nombre: string
  created_at: string
}

interface Stats {
  total_estudiantes: number
  presentes: number
  ausentes: number
  tardanzas: number
  porcentaje_asistencia: number
}

export default function Dashboard() {
  const [apiConnected, setApiConnected] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // ✅ URL CORRECTA DE TU API
  const API_BASE = "https://back-uqvd.onrender.com"

  useEffect(() => {
    checkApiConnection()
  }, [])

  const checkApiConnection = async () => {
    try {
      console.log("Conectando con:", API_BASE)
      const response = await fetch(`${API_BASE}/health`)
      if (response.ok) {
        setApiConnected(true)
        await fetchData()
      }
    } catch (error) {
      console.error("Error connecting to API:", error)
      setApiConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    await Promise.all([fetchStudents(), fetchStats()])
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/students`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/stats/today`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Conectando con la API...</p>
          <p className="text-sm text-gray-500 mt-2">API: {API_BASE}</p>
        </div>
      </div>
    )
  }

  if (!apiConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 flex items-center justify-center space-x-2">
              <span>❌</span>
              <span>API No Conectada</span>
            </CardTitle>
            <CardDescription>No se puede establecer conexión con el servidor</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">URL de la API:</p>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm break-all">{API_BASE}</code>
            </div>

            <div className="text-left space-y-2 text-sm text-gray-600">
              <p>
                <strong>Pasos para solucionar:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Verifica que la API esté desplegada en Render</li>
                <li>Actualiza la URL en el código (línea 31 de page.tsx)</li>
                <li>Asegúrate de que la API esté funcionando</li>
              </ol>
            </div>

            <Button onClick={checkApiConnection} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar Conexión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Sistema de Pase de Lista</h1>
              <p className="text-gray-600">Gestiona estudiantes y controla asistencia de manera eficiente</p>
              <p className="text-xs text-gray-500 mt-1">✅ API Conectada: {API_BASE}</p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total_estudiantes}</div>
                <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presentes Hoy</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.presentes}</div>
                <p className="text-xs text-muted-foreground">Han marcado asistencia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.ausentes}</div>
                <p className="text-xs text-muted-foreground">No han marcado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">% Asistencia</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.porcentaje_asistencia}%</div>
                <p className="text-xs text-muted-foreground">Del día de hoy</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Asistencia</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Estudiantes</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Reportes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceMarker students={students} onAttendanceMarked={fetchStats} apiBase={API_BASE} />
          </TabsContent>

          <TabsContent value="students">
            <StudentManager students={students} onStudentsChanged={fetchStudents} apiBase={API_BASE} />
          </TabsContent>

          <TabsContent value="reports">
            <AttendanceReports apiBase={API_BASE} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
