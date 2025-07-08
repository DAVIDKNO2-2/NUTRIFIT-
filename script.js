// API Configuration
const API_KEY = "1c0a5237b1msh39ee394c73853b8p1a2b6cjsnd5e0840b6583"
const API_HOST = "exercisedb.p.rapidapi.com"
const BASE_URL = "https://exercisedb.p.rapidapi.com"

// Global variables
let allExercises = []
let filteredExercises = []
let currentOffset = 0
let isLoading = false
let bodyParts = []

// DOM Elements
const searchInput = document.getElementById("searchInput")
const categoryFilter = document.getElementById("categoryFilter")
const equipmentFilter = document.getElementById("equipmentFilter")
const exercisesGrid = document.getElementById("exercisesGrid")
const loadMoreBtn = document.getElementById("loadMoreBtn")
const loading = document.getElementById("loading")
const resultsCount = document.getElementById("resultsCount")
const exerciseModal = document.getElementById("exerciseModal")
const closeModal = document.getElementById("closeModal")
const modalBody = document.getElementById("modalBody")
const menuToggle = document.getElementById("menuToggle")

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  initializeProgress()
})

async function initializeApp() {
  try {
    await Promise.all([fetchBodyParts(), fetchExercises()])
  } catch (error) {
    console.error("Error initializing app:", error)
    showError("Error al cargar la aplicación. Por favor, recarga la página.")
  }
}

function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener("input", debounce(handleSearch, 300))

  // Filter functionality
  categoryFilter.addEventListener("change", handleCategoryFilter)
  equipmentFilter.addEventListener("change", handleEquipmentFilter)

  // Load more button
  loadMoreBtn.addEventListener("click", loadMoreExercises)

  // Modal functionality
  closeModal.addEventListener("click", closeExerciseModal)
  window.addEventListener("click", (event) => {
    if (event.target === exerciseModal) {
      closeExerciseModal()
    }
  })

  // Mobile menu toggle
  menuToggle.addEventListener("click", toggleMobileMenu)

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// API Functions
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function fetchBodyParts() {
  try {
    const data = await fetchWithRetry(`${BASE_URL}/exercises/bodyPartList`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
      },
    })

    bodyParts = data
    populateBodyPartsFilter()
  } catch (error) {
    console.error("Error fetching body parts:", error)
  }
}

