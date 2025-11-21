  document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("NielsBubble");
  const cat = document.getElementById("Niels");
  const hideBtn = document.getElementById("hideNiels");
  const wakeBtn = document.getElementById("wakeNiels");
  const zzzBubbles = document.querySelectorAll(".zzz-bubble");

  if (!bubble || !cat || !hideBtn || !wakeBtn) return;

  const messages = bubble.textContent.trim().split("|");
  const danceFrames = [
    "/static/images/Niels/Dance1.png",
    "/static/images/Niels/Dance2.png",
    "/static/images/Niels/Dance3.png",
    "/static/images/Niels/Dance4.png",
    "/static/images/Niels/Dance5.png",
    "/static/images/Niels/Dance6.png",
    "/static/images/Niels/Dance7.png",
    "/static/images/Niels/Dance8.png",
  ];

  let index = 0;
  let talkInterval = null;
  let isDancing = false;

  // =========================== TALK ===========================
  function showMessage() {
    if (localStorage.getItem("nielsState") !== "awake" || isDancing) return;

    cat.src = "/static/images/Niels/NielsPoint.png";
    cat.classList.add("talking");

    bubble.textContent = messages[index];
    bubble.classList.add("show");

    setTimeout(() => {
      if (localStorage.getItem("nielsState") === "awake" && !isDancing) {
        bubble.classList.remove("show");
        cat.src = "/static/images/Niels/NielsAwake.png";
        cat.classList.remove("talking");
      }
    }, 4000);

    index = (index + 1) % messages.length;
  }

  function startTalking() {
    if (localStorage.getItem("nielsState") !== "awake") return;
    clearInterval(talkInterval);
    showMessage();
    talkInterval = setInterval(showMessage, 8000);
    hideBtn.style.display = "block";
    wakeBtn.style.display = "none";
    zzzBubbles.forEach(z => (z.style.display = "none"));
  }

  function stopTalking() {
    clearInterval(talkInterval);
    talkInterval = null;
    bubble.classList.remove("show");
  }

  // ===========================   DANCE  ===========================
  function dance() {
    if (
      localStorage.getItem("nielsState") !== "awake" ||
      isDancing
    )
      return;

    isDancing = true;
    stopTalking();
    bubble.classList.remove("show");
    cat.classList.remove("talking");

    let frame = 0;
    const danceInterval = setInterval(() => {
      if (localStorage.getItem("nielsState") !== "awake") {
        clearInterval(danceInterval);
        isDancing = false;
        return;
      }

      cat.src = danceFrames[frame];
      frame++;

      if (frame >= danceFrames.length) {
        clearInterval(danceInterval);
        isDancing = false;
        if (localStorage.getItem("nielsState") === "awake") {
          cat.src = "/static/images/Niels/NielsAwake.png";
          startTalking();
        }
      }
    }, 200); // 0.2 s PER FRAME = SMOOTH PACE 
  }

  // =========================== RANDOM DANCE LOOP ===========================
  function startRandomDancing() {
    const nextDance = Math.floor(Math.random() * 180000) + 120000; // 2–5 MINS
    setTimeout(() => {
      if (localStorage.getItem("nielsState") === "awake" && !isDancing) {
        dance();
      }
      startRandomDancing();
    }, nextDance);
  }

  function swapCatImage(newSrc) {
    cat.classList.add("fadeSwap");
    setTimeout(() => {
      cat.src = newSrc;
      cat.classList.remove("fadeSwap");
    }, 150); // FADE DURATION = 150 ms
  }

  // =========================== SLEEP / WAKE HANDLERS ===========================
  hideBtn.addEventListener("click", () => {
    localStorage.setItem("nielsState", "sleeping");
    stopTalking();
    isDancing = false;
    swapCatImage("/static/images/Niels/NielsSleep.png");
    hideBtn.style.display = "none";
    wakeBtn.style.display = "block";
    zzzBubbles.forEach(z => (z.style.display = "block"));
  });

  wakeBtn.addEventListener("click", () => {
    localStorage.setItem("nielsState", "awake");
    swapCatImage("/static/images/Niels/NielsAwake.png");
    startTalking();
    startRandomDancing();
    zzzBubbles.forEach(z => (z.style.display = "none"));
  });

  // =========================== CLICK NIELS  ===========================
  cat.addEventListener("click", () => {
    const state = localStorage.getItem("nielsState");
    if (state === "awake" && !isDancing) {
      if (Math.random() < 0.25) dance();
      else showMessage();
    }
  });

  // =========================== INITIAL STATE RESTORE ===========================
  const savedState = localStorage.getItem("nielsState");
  if (savedState === "sleeping") {
    swapCatImage("/static/images/Niels/NielsSleep.png");
    hideBtn.style.display = "none";
    wakeBtn.style.display = "block";
    zzzBubbles.forEach(z => (z.style.display = "block"));
    stopTalking();
  } else {
    localStorage.setItem("nielsState", "awake");
    swapCatImage("/static/images/Niels/NielsAwake.png");
    startTalking();
    startRandomDancing();
  }
});
