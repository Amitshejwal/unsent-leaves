const popup = document.getElementById("popup");
const helpPopup = document.getElementById("helpPopup");
const aboutPopup = document.getElementById("aboutPopup");
const treeFullMessage = document.getElementById("treeFullMessage");

const popupTitle = document.getElementById("popupTitle");
const toInput = document.getElementById("toInput");
const messageInput = document.getElementById("messageInput");
const readMessage = document.getElementById("readMessage");
const popupTimer = document.getElementById("popupTimer");
const saveBtn = document.getElementById("saveBtn");

const notesContainer = document.getElementById("notesContainer");

let selectedNote = null;

const TWELVE_HOURS = 12 * 60 * 60 * 1000;

let messages = JSON.parse(localStorage.getItem("messages")) || {};

const desktopPositions = [
  {top:"50%", left:"35%"},
  {top:"49%", left:"43%"},
  {top:"49%", left:"50%"},
  {top:"50%", left:"57%"},

  {top:"61%", left:"33%"},
  {top:"61%", left:"42%"},
  {top:"61%", left:"50%"},
  {top:"61%", left:"58%"},
  {top:"61%", left:"67%"},

  {top:"73%", left:"39%"},
  {top:"73%", left:"50%"},
  {top:"73%", left:"61%"}
];

const mobilePositions = [
  {top:"60%", left:"29%"},
  {top:"59%", left:"40%"},
  {top:"59%", left:"50%"},
  {top:"60%", left:"61%"},

  {top:"73%", left:"27%"},
  {top:"73%", left:"39%"},
  {top:"73%", left:"50%"},
  {top:"73%", left:"61%"},
  {top:"73%", left:"73%"},

  {top:"86%", left:"35%"},
  {top:"86%", left:"50%"},
  {top:"86%", left:"65%"}
];

const leafIcon = `
<svg width="34" height="34" viewBox="0 0 64 64" fill="none">
  <path
    d="M51 11C32 12 17 22 13 43C31 45 48 32 51 11Z"
    stroke="currentColor"
    stroke-width="4"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M14 43C25 34 34 27 47 17"
    stroke="currentColor"
    stroke-width="4"
    stroke-linecap="round"
  />
</svg>
`;

function getPositions(){
  return window.innerWidth <= 600 ? mobilePositions : desktopPositions;
}

function applyNotePositions(){
  const positions = getPositions();
  const wrappers = document.querySelectorAll(".note-wrapper");

  wrappers.forEach((wrapper, index) => {
    wrapper.style.top = positions[index].top;
    wrapper.style.left = positions[index].left;
  });
}

function saveMessagesToStorage(){
  localStorage.setItem("messages", JSON.stringify(messages));
}

function isExpired(messageData){
  if(!messageData.expiresAt){
    return true;
  }

  return Date.now() > messageData.expiresAt;
}

function cleanExpiredMessages(){
  for(const noteNumber in messages){
    if(isExpired(messages[noteNumber])){
      delete messages[noteNumber];
    }
  }

  saveMessagesToStorage();
}

