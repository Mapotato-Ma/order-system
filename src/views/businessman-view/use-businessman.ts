import { request, sendEvent } from '@/http';
import { ref } from 'vue';
import { z } from 'zod';

const zGrid = z.object({
  name: z.string(),
  members: z.array(z.string()).optional(),
  foods: z.array(z.string()).optional(),
  nonInteractive: z.boolean().optional()
});

type IGrid = z.infer<typeof zGrid>;

export const useBusinessman = () => {
  // 布局
  const grids = ref<Map<number, IGrid>>(
    new Map([
      [1, { name: '1号大包间', members: [], foods: [] }],
      [2, { name: '2号桌', members: [], foods: [] }],
      [3, { name: '3号桌', members: [], foods: [] }],
      [4, { name: '4号包间', members: [], foods: [] }],
      [5, { name: '5号大包间', members: [], foods: [] }],
      [6, { name: '出餐口', nonInteractive: true }],
      [7, { name: '卫生间', nonInteractive: true }]
    ])
  );

  const getOrders = () => {
    sendEvent<Record<string, IGrid>, 'orders'>('getAllOrders', 'orders').subscribe((data) => {
      Object.entries(data.orders).forEach(([key, value]) => {
        grids.value.get(Number(key))!.members = value.members;
        grids.value.get(Number(key))!.foods = value.foods;
      });
    });
  };

  const booleanType = z.boolean();
  // 结账
  const payTheBill = async (tableNumber: number) => {
    const res = await request<z.infer<typeof booleanType>>(
      '/payTheBill',
      {
        method: 'POST',
        body: JSON.stringify({ tableNumber })
      },
      booleanType
    );
    console.log('🚀 ~ 校验通过，业务侧成功拿到数据 ~ 38行', res);
  };

  return { grids, getOrders, payTheBill };
};
