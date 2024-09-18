/**********************
 * Add to Notion
 */
function nt_ins() {
  /** if updateflg is '1'(create) */
  const targetList = _get_spreadsheet('1')

  // postYoutubeData(note)
  targetList.map(
    target => {
      var postData = {
        'parent': { 'database_id': nt_DB_ID },
        'properties': {
          'title': createProperties(target[4], 'title'),
          'uploadymd': createProperties(target[1], 'date'),
          'open_type': createProperties(target[2], 'multi_select'),
          'detail': createProperties(target[5], 'rich_text'),
          'videoid': createProperties(target[3], 'rich_text'),
          'url': createProperties(target[6], 'url'),
          'thumbnails': createProperties(target[7], 'files'),
          'execute_date': createProperties(target[8], 'date'),
        }
      }
      var options = {
        "method": "post",
        "headers": notionHeader,
        "payload": JSON.stringify(postData)
      };
      UrlFetchApp.fetch(nt_api_pages, options);
    }
  )

  // postYoutubeData(block)
  //　After creating a note, get the ID of the corresponding note.
  //　Create a block that will be a child element of the corresponding ID.
  const nt_api_db_url = nt_api_dbs + '/' + nt_DB_ID + '/query'
  targetList.map(
    target => {
      var searchData = {
        'filter': {
          'property': 'videoid',
          'text': {
            'equals': target[3]
          }
        }
      };
      options = {
        "method": "get",
        "headers": notionHeader,
        "payload": JSON.stringify(searchData)
      };
      var pageId = JSON.parse(UrlFetchApp.fetch(nt_api_db_url, options)).results[0].id

      var nt_api_brock_url = nt_api_brocks + '/' + pageId.replace(/-/g, "") + '/children';
      var post_data = {
        "children": [
          {
            'object': 'block',
            'type': 'video',
            'video': {
              'type': 'external',
              'external': {
                'url': target[6]
              }
            }
          }
        ]
      }
      var options = {
        "method": "patch",
        "headers": notionHeader,
        "payload": JSON.stringify(post_data)
      };

      UrlFetchApp.fetch(nt_api_brock_url, options);
    }
  )

  _off_flg_spreadsheet(targetList);
}

/**********************
 * Update to Notion
 */
function nt_upd() {
  const targetList = _get_spreadsheet('2')
  const nt_api_db_url = nt_api_dbs + '/' + nt_DB_ID + '/query'

  // postYoutubeData(note)
  targetList.map(
    target => {
      var searchData = {
        'filter': {
          'property': 'videoid',
          'text': {
            'equals': target[3]
          }
        }
      };
      var options = {
        "method": "get",
        "headers": notionHeader,
        "payload": JSON.stringify(searchData)
      };
      var pageId = JSON.parse(UrlFetchApp.fetch(nt_api_db_url, options)).results[0].id

      var nt_api_page_url = nt_api_pages + '/' + pageId.replace(/-/g, "");
      var postData = {
        'parent': { 'database_id': nt_DB_ID },
        'properties': {
          'title': createProperties(target[4], 'title'),
          'uploadymd': createProperties(target[1], 'date'),
          'open_type': createProperties(target[2], 'multi_select'),
          'detail': createProperties(target[5], 'rich_text'),
          'videoid': createProperties(target[3], 'rich_text'),
          'url': createProperties(target[6], 'url'),
          'thumbnails': createProperties(target[7], 'files'),
          'execute_date': createProperties(target[8], 'date'),
        }
      }
      options = {
        "method": "patch",
        "headers": notionHeader,
        "payload": JSON.stringify(postData)
      };
      UrlFetchApp.fetch(nt_api_page_url, options);
    }
  )
  _off_flg_spreadsheet(targetList);
}

/**
 * _get_spreadsheet
 * 引数 flg = 1(追加),2(更新)
 */
function _get_spreadsheet(flg) {
  const slice_size = 50;
  var youtube_spreadSheet = SpreadsheetApp.openById(sheet_ID);
  var youtube_lastRow = youtube_spreadSheet.getLastRow() - 1
  var compareList = youtube_spreadSheet.getSheetByName('list').getRange(2, 1, youtube_lastRow, 10).getValues();
  var targetList = [];
  for (var i = 0; compareList.length > i; i++) {
    /** updateflgがflg(1=新規,2=更新)であれば、新規追加対象 */
    if (compareList[i][9] == flg) {
      targetList.push(compareList[i]);
    }
  }
  return targetList.slice(0,slice_size);
}

/**
 * _off_flg_spreadsheet
 * 引数 targetList _get_spreadsheetで取得したリスト
 */
function _off_flg_spreadsheet(targetList) {
  var youtube_spreadSheet = SpreadsheetApp.openById(sheet_ID);
  var youtube_lastRow = youtube_spreadSheet.getLastRow() - 1
  var compareList = youtube_spreadSheet.getSheetByName('list').getRange(2, 1, youtube_lastRow, 10).getValues();
  for (var i = 0; compareList.length > i; i++) {
    for (var j = 0; targetList.length > j; j++) {
      if (compareList[i][3] == targetList[j][3]) {
        compareList[i][9] = 0
        break;
      }
    }
  }
  var insertRows = compareList.length;
  var insertCols = compareList[0].length;
  youtube_spreadSheet.getSheetByName('list').getRange(2, 1, insertRows, insertCols).setValues(compareList);
}

function createProperties(target, type) {
  switch (type) {
    case 'title':
      return {
        'title': [
          {
            'text': {
              'content': target
            }
          }
        ]
      }
    case 'date':
      return {
        'date': {
          'start': target
        }
      }
    case 'multi_select':
      return {
        'multi_select': [
          {
            'name': target
          }
        ]
      }
    case 'rich_text':
      return {
        'rich_text': [
          {
            'text': {
              'content': target
            }
          }
        ]
      }
    case 'url':
      return { 'url': target }
    case 'files':
      if (target != '') {
        return {
          'files': [
            {
              'name': target,
              'type': 'external',
              'external': {
                'url': target
              }
            }
          ]
        }
      }
  }
}






