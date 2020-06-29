// ==UserScript==
// @name         ITC-LMS ほげ
// @namespace    https://github.com/e5f6bd/itc-lms-userscripts
// @version      0.1
// @description  ITC-LMS の課題一覧をほげほげ
// @author       You
// @match        https://itc-lms.ecc.u-tokyo.ac.jp/lms/timetable
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     customCSS ./style.css
// ==/UserScript==


(function () {
    'use strict';

    $(() => {
        const text = GM_getResourceText("customCSS");
        console.log(text);
        GM_addStyle(text);
        const wrapper = $("<div>")
            .attr("id", "assignments-list")
            .insertBefore("#timetable");
        const header = $("<div>")
            .addClass("header")
            .appendTo(wrapper);
        $("<span>").addClass("icon").appendTo(header);
        $("<h1>").text("課題一覧").appendTo(header);

        const table = $("<div>")
            .addClass("divTable")
            .appendTo(wrapper);
        const tableBody = $("<div>")
            .addClass("divTableBody")
            .appendTo(table);
        const headerRow = $("<div>")
            .addClass("divTableRow head")
            .appendTo(tableBody);
        ["科目", "課題", "提出期限", "提出状況"].forEach(name =>
            $("<div>").addClass("divTableHead").text(name).appendTo(headerRow))
    });
})();
