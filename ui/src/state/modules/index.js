// Register each file as a corresponding Vuex module. Module nesting
// will mirror [sub-]directory hierarchy and modules are namespaced
// as the camelCase equivalent of their file name.

import camelCase from 'lodash/camelCase'

// const modulesCache = {}
const storeData = { modules: {} }

storeData.modules = import.meta.glob(['!./*.unit.js','./*.js'])

export default storeData.modules
