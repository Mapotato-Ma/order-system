<template>
  <div class="businessman-view">
    <template v-for="[tableNumber, grid] in grids" :key="tableNumber">
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <div
            class="businessman-view-grid"
            :class="[`grid-${tableNumber}`, { 'non-interactive': grid.nonInteractive }]"
            v-bind="props"
          >
            <span>{{ grid.name }}</span>
            <span v-if="!grid.nonInteractive">当前人数{{ grid.members?.length }}</span>
            <span v-if="!grid.nonInteractive">一共点了{{ grid.foods?.length }}道菜</span>
            <v-overlay
              :disabled="grid.nonInteractive"
              :model-value="isHovering!"
              class="align-center justify-center"
              scrim="blue"
              contained
              v-if="!grid.nonInteractive && grid.members?.length! > 0"
            >
              <v-btn variant="flat" color="primary" @click="payTheBill(tableNumber)">
                结账清台
              </v-btn>
            </v-overlay>
          </div>
        </template>
      </v-hover>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useBusinessman } from './use-businessman';

const { grids, getOrders, payTheBill } = useBusinessman();
getOrders();
</script>

<style lang="scss" scoped>
.businessman-view {
  width: 100%;
  height: 100%;
  background: linear-gradient(20deg, rgba(26, 34, 126, 0.3) 30%, rgba(13, 72, 161, 0.3) 100%);
  display: grid;
  padding: 1rem;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(6, 1fr);
  grid-template-areas:
    'a a a'
    'b c d'
    'b f d'
    'e e d'
    'e e d'
    'e e g';
  gap: 2rem;
  &-grid {
    cursor: pointer;
    color: #fff;
    text-align: center;
    align-content: center;
    font-size: 2rem;
    font-weight: bolder;
    border-radius: 1rem;
    scale: 0.8 0.8;
    border: 2px solid #8c9eff;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .grid-1 {
    grid-area: a;
  }
  .grid-2 {
    grid-area: b;
  }
  .grid-3 {
    grid-area: c;
  }
  .grid-4 {
    grid-area: d;
  }
  .grid-5 {
    grid-area: e;
  }
  .grid-6 {
    grid-area: f;
  }
  .grid-7 {
    grid-area: g;
  }
}
</style>
