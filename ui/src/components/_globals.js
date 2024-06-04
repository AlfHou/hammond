// Globally register all base components for convenience, because they
// will be used very frequently. Components are registered using the
// PascalCased version of their file name.

import Vue from 'vue'

import BaseButton from './_base-button.vue'
Vue.component('BaseButton', BaseButton)
import BaseIcon from './_base-icon.vue'
Vue.component('BaseIcon',BaseIcon)
import BaseInputText from './_base-input-text.vue'
Vue.component('BaseInputText',BaseInputText)
import BaseLink from './_base-link.vue'
Vue.component('BaseLink',BaseLink)
