// @ts-nocheck
import { createContext, useContext } from "react";

/**
 * Hybrid context: a real React Context with Provider, but ALSO mirrors the
 * latest value into a module-level store so that legacy `useAppContext()`
 * callers (which run without a Provider in some test paths) still see live
 * state. Index.tsx wraps its tree in <AppContext.Provider>; consumers use
 * `useAppContext()` unchanged.
 */
let _store: any = {};

export const AppContext = createContext<any>(_store);

export const setAppContext = (value: any) => {
  _store = value;
};

export const useAppContext = () => {
  // Prefer the live Provider value; fall back to the module store.
  const ctx = useContext(AppContext);
  return ctx && Object.keys(ctx).length ? ctx : _store;
};
