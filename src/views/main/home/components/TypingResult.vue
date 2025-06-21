<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { ChevronRight, RefreshCcw } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps<{
  wpmRecord: { time: number; wpm: number }[]
  totalTyped: number
  text: string
}>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'next'): void
}>()

const groupedWPM = computed(() => {
  const map = new Map<number, number[]>()

  props.wpmRecord.forEach(({ time, wpm }) => {
    const sec = Math.floor(time / 1000)
    if (!map.has(sec)) {
      map.set(sec, [wpm])
    } else {
      map.get(sec)?.push(wpm)
    }
  })

  return Array.from(map.entries()).map(([sec, wpmArray]) => ({
    second: sec,
    avgWPM: Math.round(wpmArray.reduce((a, b) => a + b, 0) / wpmArray.length),
  }))
})

const chartData = computed(() => ({
  labels: groupedWPM.value.map((r) => `${r.second}s`),
  datasets: [
    {
      label: 'WPM over time',
      data: groupedWPM.value.map((r) => r.avgWPM),
      fill: false,
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time (s)',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Words per Minute (WPM)',
      },
    },
  },
}

const averageWPM = computed(() => {
  const total = props.wpmRecord.reduce((sum, r) => sum + r.wpm, 0)
  return props.wpmRecord.length ? Math.round(total / props.wpmRecord.length) : 0
})

const statistics = computed(() => {
  const lastRecord = props.wpmRecord[props.wpmRecord.length - 1]
  return [
    {
      label: 'wpm',
      value: Math.ceil(averageWPM.value),
    },
    {
      label: 'acc',
      value:
        props.totalTyped === 0
          ? '0%'
          : Math.ceil(
              (props.totalTyped > props.text.length
                ? props.text.length / props.totalTyped
                : props.totalTyped / props.text.length) * 100,
            ) + '%',
    },
    {
      label: 'time',
      value: lastRecord ? Math.floor(lastRecord.time / 1000) + 's' : '0s',
    },
  ]
})

onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      emit('retry')
    } else if (e.key === 'Enter' && e.altKey) {
      emit('next')
    }
  }

  window.addEventListener('keydown', handleKeydown)

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<template>
  <div class="relative max-w-2xl w-full outline-none gap-x-3 py-10 flex-1">
    <Line :data="chartData" :options="chartOptions" />
    <div class="text-center text-lg mt-2 font-medium flex justify-between">
      <div v-for="item in statistics" :key="item.label" class="flex flex-col">
        <span class="text-accent-foreground">{{ item.label }}</span>

        <span class="text-amber-500 text-4xl">{{ item.value }}</span>
      </div>
    </div>
    <div class="flex mt-2 justify-center text-white gap-10">
      <div @click="emit('retry')">
        <RefreshCcw class="text-primary-foreground/70 hover:text-primary-foreground" />
      </div>
      <div @click="emit('next')">
        <ChevronRight class="text-primary-foreground/70 hover:text-primary-foreground" />
      </div>
    </div>
  </div>
</template>
