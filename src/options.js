import { Component, render } from 'preact';
import { html } from 'htm/preact';

// todo
// color (highlight (custom css?)), outline, full, ...
// cache on/off timeout strat(url/content)
// theme light/dark
// scroll smooth auto
class App extends Component {
    constructor() {
        super();
        this.state = {};
    }
    render(props, state) {
        return html``;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const appHost = document.getElementById('app');
    render(html`<${App} />`, appHost);
});