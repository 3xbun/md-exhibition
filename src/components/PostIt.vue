<template>
  <div
    class="post"
    :style="{
      backgroundColor: `#${color[props.seed % 5]}`,
      filter: `drop-shadow(0 6px 14px ${shade(props.seed)})`,
      rotate: `${Math.random() * 4 - 2}deg`,
    }"
  >
    <img
      src="https://www.pngall.com/wp-content/uploads/2/Drawing-Pin.png"
      alt=""
      :style="{ marginLeft: `${Math.random() * 80}%` }"
    />
    <h1>{{ props.title }}</h1>
    <p>{{ props.msg }}</p>
  </div>
</template>

<script setup>
const props = defineProps(["title", "msg", "seed"]);
const color = ["d9f2e8", "e3e7fb", "fff3c4", "fde3ea", "fde8d4"];
const shade = (s) => {
  const c = color[s % 5];
  return `rgba(0,0,0,0.18)`;
};
</script>

<style scoped>
.post {
  font-family: "Prompt", sans-serif;
  padding: 1.2rem 1.2rem 1.4rem;
  border-radius: 0.75rem;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.post img {
  position: absolute;
  top: -0.55rem;
  width: 9%;
  min-width: 26px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
}
.post h1 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--md-text);
  margin-bottom: 0.35rem;
}
.post p {
  font-size: 0.95rem;
  color: var(--md-text-soft);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
