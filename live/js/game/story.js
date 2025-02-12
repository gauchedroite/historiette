import * as App from "../core/app.js";
import * as Router from "../core/router.js";
import * as Misc from "../core/misc.js";
import * as Theme from "../core/theme/theme.js";
import { state } from "./state.js";
export const NS = "GSTORY";
let mystate;
let gameid = "";
let pageno = 0;
let isNew = false;
let user_text = "";
let assistant_text = null;
let next_user_text = null;
const formTemplate = () => {
    var _a;
    const add = (row) => rows.push(row);
    let rows = [];
    if (pageno > 0)
        add(`<p><b>${user_text === null || user_text === void 0 ? void 0 : user_text.replace(/\n/g, "<br>")}</b></p>`);
    add(`<p><div id="ct_response">${(_a = assistant_text === null || assistant_text === void 0 ? void 0 : assistant_text.replace(/\n/g, "<br>")) !== null && _a !== void 0 ? _a : ""}</div></p>`);
    add(`<br><br>`);
    if (assistant_text && assistant_text.length > 0) {
        const label = `<b>${state.usernameCapitalized}</b>: Qu'est-ce que tu dis ?`;
        const disabled = (next_user_text == undefined || next_user_text.length == 0);
        add(Theme.renderFieldTextarea(NS, "next_user_text", next_user_text, label, { required: true, rows: 4 }));
        add(`<div style="--d:flex; --jc:flex-end;"><button type="submit" onclick="${NS}.submit()" ${disabled ? "disabled" : ""}>OK!</button></div>`);
    }
    return rows.join("");
};
const pageTemplate = (form) => {
    let prev_url = `#/story/${gameid}/${pageno - 1}`;
    let prev_disabled = (pageno == 0 ? "disabled" : "");
    let next_url = `#/story/${gameid}/${pageno + 1}`;
    let next_disabled = (pageno == state.lastPageNo() ? "disabled" : "");
    return `
<div class="ct-header">
    <h3>
        <a class="js-waitable-2" href="#/menu/${gameid}"><i class="fa-solid fa-arrow-left"></i></a>
        <span>${mystate.title}</span>
    </h3>
</div>
<div class="ct-content form">
    <div class="ct-story">
        ${form}
    </div>
</div>
<div class="ct-footer page-nav js-waitable-2">
    <button type="button" onclick="window.location='${prev_url}'" ${prev_disabled} title="prev" style="--x:100;"><i class="fa-solid fa-turn-left"></i></button>
    <button type="button" onclick="window.location='${next_url}'" ${next_disabled} title="next" style="--x:100;"><i class="fa-solid fa-turn-right"></i></button>
</div>
`;
};
const streamUpdater = (message) => {
    var _a;
    const span = document.createElement("span");
    span.innerHTML = message.replace(/\n/g, "<br>");
    (_a = document.getElementById("ct_response")) === null || _a === void 0 ? void 0 : _a.appendChild(span);
};
const render_and_fetch_more = async () => {
    user_text = state.userMessageOnPage(pageno);
    next_user_text = state.userMessageOnNextPage(pageno);
    App.render();
    assistant_text = state.assistantMessageAtPage(pageno);
    if (assistant_text == undefined) {
        assistant_text = await state.executePrompt(user_text, streamUpdater);
        state.appendAssistantMessage(assistant_text);
    }
    App.untransitionUI();
    App.render();
};
export const fetch = (args) => {
    gameid = (args ? args[0] : "");
    pageno = +(args ? (args[1] != undefined ? args[1] : "new") : "new");
    isNew = isNaN(pageno);
    if (isNew) {
        assistant_text = null;
        next_user_text = null;
        state.fetch_game_definition(gameid)
            .then((payload) => {
            mystate = Misc.clone(payload);
            state.resetMessages();
            Router.goto(`#/story/${gameid}/0`, 1);
        });
    }
    else {
        App.prepareRender(NS, "Story", "game_story");
        state.fetch_game_definition(gameid)
            .then((payload) => {
            mystate = Misc.clone(payload);
        })
            .then(render_and_fetch_more)
            .catch(render_and_fetch_more);
    }
};
export const render = () => {
    if (!App.inContext(NS))
        return "";
    const form = formTemplate();
    return pageTemplate(form);
};
export const postRender = () => {
    if (!App.inContext(NS))
        return;
};
const getFormState = () => {
    next_user_text = Misc.fromInputText(`${NS}_next_user_text`, next_user_text);
};
export const onchange = (input) => {
    getFormState();
    App.render();
};
export const submit = (input) => {
    state.appendUserMessage(next_user_text, pageno);
    next_user_text = null;
    assistant_text = null;
    Router.goto(`#/story/${gameid}/${pageno + 1}`);
};
