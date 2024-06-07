import { fromEvent, map } from 'rxjs';
import { ZodType, z } from 'zod';

export const request = async <T>(
  url: string,
  options: RequestInit = { method: 'POST' },
  responseType: ZodType<T> = z.any()
): Promise<T | undefined> => {
  const result: {
    code: number;
    data: unknown;
  } = await (await fetch(`/api${url}`, options))
    .json()
    .catch((err) => console.log('🚀 ~ err ~ 1行', err));

  // 拿到后端返回数据，开始类型强校验
  const typeCheckResult = await responseType.safeParseAsync(result.data);
  console.log('🚀 ~ 类型校验结果 ~ 20行', typeCheckResult);

  if (typeCheckResult.success) {
    return typeCheckResult.data;
  } else {
    alert('后端返回数据类型不匹配！');
  }
};

export const sendEvent = <T, K extends string>(url: string, object: string) => {
  return fromEvent<MessageEvent<string>>(new EventSource(`/events/${url}`), object).pipe(
    map((event) => JSON.parse(event.data) as Record<K, T>)
  );
};
