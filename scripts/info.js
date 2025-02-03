function info(element){
    const infoDiv = document.getElementById("infoDiv");
    if(element.parentElement.parentElement.className != "gloss"){
        return;
    }
    
    const td = element.parentElement.parentElement.parentElement;
    const tr = td.parentElement;
    const words = Array.from(tr.querySelectorAll('td > span.gloss')).map(span => span.parentElement);
    const source = td.querySelector("span[lang='hbo']");
    const gloss = element.parentElement;
    const glosses = Array.from(gloss.parentElement.children);
    const glossIndex = glosses.indexOf(gloss);
    const morphemes = source.children;
    const morpheme = morphemes[glossIndex];
    //const wordContent = source.textContent.replace(/[\u0591-\u05AF]/g, "").replace(/⹀/g, "");
    //const morphemeContent = morpheme.textContent.replace(/[\u0591-\u05AF]/g, "").replace(/⹀/g, "");
    const verse = tr.getAttribute("data-osisid")
    const index = Array.prototype.indexOf.call(words, td);
    const strongs = "H" + String(codeMap[verse][index].replace(/.\//g, "").split(" ")[0]);

    var sameWord;

    if (infoDiv){
        sameWord = infoDiv.parentElement == td;
        infoDiv.remove();
    }
    if (!infoDiv || !sameWord){
        const infoDiv = document.createElement("div");
        infoDiv.id = "infoDiv";

        const lemmaSpan = document.createElement("span");
        lemmaSpan.id = "lemmaSpan";
        const xlitSpan = document.createElement("span");
        xlitSpan.id = "xlitSpan";
        const strongsSpan = document.createElement("span");
        strongsSpan.id = "strongsSpan";
        const defSpan = document.createElement("span");
        defSpan.id = "defSpan";

        infoDiv.appendChild(lemmaSpan);
        infoDiv.appendChild(xlitSpan);
        infoDiv.appendChild(strongsSpan);
        infoDiv.appendChild(defSpan);

        infoDiv.style.top = "75px";
        infoDiv.style.right = "0px";
        infoDiv.style.minWidth = "200px";

        const entry = strongsHebrewDictionary[strongs];
        
        lemmaSpan.textContent = entry.lemma + "\n";
        xlitSpan.textContent = entry.xlit + "\n";
        strongsSpan.textContent = strongs + "\n";
        defSpan.textContent = entry.strongs_def;

        td.appendChild(infoDiv);

        if (infoDiv.getBoundingClientRect().x <= 10) {
            infoDiv.style.right = (Math.floor(infoDiv.getBoundingClientRect().x) - 15) + "px";
        }
    }
}