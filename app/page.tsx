"use client"

import { useState, useEffect } from "react"
import { Search, Dumbbell, Filter, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  id: string
  name: string
  bodyPart: string
  equipment: string
  gifUrl: string
  target: string
  secondaryMuscles: string[]
  instructions: string[]
}

const API_KEY = "1c0a5237b1msh39ee394c73853b8p1a2b6cjsnd5e0840b6583"
const API_HOST = "exercisedb.p.rapidapi.com"

export default function ExerciseApp() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [bodyParts, setBodyParts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch body parts for categories
  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        const response = await fetch("https://exercisedb.p.rapidapi.com/exercises/bodyPartList", {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch body parts")

        const data = await response.json()
        setBodyParts(data)
      } catch (err) {
        console.error("Error fetching body parts:", err)
      }
    }

    fetchBodyParts()
  }, [])

  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://exercisedb.p.rapidapi.com/exercises?limit=50&offset=0", {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch exercises")

        const data = await response.json()
        setExercises(data)
        setFilteredExercises(data)
      } catch (err) {
        setError("Error al cargar los ejercicios. Por favor, intenta de nuevo.")
        console.error("Error fetching exercises:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  // Filter exercises based on search and category
  useEffect(() => {
    let filtered = exercises

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((exercise) => exercise.bodyPart === selectedCategory)
    }

    setFilteredExercises(filtered)
  }, [searchTerm, selectedCategory, exercises])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dumbbell className="h-8 w-8" />
              <h1 className="text-3xl font-bold">ExerciseDB</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6" />
              <span className="text-lg">Tu biblioteca de ejercicios</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section className="bg-white shadow-md border-b-4 border-red-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Encuentra el ejercicio perfecto para ti
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar ejercicios..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 h-5 w-5 z-10" />
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {bodyParts.map((bodyPart) => (
                      <SelectItem key={bodyPart} value={bodyPart}>
                        {bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Mostrando {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? "s" : ""}
                {selectedCategory !== "all" && ` en la categoría "${selectedCategory}"`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-lg text-gray-600">Cargando ejercicios...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
              {error}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-lg transition-shadow duration-300 border-red-100">
                <CardHeader className="pb-3">
                  <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={exercise.gifUrl || "/placeholder.svg"}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2 text-gray-800">
                    {exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}
                  </CardTitle>
                  <CardDescription className="mb-3">
                    <strong>Músculo objetivo:</strong> {exercise.target}
                  </CardDescription>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {exercise.bodyPart}
                    </Badge>
                    <Badge variant="outline" className="border-red-200 text-red-700">
                      {exercise.equipment}
                    </Badge>
                  </div>

                  {exercise.secondaryMuscles.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Músculos secundarios:</p>
                      <div className="flex flex-wrap gap-1">
                        {exercise.secondaryMuscles.slice(0, 3).map((muscle, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-300">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => {
                      // Aquí podrías abrir un modal con más detalles del ejercicio
                      console.log("Ver detalles de:", exercise.name)
                    }}
                  >
                    Ver detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron ejercicios</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o cambia la categoría</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-red-600 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="flex items-center justify-center space-x-2">
              <Dumbbell className="h-5 w-5" />
              <span>Powered by ExerciseDB API</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
