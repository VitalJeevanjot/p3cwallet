<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="text-white" style="background-color: white" align="center">
      <q-toolbar align="center">
          <q-avatar style=" display: block;
            margin-left: auto;
            margin-right: auto;">
            <img src="statics/whale.png">
          </q-avatar>
      </q-toolbar>
    </q-header>
        <q-separator inset/>
<!--
        <q-bar dense class="bg-amber text-grey-8">
          <q-icon name="fas fa-signal" />
          <div>mobi-net</div>
          <div>4G</div>
          <q-icon name="fas fa-wifi" />
          <q-space />
          <q-icon name="near_me" />
          <q-icon name="fas fa-battery-full" />
        </q-bar> -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'MyLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
