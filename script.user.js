// ==UserScript==
// @name         ITC-LMS ほげ
// @namespace    https://github.com/e5f6bd/itc-lms-userscripts
// @version      0.1
// @description  ITC-LMS の課題一覧をほげほげ
// @author       You
// @match        https://itc-lms.ecc.u-tokyo.ac.jp/lms/timetable
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @resource     customCSS ./style.css
// ==/UserScript==

(function () {
    'use strict';

    const getCourses = () => Array.from(new Set(Array.from($('.course_on_timetable')).map(e => e.id))).map(id => ({
        id,
        name: $(`#${id}`).text().trim()
    }));

    const parser = new DOMParser();
    const fetchAssignments = async course => {
        const res = await fetch(`/lms/course?idnumber=${course.id}`);
        await new Promise(res => setTimeout(res, 500));
        const page = parser.parseFromString(await res.text(), 'text/html');
        document.hoge = page;
        return [...page.querySelectorAll("#reportList .result_list_line")].map(e => {
            const [a, , c, , d] = e.querySelectorAll(".result_list_txt");
            return {
                title: a.innerHTML,
                until: c.innerHTML,
                status: d.innerHTML,
                statusText: d.innerText.trim(),
            }
        });
    }

    const showAssignments = arg => {
        const assignments = arg
            .sort((x, y) => new Date(x.until) - new Date(y.until))
            .filter(x => !["期限内提出", "期限後提出"].includes(x.statusText));
        const tableBody = $("#assignmentsTableBody");
        tableBody.children(".data").remove();
        for (const {course, title, until, status} of assignments) {
            $("<div>")
                .addClass("divTableRow data")
                .appendTo(tableBody).append([
                $("<div>").addClass("divTableCell").append(
                    $("<a>").attr("href", `/lms/course?idnumber=${course.id}`).text(course.name)
                ),
                $("<div>").addClass("divTableCell").html(title),
                $("<div>").addClass("divTableCell").html(until),
                $("<div>").addClass("divTableCell").html(status),
            ]);
        }
    };

    const reloadAssignmentsList = async () => {
        console.log("pressed");
        const button = $("#assignments-list-reload");
        button.addClass("active").children("a").text("更新中");

        let assignments = [];
        for (const course of getCourses()) {
            const newAssignments = fetchAssignments(course);
            showAssignments(assignments);
            (await newAssignments).forEach(e => assignments.push({...e, course}));
        }
        showAssignments(assignments);
        GM_setValue("assignments", assignments);

        button.removeClass("active").children("a").text("更新");
    }

    $(() => {
        GM_addStyle(GM_getResourceText("customCSS"));
        const wrapper = $("<div>")
            .attr("id", "assignments-list")
            .insertBefore("#timetable");
        const header = $("<div>")
            .addClass("header")
            .appendTo(wrapper);
        $("<span>").addClass("icon").appendTo(header);
        $("<h1>").text("課題一覧").append(
            $("<div>").attr("id", "assignments-list-reload").addClass("round_button").append(
                $("<a>", {href: "javascript:void(0)"}).text("更新").click(reloadAssignmentsList)
            )
        ).appendTo(header);

        const table = $("<div>")
            .addClass("divTable")
            .appendTo(wrapper);
        const tableBody = $("<div>")
            .attr("id", "assignmentsTableBody")
            .addClass("divTableBody")
            .appendTo(table);
        const headerRow = $("<div>")
            .addClass("divTableRow head")
            .appendTo(tableBody);
        ["科目", "課題", "提出期限", "提出状況"].forEach(name =>
            $("<div>").addClass("divTableHead").text(name).appendTo(headerRow))

        showAssignments(GM_getValue("assignments"));
    });
})();
