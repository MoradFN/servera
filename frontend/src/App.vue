<!-- MTTODO TRANSITION TEST, LÄGG DE NÅN ANNAN STANS. -->

<template>
  <div id="app">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<!-- <style>
/* Transitions for smoother navigation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> -->
