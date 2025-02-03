async function loadxigt(xml, section) {
    reader.replaceChildren();
    try {
        const response = await fetch(xml);
    
        if (!response.ok) {
            throw new Error("Response status: " + response.statusText);
        }
    
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "application/xml");
    
        const igts = xmlDoc.getElementsByTagName("igt");
        const verses = Array.from(igts).filter(child => {
            return child.getAttribute("id").startsWith(section + ".");
        });

        for (const verse of verses){
            const row = document.createElement("tr");
            row.setAttribute("data-osisID", verse.id)
            reader.appendChild(row);
            const num = document.createElement("th");
            num.textContent = verse.id.split(".")[2];
            row.appendChild(num);

            const phraseTier = verse.querySelector("[type='phrases']");
            const wordTier = verse.querySelector("[type='words']");
            const morphemeTier = verse.querySelector("[type='morphemes']");
            const glossTier = verse.querySelector("[type='glosses']");

            let position = 0;

            for (const word of wordTier.children){
                const wordCell = document.createElement("td");
                const sourceSpan = document.createElement("span");
                sourceSpan.setAttribute("lang", "hbo");
                const glossSpan = document.createElement("span");
                glossSpan.classList.add("gloss");
                row.appendChild(wordCell);
                wordCell.appendChild(sourceSpan);
                wordCell.appendChild(glossSpan);

                const wordMatch = word.getAttribute("segmentation").match(/(.+)\[(\d+)-(\d+)\]/);
                const wordAlignment = wordMatch[1];
                const wordStart = Number(wordMatch[2]);
                const wordEnd = Number(wordMatch[3]);

                const phrase = phraseTier.querySelector(`#${wordAlignment}`);
                const wordContent = phrase.textContent.slice(wordStart, wordEnd);

                let trail = phrase.textContent.slice(position, wordStart);
                if (word === wordTier.lastChild.previousSibling){
                    trail = phrase.textContent.slice(wordEnd, phrase.length);
                }
                if (trail.trim() !== ""){
                    for (punct of trail.replace(/\s+/g, "")){
                        const punctCell = document.createElement("td");
                        const sourceSpan = document.createElement("span");
                        sourceSpan.setAttribute("lang", "hbo");
                        const punctSpan = document.createElement("span");
                        punctSpan.textContent = punct;
                        sourceSpan.appendChild(punctSpan);
                        punctCell.appendChild(sourceSpan);
                        row.appendChild(punctCell);
                    }
                }
                position = wordEnd;

                const morphemes = Array.from(morphemeTier.children).filter(child => {
                    return child.getAttribute("segmentation").startsWith(word.id + "[");
                });

                let separator = ".";
                for (const morpheme of morphemes){
                    const morphSpan = document.createElement("span");
                    sourceSpan.appendChild(morphSpan);
                    const morphglossSpan = document.createElement("span");
                    glossSpan.appendChild(morphglossSpan);
                    
                    const morphMatch = morpheme.getAttribute("segmentation").match(/(.+)\[(\d+)-(\d+)\]/);
                    const morphStart = morphMatch[2];
                    const morphEnd = morphMatch[3];

                    const morphContent = wordContent.slice(morphStart, morphEnd);
                    const morphType = morpheme.getAttribute("type");
                    if (morphType == "clitic"){
                        morphSpan.textContent = morphContent + "⹀";
                    } else if (morphType == "affix"){
                        morphSpan.textContent = "-" + morphContent;
                    } else {
                        morphSpan.textContent = morphContent;
                    }

                    const glosses = glossTier.querySelectorAll(`[alignment="${morpheme.id}"]`);
                    for (const gloss of glosses){
                        const tag = gloss.getAttribute("type") == "leipzig" ? "abbr" : "span";
                        if (morphType == "clitic"){
                            morphglossSpan.innerHTML += `<${tag}>` + gloss.textContent + `</${tag}>` + "⹀";
                        } else if (morphglossSpan.textContent) {
                            morphglossSpan.innerHTML += "." + `<${tag}>` + gloss.textContent + `</${tag}>`;
                        } else if (morphType == "affix"){
                            morphglossSpan.innerHTML += "-" + `<${tag}>` + gloss.textContent + `</${tag}>`;
                        } else {
                            morphglossSpan.innerHTML += `<${tag}>` + gloss.textContent + `</${tag}>`;
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error(error.message);
        return null;
    }

}