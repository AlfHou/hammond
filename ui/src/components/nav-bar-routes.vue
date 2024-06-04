<script>
// Allows stubbing BaseLink in unit tests
const BaseLink = 'BaseLink'

export default {
  props: {
    route: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getRouteTitle(route) {
      return typeof route.title === 'function' ? route.title() : route.title
    },
    getRouteBadge(route) {
      if (!route.badge) {
        return false
      }
      return typeof route.badge === 'function' ? route.badge() : route.badge
    }

  },
}
</script>

<template>
  <BaseLink v-if="getRouteBadge(route) > 0" tag='b-navbar-item' key={route.name} :to="route" exact-active-class={$style.active}>
    <a>{{getRouteTitle(route)}}</a>
    <b-tag rounded type='is-danger is-light'>
      {{getRouteBadge(route)}}
    </b-tag>
  </BaseLink>
  <BaseLink v-else tag='b-navbar-item' :key="route.name" :to="route" exact-active-class={$style.active}>
    <a>{{getRouteTitle(route)}}</a>
  </BaseLink>
</template>