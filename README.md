# Introduction 簡介
This program is hosted at https://classgradeanalyzer.azurewebsites.net
on which you will see an Angular SPA when you surf.
Then, you will find that some of its buttons do not function because it is an *Office App*.
It means that it only functions correctly in Excel. 

Therefore, please load it from Excel Add-in and it will show up as a Task Pane.

Besides, you can watch its demo in https://youtu.be/4j8bWnO18ls.

這個程式是一個Angular 單網頁應用程式，你可以連到 https://classgradeanalyzer.azurewebsites.net 來看一下它大概在做甚麼。
不過，由於這個程式其實是與Excel搭配的，也就是它必須要由Excel的 *我的增益集* 來叫用，而且以工作窗格的形式出現在Excel內。
所以，在該網頁上試用時，部分不工作的按鈕是因為它需要叫用Excel。所以，請在Excel下試用才可以讓它完全運作。

此外，你可以在 https://youtu.be/4j8bWnO18ls 看到它的演示。
# Installation 安裝
If you want to run it on your local machine, you need to install

如果你想要安裝這個Source code在你的本機上，比如說為了學習如何寫 Office Add-in，請先安裝

1. VS Code
2. node

Then get into this repository and click C-S-B to execute this program in VS Code and it will hold a server at https://localhost:3000.

然後切換到本原始碼目錄，在VS Code裡按 C-S-B 來編譯並執行它，透過 https://localhost:3000 就可以連上它了。

Then, how to let your Excel you want to side-load an add-in?
Please following the tutorial shown in https://docs.microsoft.com/en-us/office/dev/add-ins/quickstarts/excel-quickstart-angular

接著，要怎麼讓 Excel 可以叫用它呢？
請依照  https://docs.microsoft.com/en-us/office/dev/add-ins/quickstarts/excel-quickstart-angular 的教學做就可以做到了。

Good luck!

祝好運！

One more thing, the file ...-local.xml is for executing the add-in from your local machine.

順帶一提，那個 ...-local.xml 檔是給本機測試用的。