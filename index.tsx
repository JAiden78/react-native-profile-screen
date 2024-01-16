import React, { memo, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

import { RFValue } from "react-native-responsive-fontsize";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { useDispatch, useSelector } from "react-redux";
import { ICON_GAME, ICON_PHOTO, ICON_TAG, ICON_TEXT } from "../../../assets";
import { AppLoadingView } from "../../components";
import { setUserProfileData } from "../../redux/reducers/userProfileDataSlice";
import { setUser } from "../../redux/reducers/userSlice";
import { store } from "../../redux/store";
import {
  GetMediaOnlyPosts,
  GetPostsOfSpecificUser,
  GetPostsOfSpecificUserWhereTaggedIn,
  GetSingleUserProfile,
} from "../../services";
import { GetUserReviews } from "../../services/gamesService";
import { ListRenderItem } from "./UserProfileTabs/ListComponent";
import { UserProfileHeader } from "./UserProfileTabs/UserProfileHeader";
import { usePagination } from "./paginationService";

const UserProfileScreenComp = ({ navigation, route }: any) => {
  let { user, userProfileData } = useSelector((state: any) => state.root);
  const disp = useDispatch();
  let userId = route?.params?.userID;
  let isCurrentUser = user?._id == userId;

  let [state, setState] = useState({
    loading: !isCurrentUser,
    showMenu: false,
    LHeight: 0,
    LWidth: 0,
    bioShowMoreLines: 3,
    showMore: false,
    scrollPosition: 0,
    enableScrollViewScroll: true,
    userData: isCurrentUser ? user : null,
    isVisible: false,
    currentItemIndex: 0,
    showPostMenu: false,
    focused: false,
  });

  const [minHeight, setMinHeight] = useState(1500);

  //ScrollRef to get scroll Position and scroll to specific position
  const scrollPos: any = useRef(0);
  const scrollRef: any = useRef(null);
  const minHeightRef: any = useRef(0);
  const dispatch = useDispatch();

  useEffect(() => {
    minHeightRef.current = minHeight;
  }, [minHeight]);

  /**
   * Hit API to get User Profile Data
   */
  const getsingleuserprofilehelper = () => {
    GetSingleUserProfile((profileRes: any) => {
      if (profileRes) {
        let cloneArr = [...profileRes.gamingAccounts];

        let obj = {
          ...profileRes,
          gamingAccounts: cloneArr,
        };
        setState((prev) => ({ ...prev, loading: false, userData: obj }));
        if (isCurrentUser) disp(setUser(obj));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }, userId);
  };

  const [activeTab, setActiveTab] = useState(0);

  //Posts pagination and data handling
  const [
    postsState,
    hitPostsApi,
    handlePostsRefresh,
    handlePostsLoadMore,
    postsBeenHit,
  ]: any = usePagination(
    GetPostsOfSpecificUser,
    userId,
    "",
    10,
    isCurrentUser
      ? (data: any) => {
          dispatch(setUserProfileData({ posts: data }));
        }
      : undefined,
    isCurrentUser
      ? () => {
          return store?.getState()?.root?.userProfileData?.posts;
        }
      : undefined
  );

  //Grid pagination and data handling
  const [
    gridState,
    hitGridApi,
    handleGridRefresh,
    handleGridLoadMore,
    gridBeenHit,
  ]: any = usePagination(
    GetMediaOnlyPosts,
    userId,
    "",
    30,
    isCurrentUser
      ? (data: any) => {
          dispatch(setUserProfileData({ media: data }));
        }
      : undefined,
    isCurrentUser
      ? () => {
          return store?.getState()?.root?.userProfileData?.media;
        }
      : undefined
  );

  //Reviews pagination and data handling
  const [
    reviewsState,
    hitReviewsApi,
    handleReviewsRefresh,
    handleReviewsLoadMore,
    reviewsBeenHit,
  ]: any = usePagination(
    GetUserReviews,
    userId,
    "",
    10,
    isCurrentUser
      ? (data: any) => {
          dispatch(setUserProfileData({ reviews: data }));
        }
      : undefined,
    isCurrentUser
      ? () => {
          return store?.getState()?.root?.userProfileData?.reviews;
        }
      : undefined
  );

  //Tagged In Posts pagination and data handling
  const [
    tagsState,
    hitTagsApi,
    handleTagsRefresh,
    handleTagsLoadMore,
    tagsBeenHit,
  ]: any = usePagination(
    GetPostsOfSpecificUserWhereTaggedIn,
    userId,
    "",
    10,
    isCurrentUser
      ? (data: any) => {
          dispatch(setUserProfileData({ taggedInPosts: data }));
        }
      : undefined,
    isCurrentUser
      ? () => {
          return store?.getState()?.root?.userProfileData?.taggedInPosts;
        }
      : undefined
  );

  useEffect(() => {
    getsingleuserprofilehelper();
  }, []);

  useEffect(() => {
    const unsubscribeFocusListner = navigation.addListener("focus", () => {
      setState((prev) => ({ ...prev, focused: true }));
    });
    const unsubscribeBlur = navigation.addListener("blur", () => {
      setState((prev) => ({ ...prev, focused: false }));
    });

    return () => {
      unsubscribeFocusListner();
      unsubscribeBlur();
    };
  }, []);

  useEffect(() => {
    if (activeTab == 0) {
      !postsBeenHit && hitPostsApi();
    } else if (activeTab == 1) {
      !gridBeenHit && hitGridApi();
    } else if (activeTab == 2) {
      !reviewsBeenHit && hitReviewsApi();
    } else if (activeTab == 3) {
      !tagsBeenHit && hitTagsApi();
    }
  }, [activeTab]);

  let tabs_data = [ICON_TEXT, ICON_PHOTO, ICON_GAME, ICON_TAG];

  /**
   * Chooses Data based on Current Tab
   */
  const handleListData = () => {
    if (activeTab == 0) {
      return isCurrentUser ? userProfileData?.posts : postsState?.data;
    } else if (activeTab == 1) {
      let chunks: any = [];
      let data = isCurrentUser ? userProfileData?.media : gridState?.data;
      for (let i = 0; i < data?.length; i += 3) {
        chunks.push(data?.slice(i, i + 3));
      }
      return chunks;
    } else if (activeTab == 2) {
      return isCurrentUser ? userProfileData?.reviews : reviewsState?.data;
    } else if (activeTab == 3) {
      return isCurrentUser ? userProfileData?.taggedInPosts : tagsState?.data;
    }
  };

  /**
   * Chooses List Loader based on Current Tab
   */
  const handleListLoader = () => {
    if (activeTab == 0) {
      return postsState.loading;
    } else if (activeTab == 1) {
      return gridState.loading;
    } else if (activeTab == 2) {
      return reviewsState.loading;
    } else if (activeTab == 3) {
      return tagsState.loading;
    }
  };

  /**
   * Chooses Refresh Loader based on Current Tab
   */
  const handleListRefresh = () => {
    if (activeTab == 0) {
      return postsState.refreshing;
    } else if (activeTab == 1) {
      return gridState.refreshing;
    } else if (activeTab == 2) {
      return reviewsState.refreshing;
    } else if (activeTab == 3) {
      return tagsState.refreshing;
    }
  };

  /**
   * Chooses List Footer Loader based on Current Tab
   */
  const handleListFooter = () => {
    if (activeTab == 0) {
      return postsState.footerLoader;
    } else if (activeTab == 1) {
      return gridState.footerLoader;
    } else if (activeTab == 2) {
      return reviewsState.footerLoader;
    } else if (activeTab == 3) {
      return tagsState.footerLoader;
    }
  };

  /**
   * Loads more Data when scrolled to bottom of the list based on Current Tab
   */
  const onEndReached = () => {
    if (activeTab == 0) {
      let data = isCurrentUser ? userProfileData?.posts : postsState?.data;
      if (data?.length) handlePostsLoadMore(data[data?.length - 1]?._id);
    } else if (activeTab == 1) {
      let data = isCurrentUser ? userProfileData?.media : gridState?.data;
      if (data?.length) handleGridLoadMore(data[data.length - 1]?._id);
    } else if (activeTab == 2) {
      let data = isCurrentUser ? userProfileData?.reviews : reviewsState?.data;
      if (data?.length) {
        handleReviewsLoadMore(data[data?.length - 1]?._id);
      }
    } else if (activeTab == 3) {
      let data = isCurrentUser
        ? userProfileData?.taggedInPosts
        : tagsState?.data;
      if (data.length) {
        handleTagsLoadMore(data[data?.length - 1]?._id);
      }
    }
  };

  /**
   * Refreshes Data based on Current Tab
   */
  const onRefresh = () => {
    if (activeTab == 0) {
      handlePostsRefresh();
    } else if (activeTab == 1) {
      handleGridRefresh();
    } else if (activeTab == 1) {
      handleReviewsRefresh();
    } else if (activeTab == 4) {
      handleTagsRefresh();
    }
  };

  let actualData = handleListData();
  let isRefreshing = handleListRefresh();
  let footerLoader = handleListFooter();
  let loading = handleListLoader();

  let height = Dimensions.get("screen").height;

  const postsRefs: any = useRef([]);
  const currentPlaying: any = useRef({
    postId: null,
    ref: null,
  });

  /**
   * Find out the item currently in view of the list to Autoplay the video.
   */
  const onViewRef = React.useRef(({ viewableItems }: any) => {
    let newInView: any = {
      postId: null,
      ref: null,
    };
    for (let i = 0; i < viewableItems?.length; i++) {
      let item = viewableItems[i];
      if (item?.isViewable) {
        let post = item?.item;
        if (post) {
          let albumItems = post?.attachments;
          if (albumItems?.length > 0) {
            if (
              postsRefs &&
              postsRefs.current &&
              postsRefs.current.length &&
              postsRefs.current.length >= item?.index
            ) {
              if (post._id != currentPlaying?.current?.postId) {
                postsRefs?.current[item?.index].playCurrent();
              }
              newInView.postId = post._id;
              newInView.ref = postsRefs?.current[item?.index];

              break;
            }
          }
        }
      }
    }
    if (
      currentPlaying &&
      currentPlaying.current &&
      newInView?.postId != currentPlaying.current?.postId &&
      currentPlaying.current.ref &&
      currentPlaying.current.ref.pauseCurrent &&
      typeof currentPlaying.current.ref.pauseCurrent == "function"
    ) {
      currentPlaying?.current?.ref?.pauseCurrent();
    }
    currentPlaying.current.postId = newInView.postId;
    currentPlaying.current.ref = newInView.ref;

    if (newInView.postId == null && viewableItems.length > 0) {
      newInView.postId = viewableItems[0].item?.id;
      newInView.ref = postsRefs?.current[0];
    }
  });

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 70 });

  /**
   * Stops currently playing video.
   */
  const stopCurrent = () => {
    if (
      currentPlaying &&
      currentPlaying.current &&
      currentPlaying.current.ref &&
      currentPlaying.current.ref.pauseCurrent &&
      typeof currentPlaying.current.ref.pauseCurrent == "function"
    ) {
      currentPlaying?.current?.ref?.pauseCurrent();
    }
  };

  /**
   * Plays video currently in view.
   */
  const playCurrent = () => {
    if (
      currentPlaying &&
      currentPlaying.current &&
      currentPlaying.current.ref &&
      currentPlaying.current.ref.playCurrent &&
      typeof currentPlaying.current.ref.playCurrent == "function"
    ) {
      currentPlaying?.current?.ref?.playCurrent();
    }
  };
  useEffect(() => {
    if (!state.focused) {
      stopCurrent();
    }
  }, [state.focused]);

  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "black", paddingTop: insets.top }}>
      <FlatList
        onScroll={({ nativeEvent }: any) => {
          scrollPos.current = nativeEvent.contentOffset.y;
        }}
        ref={scrollRef}
        scrollEventThrottle={200}
        stickyHeaderIndices={[1]}
        data={["dummmy", ...actualData]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={"white"}
            onRefresh={onRefresh}
          />
        }
        ListHeaderComponent={
          <UserProfileHeader
            navigation={navigation}
            state={state}
            setState={setState}
            isCurrentUser={isCurrentUser}
            userId={userId}
            setMinHeight={setMinHeight}
          />
        }
        contentContainerStyle={{
          minHeight: minHeight + height - RFValue(58) - insets.top,
          paddingBottom: insets.bottom,
        }}
        keyExtractor={(ii, index) => {
          if (index == 0) {
            return "header";
          }
          if (activeTab == 1) {
            let id = "";
            ii.map((item: any) => {
              id += item?._id || uuid.v4();
            });
            return id;
          } else {
            let id = ii?._id || uuid.v4();
            return id;
          }
        }}
        onViewableItemsChanged={onViewRef.current}
        onEndReached={onEndReached}
        ListFooterComponent={
          <>
            {footerLoader && (
              <View style={{ paddingVertical: RFValue(15) }}>
                <ActivityIndicator size={"small"} color={"white"} />
              </View>
            )}
          </>
        }
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item, index }: any) => {
          return (
            <ListRenderItem
              index={index}
              item={item}
              tabs_data={tabs_data}
              setActiveTab={(num: number) => {
                if (scrollPos.current > minHeight) {
                  scrollRef?.current?.scrollToOffset({
                    offset: minHeightRef?.current,
                    animated: false,
                  });
                }
                setActiveTab(num);
              }}
              activeTab={activeTab}
              navigation={navigation}
              userId={userId}
              noData={actualData?.length == 0}
              loading={loading}
              stopCurrent={stopCurrent}
              playCurrent={playCurrent}
              ref={(el: any) => (postsRefs.current[index] = el)}
            />
          );
        }}
      />

      {state.loading ? <AppLoadingView /> : null}
    </View>
  );
};

function arePropsEqual(prevProps: any, nextProps: any) {
  return true;
}

export const UserProfileScreen = memo(UserProfileScreenComp, arePropsEqual);
