const calcularIMC = () => {
    const peso = Number.parseFloat(document.getElementById("peso-imc").value)
    const altura = Number.parseFloat(document.getElementById("altura-imc").value) / 100 // convertir cm a m

    if (!peso || !altura) {
      alert("Por favor, ingresa peso y altura válidos")
      return
    }

    const imc = peso / (altura * altura)
    let categoria = ""
    let color = ""

    if (imc < 18.5) {
      categoria = "Bajo peso"
      color = "text-red-400"
    } else if (imc < 25) {
      categoria = "Peso normal"
      color = "text-red-600"
    } else if (imc < 30) {
      categoria = "Sobrepeso"
      color = "text-red-500"
    } else {
      categoria = "Obesidad"
      color = "text-red-700"
    }

    const resultado = document.getElementById("resultado-imc")
    resultado.innerHTML = `
      <p class="font-semibold text-gray-800">IMC: ${imc.toFixed(1)}</p>
      <p class="text-sm ${color}">${categoria}</p>
    `
    resultado.classList.remove("hidden")
  }

  const calcularCalorias = () => {
    const peso = Number.parseFloat(document.getElementById("peso-cal").value)
    const altura = Number.parseFloat(document.getElementById("altura-cal").value)
    const edad = Number.parseFloat(document.getElementById("edad-cal").value)
    const sexo = document.getElementById("sexo-cal").value
    const actividad = Number.parseFloat(document.getElementById("actividad-cal").value)

    if (!peso || !altura || !edad) {
      alert("Por favor, completa todos los campos")
      return
    }

    let tmb
    if (sexo === "hombre") {
      tmb = 88.362 + 13.397 * peso + 4.799 * altura - 5.677 * edad
    } else {
      tmb = 447.593 + 9.247 * peso + 3.098 * altura - 4.33 * edad
    }

    const calorias = Math.round(tmb * actividad)

    const resultado = document.getElementById("resultado-cal")
    resultado.innerHTML = `
      <p class="font-semibold text-gray-800">${calorias} calorías/día</p>
      <p class="text-sm text-gray-600">Para mantener tu peso actual</p>
    `
    resultado.classList.remove("hidden")
  }

  const calcularAgua = () => {
    const peso = Number.parseFloat(document.getElementById("peso-agua").value)
    const actividad = Number.parseFloat(document.getElementById("actividad-agua").value)
    const clima = Number.parseFloat(document.getElementById("clima-agua").value)

    if (!peso) {
      alert("Por favor, ingresa tu peso")
      return
    }

    // Fórmula: 35ml por kg de peso corporal como base
    const aguaML = peso * 35 * actividad * clima
    const vasos = Math.round(aguaML / 250) // 250ml por vaso
    const litros = (aguaML / 1000).toFixed(1)

    const resultado = document.getElementById("resultado-agua")
    resultado.innerHTML = `
      <p class="font-semibold text-gray-800">${vasos} vasos de agua</p>
      <p class="text-sm text-gray-600">${litros} litros por día</p>
    `
    resultado.classList.remove("hidden")
  }
