<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LETTER_STATUS } from './services/type'
import { MousePointerClick } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const text = ref('script')

const words = computed(() => text.value.split(' '))
const typedStatus = ref<Array<Array<LETTER_STATUS>>>([])

const currentWordIndex = ref(0)
const currentLetterIndex = ref(0)

const isStarted = ref(false)
const isFinished = ref(false)
const startTime = ref(0)
const endTime = ref(0)

const isFocusing = ref(false)
const typingContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  resetTypedStatus()
  typingContainer.value?.focus()
})

function resetTypedStatus() {
  typedStatus.value = words.value.map((word) => new Array(word.length).fill(LETTER_STATUS.PENDING))
  currentWordIndex.value = 0
  currentLetterIndex.value = 0
  isFinished.value = false
  isStarted.value = false
  startTime.value = 0
  endTime.value = 0
}

const handleFocus = () => (isFocusing.value = true)

const handleBlur = () => {
  setTimeout(() => (isFocusing.value = false), 300)
}

function checkLetterStatus(idx: number, subIdx: number) {
  return cn('text-4xl font-light relative leading-snug', {
    'text-primary': typedStatus.value?.[idx]?.[subIdx] === LETTER_STATUS.CORRECT,
    'text-red-400': typedStatus.value?.[idx]?.[subIdx] === LETTER_STATUS.INCORRECT,
    'text-accent': typedStatus.value?.[idx]?.[subIdx] === LETTER_STATUS.PENDING,
    'current-pivet': idx === currentWordIndex.value && subIdx === currentLetterIndex.value,
    'is-first': idx === 0 && subIdx === 0,
    'current-end-pivet': currentWordIndex.value === idx && currentLetterIndex.value === subIdx + 1,
  })
}

function handleKeyDown(e: KeyboardEvent) {
  if (isFinished.value) return
  const key = e.key

  if (!isStarted.value) {
    isStarted.value = true
    startTime.value = Date.now()
  }

  const word = words.value[currentWordIndex.value]
  if (!word) return

  if (key.length === 1) {
    // handle space
    if (key === ' ') {
      if (currentLetterIndex.value > 0) {
        currentWordIndex.value++
        currentLetterIndex.value = 0
      }
      return
    }
    if (
      currentWordIndex.value === words.value.length - 1 &&
      currentLetterIndex.value === word.length - 1
    ) {
      endTime.value = Date.now()
      isFinished.value = true
    }

    const expectedChar = word[currentLetterIndex.value] || ''

    typedStatus.value[currentWordIndex.value][currentLetterIndex.value] =
      key === expectedChar ? LETTER_STATUS.CORRECT : LETTER_STATUS.INCORRECT

    if (currentLetterIndex.value === word.length - 1 && key === ' ') {
      currentWordIndex.value++
      currentLetterIndex.value = 0
    } else {
      if (currentLetterIndex.value === word.length) return
      currentLetterIndex.value++
    }
  } else if (key === 'Backspace') {
    if (currentLetterIndex.value > 0) {
      currentLetterIndex.value--
    } else if (currentWordIndex.value > 0) {
      currentWordIndex.value--
      currentLetterIndex.value = words.value[currentWordIndex.value].length - 1
    } else {
      return
    }

    typedStatus.value[currentWordIndex.value][currentLetterIndex.value] = LETTER_STATUS.PENDING
  }
}
</script>

<template>
  <div class="flex flex-col w-full h-full items-center">
    <div class="py-10">Toolbar here</div>

    <div
      tabindex="0"
      ref="typingContainer"
      @keydown.prevent.stop="handleKeyDown"
      @focus="handleFocus"
      @blur="handleBlur"
      class="relative w-full outline-none gap-x-3 py-10 flex flex-1 items-center justify-center"
    >
      <div class="flex flex-wrap gap-y-10 gap-x-3 justify-center text-accent">
        <div v-for="(word, idx) in words" :key="idx" class="h-fit flex">
          <span
            v-for="(letter, subIdx) in word.split('')"
            :key="subIdx"
            :class="checkLetterStatus(idx, subIdx)"
          >
            {{ letter }}
          </span>
        </div>
      </div>
      <div v-if="isFinished">done</div>

      <div
        v-if="!isFocusing"
        class="pointer-events-none absolute w-full h-full inset-0 bg-secondary/80 backdrop:blur-2xl text-white flex justify-center items-center gap-3"
      >
        <MousePointerClick /> Click here to focus
      </div>
    </div>

    <div class="py-20">Footer</div>
  </div>
</template>

<style scoped>
.current-pivet {
  position: relative;
  height: 100%;
}
.current-pivet::after {
  position: absolute;
  width: 2px;
  height: 100%;
  content: '';
  left: 0;
  top: 0;
  background-color: white;
  transition: all ease-in-out;
}

.current-end-pivet {
  position: relative;
  height: 100%;
}
.current-end-pivet::after {
  position: absolute;
  width: 2px;
  height: 100%;
  content: '';
  right: 0;
  top: 0;
  background-color: white;
  transition: all ease-in-out;
}

.is-first.current-pivet::after {
  animation: blink 1s infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
    scale: 1;
  }
  50% {
    opacity: 0;
    scale: 0.8;
  }
}
</style>
