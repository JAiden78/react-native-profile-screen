import { useRef, useState } from "react";

/**
 * A hook to keep track of list data retreived from API and the list refesh and footer loading state.
 * @param Api
 * @param userId
 * @param key
 * @param limit
 * @param saveData
 * @param getData
 * @returns Data, Loading state, APIs to hit on screen render and when Scroll reached end.
 */
function usePagination(
  Api: any,
  userId: string,
  key: string,
  limit: number = 10,
  saveData?: any,
  getData?: any
) {
  const cursorArr: any = useRef([]);
  const hasBeenHit = useRef(false);
  const [state, setState] = useState({
    loading: true,
    refreshing: false,
    data: [],
    footerLoader: false,
  });

  function HitApi(cursor: any) {
    if (!cursor) cursorArr.current = [];
    if (!cursorArr?.current?.includes(cursor)) {
      if (cursor) {
        setState((pre) => {
          return { ...pre, footerLoader: true };
        });
      }
      Api(
        (res: any) => {
          if (res) {
            hasBeenHit.current = true;
            let data = key ? res[key] : res;
            let prevData = !!getData ? getData() : state.data;
            let newArr = cursor ? [...prevData, ...data] : data;
            let uniqueArr: any = [
              ...new Set(newArr.map((item: any) => (item?._id ? item : false))),
            ];
            if (saveData) {
              saveData(uniqueArr);
              setState((prev) => ({
                ...prev,
                loading: false,
                refreshing: false,
                footerLoader: false,
              }));
            } else {
              setState((prev) => ({
                ...prev,
                loading: false,
                refreshing: false,
                footerLoader: false,
                data: uniqueArr,
              }));
            }
          }
          setState((prev) => ({
            ...prev,
            loading: false,
            refreshing: false,
            footerLoader: false,
          }));
        },
        userId,
        cursor,
        limit
      );
    } else {
      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
      }));
    }
    cursorArr?.current?.push(cursor);
  }

  function handleRefresh() {
    setState((prev) => ({ ...prev, refreshing: true }));
    HitApi(false);
  }

  function loadMore(offset: any) {
    HitApi(offset);
  }

  return [state, HitApi, handleRefresh, loadMore, hasBeenHit.current];
}

export { usePagination };
