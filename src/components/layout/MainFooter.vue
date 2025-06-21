<template>
  <div
    class="mx-auto flex flex-col justify-center items-center mb-4 gap-2 mt-4 text-white text-[12px] leading-relaxed tracking-wide"
  >
    <div class="flex justify-center items-center gap-3">
      <span class="key">ctrl</span> + <span class="key">enter</span> - retry
    </div>
    <div class="flex justify-center items-center gap-3">
      <span class="key">alt</span> + <span class="key">enter</span> - next
    </div>
  </div>
</template>
<style scoped>
.key {
  background: gray;
  color: white;
  padding: 0px 15px;
  display: inline-block;
  border-radius: 4px;
}
</style>
