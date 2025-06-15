const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
let chapter = params.get("chapter");

const bookSelect = document.getElementById("bookSelect");
const bookSelectText = document.getElementById("bookSelectText");
const selectMenu = document.getElementById("selectMenu");

// Load chapter
if (!chapter) {
  chapter = localStorage.getItem("chapter");
  if (chapter) {
    window.location.search = `?chapter=${chapter}`;
  }
}

if (chapter){
    bookSelect.value = chapter
    const name = bookMap[chapter.split(".")[0]].name;
    bookSelectText.textContent = name + " " + chapter.split(".")[1];
    document.title = "IGTBible | " + name + " " + chapter.split(".")[1]; 
    window.history.pushState({}, "", `${url.pathname}?${params}`);
} else {
    bookSelectText.textContent = "Genesis 1";
    bookSelect.value = "Gen.1";
    document.title = "IGTBible | Genesis 1"; 
    window.history.pushState({}, "", `${url.pathname}?${params}`);
}

// Save chapter
window.addEventListener("beforeunload", () => {
  if (chapter) localStorage.setItem("chapter", bookSelect.value);
});


//Select button
function menuReset(){
    const chapterMenu = document.getElementById("chapterMenu");
    chapterMenu.remove();
    bookMenu.scrollTop = 0;
    bookMenu.style.display = "";
}

function menuToggle(){
    selectMenu.classList.toggle("hidden");
    bookMenu.scrollTop = 0;
    if (selectMenu.classList.contains("hidden")){
        menuReset();
    }
}

//Select menu
const bookMenu = document.createElement("div");
bookMenu.id = "bookMenu";
selectMenu.appendChild(bookMenu);

Object.keys(bookMap).forEach(book => {
    const key = book;
    const name = bookMap[book].name;
    const chapters = bookMap[book].chapters;

    //Create book menu
    const bookButton = document.createElement("button");
    bookButton.textContent = name;
    bookButton.onclick = function() {

        //Hide book menu
        bookMenu.style.display = "none";

        //Generate chapter menu
        const chapterMenu = document.createElement("div");
        chapterMenu.id = "chapterMenu";
        const chapterSpan = document.createElement("span");
        chapterSpan.textContent = name;
        chapterSpan.onclick = menuReset;
        chapterMenu.appendChild(chapterSpan);

        const chapterSelect = document.createElement("div");
        chapterSelect.classList.add("chapterSelect");
        for (let i = 0; i<chapters; i++){
            const chapterButton = document.createElement("button");
            chapterButton.onclick = function() {
                bookSelect.value = this.value;
                bookSelectText.textContent = this.parentElement.parentElement.querySelector("span").textContent + " " + this.value.split(".")[1];
                selectBook(this.value);
                params.set("chapter", this.value);
                document.title = "IGTBible | " + name + " " + this.value.split(".")[1]; 
                window.history.pushState({}, "", `${url.pathname}?${params}`);

                // Reset menu
                bookMenu.style.display = "";
                chapterMenu.remove();
                selectMenu.classList.add("hidden");
            }
            chapterButton.textContent = i+1;
            chapterButton.value = key + "." + (i+1);
            chapterSelect.appendChild(chapterButton);
            if (chapterButton.value == params.get("chapter")){
                document.querySelector("selected")?.classList.remove("selected");
                chapterButton.classList.add("selected");
            }

            chapterSelect.scrollTop = 0;
            chapterMenu.appendChild(chapterSelect);
            selectMenu.appendChild(chapterMenu);
        }
    }
    bookMenu.appendChild(bookButton);
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
        const selectedButton = selectMenu.querySelector(`.chapterSelect button.selected`)
        if (selectedButton){
            selectedButton.classList.toggle("selected", false);
        }

        const url = new URL(window.location.href);
        url.searchParams.set("chapter", value);
        window.history.pushState({}, "", url);
        localStorage.setItem("chapter", value);
        console.log(value);
        console.log(localStorage.getItem("chapter"));
    });
}

//Light/dark mode
function setTheme() {
    const theme = localStorage.getItem("theme");
    const darkTheme = theme ? theme === "dark" : 
                   window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    document.body.classList.toggle("dark", darkTheme);
    sunIcon.classList.toggle("hidden", !darkTheme);
    moonIcon.classList.toggle("hidden", darkTheme);
}

setTheme();

function lightToggle() {
    const currentlyDark = document.body.classList.contains("dark");
    localStorage.setItem("theme", currentlyDark ? "light" : "dark");
    setTheme();
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