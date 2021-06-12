import { Component, render } from 'preact';
import { html } from 'htm/preact';

class App extends Component {
    constructor() {
        super();
        this.state = {
            color: localStorage.color || "#ff0000", // hex color
            scroll: localStorage.scroll || "auto" // auto, smooth
        };
    }

    onColorChange(e) {
        localStorage.color = e.target.value;
    }

    onScrollTypeChange(e) {
        localStorage.scroll = e.target.value;
    }

    render(props, state) {
        return html`<div>
            <div>
                <input type="color" id="color" name="head" value=${this.state.color} onchange=${(e)=> this.onColorChange(e)}/>
                <label for="color">Select highlight color</label>
            </div>
            <div>
                <input type="radio" id="smooth" name="scroll" value="smooth" checked=${this.state.scroll === "smooth"} onchange=${(e)=> this.onScrollTypeChange(e)}/>
                <label for="smooth">smooth</label>
                <input type="radio" id="auto" name="scroll" value="auto" checked=${this.state.scroll === "auto"} onchange=${(e)=> this.onScrollTypeChange(e)}/>
                <label for="auto">auto</label>
            </div>
        </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const appHost = document.getElementById('app');
    render(html`<${App} />`, appHost);
});