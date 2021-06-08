let boxes = [];

const getBoxes = (textNode) => {
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const rects = range.getClientRects();
    return [...rects];
}

const createBox = (rect) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    const overlayDiv = document.createElement("div");

    overlayDiv.className = `_ai_search_overlay`;
    overlayDiv.style.zIndex = 9999;
    overlayDiv.style.position = `absolute`;
    overlayDiv.style.border = `1px solid red`;
    overlayDiv.style.margin = overlayDiv.style.padding = "0";
    overlayDiv.style.top = `${rect.top + scrollTop}px`;
    overlayDiv.style.left = `${rect.left + scrollLeft}px`;
    overlayDiv.style.width = `${rect.width - 2}px`;
    overlayDiv.style.height = `${rect.height - 2}px`;
    overlayDiv.style.pointerEvents = `none`;
    return overlayDiv;
}

const updateOverlay = () => {
    document.querySelectorAll('._ai_search_overlay').forEach(e => e.remove());
    boxes.map(textNode => getBoxes(textNode).map((rect) => createBox(rect)).map(div => document.body.appendChild(div)));
}

const addOverlay = (textNode) => {
    boxes.push(textNode);
    updateOverlay();
}

const clearOverlays = () => {
    boxes = []
    updateOverlay();
}

window.addEventListener("resize", () => {
    console.log("update");
    updateOverlay();
});

const scrollToElement = (element) => {
    element && element.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });
}

const isHidden = (el) => {
    const style = window.getComputedStyle(el);
    return (style.display === 'none')
}

const isWhiteSpaceNode = (node) => {
    const value = node.nodeValue;
    for (let i of value) {
        if (i !== "\n" && i !== "\t" && i !== "\r") {
            return false;
        }
    }
    return !isHidden(node.parentElement);
}

const highlight = (data) => {
    if(!data) {
        console.warn("no highlight data provided!")
        return;
    }
    const { startIndex, endIndex, score, text } = data;

    console.log("highlighting", { startIndex, endIndex, score, text })

    let currentNode;
    let length = 0;

    const matches = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
 
    while (currentNode = walker.nextNode()) {
        if (isWhiteSpaceNode(currentNode)) continue;
        const nodeValue = currentNode.nodeValue.trim(); 
        const startLength = length;
        length += nodeValue.length + 1;
        
        // todo: split matching text nodes to match the precise text
        // node.splitText(3);

        if (length > startIndex) {         
            matches.push(currentNode);
        }

        if (length >= endIndex) {
            break;
        }
    }

    console.log("matches", matches);

    matches.map(match => addOverlay(match));

    scrollToElement(matches[0].parentElement);
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("content", request)

    const { type, data } = request;

    switch (type) {
        case "HIGHLIGHT":
            highlight(data);
            break;

        case "REMOVEHIGHLIGHT":
            clearOverlays();
            break;

        default:
            throw new Error(`Not supported command: "${type}"`);
    }

    return false;
})
