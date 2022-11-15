const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const message = ref("Hello World!");
    const data = Queues;

    const searchText = ref("");
    const filteredData = computed(() =>
      data.filter((e) => e.staff.includes(searchText.value))
    );
    const filteredStd = computed(
      () => Students.filter((e) => e.id === searchText.value)[0]
    );

    return {
      message,
      filteredData,
      filteredStd,
      searchText,
    };
  },
}).mount("#app");
