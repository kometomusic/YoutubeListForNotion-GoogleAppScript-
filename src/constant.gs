/** Sheet ID of the spreadsheet */
var sheet_ID = 'please enter your SpreadSheet ID';

/** Notion Database ID */
var nt_DB_ID = 'please enter your Notion Database ID';

/** Notion Token */
var nt_token = 'please enter your Notion Integration Token';

/** Notion API*/
var nt_api_pages = 'https://api.notion.com/v1/pages';
var nt_api_dbs = 'https://api.notion.com/v1/databases'
var nt_api_brocks = 'https://api.notion.com/v1/blocks'

const notionHeader = ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + nt_token,
    'Notion-Version': '2021-08-16'
})