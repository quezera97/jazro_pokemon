<template>
  <div v-if="visible" class="loading-overlay d-flex">
    <div class="spinner-border text-light" role="status" style="width:48px;height:48px"></div>
  </div>
</template>

<script>
export default {
  name: "LoadingOverlay",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1050;
  justify-content: center;
  align-items: center;
}
</style>
