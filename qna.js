// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { getDatabase, ref, onValue, push, set, update } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const view = document.querySelector("#view");
const content = document.querySelector("#content");
const view_categories = document.querySelector("#view_categories");
const queries = document.querySelector("#queries");
const search_button = document.querySelector("#search_button");
const search_text = document.querySelector("#search_text");
const category_tbody = document.querySelector("#category_tbody");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        getCategories(uid);
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
    } else {
        // User is signed out
        window.open("index.html","_self");
    }
});

function getCategories(userId){
    onValue(ref(db, 'questions_answers/categories'), (snapshot) => {
        add_categories.innerHTML = "";
        category_tbody.innerHTML = "";
        const data = snapshot.val();
        for(let d in data){
            add_categories.innerHTML += `<option>${data[d].category}</option>`;
            category_tbody.innerHTML += `
                <tr class="hover:bg-gray-100">
                    <td class="p-2">${data[d].category}</td>
                    <td class="p-2 text-right"><input type="checkbox" class="checkbox"></td>
                </tr>
            `;
        }
    });
}

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
            <div class="shadow-md p-2 bg-gray-100 border-l-slate-700 border-2 mb-5">
                <div class="flex items-center mb-2">
                    <small class="mr-2"><b>Category:</b></small>
                    <span>${data[d].category}</span>
                </div>
                <div class="grid grid-flow-row mb-2">
                    <small><b>Question</b></small>
                    <span>${data[d].question}</span>
                </div>
                <div class="grid grid-flow-row">
                    <small><b>Answer</b></small>
                    <span>${data[d].answer}</span>
                </div>
            </div>
        `;
        content.innerHTML += contentinnerHTML;
    }
}

ClassicEditor
.create( document.querySelector('#editor1') )
.then(e=>{
    editor1 = e;
})
.catch( error => {
});

ClassicEditor
.create( document.querySelector('#editor2') )
.then(e=>{
    editor2 = e;
})
.catch( error => {
});