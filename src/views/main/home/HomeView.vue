<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { cn } from '@/lib/utils'
import { DATA } from '@/services/data'
import { MousePointerClick } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import TypingResult from './components/TypingResult.vue'
import { LETTER_STATUS } from './services/type'

const text = ref('')

const words = computed(() => text.value.split(' '))

const typedStatus = ref<Array<Array<LETTER_STATUS>>>([])
const totalTyped = ref(0)

const currentWordIndex = ref(0)
const currentLetterIndex = ref(0)

const isStarted = ref(false)
const isFinished = ref(false)
const startTime = ref(0)
const endTime = ref(0)
const wpmRecords = ref<{ time: number; wpm: number }[]>([])

const isFocusing = ref(false)
const typingContainer = ref<HTMLDivElement | null>(null)

const options = [10, 20, 30]
const currentOption = ref(10)
const handleSelectOption = (option: number) => {
  currentOption.value = option
  resetTypedStatus()
}

watch(currentOption, (newCount) => {
  text.value = generateRandomText(newCount)
})

watch(text, () => {
  typingContainer.value?.focus()
  handleFocus()
})

function generateRandomText(count: number) {
  const shuffled = [...DATA].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).join(' ')
}

onMounted(() => {
  typingContainer.value?.focus()
  text.value = generateRandomText(currentOption.value)
  resetTypedStatus()
})
function calculateWPM(): number {
  const elapsedTimeMs = Date.now() - startTime.value
  const elapsedTimeMin = elapsedTimeMs / 1000 / 60

  if (elapsedTimeMs < 200) return 0 // Ignore data if under 200ms

  let correctCharCount = 0

  for (let i = 0; i <= currentWordIndex.value; i++) {
    const statuses = typedStatus.value[i]

    const limit =
      i === currentWordIndex.value
        ? Math.min(currentLetterIndex.value, statuses.length)
        : statuses.length

    for (let j = 0; j < limit; j++) {
      if (statuses[j] === LETTER_STATUS.CORRECT) {
        correctCharCount++
      }
    }
  }

  const wordsTyped = correctCharCount / 5
  return Math.round(wordsTyped / elapsedTimeMin)
}
function recordWPM() {
  const elapsedTime = Date.now() - startTime.value
  if (elapsedTime < 500) return

  const wpm = calculateWPM()
  if (wpm === 0) return

  const last = wpmRecords.value[wpmRecords.value.length - 1]
  if (!last || Math.abs(last.wpm - wpm) >= 1) {
    wpmRecords.value.push({
      time: elapsedTime,
      wpm,
    })
  }
}

function resetTypedStatus() {
  typedStatus.value = words.value.map((word) => new Array(word.length).fill(LETTER_STATUS.PENDING))
  currentWordIndex.value = 0
  currentLetterIndex.value = 0
  isFinished.value = false
  isStarted.value = false
  startTime.value = 0
  endTime.value = 0
  totalTyped.value = 0
  wpmRecords.value = []
}

watch(words, () => {
  typedStatus.value = words.value.map((word) => new Array(word.length).fill(LETTER_STATUS.PENDING))
})
function handleRetry() {
  resetTypedStatus()

  setTimeout(() => {
    typingContainer.value?.focus()
  }, 0)
}

function handleNext() {
  text.value = generateRandomText(currentOption.value)
  resetTypedStatus()

  setTimeout(() => {
    typingContainer.value?.focus()
  }, 0)
}

const handleFocus = () => (isFocusing.value = true)

const handleBlur = () => {
  isFocusing.value = false
}

function checkLetterStatus(idx: number, subIdx: number) {
  const isCurrent = idx === currentWordIndex.value && subIdx === currentLetterIndex.value
  const isEnd =
    currentWordIndex.value === idx &&
    currentLetterIndex.value === subIdx + 1 &&
    currentLetterIndex.value === words.value[idx].length

  return cn('text-4xl font-light relative leading-snug', {
    'text-primary': typedStatus.value?.[idx]?.[subIdx] === LETTER_STATUS.CORRECT,
    'text-red-400': typedStatus.value?.[idx]?.[subIdx] === LETTER_STATUS.INCORRECT,
    'text-accent': typedStatus.value?.[idx]?.[subIdx] === LETTER_STATUS.PENDING,
    'is-first': idx === 0 && subIdx === 0,
    'current-pivet': isFocusing.value && isCurrent && !isEnd,
    'current-end-pivet': isFocusing.value && isEnd,
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
    totalTyped.value++
    if (key === ' ') {
      if (currentLetterIndex.value > 0 && currentWordIndex.value < words.value.length - 1) {
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
    recordWPM()
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
  <div class="flex flex-col flex-1 w-full h-full overflow-hidden items-center">
    <div v-if="!isFinished" class="py-1 border px-3 mb-2 rounded-md">
      <Button
        v-for="item in options"
        :onclick="() => handleSelectOption(item)"
        :class="cn('cursor-pointer', currentOption === item && 'bg-primary')"
        :key="item"
        variant="secondary"
        >{{ item }}</Button
      >
    </div>

    <div
      v-if="!isFinished"
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

      <div
        v-if="!isFocusing"
        class="pointer-events-none absolute w-full h-full inset-0 bg-accent/80 rounded-3xl backdrop:blur-2xl text-white flex justify-center items-center gap-3"
      >
        <MousePointerClick /> Click here to focus
      </div>
    </div>

    <TypingResult
      @next="handleNext"
      @retry="handleRetry"
      v-else
      :wpm-record="wpmRecords"
      :totalTyped="totalTyped"
      :text="text"
    />
  </div>
</template>

<style scoped>
.current-pivet {
  position: relative;
  height: 100%;
  transition: all ease;
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
