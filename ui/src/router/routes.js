import store from '@/state/store'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useVehiclesStore } from '@/stores/vehicles'

export default [
  {
    path: '/',
    name: 'home',
    meta: {
      authRequired: true,
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        const vehicles = useVehiclesStore()
        const users = useUsersStore()
        vehicles.fetchVehicles()
          .then((vehicles) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.vehicles = vehicles

              users.me()
              .then((me) => {
                next()
              })
            // Continue to the route.
          })
          .catch((ex) => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            console.log(ex)
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    component: () => lazyLoadView(import('@/router/views/home.vue')),
    props: (route) => ({ user: useAuthStore().currentUser || {} }),
  },
  {
    path: '/initialize',
    name: 'initialize',
    component: () => lazyLoadView(import('@/router/views/initialize.vue')),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        const auth = useAuthStore()

        if (auth.isInitialized) {
          next({ name: 'login' })
        }

        if (auth.currentUser) {
          // Redirect to the home page instead
          next({ name: 'home' })
        } else {
          // Continue to the login page
          next()
        }
      },
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => lazyLoadView(import('@/router/views/login.vue')),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in

        if (!store.getters['auth/isInitialized']) {
          // Redirect to the home page instead
          console.log('App is not initialized')
          next({ name: 'initialize' })
        }

        if (store.getters['auth/loggedIn']) {
          // Redirect to the home page instead
          next({ name: 'home' })
        } else {
          // Continue to the login page
          next()
        }
      },
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => lazyLoadView(import('@/router/views/profile.vue')),
    meta: {
      authRequired: true,
      roles: ['ADMIN'],
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/admin/settings',
    name: 'site-settings',
    component: () => lazyLoadView(import('@/router/views/siteSettings.vue')),
    meta: {
      authRequired: true,
      roles: ['ADMIN'],
    },
    props: (route) => ({
      user: store.state.auth.currentUser || {},
      settings: store.state.utils.settings || {},
    }),
  },
  {
    path: '/admin/users',
    name: 'users',
    component: () => lazyLoadView(import('@/router/views/users.vue')),
    meta: {
      authRequired: true,
      roles: ['ADMIN'],
    },
    props: (route) => ({
      user: store.state.auth.currentUser || {},
      settings: store.state.utils.settings || {},
    }),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => lazyLoadView(import('@/router/views/settings.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({
      user: store.state.auth.currentUser || {},
      me: store.state.users.me || {},
    }),
  },
  {
    path: '/profile/:username',
    name: 'username-profile',
    component: () => lazyLoadView(import('@/router/views/profile.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store
          // Try to fetch the user's information by their username
          .dispatch('users/fetchUser', { username: routeTo.params.username })
          .then((user) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.user = user
            // Continue to the route.
            next()
          })
          .catch(() => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ user: route.meta.tmp.user }),
  },

  {
    path: '/vehicles/create',
    name: 'vehicle-create',
    component: () => lazyLoadView(import('@/router/views/createVehicle.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
    },
  },
  {
    path: '/vehicles/:vehicleId',
    name: 'vehicle-detail',
    component: () => lazyLoadView(import('@/router/views/vehicle.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store
          // Try to fetch the user's information by their username
          .dispatch('vehicles/fetchVehicleById', {
            vehicleId: routeTo.params.vehicleId,
          })
          .then((vehicle) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.vehicle = vehicle
            // Continue to the route.
            next()
          })
          .catch(() => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ vehicle: route.meta.tmp.vehicle }),
  },
  {
    path: '/vehicles/:vehicleId/edit',
    name: 'vehicle-edit',
    component: () => lazyLoadView(import('@/router/views/createVehicle.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store
          // Try to fetch the user's information by their username
          .dispatch('vehicles/fetchVehicleById', {
            vehicleId: routeTo.params.vehicleId,
          })
          .then((vehicle) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.vehicle = vehicle
            // Continue to the route.
            next()
          })
          .catch(() => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ vehicle: route.meta.tmp.vehicle }),
  },
  {
    path: '/vehicles/:vehicleId/fillup',
    name: 'vehicle-create-fillup',
    component: () => lazyLoadView(import('@/router/views/createFillup.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store
          // Try to fetch the user's information by their username
          .dispatch('vehicles/fetchVehicleById', {
            vehicleId: routeTo.params.vehicleId,
          })
          .then((vehicle) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.vehicle = vehicle
            // Continue to the route.
            next()
          })
          .catch(() => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ vehicle: route.meta.tmp.vehicle }),
  },
  {
    path: '/vehicles/:vehicleId/fillup/:fillupId/edit',
    name: 'vehicle-edit-fillup',
    component: () => lazyLoadView(import('@/router/views/createFillup.vue')),
    meta: {
      authRequired: true,

      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store

          .dispatch('vehicles/fetchVehicleById', {
            vehicleId: routeTo.params.vehicleId,
          })
          .then((vehicle) => {
            routeTo.meta.tmp.vehicle = vehicle
            store

              .dispatch('vehicles/fetchFillupById', {
                vehicleId: routeTo.params.vehicleId,
                fillupId: routeTo.params.fillupId,
              })
              .then((fillup) => {
                routeTo.meta.tmp.fillup = fillup

                next()
              })
          })
          .catch(() => {
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ vehicle: route.meta.tmp.vehicle, fillup: route.meta.tmp.fillup }),
  },
  {
    path: '/vehicles/:vehicleId/expense',
    name: 'vehicle-create-expense',
    component: () => lazyLoadView(import('@/router/views/createExpense.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store
          // Try to fetch the user's information by their username
          .dispatch('vehicles/fetchVehicleById', {
            vehicleId: routeTo.params.vehicleId,
          })
          .then((vehicle) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.vehicle = vehicle
            // Continue to the route.
            next()
          })
          .catch(() => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ vehicle: route.meta.tmp.vehicle }),
  },
  {
    path: '/vehicles/:vehicleId/expense/:expenseId/edit',
    name: 'vehicle-edit-expense',
    component: () => lazyLoadView(import('@/router/views/createExpense.vue')),
    meta: {
      authRequired: true,

      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store

          .dispatch('vehicles/fetchVehicleById', {
            vehicleId: routeTo.params.vehicleId,
          })
          .then((vehicle) => {
            routeTo.meta.tmp.vehicle = vehicle
            store

              .dispatch('vehicles/fetchExpenseById', {
                vehicleId: routeTo.params.vehicleId,
                expenseId: routeTo.params.expenseId,
              })
              .then((expense) => {
                routeTo.meta.tmp.expense = expense

                next()
              })
          })
          .catch(() => {
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ vehicle: route.meta.tmp.vehicle, expense: route.meta.tmp.expense }),
  },
  {
    path: '/quickEntries',
    name: 'quickEntries',
    component: () => lazyLoadView(import('@/router/views/quickEntries.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/import',
    name: 'import',
    component: () => lazyLoadView(import('@/router/views/import.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/import/fuelly',
    name: 'import-fuelly',
    component: () => lazyLoadView(import('@/router/views/import-fuelly.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/import/drivvo',
    name: 'import-drivvo',
    component: () => lazyLoadView(import('@/router/views/import-drivvo.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/import/generic',
    name: 'import-generic',
    component: () => lazyLoadView(import('@/router/views/import-generic.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/logout',
    name: 'logout',
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        store.dispatch('auth/logOut').then((data) => {
          const authRequiredOnPreviousRoute = routeFrom.matched.some((route) => route.meta.authRequired)
          // Navigate back to previous page, or home as a fallback
          next(authRequiredOnPreviousRoute ? { name: 'login' } : { ...routeFrom })
        })
      },
    },
  },
  {
    path: '/404',
    name: '404',
    component: import('@/router/views/_404.vue').default,
    // Allows props to be passed to the 404 page through route
    // params, such as `resource` to define what wasn't found.
    props: true,
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  {
    path: '*',
    redirect: '404',
  },
]

// Lazy-loads view components, but with better UX. A loading view
// will be used if the component takes a while to load, falling
// back to a timeout view in case the page fails to load. You can
// use this component to lazy-load a route with:
//
// component: () => lazyLoadView(import('@/router/views/my-view'))
//
// NOTE: Components loaded with this strategy DO NOT have access
// to in-component guards, such as beforeRouteEnter,
// beforeRouteUpdate, and beforeRouteLeave. You must either use
// route-level guards instead or lazy-load the component directly:
//
// component: () => import('@/router/views/my-view')
//
function lazyLoadView(AsyncView) {
  const AsyncHandler = () => ({
    component: AsyncView,
    // A component to use while the component is loading.
    loading: import('@/router/views/_loading.vue').default,
    // Delay before showing the loading component.
    // Default: 200 (milliseconds).
    delay: 400,
    // A fallback component in case the timeout is exceeded
    // when loading the component.
    error: import('@/router/views/_timeout.vue').default,
    // Time before giving up trying to load the component.
    // Default: Infinity (milliseconds).
    timeout: 10000,
  })

  return Promise.resolve({
    functional: true,
    render(h, { data, children }) {
      // Transparently pass any props or children
      // to the view component.
      return h(AsyncHandler, data, children)
    },
  })
}
