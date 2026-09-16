import { useCallback, useRef, useState } from 'react';

/**
 * Guards API-triggering actions against double clicks / concurrent fires
 * and exposes a busy key so buttons can show a loading state.
 *
 * Usage:
 *   const { busyKey, runAction } = useApiAction();
 *   <button disabled={busyKey === `delete-${id}`}
 *           onClick={() => runAction(`delete-${id}`, () => remove(id))}>
 */
export function useApiAction() {
  const [busyKey, setBusyKey] = useState(null);
  const busyRef = useRef(null);

  const runAction = useCallback(async (key, action) => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = key;
    setBusyKey(key);
    try {
      await action();
    } finally {
      busyRef.current = null;
      setBusyKey(null);
    }
  }, []);

  return {
    busyKey,
    runAction,
    isBusy: busyKey != null
  };
}

export default useApiAction;