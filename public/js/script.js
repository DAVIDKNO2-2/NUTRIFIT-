document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN Y CONSTANTES ---
    // API_KEY y API_HOST se eliminan, las llamadas van al backend propio.
    const PLACEHOLDER_IMAGE = 'assets/images/placeholder.svg'; // Ruta relativa a public/

    // --- ESTADO DE LA APLICACIÓN ---
    let exercises = [];
    let filteredExercises = [];
    let bodyParts = [];
    let searchTerm = "";
    let selectedCategory = "all";
    let isLoading = false;
    let error = "";

    // --- ELEMENTOS DEL DOM ---
    const searchInput = document.getElementById('search-term');
    const categorySelect = document.getElementById('category-select');
    const exerciseListContainer = document.getElementById('exercise-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageElement = document.getElementById('error-message');
    const noResultsMessage = document.getElementById('no-results-message');
    const resultsCounter = document.getElementById('results-counter');

    // --- FUNCIONES DE LA API (ahora llaman al backend propio) ---
    async function fetchDataFromBackend(apiPath) {
        // La URL base es relativa al dominio actual, el backend sirve desde la misma raíz.
        const url = `/api${apiPath}`; // ej: /api/bodyparts o /api/exercises
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Error ${response.status}: ${errorData.message || 'Failed to fetch data from backend'}`);
            }
            return await response.json();
        } catch (err) {
            console.error(`Error fetching ${url}:`, err);
            throw err;
        }
    }

    async function fetchBodyParts() {
        try {
            // Llama a la nueva ruta del backend /api/bodyparts
            const data = await fetchDataFromBackend('/bodyparts');
            bodyParts = data;
            renderBodyParts();
        } catch (err) {
            updateErrorState(`Error al cargar categorías: ${err.message}`);
        }
    }

    async function fetchExercises() {
        updateLoadingState(true);
        try {
            // Llama a la nueva ruta del backend /api/exercises
            // Si se necesitan query params para el backend, se añadirían aquí. Ej: fetchDataFromBackend('/exercises?limit=100')
            const data = await fetchDataFromBackend('/exercises');
            exercises = data.map(ex => ({ ...ex, id: String(ex.id) }));
            applyFiltersAndRender();
        } catch (err) {
            updateErrorState(`Error al cargar ejercicios: ${err.message}`);
        } finally {
            updateLoadingState(false);
        }
    }

    // --- FUNCIONES DE RENDERIZADO ---
    function renderBodyParts() {
        if (!categorySelect) return;
        categorySelect.innerHTML = '<option value="all">Todas las categorías</option>'; // Reset
        bodyParts.forEach(part => {
            const option = document.createElement('option');
            option.value = part;
            option.textContent = part.charAt(0).toUpperCase() + part.slice(1);
            categorySelect.appendChild(option);
        });
    }

    function renderExercises() {
        if (!exerciseListContainer) return;
        exerciseListContainer.innerHTML = ''; // Limpiar lista anterior

        if (error) {
            errorMessageElement.textContent = error;
            errorMessageElement.style.display = 'block';
            noResultsMessage.style.display = 'none';
            exerciseListContainer.style.display = 'none';
            resultsCounter.textContent = 'Error al cargar';
            return;
        }

        errorMessageElement.style.display = 'none';

        if (filteredExercises.length === 0 && !isLoading) {
            noResultsMessage.style.display = 'block';
            exerciseListContainer.style.display = 'none';
        } else {
            noResultsMessage.style.display = 'none';
            exerciseListContainer.style.display = 'grid'; // o el display que corresponda
        }

        updateResultsCounter();

        filteredExercises.forEach(exercise => {
            const card = document.createElement('div');
            card.className = 'exercise-card';
            card.innerHTML = `
                <div class="exercise-gif-container">
                    <img src="${exercise.gifUrl || PLACEHOLDER_IMAGE}" alt="${exercise.name}" class="exercise-gif" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';">
                </div>
                <div class="exercise-info">
                    <h3 class="exercise-name">${exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}</h3>
                    <p class="exercise-target"><strong>Músculo objetivo:</strong> ${exercise.target}</p>
                    <div class="exercise-badges">
                        <span class="badge body-part-badge">${exercise.bodyPart}</span>
                        <span class="badge equipment-badge">${exercise.equipment}</span>
                    </div>
                    ${exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 ? `
                    <div class="secondary-muscles">
                        <p class="secondary-muscles-title">Músculos secundarios:</p>
                        <div class="secondary-muscles-list">
                            ${exercise.secondaryMuscles.slice(0, 3).map(muscle => `<span class="badge secondary-muscle-badge">${muscle}</span>`).join('')}
                        </div>
                    </div>` : ''}
                    <button class="details-button" data-exercise-id="${exercise.id}">Ver detalles</button>
                </div>
            `;
            // TODO: Añadir event listener al botón "Ver detalles" si se implementa esa funcionalidad
            // card.querySelector('.details-button').addEventListener('click', () => showExerciseDetails(exercise));
            exerciseListContainer.appendChild(card);
        });
    }

    function updateResultsCounter() {
        if (!resultsCounter) return;
        let text = `Mostrando ${filteredExercises.length} ejercicio${filteredExercises.length !== 1 ? "s" : ""}`;
        if (selectedCategory !== "all") {
            text += ` en la categoría "${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}"`;
        }
        resultsCounter.textContent = text;
    }


    function updateLoadingState(loading) {
        isLoading = loading;
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        }
        if (isLoading) { // Si está cargando, ocultar otros mensajes
            errorMessageElement.style.display = 'none';
            noResultsMessage.style.display = 'none';
            if(exerciseListContainer) exerciseListContainer.style.display = 'none';
        }
    }

    function updateErrorState(errorMessage) {
        error = errorMessage;
        isLoading = false; // Si hay error, no estamos cargando
        if(loadingIndicator) loadingIndicator.style.display = 'none';
        renderExercises(); // Para mostrar el mensaje de error
    }

    // --- LÓGICA DE FILTRADO Y BÚSQUEDA ---
    function applyFiltersAndRender() {
        let tempExercises = [...exercises];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            tempExercises = tempExercises.filter(ex =>
                ex.name.toLowerCase().includes(lowerSearchTerm) ||
                ex.target.toLowerCase().includes(lowerSearchTerm) ||
                ex.bodyPart.toLowerCase().includes(lowerSearchTerm)
            );
        }

        // Filtrar por categoría
        if (selectedCategory !== "all") {
            tempExercises = tempExercises.filter(ex => ex.bodyPart === selectedCategory);
        }

        filteredExercises = tempExercises;
        error = ""; // Limpiar error si los filtros se aplican correctamente
        renderExercises();
    }

    // --- MANEJADORES DE EVENTOS ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            applyFiltersAndRender();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            applyFiltersAndRender();
        });
    }

    // --- INICIALIZACIÓN ---
    async function initApp() {
        updateLoadingState(true); // Iniciar con indicador de carga para el fetch inicial
        await fetchBodyParts(); // Cargar categorías primero
        await fetchExercises(); // Luego cargar ejercicios
        // El loading state se maneja dentro de fetchExercises
    }

    initApp();
});
