import * as App from "../core/app.js"
import { waitAsync } from "../utils.js";

export interface GameList {
    code: string
    title: string
}

export interface GameDefinition {
    code: string | null
    title: string | null
    bg_url: string | null
    prompt: string | null
}

export interface Message {
    role: string,
    content: string
}


interface IState {
    username: string
}

interface ILocalState {
}


class State {
    private _state: IState | undefined
    private _username: string
    private _localState: ILocalState
    private _index: GameList[] = []
    private _game_definition: GameDefinition | undefined
    private _gameid: string | undefined

    constructor() {
        this._localState = <ILocalState>{}
        this._username = "laura"
        this.username = localStorage.getItem("username") ?? "laura"
    }

    set username(value: string) {
        this._username = value
        localStorage.setItem("username", value)
        const json = localStorage.getItem(value)
        this._localState = JSON.parse(json ?? "{}")
    }

    get username() {
        return this._username!
    }

    get index() {
        return this._index!
    }

    get gameid() {
        return this._gameid!
    }

    get game_definition() {
        return this._game_definition!
    }


    //
    // Managing the localStorage
    //
    private getKey(what: string) {
        return `${this.username}_${this.gameid}_${what}`
    }

    getMessages = () => {
        const key = this.getKey("messages")
        const json = localStorage.getItem(key) ?? "[]"
        return JSON.parse(json)as Message[]
    }

    appendMessage = (role: string, content: string) => {
        const msg = this.getMessages()
        msg.push(<Message>{ role, content })

        const key = this.getKey("messages")
        localStorage.setItem(key, JSON.stringify(msg))
    }


    //
    // Reading content on the server
    //
    async fetch_index () {
        return App.GET("assets/_index.json")
            .then((payload: any) =>{
                this._index = payload;
            })
    }

    async fetch_game_definition (gameid: string) {
        this._gameid = gameid
        return App.GET(`assets/${gameid}.json`)
            .then((payload: any) =>{
                this._game_definition = payload;
                return payload
            })
    }

    new_game_definition () {
        this._game_definition = <GameDefinition> {
            code: "new",
            title: "NEW",
            bg_url: "",
            prompt: "You are an helpful assistant"
        }

        this._gameid = this._game_definition.code!
    }


    //
    // Interact with ollama
    //
    async executePrompt(user_prompt: string) {
        // Créer le prompt complet à partir de ce qu'il y a dans localStorage + user_prompt
        await waitAsync(2000)
        return "Réponse de ollama au prompt: " + user_prompt
    }
}

export const state = new State();
