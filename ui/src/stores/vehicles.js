import { defineStore } from 'pinia'
import axios from 'axios'
import { filter } from 'lodash'

import parseISO from 'date-fns/parseISO'
export const useVehiclesStore = defineStore('vehicles', {
    state: () => {
        return {
            vehicles: [],
            roleMasters: [],
            fuelUnitMasters: [],
            distanceUnitMasters: [],
            currencyMasters: [],
            fuelTypeMasters: [],
            quickEntries: [],
            vehicleStats: new Map(),
        }

    },
    getters: {

  unprocessedQuickEntries: () => {
    return filter(this.quickEntries, (o) => o.processDate == null)
  },
  processedQuickEntries: () => {
    return filter(this.quickEntries, (o) => o.processDate != null)
  },
    },
    actions: {

  cacheVehicle(newVehicles) {
    this.vehicles = newVehicles
  },
  cacheVehicleStats(stats) {
    this.vehicleStats.set(stats.vehicleid, stats)
  },
  cacheFuelUnitMasters(masters) {
    this.fuelUnitMasters = masters
  },
  cacheDistanceUnitMasters(masters) {
    this.distanceUnitMasters = masters
  },
  cacheFuelTypeMasters(masters) {
    this.fueltypeMasters = masters
  },
  cacheCurrencyMasters(masters) {
    this.currencyMasters = masters
  },
  cacheQuickEntries(entries) {
    this.quickEntries = entries
  },
  cacheRoleMasters(roles) {
    this.roleMasters = roles
  },
  fetchMasters() {
    return axios.get('/api/masters').then((response) => {
      const fuelUnitMasters = response.data.fuelUnits
      const fuelTypeMasters = response.data.fuelTypes
      this.fuelUnitMasters =  fuelUnitMasters
      this.fuelTypeMasters =  fuelTypeMasters
      this.currencyMasters =  response.data.currencies
      this.distanceUnitMasters =  response.data.distanceUnits
      this.roleMasters =  response.data.roles
      return response.data
    })
  },
  fetchVehicles() {
    return axios.get('/api/me/vehicles').then((response) => {
      const data = response.data
      this.cacheVehicle(data)
      return data
    })
  },
  fetchQuickEntries(force) {
    if (this.quickEntries && !force) {
      return Promise.resolve(this.quickEntries)
    }
    return axios.get('/api/me/quickEntries').then((response) => {
      const data = response.data
      this.cacheQuickEntries(data)
      return data
    })
  },
  fetchVehicleById(vehicleId) {
    const matchedVehicle = this.vehicles.find((vehicle) => vehicle.id === vehicleId)
    if (matchedVehicle) {
      return Promise.resolve(matchedVehicle)
    }
    return axios.get('/api/vehicles/' + vehicleId).then((response) => {
      const data = response.data
      // commit('CACHE_VEHICLE', data)
      return data
    })
  },
  fetchFillupById(vehicleId, fillupId) {
    return axios.get(`/api/vehicles/${vehicleId}/fillups/${fillupId}`).then((response) => {
      const data = response.data
      data.date = parseISO(data.date)
      return data
    })
  },
  deleteFillupById(vehicleId, fillupId) {
    return axios.delete(`/api/vehicles/${vehicleId}/fillups/${fillupId}`).then((response) => {
      const data = response.data
      return data
    })
  },
  fetchExpenseById(vehicleId, expenseId) {
    return axios.get(`/api/vehicles/${vehicleId}/expenses/${expenseId}`).then((response) => {
      const data = response.data
      data.date = parseISO(data.date)
      return data
    })
  },
  deleteExpenseById(vehicleId, expenseId) {
    return axios.delete(`/api/vehicles/${vehicleId}/expenses/${expenseId}`).then((response) => {
      const data = response.data
      return data
    })
  },
  fetchAttachmentsByVehicleId({ vehicleId }) {
    return axios.get(`/api/vehicles/${vehicleId}/attachments`).then((response) => {
      const data = response.data

      return data
    })
  },
  fetchUsersByVehicleId(vehicleId, force) {
    return axios.get(`/api/vehicles/${vehicleId}/users`).then((response) => {
      const data = response.data
      // data.vehicleId = vehicleId
      // commit('CACHE_VEHICLE_STATS', data)

      return data
    })
  },
  fetchFuelSubtypesByVehicleId(vehicleId, force) {
    return axios.get(`/api/vehicles/${vehicleId}/fuelSubTypes`).then((response) => {
      const data = response.data
      return data
    })
  },
  fetchStatsByVehicleId(vehicleId, force) {
    if (this.vehicleStats.has(vehicleId) && !force) {
      return Promise.resolve(this.vehicleStats.get(vehicleId))
    }
    return axios.get(`/api/vehicles/${vehicleId}/stats`).then((response) => {
      const data = response.data
      data.vehicleId = vehicleId
      this.cacheVehicleStats(data)

      return data
    })
  },
  setQuickEntryAsProcessed(id) {
    return axios.post(`/api/quickEntries/${id}/process`, {}).then((response) => {
      const data = response.data
      this.fetchQuickEntries(force=true)
      return data
    })
  },
  deleteQuickEntry(id) {
    return axios.delete(`/api/quickEntries/${id}`).then((response) => {
      const data = response.data
      this.fetchQuickEntries(force=true)
      return data
    })
  },
    }
})