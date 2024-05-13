<template>
  <div class="customer-view d-flex flex-column">
    <v-card class="mx-auto d-flex w-100">
      <template v-slot:prepend>
        <v-icon color="error" icon="mdi-food" @click.middle="goAdmin"></v-icon>
      </template>
      <template v-slot:title>
        <span class="font-weight-black">欢迎来到Mapotato食堂</span>
      </template>
      <v-card-text class="bg-surface-light pt-4 d-flex ga-3">
        <span class="text-h6 text-caption">今日上新：</span>
        <span class="d-flex ga-2">
          <v-chip size="x-small" variant="outlined" color="green">蒜蓉西兰花</v-chip>
          <v-chip size="x-small" variant="outlined" color="warning">豉汁蒸鸡脚</v-chip>
          <v-chip size="x-small" variant="outlined" color="error">豉椒鸡胗</v-chip>
        </span>
      </v-card-text>
    </v-card>
    <v-divider></v-divider>
    <v-chip color="default">
      <span class="d-flex ga-1 align-center title">
        桌号为
        <v-chip size="x-small" variant="outlined" color="default">{{ tableNumber }}</v-chip>
        的顾客
        <v-chip size="x-small" variant="outlined" color="error">{{ userName }}</v-chip>
        正在下单, 参与下单的顾客还有：
      </span>
      <div class="d-flex ga-2 members">
        <v-chip
          size="x-small"
          variant="outlined"
          color="primary"
          v-for="item in deskMates"
          :key="item"
          prepend-icon="mdi-account"
        >
          <span>{{ item }}</span>
        </v-chip>
      </div>
    </v-chip>
    <!-- 点菜列表 -->
    <v-list>
      <v-list-item v-for="[food, count] in orderMap" :key="food" class="border-b-sm">
        <div class="d-flex justify-space-between align-center">
          <span>{{ food }}</span>
          <span class="d-flex justify-space-between align-center ga-3">
            <v-chip variant="outlined" color="primary" v-show="count > 0">{{ count }}</v-chip>
            <v-btn
              icon="mdi-plus"
              square
              ripple
              color="primary"
              variant="tonal"
              @click="addFood(food)"
            ></v-btn>
          </span>
        </div>
      </v-list-item>
    </v-list>
    <v-btn color="primary">提交订单</v-btn>
    <v-dialog v-model="dialog" width="auto">
      <v-card max-width="400" prepend-icon="mdi-forum" title="请选择桌号并输入用户名">
        <v-radio-group inline v-model="inputTableNumber">
          <v-radio label="1号桌" :value="1"></v-radio>
          <v-radio label="2号桌" :value="2"></v-radio>
          <v-radio label="3号桌" :value="3"></v-radio>
          <v-radio label="4号桌" :value="4"></v-radio>
          <v-radio label="5号桌" :value="5"></v-radio>
        </v-radio-group>
        <v-text-field
          :rules="[(v) => !!v || '请输入用户名']"
          aria-required="true"
          label="请输入用户名"
          v-model="userName"
        ></v-text-field>
        <template v-slot:actions>
          <v-btn class="ms-auto" text="Ok" @click="confirm"></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" color="error" :timeout="1000">请输入用户名</v-snackbar>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useCustomer } from './use-customer';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const dialog = ref(false);
const snackbar = ref(false);
const userName = ref(localStorage.getItem('userName') ?? '');
const inputTableNumber = ref(1);
const {
  tableNumber,
  orderMap,
  deskMates,
  getMenu,
  setTableNumber,
  setUserName,
  orderByTableNumber,
  getOrderByTableNumber,
  getDeskMateByTableNumber
} = useCustomer();

onMounted(async () => {
  if (localStorage.getItem('userName')) {
    setTableNumber(Number(localStorage.getItem('tableNumber')));
    setUserName(localStorage.getItem('userName')!);
    initView();
  } else {
    dialog.value = true;
  }
});

const confirm = async () => {
  if (!userName.value) {
    snackbar.value = true;
  } else {
    setTableNumber(inputTableNumber.value);
    setUserName(userName.value);
    dialog.value = false;
    initView();
  }
};

const initView = async () => {
  await getMenu();
  getOrderByTableNumber();
  getDeskMateByTableNumber();
};

const addFood = (food: string) => {
  orderByTableNumber(food);
};

const goAdmin = () => {
  router.push('/businessman');
};
</script>

<style lang="scss" scoped>
.customer-view {
  height: 100%;
  width: 100%;
  & > :deep(.v-chip) {
    width: 100%;
    flex-shrink: 0;
    padding: 1rem;
    border-radius: 0.1rem;
    height: unset;
    & > .v-chip__content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.4rem;
      .title,
      .members {
        width: 100%;
        flex-wrap: wrap;
      }
    }
  }
  .v-list {
    height: 100%;
    margin-bottom: 1.5rem;
  }
}
// 兼容移动端
@media (max-width: 600px) {
  .customer-view > .v-card {
    flex-direction: column;
    flex-shrink: 0;
    & > .v-card-text {
      flex-direction: column;
    }
  }
}
</style>