async function fetchExercises(offset = 0, limit = 20) {
  if (isLoading) return

  isLoading = true
  showLoading(true)

  try {
    const data = await fetchWithRetry(`${BASE_URL}/exercises?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
      },
    })

    if (offset === 0) {
      allExercises = data
      filteredExercises = [...data]
    } else {
      allExercises = [...allExercises, ...data]
      filteredExercises = [...filteredExercises, ...data]
    }

    renderExercises()
    updateResultsCount()

    // Update exercise count in hero
    document.getElementById("exerciseCount").textContent = `${allExercises.length}+`
  } catch (error) {
    console.error("Error fetching exercises:", error)
    showError("Error al cargar los ejercicios. Por favor, intenta de nuevo.")
  } finally {
    isLoading = false
    showLoading(false)
  }
}

// UI Functions
function populateBodyPartsFilter() {
  bodyParts.forEach((bodyPart) => {
    const option = document.createElement("option")
    option.value = bodyPart
    option.textContent = bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)
    categoryFilter.appendChild(option)
  })
}

function renderExercises() {
  if (currentOffset === 0) {
    exercisesGrid.innerHTML = ""
  }

  const exercisesToRender = filteredExercises.slice(currentOffset)

  exercisesToRender.forEach((exercise) => {
    const exerciseCard = createExerciseCard(exercise)
    exercisesGrid.appendChild(exerciseCard)
  })

  currentOffset = filteredExercises.length
}

function createExerciseCard(exercise) {
  const card = document.createElement("div")
  card.className = "exercise-card slide-up"
  card.onclick = () => openExerciseModal(exercise)

  card.innerHTML = `
        <img src="${exercise.gifUrl}" alt="${exercise.name}" class="exercise-image" loading="lazy">
        <div class="exercise-content">
            <h3 class="exercise-title">${exercise.name}</h3>
            <p class="exercise-target"><strong>Músculo objetivo:</strong> ${exercise.target}</p>
            <div class="exercise-badges">
                <span class="badge badge-primary">${exercise.bodyPart}</span>
                <span class="badge badge-secondary">${exercise.equipment}</span>
            </div>
            ${
              exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
                ? `
                <div class="secondary-muscles">
                    <p><strong>Músculos secundarios:</strong></p>
                    <div class="exercise-badges">
                        ${exercise.secondaryMuscles
                          .slice(0, 3)
                          .map((muscle) => `<span class="badge badge-secondary">${muscle}</span>`)
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }
        </div>
    `

  return card
}

function openExerciseModal(exercise) {
  modalBody.innerHTML = `
        <div class="exercise-modal-content">
            <img src="${exercise.gifUrl}" alt="${exercise.name}" style="width: 100%; max-width: 400px; margin: 0 auto 2rem; display: block; border-radius: 12px;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--gray-800); text-transform: capitalize;">${exercise.name}</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div>
                    <h3 style="color: var(--primary-red); margin-bottom: 0.5rem;">Músculo Principal</h3>
                    <p style="font-weight: 600;">${exercise.target}</p>
                </div>
                <div>
                    <h3 style="color: var(--primary-red); margin-bottom: 0.5rem;">Parte del Cuerpo</h3>
                    <p style="font-weight: 600;">${exercise.bodyPart}</p>
                </div>
                <div>
                    <h3 style="color: var(--primary-red); margin-bottom: 0.5rem;">Equipo</h3>
                    <p style="font-weight: 600;">${exercise.equipment}</p>
                </div>
            </div>
            
            ${
              exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
                ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--primary-red); margin-bottom: 1rem;">Músculos Secundarios</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${exercise.secondaryMuscles
                          .map((muscle) => `<span class="badge badge-secondary">${muscle}</span>`)
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }
            
            ${
              exercise.instructions && exercise.instructions.length > 0
                ? `
                <div>
                    <h3 style="color: var(--primary-red); margin-bottom: 1rem;">Instrucciones</h3>
                    <ol style="padding-left: 1.5rem; line-height: 1.8;">
                        ${exercise.instructions
                          .map((instruction) => `<li style="margin-bottom: 0.5rem;">${instruction}</li>`)
                          .join("")}
                    </ol>
                </div>
            `
                : ""
            }
            
            <div style="margin-top: 2rem; text-align: center;">
                <button class="btn-primary" onclick="addToWorkout('${exercise.id}', '${exercise.name}')">
                    Agregar a mi rutina
                </button>
            </div>
        </div>
    `

  exerciseModal.style.display = "block"
  document.body.style.overflow = "hidden"
}

function closeExerciseModal() {
  exerciseModal.style.display = "none"
  document.body.style.overflow = "auto"
}

// Search and Filter Functions
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim()
  filterExercises()
}

function handleCategoryFilter() {
  filterExercises()
}

function handleEquipmentFilter() {
  filterExercises()
}

function filterExercises() {
  const searchTerm = searchInput.value.toLowerCase().trim()
  const selectedCategory = categoryFilter.value
  const selectedEquipment = equipmentFilter.value

  filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch =
      !searchTerm ||
      exercise.name.toLowerCase().includes(searchTerm) ||
      exercise.target.toLowerCase().includes(searchTerm) ||
      exercise.bodyPart.toLowerCase().includes(searchTerm)

    const matchesCategory = selectedCategory === "all" || exercise.bodyPart === selectedCategory
    const matchesEquipment = selectedEquipment === "all" || exercise.equipment === selectedEquipment

    return matchesSearch && matchesCategory && matchesEquipment
  })

  currentOffset = 0
  renderExercises()
  updateResultsCount()
}

function updateResultsCount() {
  const count = filteredExercises.length
  resultsCount.textContent = `Mostrando ${count} ejercicio${count !== 1 ? "s" : ""}`
}

function loadMoreExercises() {
  if (currentOffset >= filteredExercises.length) {
    fetchExercises(allExercises.length, 20)
  }
}

