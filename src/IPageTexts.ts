interface IPageTexts {
    appPage: IAppPage;
    welcomePage: IWelcomePage;
    TestPage: ITestPage;
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
