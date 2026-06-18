// Integração com APIs públicas de localização: IBGE (estados/municípios) e ViaCEP (endereço) - [Pedro Marinho]
// Usa fetch puro (sem o axios da API) para não enviar o token JWT a serviços externos.

const IBGE = 'https://servicodados.ibge.gov.br/api/v1/localidades'

// Lista os 27 estados brasileiros (ordenados por nome) -> [{ id, sigla, nome }]
export async function fetchStates() {
  const res = await fetch(`${IBGE}/estados?orderBy=nome`)
  if (!res.ok) throw new Error('Falha ao carregar estados (IBGE)')
  return res.json()
}

// Lista os municípios de um estado (pela sigla, ex: "PE") -> [{ id, nome }]
export async function fetchCities(uf) {
  if (!uf) return []
  const res = await fetch(`${IBGE}/estados/${uf}/municipios`)
  if (!res.ok) throw new Error('Falha ao carregar municípios (IBGE)')
  const data = await res.json()
  return data.sort((a, b) => a.nome.localeCompare(b.nome))
}

// Busca um endereço pelo CEP via ViaCEP -> { street, neighborhood, city, state } ou null
export async function fetchAddressByCep(cep) {
  const clean = (cep || '').replace(/\D/g, '')
  if (clean.length !== 8) return null
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
  if (!res.ok) throw new Error('Falha ao consultar o CEP (ViaCEP)')
  const data = await res.json()
  if (data.erro) return null
  return {
    street: data.logradouro || '',
    neighborhood: data.bairro || '',
    city: data.localidade || '',
    state: data.uf || '',
  }
}
