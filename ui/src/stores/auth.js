import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => {
        return { currentUser: '', initialized: '' }

    },
    getters: {},
    actions: {
        updateCurrentUser(newValue) {
            this.currentUser = newValue
            axios.defaults.headers.common.Authorization = this.currentUser ? this.currentUser.token : ''
        },
        updateInitStatus(newValue) {
            this.initialized = newValue
        }
    }
})