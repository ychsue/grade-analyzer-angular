export const defaultPTS:IPageTexts ={
  "appPage": {
    "welcome": "歡迎",
    "setup": "設定",
    "generate": "產生",
    "title": "班級成績管理小幫手"
  },
  "welcomePage": {
    "note": "注意",
    "noteIntro": "你的設定不完全，問題條列如下：",
    "notSetting": "你尚未完成任何設定",
    "noTemplateSheet": "你並沒有提供一個樣板表單",
    "noteAction": "在讀完下列說明後，請先按以下按鈕以進入設定頁面去做必要的設定，謝謝。",
    "welcomeIntro": "歡迎使用此小幫手，此小幫手可以幫你將你的學生的成績{0}依照個別的學生{1}輸出其表格，也可以看到所有學生{2}長期的學習趨勢。使用法很簡單，目前只有<b>設定</b>與<b>產生</b>這兩個功能。原始碼在{3}裡",
    "setup": "設定",
    "cSetup": "  原則上，<b>設定</b>只有在第一次使用時才需要去動用到它，因為對這個小幫手而言，它一開始並不知道你怎麼稱呼<i>ID</i>，<i>總分</i>等有特殊意義的表頭，你得在<b>設定</b>裡告訴它。此外，表單<i>{0}</i>是用來產生所有成績輸入表單的樣板，請勿刪除它，你在裏頭所新增或刪除的學生或科目，即未來你的成績輸入表單的樣板。",
    "generate": "產生",
    "cGenerate": "由這裡你可以產生每次月考成績輸入的表格，也可以產生歷年成績的比較。表單<b>{0}</b>會輸出個別學生的學習狀況，可以印下來後交給學生家長；而<b>{0}_${1}$</b>則用顏色顯示所有學生在每次考試中成績大概落在哪裡，好方便老師看出哪些學生需要輔導，而哪些又適合當小老師。",
    "eachCourse": "各科目"
  },
  "TestPage": {
    "test": "測試"
  },
  "gSettings": {
    "stID": "座號",
    "stName": "姓名",
    "stAvg": "平均",
    "stTotal": "總分",
    "stScore": "績效",
    "stTitle": "$YEAR$學年度 學期$SEM$ 第$TIMES$次考試",
    "stCAvg": "各科平均",
    "stCHighest": "最高分",
    "stCLowest": "最低分",
    "new_year": "106",
    "chartSheetName": "學生列表",
    "stSpecial": "家長簽名及意見"
  },
  "SettingsPage": {
    "special": "特殊表單名稱：",
    "pChartName": "成績圖表表單名稱：(outputs)",
    "pTmpName": "樣板表單名稱：(input)",
    "speField": "樣板表單中特殊欄位值：",
    "top": "科目上方",
    "left": "科目之左",
    "right": "科目之右",
    "bottom": "科目下方",
    "renew": "更新",
    "genTmp": "➕產生",
    "renewing": "更新中",
    "done": "完成",
    "firstTime": "第一次使用",
    "firstTimeMsg": "由於Settings尚未有任何資料，我已自動幫你產生了一份。<br/>如不滿意，請依自己的需要修改，完畢後，請按最下面的更新鈕🔃即可更新。",
    "needTmpTitle": "請先產生樣板表單",
    "needTmpMsg": "所有的成績輸入都以樣板表單為主。請先按按鈕<br/>'{0}'<br/>以自動產生一份表單給你。",
    "understand": "了解了",
    "note": "注意",
    "change": "變更",
    "unchange": "不變更",
    "keepEdit": "再修改",
    "creatingSample": "創建樣板中",
    "waiting": "請稍候",
    "running": "進行中",
    "notExisting": "工作表 {0} 不存在。<br/>",
    "settingChanged": "設定已經改變。<br/>",
    "wannaChange": "要變更嗎？"
  }
}