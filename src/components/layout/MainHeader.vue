<script setup lang="ts">
import { ROUTES_PATH } from '@/services/constants'
import { Bell, InfoIcon, Keyboard, User } from 'lucide-vue-next'
</script>
<template>
  <div class="py-5 flex items-center justify-between">
    <div class="flex items-center gap-3.5">
      <RouterLink :to="ROUTES_PATH.HOME">
        <span class="font-bold text-3xl text-primary-foreground leading-relaxed tracking-wide"
          >i<span class="text-primary">s</span>how<span>s</span>peed<span>t</span>ype</span
        >
      </RouterLink>
      <RouterLink :to="ROUTES_PATH.HOME">
        <Keyboard
          class="text-primary-foreground/70 hover:text-primary-foreground translate-y-[2px]"
          :size="24"
        />
      </RouterLink>
      <RouterLink :to="ROUTES_PATH.PROFILE">
        <InfoIcon
          class="text-primary-foreground/70 hover:text-primary-foreground translate-y-[2px]"
          :size="24"
        />
      </RouterLink>
    </div>
    <div class="flex items-center gap-3.5">
      <Bell class="cursor-pointer text-primary-foreground/70 hover:text-primary-foreground" />
      <RouterLink :to="ROUTES_PATH.LOGIN">
        <User class="text-primary-foreground/70 hover:text-primary-foreground" />
      </RouterLink>
    </div>
  </div>
</template>
