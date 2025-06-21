<script setup lang="ts">
import MainFooter from './components/layout/MainFooter.vue'
import MainHeader from './components/layout/MainHeader.vue'
</script>

<template>
  <div class="bg-secondary h-dvh px-10">
    <div class="container mx-auto h-full flex flex-col">
      <MainHeader />
      <div class="flex-1">
        <RouterView />
      </div>
      <MainFooter />
    </div>
  </div>
</template>
