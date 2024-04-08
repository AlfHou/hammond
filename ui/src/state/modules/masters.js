import axios from 'axios'

export const state = {
  languageMasters: [],
  fuelUnitMasters: [],
  distanceUnitMasters: [],
  currencyMasters: [],
  fuelTypeMasters: [],
  roleMasters: [],
}
export const mutations = {
  CACHE_LANGUAGE_MASTERS(state, masters) {
    state.languageMasters = masters
  },
  CACHE_FUEL_UNIT_MASTERS(state, masters) {
    state.fuelUnitMasters = masters
  },
  CACHE_DISTANCE_UNIT_MASTERS(state, masters) {
    state.distanceUnitMasters = masters
  },
  CACHE_FUEL_TYPE_MASTERS(state, masters) {
    state.fuelTypeMasters = masters
  },
  CACHE_CURRENCY_MASTERS(state, masters) {
    state.currencyMasters = masters
  },
  CACHE_ROLE_MASTERS(state, roles) {
    state.roleMasters = roles
  },
}

export const getters = {}

export const actions = {
  init({ dispatch, rootState }) {
    const { currentUser } = rootState.auth
    if (currentUser) {
      dispatch('fetchMasters')
    }
  },
  fetchMasters({ commit, state, rootState }) {
    return axios.get('/api/masters').then((response) => {
      commit('CACHE_LANGUAGE_MASTERS', response.data.languages)
      commit('CACHE_FUEL_UNIT_MASTERS', response.data.fuelUnits)
      commit('CACHE_FUEL_TYPE_MASTERS', response.data.fuelTypes)
      commit('CACHE_CURRENCY_MASTERS', response.data.currencies)
      commit('CACHE_DISTANCE_UNIT_MASTERS', response.data.distanceUnits)
      commit('CACHE_ROLE_MASTERS', response.data.roles)
      return response.data
    })
  },
}