// Calculator Functions
function calculateBMI() {
  const height = Number.parseFloat(document.getElementById("height").value)
  const weight = Number.parseFloat(document.getElementById("weight").value)
  const resultDiv = document.getElementById("bmiResult")

  if (!height || !weight || height <= 0 || weight <= 0) {
    showResult(resultDiv, "Por favor, ingresa valores válidos para altura y peso.", "error")
    return
  }

  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)

  let category = ""
  let color = ""

  if (bmi < 18.5) {
    category = "Bajo peso"
    color = "#3b82f6"
  } else if (bmi < 25) {
    category = "Peso normal"
    color = "#10b981"
  } else if (bmi < 30) {
    category = "Sobrepeso"
    color = "#f59e0b"
  } else {
    category = "Obesidad"
    color = "#ef4444"
  }

  const message = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: ${color}; margin-bottom: 0.5rem;">
                ${bmi.toFixed(1)}
            </div>
            <div style="font-size: 1.1rem; font-weight: 600; color: ${color};">
                ${category}
            </div>
        </div>
    `

  showResult(resultDiv, message, "success")
}

function calculateCalories() {
  const height = Number.parseFloat(document.getElementById("height").value)
  const weight = Number.parseFloat(document.getElementById("weight").value)
  const age = Number.parseFloat(document.getElementById("age").value)
  const gender = document.getElementById("gender").value
  const activity = Number.parseFloat(document.getElementById("activity").value)
  const resultDiv = document.getElementById("calorieResult")

  if (!height || !weight || !age || height <= 0 || weight <= 0 || age <= 0) {
    showResult(resultDiv, "Por favor, completa todos los campos con valores válidos.", "error")
    return
  }

  // Mifflin-St Jeor Equation
  let bmr
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }

  const tdee = bmr * activity

  const message = `
        <div style="text-align: center;">
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-red);">
                    ${Math.round(tdee)} calorías/día
                </div>
                <div style="font-size: 0.9rem; color: var(--gray-600);">
                    Calorías para mantener peso
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-size: 0.9rem;">
                <div>
                    <div style="font-weight: bold; color: var(--primary-red);">${Math.round(tdee - 500)}</div>
                    <div>Perder peso</div>
                </div>
                <div>
                    <div style="font-weight: bold; color: var(--primary-red);">${Math.round(tdee)}</div>
                    <div>Mantener</div>
                </div>
                <div>
                    <div style="font-weight: bold; color: var(--primary-red);">${Math.round(tdee + 500)}</div>
                    <div>Ganar peso</div>
                </div>
            </div>
        </div>
    `

  showResult(resultDiv, message, "success")
}

function calculateWater() {
  const weight = Number.parseFloat(document.getElementById("waterWeight").value)
  const exerciseTime = Number.parseFloat(document.getElementById("exerciseTime").value) || 0
  const resultDiv = document.getElementById("waterResult")

  if (!weight || weight <= 0) {
    showResult(resultDiv, "Por favor, ingresa un peso válido.", "error")
    return
  }

  // Basic water calculation: 35ml per kg + extra for exercise
  const baseWater = weight * 35
  const exerciseWater = exerciseTime * 12 // 12ml per minute of exercise
  const totalWater = baseWater + exerciseWater

  const glasses = Math.ceil(totalWater / 250) // 250ml per glass

  const message = `
        <div style="text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-red); margin-bottom: 0.5rem;">
                ${Math.round(totalWater)} ml/día
            </div>
            <div style="font-size: 1.1rem; margin-bottom: 1rem;">
                ≈ ${glasses} vasos de agua
            </div>
            <div style="font-size: 0.9rem; color: var(--gray-600);">
                ${Math.round(baseWater)}ml base + ${Math.round(exerciseWater)}ml por ejercicio
            </div>
        </div>
    `

  showResult(resultDiv, message, "success")
}

function showResult(element, message, type) {
  element.innerHTML = message
  element.className = `result show ${type}`
  element.style.display = "block"
}

// Progress Tracking Functions
function initializeProgress() {
  updateWaterGlasses()
  loadProgress()
}

function addExercise() {
  const currentCount = Number.parseInt(document.getElementById("todayExercises").textContent)
  const newCount = currentCount + 1
  document.getElementById("todayExercises").textContent = newCount

  // Save to localStorage
  localStorage.setItem("todayExercises", newCount.toString())

  // Show success message
  showNotification("¡Ejercicio agregado! 💪", "success")
}

function addWater() {
  const currentGlasses = document.querySelectorAll(".water-glass.filled").length
  if (currentGlasses < 8) {
    const glasses = document.querySelectorAll(".water-glass")
    glasses[currentGlasses].classList.add("filled")

    // Save to localStorage
    localStorage.setItem("waterGlasses", (currentGlasses + 1).toString())

    showNotification("¡Vaso de agua agregado! 💧", "success")
  } else {
    showNotification("¡Ya completaste tu meta de agua del día! 🎉", "success")
  }
}

function addToWorkout(exerciseId, exerciseName) {
  // Add to workout (could be saved to localStorage or sent to a server)
  const workout = JSON.parse(localStorage.getItem("workout") || "[]")

  if (!workout.find((ex) => ex.id === exerciseId)) {
    workout.push({ id: exerciseId, name: exerciseName, date: new Date().toISOString() })
    localStorage.setItem("workout", JSON.stringify(workout))

    showNotification(`${exerciseName} agregado a tu rutina! 🏋️`, "success")
    addExercise() // Also count as completed exercise
  } else {
    showNotification("Este ejercicio ya está en tu rutina", "info")
  }

  closeExerciseModal()
}

function updateWaterGlasses() {
  const waterGlassesContainer = document.getElementById("waterGlasses")
  waterGlassesContainer.innerHTML = ""

  for (let i = 0; i < 8; i++) {
    const glass = document.createElement("div")
    glass.className = "water-glass"
    waterGlassesContainer.appendChild(glass)
  }
}

function loadProgress() {
  // Load today's exercises
  const todayExercises = localStorage.getItem("todayExercises") || "0"
  document.getElementById("todayExercises").textContent = todayExercises

  // Load water glasses
  const waterGlasses = Number.parseInt(localStorage.getItem("waterGlasses") || "0")
  const glasses = document.querySelectorAll(".water-glass")
  for (let i = 0; i < Math.min(waterGlasses, glasses.length); i++) {
    glasses[i].classList.add("filled")
  }

  // Load streak (could be calculated based on daily activity)
  const streak = localStorage.getItem("streak") || "1"
  document.getElementById("streakDays").textContent = streak
}

// Utility Functions
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function showLoading(show) {
  loading.style.display = show ? "block" : "none"
}

function showError(message) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #fee2e2;
        color: #dc2626;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid #fecaca;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `
  errorDiv.textContent = message

  document.body.appendChild(errorDiv)

  setTimeout(() => {
    errorDiv.remove()
  }, 5000)
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`

  const colors = {
    success: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    error: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    info: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  }

  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type].bg};
        color: ${colors[type].color};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid ${colors[type].border};
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
    `
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu")
  navMenu.classList.toggle("active")
}

