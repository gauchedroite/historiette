import * as router from "../core/router.js";
import * as home from "./home.js";
import * as menu from "./menu.js";
import * as story from "./story.js";
import * as editor from "./editor.js";
import * as bonjour from "./bonjour.js";
window[home.NS] = home;
window[menu.NS] = menu;
window[story.NS] = story;
window[editor.NS] = editor;
window[bonjour.NS] = bonjour;
export const assignDefaultRoute = (routeName) => {
    router.addRoute(routeName, params => bonjour.fetch(params));
};
export const startup = () => {
    router.addRoute("^#/home/?(.*)$", params => home.fetch(params));
    router.addRoute("^#/menu/?(.*)$", params => menu.fetch(params));
    router.addRoute("^#/story/?(.*)$", params => story.fetch(params));
    router.addRoute("^#/editor/?(.*)$", params => editor.fetch(params));
    router.addRoute("^#/bonjour/?(.*)$", params => bonjour.fetch(params));
};
export const render = () => {
    return `
    ${home.render()}
    ${menu.render()}
    ${story.render()}
    ${editor.render()}
    ${bonjour.render()}
`;
};
export const postRender = () => {
    home.postRender();
    menu.postRender();
    story.postRender();
    editor.postRender();
    bonjour.postRender();
};
