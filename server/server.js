import { readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { Subject, merge } from 'rxjs';

// JSON数据静态资源路径
const ORDER_PATH = './server/data/order.json';
const MENU_PATH = './server/data/menu.json';

// 获取订单
const getOrder = () => JSON.parse(readFileSync(ORDER_PATH, { encoding: 'utf8' }));
// 写入订单
const writeData = (data) => {
  writeFileSync(ORDER_PATH, JSON.stringify(data), { encoding: 'utf8' });
  console.log('🚀 ~ 写入最新数据: ~ 14行');
  console.table(getOrder());
};
// 获取菜单
const getMenu = () => JSON.parse(readFileSync(MENU_PATH, { encoding: 'utf8' }));

// 创建服务
createServer()
  .listen(3000, () => {
    console.log('🚀 ~ server ~ 20行', 'Server is running on port 3000');
  })
  .on('request', async (req, res) => {
    req.url = req.url.replace('/api', '');
    req.url = req.url.replace('/events', '');
    const reqBody = await getReqBody(req);
    if (req.url.startsWith('/getDeskMateByTableNumber')) {
      getDeskMateByTableNumber(...req.url.split('/').slice(2), res);
    }
    if (req.url.startsWith('/orderByTableNumber')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      orderByTableNumber(reqBody);
      res.end(toJSON({ code: 200, message: '请求成功' }));
    }
    if (req.url.startsWith('/getMenu')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(toJSON({ code: 200, message: '获取菜单成功', data: getMenu() }));
      return;
    }
    if (req.url.startsWith('/getOrderByTableNumber')) {
      getOrderByTableNumber(req.url.split('/').pop(), res);
    }
    if (req.url.startsWith('/getAllOrders')) {
      getAllOrders(res);
    }
    if (req.url.startsWith('/payTheBill')) {
      payTheBill(reqBody, res);
    }
  });

// 获取请求体JSON数据
const getReqBody = (req) =>
  new Promise((resolve) => {
    req.on('data', (body) => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        resolve(null);
      }
    });
    req.on('end', () => {
      resolve(null);
    });
  });

// 转JSON工具方法
const toJSON = (data) => JSON.stringify(data);

/**
 * @type {Map<number, Subject<void>>}
 */
const orderSubjects = new Map([
  ['1', new Subject()],
  ['2', new Subject()],
  ['3', new Subject()],
  ['4', new Subject()],
  ['5', new Subject()]
]);

// 所有订单总通知
const orderTotalSubject = new Subject();

merge(...[...orderSubjects.values()]).subscribe(orderTotalSubject);

// 通过桌号点菜
const orderByTableNumber = ({ tableNumber, food, userName }) => {
  try {
    tableNumber = String(tableNumber);
    const currentData = getOrder();
    ((currentData[tableNumber] ??= {}).foods ??= []).push(food);
    const members = new Set(((currentData[tableNumber] ??= {}).members ??= [])).add(userName);
    currentData[tableNumber].members = [...members];
    writeData(currentData);

    // 点菜成功，通知此桌所有人
    orderSubjects.get(tableNumber).next();
  } catch (error) {
    console.log('🚀 ~ orderByTableNumber ~ 100行', error);
    res.end(toJSON({ code: 400, message: '点菜失败' }));
  }
};

// 通过桌号实时获取同桌
const getDeskMateByTableNumber = async (tableNumber, userName, res) => {
  userName = decodeURIComponent(userName);
  try {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const getMembers = () =>
      (getOrder()[tableNumber]?.members ?? []).filter((member) => member !== userName);
    orderSubjects.get(tableNumber).subscribe(() => {
      sendSSEEvent(res, 'members', toJSON({ members: getMembers() }));
    });
    orderSubjects.get(tableNumber).next();
  } catch (error) {
    console.log('🚀 ~ getOrderByTableNumber ~ 111行', error);
    res.end(toJSON({ code: 400, message: '获取失败' }));
  }
};

// 通过桌号实时获取点单结果
const getOrderByTableNumber = (tableNumber, res) => {
  try {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    orderSubjects.get(tableNumber).subscribe(() => {
      sendSSEEvent(res, 'foods', toJSON({ foods: getOrder()[tableNumber]?.foods ?? [] }));
    });
    orderSubjects.get(tableNumber).next();
  } catch (error) {
    console.log('🚀 ~ getOrderByTableNumber ~ 111行', error);
    res.end(toJSON({ code: 400, message: '获取失败' }));
  }
};

// 实时获取所有点单结果
const getAllOrders = (res) => {
  try {
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    orderTotalSubject.subscribe(() => {
      sendSSEEvent(res, 'orders', toJSON({ orders: getOrder() }));
    });
    orderTotalSubject.next();
  } catch (error) {
    console.log('🚀 ~ getAllOrders ~ 111行', error);
    res.end(toJSON({ code: 400, message: '获取失败' }));
  }
};

// 通过桌号支付账单
const payTheBill = ({ tableNumber }, res) => {
  try {
    const currentData = getOrder();
    currentData[tableNumber].members = [];
    currentData[tableNumber].foods = [];
    writeData(currentData);
    // 通知这桌人
    orderSubjects.get(String(tableNumber)).next();
    res.end(toJSON({ code: 200, message: '支付成功', data: true }));
  } catch (error) {
    console.log('🚀 ~ 支付失败 ~ 154行', error);
    res.end(toJSON({ code: 400, message: '支付失败', data: false }));
  }
};

// 根据类型和数据发送SSE事件
const sendSSEEvent = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${data}\n\n`);
};
