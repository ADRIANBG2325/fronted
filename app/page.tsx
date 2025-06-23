
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentManager } from "@/components/student-manager"
import { AttendanceMarker } from "@/components/attendance-marker"
import { AttendanceReports } from "@/components/attendance-reports"
import { Users, UserCheck, BarChart3, RefreshCw, AlertCircle, ExternalLink, CheckCircle } from "lucide-react"

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
  const [connectionError, setConnectionError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // ✅ URL CORRECTA DE TU API
  const API_BASE = "https://back-uqvd.onrender.com"

  useEffect(() => {
    checkApiConnection()
  }, [])

  const checkApiConnection = async () => {
    try {
      setConnectionError("")
      console.log("🔄 Intentando conectar con:", API_BASE)
      console.log("🌐 Origen actual:", window.location.origin)

      // Configuración específica para CORS
      const fetchOptions = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        mode: "cors" as RequestMode,
        credentials: "omit" as RequestCredentials,
      }

      console.log("📡 Fetch options:", fetchOptions)

      const response = await fetch(`${API_BASE}/health`, fetchOptions)

      console.log("📡 Response status:", response.status)
      console.log("📡 Response ok:", response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ API Response:", data)
        setDebugInfo(data)
        setApiConnected(true)
        await fetchData()
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }
    } catch (error: any) {
      console.error("❌ Error connecting to API:", error)
      setApiConnected(false)

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setConnectionError(
          `Error de red o CORS. Origen: ${window.location.origin}. Verifica que la API permita este dominio.`,
        )
      } else if (error.message.includes("CORS")) {
        setConnectionError(`Error de CORS: La API no permite conexiones desde ${window.location.origin}`)
      } else {
        setConnectionError(`Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    await Promise.all([fetchStudents(), fetchStats()])
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/students`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        mode: "cors",
        credentials: "omit",
      })
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
      const response = await fetch(`${API_BASE}/reports/stats/today`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        mode: "cors",
        credentials: "omit",
      })
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
    await checkApiConnection()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Conectando con la API...</p>
          <p className="text-sm text-gray-500 mt-2">API: {API_BASE}</p>
          <p className="text-xs text-gray-400 mt-1">
            Origen: {typeof window !== "undefined" ? window.location.origin : "..."}
          </p>
        </div>
      </div>
    )
  }

  if (!apiConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6" />
              <span>API No Conectada</span>
            </CardTitle>
            <CardDescription>Problema de CORS entre Vercel y Render</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>API URL:</strong>
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">{API_BASE}</code>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Frontend URL:</strong>
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                  {typeof window !== "undefined" ? window.location.origin : "..."}
                </code>
              </div>
            </div>

            {connectionError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-700">{connectionError}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-700 mb-3">
                <strong>Pasos de diagnóstico:</strong>
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    1. Probar API directamente:{" "}
                    <a
                      href={`${API_BASE}/health`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline inline-flex items-center"
                    >
                      {API_BASE}/health <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">2. Si ves JSON, la API funciona pero hay problema de CORS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">3. Actualizar configuración CORS en la API</span>
                </div>
              </div>
            </div>

            {debugInfo && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-2">
                  <strong>Información de debug:</strong>
                </p>
                <pre className="text-xs bg-green-100 p-2 rounded overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={handleRefresh} className="flex-1" disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Reintentando..." : "Reintentar"}
              </Button>
              <Button variant="outline" onClick={() => window.open(`${API_BASE}/health`, "_blank")} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Probar API
              </Button>
            </div>
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
              <p className="text-xs text-green-600 mt-1">✅ API Conectada: {API_BASE}</p>
              {debugInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  🔗 CORS: {debugInfo.cors} | Origen detectado: {debugInfo.origin}
                </p>
              )}
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
