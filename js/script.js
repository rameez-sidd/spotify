console.log("Let's Write Javascript");


let loop = false;

let songs;

let currPlayList = {
    name: "",
    list: [],
};
let currLI = "";
let currSong = new Audio();
let currTime;
let duration;

let currFolder;

let seekbar = document.querySelector("#song-seekbar");
let library = document.querySelector("#left");

let isUpdatingSeekbar = false;
let currPlayBtn = null;

function getURL(song) {
    return `http://127.0.0.1:5500/songs/${currFolder.replaceAll(" ", "%20")}/${song.replaceAll(" ", "%20")}.mp3`
}

function formatTime(seconds) {
    if (seconds < 0 || isNaN(seconds)) {
        return `00:00`;
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.querySelector("ul").querySelectorAll('a[href*="/songs"]')
    let cardContainer = document.querySelector("#container");

    anchors.forEach(async (a) => {
        let folder = a.title;

        let promise = await fetch(`/songs/${folder}/info.json`);
        let response = await promise.json();

        cardContainer.innerHTML += `<div class="cards" data-folder="${folder}">
                    <div class="img" style="background-image:url('../Songs/${folder}/cover.jpeg'), url('https://i.ebayimg.com/images/g/Lh8AAOSwFQVdsuBg/s-l1200.jpg')">
                        
                        <div class="play-icon"><i class="fa-solid fa-play"></i></div>
                    </div>
                    <p class="title">${response.title}</p>
                    <p class="description text-grey">${response.description}</p>
                </div>`



        document.querySelectorAll(".cards").forEach((card) => {
            card.addEventListener("click", async (item) => {
                currFolder = item.currentTarget.dataset.folder;
                document.querySelector("#library #playlist-info").style.display = "flex";
                document.querySelector("#library header").style.display = "none";  //new commit
                
                document.querySelector("#playlist-title").innerHTML = item.currentTarget.dataset.folder;
                document.querySelector("#playlist-desc").innerHTML = item.currentTarget.querySelector(".description").innerHTML;
                songs = await getSongsTitle(item.currentTarget.dataset.folder);

                library.style.left = "0%";

                if (window.innerWidth <= 920) {
                    // modified
                    document.querySelector("#right header").classList.add("reduce-brightness");
                    document.querySelector("#right main").classList.add("reduce-brightness");
                    document.querySelector("#right main").style.overflowY = "hidden";

                }
                
                loadLibrary(songs);
                if (item.target.closest(".play-icon") && card.contains(item.target.closest(".play-icon"))) {
                    let songLIs = document.querySelector("#song-list").querySelectorAll("li");
                    let fSongIcon = songLIs[0].querySelector(".song-card-playbtn i");
                    player.querySelector("#player-song-title").innerHTML = songLIs[0].querySelector(".song-title").innerHTML;
                    let fSong = player.querySelector("#player-song-title").innerHTML;

                    if (currLI && currLI !== songLIs[0]) {
                        currLI.classList.remove("playing-currently");
                    }
                    songLIs[0].classList.add("playing-currently");
                    currLI = songLIs[0];
                    currPlayList.name = currFolder;
                    currPlayList.list = Array.from(songLIs);


                    playTrack(fSong, fSongIcon);
                }

            });
        });


    });


}

function loadLibrary(songs) {
    let songUL = document.querySelector("#library ul");
    songUL.innerHTML = "";
    songs.forEach((song) => {
        songUL.innerHTML += `<li>
                        <div class="song-card-info">
                            <div><i class="fa-solid fa-music"></i></div>
                            <div class="song-title">${song}</div>
                        </div>
                        <div class="song-card-playbtn">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    </li>`
    });

    let songLIs = document.querySelector("#song-list").querySelectorAll("li");



    if (currPlayList.name === currFolder) {
        songLIs.forEach((song) => {
            if (getURL(song.querySelector(".song-title").innerHTML) === currSong.src) {
                song.classList.add("playing-currently");
                let icon = song.querySelector(".song-card-playbtn i");
                icon.setAttribute("class", "fa-solid fa-pause");
                currPlayBtn = icon;
                currLI = song;
            }
        });
    }


    if (currSong.ended) {
        songLIs.forEach((song) => {
            if (song === currLI) {
                song.classList.remove("playing-currently");
                song.querySelector(".song-card-playbtn i").setAttribute("class", "fa-solid fa-play");
            }
        });
    }


    readyToPlay(songLIs);

}

function readyToPlay(songLIs) {
    let firstSongicon = songLIs[0].querySelector(".song-card-playbtn i");

    if (currSong.src == "" || player.querySelector("#player-song-title").innerHTML === "") {
        player.querySelector("#player-song-title").innerHTML = songLIs[0].querySelector(".song-title").innerHTML;
        let firstSong = player.querySelector("#player-song-title").innerHTML;
        // playTrack(firstSong, firstSongicon, true);
    }



    songLIs.forEach((song) => {

        if (currLI !== "" && !currSong.ended) {
            if (currLI.querySelector(".song-title").innerHTML === song.querySelector(".song-title").innerHTML) {
                song.classList.add("playing-currently");
                let icon = song.querySelector(".song-card-playbtn i");
                icon.setAttribute("class", "fa-solid fa-pause");
                currLI = song;
                currPlayBtn = icon;
            }
        }

        song.addEventListener("click", (e) => {
            
            if (currPlayList.list.length !== 0 && currPlayList.name === currFolder) {
            } else {
                currPlayList.name = currFolder;
                currPlayList.list = Array.from(songLIs);
            }
            player.querySelector("#player-song-title").innerHTML = song.querySelector(".song-title").innerHTML;
            let track = player.querySelector("#player-song-title").innerHTML;
            let icon = song.querySelector(".song-card-playbtn i");
            if (currLI && currLI !== song) {
                currLI.classList.remove("playing-currently");
            }
            song.classList.add("playing-currently");
            currLI = song;
            playTrack(track, icon);
        });
    });

    // main(songLIs);

}

function playTrack(track, icon, pause = false) {
    if (currSong.src === getURL(track) && !currSong.ended && !currSong.paused) {
        return;
    }
    currSong.src = `/songs/${currFolder}/${track}.mp3`;
    if (!pause) {
        if (currPlayBtn && currPlayBtn !== icon) {
            currPlayBtn.setAttribute("class", "fa-solid fa-play");
        }

        play.setAttribute("class", "fa-regular fa-circle-pause");
        icon.setAttribute("class", "fa-solid fa-pause");
        currPlayBtn = icon;
        currSong.play();
    }
    else {

    }



}

function equal(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

async function getSongsElement(folder) {
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll('a[href$=".mp3"]');
    return as;

}

async function getSongsLink() {
    let songs = await getSongsElement();

    let songLink = [];
    for (const song of songs) {
        songLink.push(song.href);
    }

    return songLink;

}

async function getSongsTitle(folder) {
    let songs = await getSongsElement(folder);
    let songTitle = [];
    for (const song of songs) {
        songTitle.push(song.title.substring(0, song.title.length - 4));
    }

    return songTitle;
}




async function main() {

    await displayAlbums();

    // Reset the play button when the song ends
    currSong.addEventListener('ended', () => {
        // new commit
        if(loop === true){
            next.click(); 
            return;
        }

        if (currPlayBtn) {
            play.setAttribute("class", "fa-regular fa-circle-play");
            currPlayBtn.setAttribute("class", "fa-solid fa-play");
            currPlayBtn = null;
            currLI.classList.remove("playing-currently");
            console.log("ended");

        }
    });


    // Add event listener for play
    play.addEventListener("click", () => {
        if (currSong.src === "") {
            if (player.querySelector("#player-song-title").innerHTML !== "") {

                currSong.src = `/songs/${currFolder}/${player.querySelector("#player-song-title").innerHTML}.mp3`;
                currPlayList.name = currFolder;
                currPlayList.list = Array.from(document.querySelector("#song-list").querySelectorAll("li"));
            }
            else {
                return;
            }
            // console.log(currSong.paused);
        }

        if (currSong.paused) {
            currSong.play();
            play.setAttribute("class", "fa-regular fa-circle-pause");

            //search for the last played song
            let lastPlayedSong = player.querySelector("#player-song-title").innerHTML;
            let songLIs = document.querySelector("#song-list").querySelectorAll("li");
            songLIs.forEach((song) => {
                let track = song.querySelector(".song-title").innerHTML;
                let icon = song.querySelector(".song-card-playbtn i");
                if (track === lastPlayedSong) {
                    icon.setAttribute("class", "fa-solid fa-pause");
                    song.classList.add("playing-currently");
                    currLI = song;
                    currPlayBtn = icon;
                }
            });


        }
        else {
            currSong.pause();
            play.setAttribute("class", "fa-regular fa-circle-play");
        }

    });

    previous.addEventListener("click", () => {
        if (currSong.src === "" || player.querySelector("#player-song-title").innerHTML === "") {
            return;
        }


        //search the current playing song in playlist
        let idx;
        for (let i = 0; i < currPlayList.list.length; i++) {
            if (`http://127.0.0.1:5500/songs/${currPlayList.name.replaceAll(" ", "%20")}/${(currPlayList.list[i].querySelector(".song-title").innerHTML).replaceAll(" ", "%20")}.mp3` == currSong.src) {
                idx = i - 1;
                if (idx < 0) {
                    idx = currPlayList.list.length - 1;
                }
                currSong.src = `/songs/${currPlayList.name}/${currPlayList.list[idx].querySelector(".song-title").innerHTML}.mp3`;

                if (currPlayList.name === currFolder) {
                    let song = document.querySelector("#song-list").querySelectorAll("li")[idx];
                    if (currLI && currLI !== song) {
                        currLI.classList.remove("playing-currently");
                    }
                    song.classList.add("playing-currently");
                    currLI = song;

                    let icon = song.querySelector(".song-card-playbtn i");
                    if (currPlayBtn && currPlayBtn !== icon) {
                        currPlayBtn.setAttribute("class", "fa-solid fa-play");
                    }
                    icon.setAttribute("class", "fa-solid fa-pause");
                    currPlayBtn = icon;

                }

                break;
            }
        }

        if (play.classList.contains("fa-circle-play")) {
            play.setAttribute("class", "fa-regular fa-circle-pause");
        }
        player.querySelector("#player-song-title").innerHTML = currPlayList.list[idx].querySelector(".song-title").innerHTML;
        currSong.play();
    });
    next.addEventListener("click", () => {
        if (currSong.src === "" || player.querySelector("#player-song-title").innerHTML === "") {
            return;
        }
        //search the current playing song in playlist
        let idx;
        for (let i = 0; i < currPlayList.list.length; i++) {
            if (`http://127.0.0.1:5500/songs/${currPlayList.name.replaceAll(" ", "%20")}/${(currPlayList.list[i].querySelector(".song-title").innerHTML).replaceAll(" ", "%20")}.mp3` == currSong.src) {
                idx = i + 1;
                if (idx >= currPlayList.list.length) {
                    idx = 0;
                }
                currSong.src = `/songs/${currPlayList.name}/${currPlayList.list[idx].querySelector(".song-title").innerHTML}.mp3`;

                if (currPlayList.name === currFolder) {
                    let song = document.querySelector("#song-list").querySelectorAll("li")[idx];
                    if (currLI && currLI !== song) {
                        currLI.classList.remove("playing-currently");
                    }
                    song.classList.add("playing-currently");
                    currLI = song;

                    let icon = song.querySelector(".song-card-playbtn i");
                    if (currPlayBtn && currPlayBtn !== icon) {
                        currPlayBtn.setAttribute("class", "fa-solid fa-play");
                    }
                    icon.setAttribute("class", "fa-solid fa-pause");
                    currPlayBtn = icon;


                }

                break;
            }
        }

        if (play.classList.contains("fa-circle-play")) {
            play.setAttribute("class", "fa-regular fa-circle-pause");
        }
        player.querySelector("#player-song-title").innerHTML = currPlayList.list[idx].querySelector(".song-title").innerHTML;
        currSong.play();
    });

    // Add event listener for current playing song timeupdate
    currSong.addEventListener("timeupdate", (e) => {
        currTime = formatTime(currSong.currentTime);
        duration = formatTime(currSong.duration);
        document.querySelector("#player-song-time #current-time").innerHTML = currTime;
        document.querySelector("#player-song-time #duration").innerHTML = duration;
        if (!isUpdatingSeekbar) {
            seekbar.value = (currSong.currentTime / currSong.duration) * 100;
        }

    });

    // Add event listener for seekbar
    seekbar.addEventListener("input", () => {
        isUpdatingSeekbar = true;
        currSong.currentTime = (seekbar.value * currSong.duration) / 100;


    });

    seekbar.addEventListener('change', function () {
        isUpdatingSeekbar = false; // Reset flag after seekbar value has been updated
    });

    // Add event listener for volume bar
    volumebar.addEventListener("change", (e) => {
        let volBtn = document.querySelector("#player-song-vol i");
        currSong.volume = parseInt(e.target.value) / 100;
        if (currSong.volume === 0) {
            volBtn.setAttribute("class", "fa-solid fa-volume-off");
        }
        else if (currSong.volume === 1) {
            volBtn.setAttribute("class", "fa-solid fa-volume-high");
        }
        else {
            volBtn.setAttribute("class", "fa-solid fa-volume-low");
        }
    });

    // Play or pause the audio when the spacebar is pressed
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent the default spacebar action (scrolling)
            if (currSong.src == "") {
                if (player.querySelector("#player-song-title").innerHTML !== "") {

                    currSong.src = `/songs/${currFolder}/${player.querySelector("#player-song-title").innerHTML}.mp3`;
                    currPlayList.name = currFolder;
                    currPlayList.list = Array.from(document.querySelector("#song-list").querySelectorAll("li"));
                }
                else {
                    return;
                }
            }

            if (currSong.paused) {

                currSong.play()
                play.setAttribute("class", "fa-regular fa-circle-pause");
                let lastPlayedSong = player.querySelector("#player-song-title").innerHTML;
                let songLIs = document.querySelector("#song-list").querySelectorAll("li");
                songLIs.forEach((song) => {
                    let track = song.querySelector(".song-title").innerHTML;
                    let icon = song.querySelector(".song-card-playbtn i");
                    if (track === lastPlayedSong) {
                        song.classList.add("playing-currently");
                        icon.setAttribute("class", "fa-solid fa-pause");
                        currLI = song;
                        currPlayBtn = icon;
                    }
                });

            } else {
                currSong.pause();
                play.setAttribute("class", "fa-regular fa-circle-play");
            }
        }





    });

}



document.querySelector(".fa-repeat").addEventListener("click", (e) => {
    if(!loop){
        e.currentTarget.classList.remove("repeat-off");
        loop = true;
    } else{
        e.currentTarget.classList.add("repeat-off");
        loop = false;

    }
});


document.querySelector("#hamburger").addEventListener("click", () => {
    document.querySelector("#left").style.left = "0%";
    document.querySelector("#right header").classList.add("reduce-brightness"); //modified
    document.querySelector("#right main").classList.add("reduce-brightness");
    document.querySelector("#right main").style.overflowY = "hidden";
});

document.querySelector(".fa-xmark").addEventListener("click", () => {
    document.querySelector("#left").style.left = "-100%";
    document.querySelector("#right header").classList.remove("reduce-brightness");  //modified
    document.querySelector("#right main").classList.remove("reduce-brightness");
    document.querySelector("#right main").style.overflowY = "auto";
});



main();
