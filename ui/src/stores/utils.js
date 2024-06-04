import { defineStore } from 'pinia'
import { useUsersStore } from './users'

export const useUtilsStore = defineStore('utils', {
    state: () => {
        return {
            isMobile: false,
            settings: null,
        }
    },
    getters: {},
    actions: {
        cacheIsMobile(isMobile) {
            this.isMobile = isMobile
        },
        cacheSettings(settings) {
            this.settings = settings
        },
        checkSize() {
            this.isMobile = window.innerWidth < 600
            return this.isMobile
        },
        getSettings() {
            return axios.get(`/api/settings`).then((response) => {
                const data = response.data
                this.settings = data
                return data
            })
        },
        saveSettings({ settings }) {
            return axios.post(`/api/settings`, { ...settings }).then((response) => {
                const data = response.data
                this.getSettings()
                return data
            })
        },
        saveUserSettings({ settings }) {
            return axios.post(`/api/me/settings`, { ...settings }).then((response) => {
                const data = response.data
                const userStore = useUsersStore()
                userStore.forceMe().then((data) => { })
                return data
            })
        },
    }
})