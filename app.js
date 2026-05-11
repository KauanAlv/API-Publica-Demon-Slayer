'use strict'

const resultado = document.getElementById('resultado')
const pesquisa = document.getElementById('barra-pesquisa')

let personagens = []

async function getPersonagens() {
  const url = 'https://api.jikan.moe/v4/anime/38000/characters'

  const response = await fetch(url)
  const data = await response.json()

  return data.data
}

function formatarNome(nome) {

  const partes = nome.split(',')

  if (partes.length > 1) {
    return partes[1].trim() + ' ' + partes[0].trim()
  }

  return nome
}

function criarCard(personagemApi) {

  const nome = formatarNome(personagemApi.character.name)
  const imagem = personagemApi.character.images.jpg.image_url

  let tipo = 'Coadjuvante'
  let classe = 'coadjuvante'

  if (personagemApi.role == 'Main') {
    tipo = 'Principal'
    classe = 'principal'
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
  classificacao.classList.add(classe)
  classificacao.textContent = tipo

  personagem.appendChild(nomePersonagem)
  personagem.appendChild(classificacao)

  card.appendChild(img)
  card.appendChild(personagem)

  return card
}

function atualizarEstatisticas(lista) {

  const total = lista.length
  let principal = 0

  lista.forEach(function (personagem) {

    if (personagem.role == 'Main') {
      principal++
    }

  })

  const coadjuvante = total - principal

  document.getElementById('total').textContent = total
  document.getElementById('principal').textContent = principal
  document.getElementById('coadjuvante').textContent = coadjuvante
}

function preencherTela(lista) {

  resultado.replaceChildren()

  const titulo = document.createElement('div')
  titulo.classList.add('results-title')
  titulo.textContent = 'Personagens'

  const container = document.createElement('div')
  container.classList.add('container-resultado')

  const cards = lista.map(criarCard)

  container.replaceChildren(...cards)

  resultado.appendChild(titulo)
  resultado.appendChild(container)
}

function buscar() {

  const valor = pesquisa.value.toLowerCase()

  const filtrados = personagens.filter(function (personagem) {

    const nome = formatarNome(personagem.character.name).toLowerCase()

    return nome.includes(valor)
  })

  atualizarEstatisticas(filtrados)
  preencherTela(filtrados)
}

async function carregar() {

  personagens = await getPersonagens()

  atualizarEstatisticas(personagens)
  preencherTela(personagens)
}

pesquisa.addEventListener('input', buscar)

carregar()