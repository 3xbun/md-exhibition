<template>
  <div
    class="post"
    :style="{
      backgroundColor: `#${color[props.seed % 5]}`,
      filter: `drop-shadow(2px 3px 2px #${color[props.seed % 5]})`,
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
const color = ["95f0d9", "adb1ef", "ffe14d", "f8608a", "fc8343"];
</script>

<style scoped>
* {
  font-family: "Sriracha", cursive;
}

.post {
  background-color: #ccfdcb;
}

img {
  width: 5%;
  /* margin-left: 80%; */
}

@media (max-width: 768px) {
  img {
    width: 10%;
  }
}
</style>