function formatTimeLeft(expiresAt){
  const timeLeft = expiresAt - Date.now();

  if(timeLeft <= 0){
    return "00:00:00";
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}

function updateTreeFullMessage(){
  const usedLeaves = Object.keys(messages).length;

  if(usedLeaves >= 12){
    treeFullMessage.classList.add("active");
  } else {
    treeFullMessage.classList.remove("active");
  }
}

cleanExpiredMessages();

for(let i = 1; i <= 12; i++){

  const wrapper = document.createElement("div");
  wrapper.classList.add("note-wrapper");

  const note = document.createElement("div");
  note.classList.add("note");

  note.innerHTML = leafIcon;

  note.onclick = () => openPopup(i);

  const timer = document.createElement("div");
  timer.classList.add("note-timer");
  timer.id = `timer-${i}`;

  if(messages[i]){
    note.classList.add("filled");
    timer.style.display = "block";
  }

  wrapper.appendChild(note);
  wrapper.appendChild(timer);

  notesContainer.appendChild(wrapper);
}

applyNotePositions();
updateTreeFullMessage();

window.addEventListener("resize", applyNotePositions);

function openPopup(noteNumber){

  selectedNote = noteNumber;

  const savedMessage = messages[noteNumber];

  popup.classList.add("active");

  if(savedMessage){

    popupTitle.innerText = "Secret Letter";

    toInput.style.display = "none";
    messageInput.style.display = "none";
    saveBtn.style.display = "none";

    readMessage.style.display = "block";
    popupTimer.style.display = "block";

    readMessage.innerHTML = `
      <strong>To: ${savedMessage.to}</strong>
      <p>${savedMessage.message}</p>
    `;

    popupTimer.innerText =
      `This letter fades in ${formatTimeLeft(savedMessage.expiresAt)}`;

  } else {

    popupTitle.innerText = "Hang Your Secret";

    toInput.style.display = "block";
    messageInput.style.display = "block";
    saveBtn.style.display = "block";

    readMessage.style.display = "none";
    popupTimer.style.display = "none";

    toInput.value = "";
    messageInput.value = "";
  }
}

function saveMessage(){

  const to = toInput.value.trim();
  const message = messageInput.value.trim();

  if(to === "" || message === ""){
    alert("Please write both name and message");
    return;
  }

  messages[selectedNote] = {
    to: to,
    message: message,
    createdAt: Date.now(),
    expiresAt: Date.now() + TWELVE_HOURS
  };

  saveMessagesToStorage();

  const allNotes = document.querySelectorAll(".note");
  const allTimers = document.querySelectorAll(".note-timer");

  allNotes[selectedNote - 1].classList.add("filled");
  allTimers[selectedNote - 1].style.display = "block";

  updateTreeFullMessage();

  closePopup();
}

function updateTimers(){

  for(let i = 1; i <= 12; i++){

    const timer =
      document.getElementById(`timer-${i}`);

    const note =
      document.querySelectorAll(".note")[i - 1];

    if(messages[i]){

      if(isExpired(messages[i])){

        delete messages[i];

        saveMessagesToStorage();

        note.classList.remove("filled");

        timer.style.display = "none";
        timer.innerText = "";

        updateTreeFullMessage();

      } else {

        timer.style.display = "block";

        timer.innerText =
          formatTimeLeft(messages[i].expiresAt);
      }
    }
  }

  if(
    selectedNote &&
    messages[selectedNote] &&
    popup.classList.contains("active")
  ){

    popupTimer.innerText =
      `This letter fades in ${formatTimeLeft(messages[selectedNote].expiresAt)}`;
  }
}

setInterval(updateTimers, 1000);

updateTimers();

function closePopup(){
  popup.classList.remove("active");
}

function outsideClick(event){
  if(event.target === popup){
    closePopup();
  }
}

function openHelpPopup(){
  helpPopup.classList.add("active");
}

function closeHelpPopup(){
  helpPopup.classList.remove("active");
}

function outsideHelpClick(event){
  if(event.target === helpPopup){
    closeHelpPopup();
  }
}

function openAboutPopup(){
  aboutPopup.classList.add("active");
}

function closeAboutPopup(){
  aboutPopup.classList.remove("active");
}

function outsideAboutClick(event){
  if(event.target === aboutPopup){
    closeAboutPopup();
  }
}

/* BACKGROUND SOUND */

const bgMusic = document.getElementById("bgMusic");
const soundToggle = document.getElementById("soundToggle");

let isPlaying = false;

bgMusic.volume = 0.25;

soundToggle.addEventListener("click", () => {

  if(isPlaying){

    bgMusic.pause();

    soundToggle.innerText = "🔇";

    isPlaying = false;

  } else {

    bgMusic.play();

    soundToggle.innerText = "🔊";

    isPlaying = true;
  }

});