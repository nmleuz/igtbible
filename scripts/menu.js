const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const chapter = params.get("chapter");

const bookSelect = document.getElementById("bookSelect");
const bookSelectText = document.getElementById("bookSelectText");

if (chapter){
    bookSelect.value = chapter
    const name = bookMap[chapter.split(".")[0]].name;
    bookSelectText.textContent = name + " " + chapter.split(".")[1];
    document.title = "IGTBible | " + name + " " + chapter.split(".")[1]; 
    window.history.pushState({}, '', `${url.pathname}?${params}`);
} else {
    bookSelectText.textContent = "Genesis 1";
    bookSelect.value = "Gen.1";
    document.title = "IGTBible | Genesis 1"; 
    window.history.pushState({}, '', `${url.pathname}?${params}`);
}

//Generate book select menu
Object.keys(bookMap).forEach(book => {
    const key = book;
    const name = bookMap[book].name;
    const chapters = bookMap[book].chapters;
    
    const bookMenuDiv = document.createElement("div");
    bookMenuDiv.classList.add("bookMenuDiv");
    const chapterSpan = document.createElement("span");
    chapterSpan.textContent = name;
    bookMenuDiv.appendChild(chapterSpan);
    const chapterSelect = document.createElement("div");
    chapterSelect.classList.add("chapterSelect");
    for (let i = 0; i<=chapters-1; i++){
        const chapterButton = document.createElement("button");
        chapterButton.onclick = function() {
            bookSelect.value = this.value;
            bookSelectText.textContent = this.parentElement.parentElement.querySelector("span").textContent + " " + this.value.split(".")[1];
            selectBook(this.value);
            selectToggle();
            params.set("chapter", this.value);
            document.title = "IGTBible | " + name + " " + this.value.split(".")[1]; 
            window.history.pushState({}, '', `${url.pathname}?${params}`);
        }
        chapterButton.textContent = i+1;
        chapterButton.value = key + "." + (i+1);
        chapterSelect.appendChild(chapterButton);
    }
    bookMenuDiv.appendChild(chapterSelect);
    bookMenu.appendChild(bookMenuDiv);
});

selectedValue = bookSelect.value;

let original;
let cant = true;
let morphBound = true;
selectBook(selectedValue);

//Load selected book
function selectBook(value){
    loadxigt(`igt/${value.split(".")[0]}.xml`, value).then(() => {
        original = reader.innerHTML;
        cant = true;
        morphBound = true;
        const selectedButton = bookMenu.querySelector(`.chapterSelect button.selected`)
        if (selectedButton){
            selectedButton.classList.toggle("selected", false);
        }

        const url = new URL(window.location.href);
        url.searchParams.set("chapter", value);
        window.history.pushState({}, "", url);

        bookMenu.querySelector(`.chapterSelect button[value="${value}"]`).classList.toggle("selected", true);
    });
}

//Light/dark mode
const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)").matches;
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (prefersLightScheme){
    sunIcon.classList.toggle("hidden");
}
if (prefersDarkScheme){
    moonIcon.classList.toggle("hidden");
}
function lightToggle(){
    if (prefersLightScheme){
        document.querySelector('body').classList.toggle("dark");
        sunIcon.classList.toggle("hidden");
        moonIcon.classList.toggle("hidden");
    }
    if (prefersDarkScheme){
        document.querySelector('body').classList.toggle("light");
        sunIcon.classList.toggle("hidden");
        moonIcon.classList.toggle("hidden");
    }
}

//Cantillation toggle button
function cantToggle(){
    if (cant){
        if (morphBound){
            reader.innerHTML = original.replace(/[\u0591-\u05AF]/g, "");
        } else {
            reader.innerHTML = original.replace(/[\u0591-\u05AF]/g, "").replace(/(?<![<>])⹀|(?<![0-9a-z<>])-|-(?![0-9a-z<>])/g, "");
        }
        cant = false;
    } else {
        morphBound ? reader.innerHTML = original : reader.innerHTML = original.replace(/(?<![<>])⹀|(?<![0-9a-z<>])-|-(?![0-9a-z<>])/g, "");
        cant = true;
    }
}

//Morpheme boundaries toggle button
function morphBoundToggle(){
    if (morphBound){ 
        if (cant){
            reader.innerHTML = original.replace(/(?<![<>])⹀|(?<![0-9a-z<>])-|-(?![0-9a-z<>])/g, "");
        } else {
            reader.innerHTML = original.replace(/[\u0591-\u05AF]/g, "").replace(/(?<![<>])⹀|(?<![0-9a-z<>])-|-(?![0-9a-z<>])/g, "");
        }
        morphBound = false;
    } else {
        cant ? reader.innerHTML = original : reader.innerHTML = original.replace(/[\u0591-\u05AF]/g, "");
        morphBound = true;
    }
}