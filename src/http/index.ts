import { fromEvent, map } from 'rxjs';

export const request = async (url: string, options: RequestInit = { method: 'POST' }) =>
  await (await fetch(`/api${url}`, options))
    .json()
    .catch((err) => console.log('🚀 ~ err ~ 1行', err));

export const sendEvent = <T, K extends string>(url: string, object: string) => {
  return fromEvent<MessageEvent<string>>(new EventSource(`/events/${url}`), object).pipe(
    map((event) => JSON.parse(event.data) as Record<K, T>)
  );
};
