interface IPageTexts {
    appPage: IAppPage;
    welcomePage: IWelcomePage;
    TestPage: ITestPage;
    gSettings: IGSettings;
    SettingsPage: ISettingsPage;
    GenWorksheetPage: IGenWorksheetPage;
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
interface IGenWorksheetPage {
    genNewSheet: string;
    newNameForm: string;
    year: string;
    sem: string;
    times: string;
    genNewChartSheet: string;
    base: string;
    compare: string;
    thisTime: string;
    previousTime: string;
    chartWhichCourse: string;
    course: string;
    chartSheetName: string;
    output: string;
    visualize: string;
    sen4SpecialCell: string;
    useIt: string;
    tutorial: string;
    justHeight: string;
    forAll: string;
    visNote: string;
    noGradeTitle: string;
    noGradeMsg: string;
    gotIt: string;
    createNewSheet: string;
    waiting: string;
    failGenSheetTitle: string;
    faliGenSheetMsg: string;
    running: string;
    creatingNewChart: string;
    inCreating: string;
    doneNewChart: string;
    applyingFormat: string;
    applying: string;
    done: string;
    applyingHeight: string;
    mayNotExistSheet: string;
    notExistSheet: string;
    applying2Student: string;
}
