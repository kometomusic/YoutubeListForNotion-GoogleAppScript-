/**************************************
 * Get the latest YouTube data.
 * https://developers.google.com/youtube/v3/getting-started?hl=ja
 **************************************/
function getLatestYoutube() {
  const results = YouTube.Channels.list('contentDetails', {
    mine: true
  });

  const playlistItemList = results.items.map(
    item => {
      var playlistItemList = [];
      var nextPageToken = '';
      while (nextPageToken != null) {
        playlistResponse = YouTube.PlaylistItems.list('snippet, status', {
          playlistId: item.contentDetails.relatedPlaylists.uploads,
          maxResults: 25,
          pageToken: nextPageToken
        });

        playlistItemList = playlistItemList.concat(playlistResponse.items);
        nextPageToken = playlistResponse.nextPageToken;
      }
      return playlistItemList
    }
  );

  const dataList = playlistItemList.flat().map(
    playlistItem => {

      if (playlistItem.snippet.thumbnails.medium != undefined) {
        var thumbnail = playlistItem.snippet.thumbnails.default.url
      }

      return [playlistItem.id
        , playlistItem.snippet.publishedAt
        , playlistItem.status.privacyStatus
        , playlistItem.snippet.resourceId.videoId
        , playlistItem.snippet.title
        , playlistItem.snippet.description
        , 'http://www.youtube.com/watch?v=' + playlistItem.snippet.resourceId.videoId
        , thumbnail
        , new Date()
        , 0
      ]
    }
  )

  // Update execute_date, updateflg
  const youtube_spreadSheet = SpreadsheetApp.openById(sheet_ID);
  const youtube_lastRow = youtube_spreadSheet.getLastRow() - 1
  if (youtube_lastRow > 0) {
    var compareList = youtube_spreadSheet.getSheetByName('list').getRange(2, 1, youtube_lastRow, 10).getValues();

    var endFlg
    for (var i = 0; dataList.length > i; i++) {
      endFlg = false;
      for (var j = 0; compareList.length > j; j++) {
        /**if the videoid in the list from YouTube matches the videoid in the spreadsheet 
         * (except when updateflg=1 (create)) */
        if (compareList[j][9] != '1' && dataList[i][3] == compareList[j][3]) {
          /** If the title, detail, and thumbnails are the same */
          if (dataList[i][4] == compareList[j][4] && dataList[i][5] == compareList[j][5] && dataList[i][7] == compareList[j][7]) {
            dataList[i][8] = compareList[j][8]
            if (compareList[j][9] != '') {
              dataList[i][9] = compareList[j][9]
            }
            endFlg = true;
            break;
          } else {
            dataList[i][9] = 2
            endFlg = true;
            break;
          }
        }
      }
      if (endFlg == false) {
        dataList[i][9] = 1
      }
    }
  }
  var insertRows = dataList.length;
  var insertCols = dataList[0].length;
  youtube_spreadSheet.getSheetByName('list').getRange(2, 1, insertRows, insertCols).setValues(dataList);

}