import { Component, render } from 'preact';
import { html } from 'htm/preact';
import './popup.css';

const highlight = async (data) => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return await chrome.tabs.sendMessage(tabs[0].id, { type: "HIGHLIGHT", data, color: localStorage.color || "#ff0000", scroll: localStorage.scroll || "auto" });
}

const removeHighlight = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return await chrome.tabs.sendMessage(tabs[0].id, { type: "REMOVEHIGHLIGHT" });
}

const startSearch = async (searchTerm) => {
    return await new Promise((r) => chrome.runtime.sendMessage({ type: 'QUESTION', data: { searchTerm } }, r));
}

class App extends Component {

    constructor() {
        super();
        this.state = {
            searchTerm: localStorage.lastSearchTerm || "",
            isExpanded: false,
            loading: false,
            currentSelected: 0,
            searchResult: []
        };
    }

    async updateSearch() {
        this.setState({ loading: true });
        const searchResult = await startSearch(this.state.searchTerm.trim()) || [];
        this.setState({ searchResult, loading: false, currentSelected: 0 });
        return searchResult;
    }

    async updateSearchTerm(event) {

        this.setState({ searchTerm: event.target.value });
        localStorage.lastSearchTerm = event.target.value;

        if (event.key === 'Enter') {
            event.preventDefault();

            await removeHighlight();
            await this.updateSearch();

            const {searchResult} = this.state;
            console.log(searchResult, searchResult.length);

            if (searchResult.length > 0) {
                await highlight(searchResult[0]);
            }
        }
    }

    async last() {
        if (this.state.searchResult.length === 0 && !this.state.loading) {
            await this.updateSearch()
        }

        const { searchResult, currentSelected } = this.state;
        this.setState({ currentSelected: (currentSelected - 1) < 0 ? (searchResult.length - 1) : (currentSelected - 1) });
        await removeHighlight();
        await highlight(this.state.searchResult[this.state.currentSelected]);
    }

    async next() {
        if (this.state.searchResult.length === 0 && !this.state.loading) {
            await this.updateSearch()
        }

        const { searchResult, currentSelected } = this.state;
        this.setState({ currentSelected: (currentSelected + 1) >= searchResult.length ? 0 : (currentSelected + 1) });
        await removeHighlight();
        await highlight(this.state.searchResult[this.state.currentSelected]);
    }

    async close() {
        await removeHighlight();
        window.close();
    }

    render(props, state) {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        return html`            
            <div class="searchBoxFirstLine">
                <button onClick=${()=> this.setState({ isExpanded: !state.isExpanded })}>
                    <img src=${ state.isExpanded ? 
                        (isDarkMode ? "icons/expand_less_white.svg" : "icons/expand_less_black.svg") :
                        (isDarkMode ? "icons/expand_more_white.svg" : "icons/expand_more_black.svg")} />
                </button>            
                <input type="text" value=${state.searchTerm} onkeyup=${(e)=> this.updateSearchTerm(e)}/>
                <button onClick=${()=> this.last()}><img src=${isDarkMode ? "icons/navigate_before_white.svg" : "icons/navigate_before_black.svg"} /></button>
                <button onClick=${()=> this.next()}><img src=${isDarkMode ? "icons/navigate_next_white.svg" : "icons/navigate_next_black.svg"} /></button>
                <span>${state.currentSelected + 1}/${state.searchResult.length}</span>            
                <button onClick=${()=> this.close()}><img src=${isDarkMode ? "icons/close_white.svg" : "icons/close_black.svg"} /></button>            
            </div>
            <div>${state.loading ? "loading" : ""}</div>
            <div>${(state.isExpanded && state.searchResult) ? state.searchResult.map(e => html`<p>${e.text}</p>`) : ""}</div>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const appHost = document.getElementById('app');
    render(html`<${App} />`, appHost);
});
