'use strict'

const resultado = document.getElementById('resultado')
const pesquisa = document.getElementById('barra-pesquisa')

let personagens = []

async function getPersonagens() {
  const url = "https://api.jikan.moe/v4/anime/38000/characters"
  const response = await fetch(url)
  const data = await response.json()
  return data.data
}

function formatarNome(nome) {

  const partes = nome.split(',')
  if (partes.length > 1) {
    return partes[1].trim() + " " + partes[0].trim()
  }

  return nome
}

function atualizarEstatisticas(lista) {

  const total = lista.length
  let principal = 0

  lista.forEach(function (itemLista) {
    if (itemLista.role === "Main") {
      principal++
    }
  })

  const coadjuvante = total - principal

  document.getElementById("total").textContent = total
  document.getElementById("principal").textContent = principal
  document.getElementById("coadjuvante").textContent = coadjuvante
}

function criarCards(lista) {

  const container = document.createElement('div')
  container.classList.add('container-resultado')

  for (let i = 0; i < lista.length; i++) {

    const itemLista = lista[i]
    const nome = formatarNome(itemLista.character.name)
    const imagem = itemLista.character.images.jpg.image_url

    let tipo = 'coadjuvante'
    let texto = 'Coadjuvante'

    if (itemLista.role === 'Main') {
      tipo = 'principal'
      texto = 'Principal'
    }

    const card = document.createElement('div')
    card.classList.add('cards-principais')

    const img = document.createElement('img')
    img.classList.add('card-img')
    img.src = imagem
    img.alt = nome

    const personagem = document.createElement('div')
    personagem.classList.add('personagem')

    const nomePersonagem = document.createElement('div')
    nomePersonagem.classList.add('nome-personagem')
    nomePersonagem.textContent = nome

    const classificacao = document.createElement('span')
    classificacao.classList.add('classificacao')
    classificacao.classList.add(tipo)
    classificacao.textContent = texto

    personagem.appendChild(nomePersonagem)
    personagem.appendChild(classificacao)

    card.appendChild(img)
    card.appendChild(personagem)

    container.appendChild(card)
  }

  resultado.textContent = ''

  const titulo = document.createElement('div')
  titulo.classList.add('results-title')
  titulo.textContent = 'Personagens'

  resultado.appendChild(titulo)
  resultado.appendChild(container)
}

function buscar() {

  const valor = pesquisa.value.toLowerCase()

  const filtrados = personagens.filter(function (itemFormatado) {
    const nome = formatarNome(itemFormatado.character.name).toLowerCase()

    return nome.includes(valor)
  })

  atualizarEstatisticas(filtrados)
  criarCards(filtrados)
}

async function carregar() {

  const dados = await getPersonagens()
  personagens = dados

  atualizarEstatisticas(personagens)
  criarCards(personagens)
}

pesquisa.addEventListener('input', buscar)

carregar()