import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import axios from 'axios'

export const useUsersStore = defineStore('users', {
    state: () => {
        return {
            cached: [],
            me: null
        }
    },
    getters: {},
    actions: {
        cacheUser(newUser) {
            this.cached.push(newUser)
        },
        cacheMyUser(newMe) {
            this.me = newMe
        },
        forceMe() {
            return axios
                .get('/api/me')
                .then((response) => {
                    this.cacheMyUser(response.data)
                    return response.data
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401) {
                        this.cacheMyUser(null)
                    } else {
                        console.warn(error);
                    }
                    return null
                })
        },
        users() {
          return axios
            .get('/api/users')
            .then((response) => {
              return response.data
            })
            .catch((error) => {
              if (error.response && error.response.status === 401) {
              } else {
                console.warn(error)
              }
              return null
            })
        },
        me() {
          if (this.me) {
            return Promise.resolve(this.me)
          }
          return axios
            .get('/api/me')
            .then((response) => {
              commit('CACHE_MY_USER', response.data)
              this.cacheMyUser = response.data
              return response.data
            })
            .catch((error) => {
              if (error.response && error.response.status === 401) {
                this.cacheMyUser(null)
              } else {
                console.warn(error)
              }
              return null
            })
        },
        fetchUser(username) {
          // 1. Check if we already have the user as a current user.
          const authStore = useAuthStore()
          if (authStore.currentUser && authStore.currentUser.username === username) {
            return Promise.resolve(authStore.currentUser)
          }

          // 2. Check if we've already fetched and cached the user.
          const matchedUser = state.cached.find((user) => user.username === username)
          if (matchedUser) {
            return Promise.resolve(matchedUser)
          }
        },
    }
})