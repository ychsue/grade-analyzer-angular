interface IPageTexts {
    appPage: IAppPage;
    welcomePage: IWelcomePage;
    TestPage: ITestPage;
    gSettings: IGSettings;
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
