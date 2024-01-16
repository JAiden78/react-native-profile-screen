# react-native-profile-screen
This repo contains the code for a profile screen similar to instagram where General profile information is displayed at the top of the list and selectable tabs are created for posts feed and grid display.

The profile screen also has the video autoplay feature. If the post that is currently in view contains a video, the video is played and previously playing video is paused. This is done using onViewableItemsChanged configuration of the Flatlist.

For each tab data is retreived from a separate API and loading states are maintained. This is done effectively using custom usePagination hook written in paginationService.ts file. This hook maintains data state, refresh loader state, list footer loader state and provides functions to be called on page refresh and scroll end reached to load more data.  

A demo of how the profile screen would look like in an actual mobile app is shown in this [video](https://jumpshare.com/v/Zllc5uDLRFDbkT3PHSmu).
