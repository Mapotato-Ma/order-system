import { request, sendEvent } from '@/http';
import { ref } from 'vue';
import { z } from 'zod';

export const useCustomer = () => {
  const userName = ref();
  const menu = ref<z.infer<typeof menuType>>();
  const deskMates = ref<string[]>([]);
  const tableNumber = ref<number>();
  const orderMap = ref<Map<string, number>>(new Map());

  const menuType = z.array(z.string());
  // 获取菜单
  const getMenu = async () => {
    menu.value = await request<z.infer<typeof menuType>>('/getMenu', {}, menuType);
    menu.value?.forEach((item: any) => {
      orderMap.value.set(item, 0);
    });
  };

  const setTableNumber = (num: number) => {
    tableNumber.value = num;
    localStorage.setItem('tableNumber', num.toString());
  };

  const setUserName = (name: string) => {
    userName.value = name;
    localStorage.setItem('userName', name);
  };

  const orderByTableNumber = (food: string) =>
    request('/orderByTableNumber', {
      method: 'POST',
      body: JSON.stringify({
        tableNumber: tableNumber.value,
        food,
        userName: userName.value
      })
    });

  const getOrderByTableNumber = async () => {
    sendEvent<string[], 'foods'>(`getOrderByTableNumber/${tableNumber.value}`, 'foods').subscribe(
      (data) => {
        orderMap.value.forEach((value, key) => {
          orderMap.value.set(key, data.foods.filter((item: string) => item === key).length);
        });
      }
    );
  };

  const getDeskMateByTableNumber = async () => {
    sendEvent<string[], 'members'>(
      `getDeskMateByTableNumber/${tableNumber.value}/${userName.value}`,
      'members'
    ).subscribe((data) => {
      deskMates.value = data.members ?? [];
    });
  };

  return {
    userName,
    menu,
    deskMates,
    tableNumber,
    orderMap,
    getMenu,
    setTableNumber,
    setUserName,
    orderByTableNumber,
    getOrderByTableNumber,
    getDeskMateByTableNumber
  };
};
