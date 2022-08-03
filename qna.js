import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

const view = document.querySelector("#view");
const content = document.querySelector("#content");
const view_categories = document.querySelector("#view_categories");
const queries = document.querySelector("#queries");
const search_button = document.querySelector("#search_button");
const search_text = document.querySelector("#search_text");
const signout = document.querySelector("#signout");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        getQueries();
        getQna(uid);

        view_categories.addEventListener("change",function(e){
            content.innerHTML = `<h1 class="text-2xl font-semibold text-center mt-10">Loading...</h1>
                    <p class="mt-5 text-gray-600 text-center">In case nothing loads, please check your internet connection and then Reload this page again.</p>`;
            if(view_categories.value === "All"){
                getQna(uid);
            }else{
                onValue(ref(db, 'questions_answers/qna/'+view_categories.value), (snapshot) => {
                    content.innerHTML = "";
                    const data = snapshot.val();
                    showData(data);
                });
            }            
        });

        search_button.addEventListener("click",function(e){
            if(search_text.value !== ""){
                window.find(search_text.value);
                if(!queries.innerText.includes(search_text.value)){
                    push(ref(db, 'questions_answers/queries'), {
                        text: search_text.value
                    });
                }
            }
        });

        signout.addEventListener("click",function(e){
            if(confirm("Do you want to sign out?")){
                signOut(auth).then(() => {
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(errorMessage);
                });
            }
        });
    } else {
        window.open("index.html","_self");
    }
});

function getQueries(){
    onValue(ref(db, 'questions_answers/queries'), (snapshot) => {
        queries.innerHTML = "";
        const data = snapshot.val();
        for(let key in data){
            onValue(ref(db, 'questions_answers/queries/'+key), (snapshot) => {
                const data = snapshot.val();
                queries.innerHTML += `<option>${data.text}</option>`;
            },{
                onlyOnce: true
            });
        }
    });
}

function getQna(userId){
    content.innerHTML = `<h1 class="text-2xl font-semibold text-center mt-10">Loading...</h1>
                    <p class="mt-5 text-gray-600 text-center">In case nothing loads, please check your internet connection and then Reload this page again.</p>`;
    onValue(ref(db, 'questions_answers/qna'), (snapshot) => {
        view_categories.innerHTML = "<option>All</option>";
        content.innerHTML = "";
        let updates = {};
        const data = snapshot.val();
        for(let key in data){
            view_categories.innerHTML += `<option>${key}</option>`;
            onValue(ref(db, 'questions_answers/qna/'+key), (snapshot) => {
                const data = snapshot.val();
                showData(data);
            },{
                onlyOnce: true
            });
        }
    });
}
function showData(data){
    for(let d in data){
        let contentinnerHTML = `
            <div class="shadow-sm p-2 border-l-slate-700 border-2 mb-5">
                <div class="flex items-center mb-2">
                    <small class="mr-2 font-bold">Category:</small>
                    <span>${data[d].category}</span>
                </div>
                <div class="grid grid-flow-row mb-2">
                    <small class="font-bold">Question</small>
                    <span>${data[d].question}</span>
                </div>
                <div class="grid grid-flow-row">
                    <small class="font-bold">Answer</small>
                    <span>${data[d].answer}</span>
                </div>
            </div>
        `;
        content.innerHTML += contentinnerHTML;
    }
}