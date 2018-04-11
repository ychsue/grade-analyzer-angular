interface IPageTexts {
    welcomePage: IWelcomePage;
    TestPage: ITestPage;
}
interface IWelcomePage {
    welcomeIntro: string;
    setup: string;
}
interface ITestPage {
    test: string;
}