// Add CSS for mobile menu
const mobileMenuCSS = `
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 80px;
        left: -100%;
        width: 100%;
        height: calc(100vh - 80px);
        background: var(--primary-red);
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-top: 2rem;
        transition: var(--transition);
        z-index: 999;
    }
    
    .nav-menu.active {
        left: 0;
    }
    
    .nav-menu li {
        margin: 1rem 0;
    }
    
    .nav-link {
        font-size: 1.2rem;
    }
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`

// Add the mobile menu CSS to the document
const style = document.createElement("style")
style.textContent = mobileMenuCSS
document.head.appendChild(style)

// Reset progress daily (runs on page load)
function checkDailyReset() {
  const lastVisit = localStorage.getItem("lastVisit")
  const today = new Date().toDateString()

  if (lastVisit !== today) {
    // Reset daily counters
    localStorage.setItem("todayExercises", "0")
    localStorage.setItem("waterGlasses", "0")
    localStorage.setItem("lastVisit", today)

    // Update streak
    const currentStreak = Number.parseInt(localStorage.getItem("streak") || "1")
    if (lastVisit) {
      const lastDate = new Date(lastVisit)
      const todayDate = new Date(today)
      const diffTime = Math.abs(todayDate - lastDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day
        localStorage.setItem("streak", (currentStreak + 1).toString())
      } else if (diffDays > 1) {
        // Streak broken
        localStorage.setItem("streak", "1")
      }
    }

    // Reload progress
    initializeProgress()
  }
}

// Run daily reset check
checkDailyReset()

// Add some additional animations and interactions
document.addEventListener("scroll", () => {
  const header = document.querySelector(".header")
  if (window.scrollY > 100) {
    header.style.background = "rgba(220, 38, 38, 0.95)"
    header.style.backdropFilter = "blur(10px)"
  } else {
    header.style.background = "linear-gradient(135deg, var(--primary-red), var(--secondary-red))"
    header.style.backdropFilter = "none"
  }
})

// Add intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in")
    }
  })
}, observerOptions)

// Observe elements for animation
document.querySelectorAll(".calculator-card, .nutrition-card, .progress-card").forEach((el) => {
  observer.observe(el)
})
