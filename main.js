'use strict'

const resultado = document.getElementById('resultado')
const input = document.getElementById('barra-pesquisa')

let personagens = []

// pegar dados da API
async function getPersonagens() {
  const url = "https://api.jikan.moe/v4/anime/38000/characters"
  const response = await fetch(url)
  const data = await response.json()
  return data.data
}

// formatar nome
function formatarNome(nome) {
  const partes = nome.split(',')
  if (partes.length > 1) {
    return partes[1].trim() + " " + partes[0].trim()
  }
  return nome
}

// atualizar estatísticas
function atualizarEstatisticas(lista) {
  const total = lista.length
  let principal = 0

  lista.forEach(function (p) {
    if (p.role === "Main") {
      principal++
    }
  })

  const coadjuvante = total - principal

  document.getElementById("total").textContent = total
  document.getElementById("principal").textContent = principal
  document.getElementById("coadjuvante").textContent = coadjuvante
}

// criar cards
function criarCards(lista) {
  let html = ""

  lista.forEach(p => {
    const nome = formatarNome(p.character.name)
    const imagem = p.character.images.jpg.image_url

    let tipo = "coadjuvante"
    let texto = "Coadjuvante"

    if (p.role === "Main") {
      tipo = "principal"
      texto = "Principal"
    }

    html += `
      <div class="cards-principais">
        <img class="card-img" src="${imagem}" alt="${nome}">
        
        <div class="personagem">
          <div class="nome-personagem">${nome}</div>

          <span class="classificacao ${tipo}">
            ${texto}
          </span>
        </div>
      </div>
    `
  })

  resultado.innerHTML = `
    <div class="results-title">Personagens</div>
    <div class="container-resultado">
      ${html}
    </div>
  `
}

// busca
function buscar() {
  const valor = input.value.toLowerCase()

  const filtrados = personagens.filter(p => {
    const nome = formatarNome(p.character.name).toLowerCase()
    return nome.includes(valor)
  })

  atualizarEstatisticas(filtrados)
  criarCards(filtrados)
}

// carregar tudo
async function carregar() {
  const dados = await getPersonagens()
  personagens = dados

  atualizarEstatisticas(personagens)
  criarCards(personagens)
}

// evento
input.addEventListener('input', buscar)

// iniciar
carregar()