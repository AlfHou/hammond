import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { createI18n, castToVueI18n } from 'vue-i18n-bridge';


function loadLocaleMessages() {
  // const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const locales = ['da', 'de', 'en', 'fr', 'sl']
  const messages = {}
  locales.forEach(async lang => {
    messages[lang] = await import("./locales/" + lang + ".json")
  })
  return messages
}

Vue.use(VueI18n, { bridge: true }); // you must specify '{ bridge: true }' plugin option when install vue-i18n

// `createI18n` options is almost same vue-i18n-next (vue-i18n@v9.x) API
const i18n = castToVueI18n(
  createI18n(
    {
      legacy: false,
      locale: 'en',
      silentTranslationWarn: true,
      missingWarn: false,
      messages: loadLocaleMessages()
    },
    VueI18n
  )
); // `createI18n` which is provide `vue-i18n-bridge` has second argument, you **must** pass `VueI18n` constructor which is provide `vue-i18n`

export default i18n;