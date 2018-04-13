interface IPageTexts {
    appPage: IAppPage;
    welcomePage: IWelcomePage;
    TestPage: ITestPage;
    gSettings: IGSettings;
    SettingsPage: ISettingsPage;
}
interface IAppPage {
    welcome: string;
    setup: string;
    generate: string;
    title: string;
}
interface IWelcomePage {
    note: string;
    noteIntro: string;
    notSetting: string;
    noTemplateSheet: string;
    noteAction: string;
    welcomeIntro: string;
    setup: string;
    cSetup: string;
    generate: string;
    cGenerate: string;
    eachCourse: string;
}
interface ITestPage {
    test: string;
}
interface IGSettings {
    stID: string;
    stName: string;
    stAvg: string;
    stTotal: string;
    stScore: string;
    stTitle: string;
    stCAvg: string;
    stCHighest: string;
    stCLowest: string;
    new_year: string;
    chartSheetName: string;
    stSpecial: string;
}
interface ISettingsPage {
    special: string;
    pChartName: string;
    pTmpName: string;
    speField: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
    renew: string;
    genTmp: string;
    renewing: string;
    done: string;
    firstTime: string;
    firstTimeMsg: string;
    needTmpTitle: string;
    needTmpMsg: string;
    understand: string;
    note: string;
    change: string;
    unchange: string;
    keepEdit: string;
    creatingSample: string;
    waiting: string;
    running: string;
    notExisting: string;
    settingChanged: string;
    wannaChange: string;
}
