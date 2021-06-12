import "@tensorflow/tfjs"
import * as qna from "@tensorflow-models/qna"
import * as MD5 from "md5.js"

const getMD5 = (str) => new MD5().update(str).digest('hex');

// todo move this into own file and cleanup the code
const requestContent = async () => {
    const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const response = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            const isHidden = (el) => {
                const style = window.getComputedStyle(el);
                return (style.display === 'none');
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
            let currentNode;
            const elementList = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
            while (currentNode = walker.nextNode()) {
                if (isWhiteSpaceNode(currentNode)) continue;
                elementList.push(currentNode.nodeValue.trim());
            }
            return elementList.join(" ");
        }
    });
    return [response[0].result, tab.url];
}

const set = async (key, value) => await new Promise((r) => chrome.storage.local.set({ [key]: value }, r));
const get = async (key = null) => await new Promise((r) => chrome.storage.local.get(key ? [key] : null, r));
const del = async (key) => await new Promise((r) => chrome.storage.local.remove([key], r));

const cacheTimeout = 1000 * 60 * 60; // 1h

const updateCache = async () => {
    const now = Date.now();
    const cacheEntries = await get(null);
    const entries = Object.entries(cacheEntries);
    const deletions = entries.filter(([key, value]) => (now - value.created) > cacheTimeout).map(([key, value]) => del(key));
    await Promise.allSettled(deletions);
}

const addToCache = async (question, content, response) => {
    const questionHash = getMD5(question);
    const contentHash = getMD5(content);

    const cacheObject = {
        created: Date.now(),
        questionHash,
        contentHash,
        response
    }

    const key = getMD5(`${questionHash}${contentHash}`);
    await set(key, cacheObject)
}

const getFromCache = async (question, content) => {
    const questionHash = getMD5(question);
    const contentHash = getMD5(content);
    const key = getMD5(`${questionHash}${contentHash}`);
    const cacheData = await get(key);

    if (cacheData && cacheData[key]) {
        const { response } = cacheData[key];
        return response;
    }
    return null;
}

const runQuestion = async (searchTerm) => {
    await updateCache();

    const [content, url] = await requestContent();
    const cacheAnswer = await getFromCache(searchTerm, content);

    if (cacheAnswer) {
        return cacheAnswer;
    }

    const model = await qna.load({ modelUrl: chrome.runtime.getURL('./model/model.json') });
    const rawAnswers = await model.findAnswers(searchTerm, content);

    const answers = []
    for (let match of rawAnswers) {
        let okay = true;
        for (let output of answers) {
            if (match.startIndex === output.startIndex && match.endIndex === output.endIndex) {
                okay = false;
                break;
            }
        }
        if (okay) {
            answers.push(match);
        }
    }

    await addToCache(searchTerm, content, answers)
    return answers;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("background", request)

    const { type, data } = request;

    switch (type) {
        case "QUESTION":
            const { searchTerm } = data;
            runQuestion(searchTerm).then((answers) => sendResponse(answers)).catch((error) => sendResponse([]));
            break;

        default:
            throw new Error(`Not supported command: "${type}"`);
    }

    return true;
});
