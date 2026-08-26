import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * True once mounted on the client, false during SSR — for deferring
 * browser-only rendering (portals, DOM-dependent libs) without a
 * setState-in-effect render pass.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
