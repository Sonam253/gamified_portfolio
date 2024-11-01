import './style.css'
import * as THREE from 'three';

let scene, camera, renderer, car;
let obstacles = [];
let speedBoosts = [];
let finishLine;
let speed = 0.07;
let level = 1;
let distanceTraveled = 0;
let controls = { forward: false, left: false, right: false };
let levelCompleted = false; 

// Show Popup Function for Portfolio Info
function showPopup(title, message, additionalContent = '') {
    const popup = document.getElementById("popup");
    const titleElement = document.getElementById("popup-title");
    const messageElement = document.getElementById("popup-message");
    const contentElement = document.getElementById("popup-content");
    
    // Set the title, message, and additional content
    titleElement.innerText = title;
    messageElement.innerText = message;
    contentElement.innerHTML = additionalContent;
    
    // Show the popup
    popup.style.display = "flex";
    
    // Confirm button closes the popup
    document.getElementById("popup-confirm-btn").onclick = () => {
        popup.style.display = "none";
    };

    // Close button closes the popup
    document.querySelector(".close-btn").onclick = () => {
        popup.style.display = "none";
    };
}

function init() {
    // Scene and Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 600, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 2;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gameCanvas") });
    renderer.setSize(window.innerWidth, 600);
    

    // Load the texture for the car
const textureLoader = new THREE.TextureLoader();
const carTexture = textureLoader.load('car04.png', function (texture) {
    // Car Model with image texture
    const geometry = new THREE.BoxGeometry(1, 0.5, 2);
    
    // Create a material using the loaded texture
    const material = new THREE.MeshBasicMaterial({ map: texture }); // Use 'map' to apply the texture

    car = new THREE.Mesh(geometry, material); // Create the car mesh with geometry and material
    scene.add(car); // Add the car to the scene
}, 

);


    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Initialize level 1
    startLevel(level);

    // Listen for keyboard events
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    animate();
}

// Start each level
function startLevel(level) {
    //reset the levelCompleted flag

     levelCompleted=false;
     controls.forward = false;
     distanceTraveled = 0;

    // Clear previous obstacles, speed boosts, and finish line
    obstacles.forEach(obs => scene.remove(obs));
    if (finishLine) scene.remove(finishLine);

    obstacles = [];

    // Track and elements for the current level
    createTrack(level);
    createObstacles(level);
    createFinishLine(level);

    // Update level info display
    document.getElementById("level-info").innerHTML = `<h2>Level ${level}: Portfolio Section</h2><p>Information about portfolio at the end of the level ${level}.</p>`;
}

// Create track
function createTrack(level) {
    const trackGeometry = new THREE.PlaneGeometry(50, 500);
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = Math.PI / 2;
    track.position.y = -1;
    track.position.z = -(level - 1) * 50; // Adjust position for each level
    scene.add(track);
}

// Create obstacles based on level
function createObstacles(level) {
    let obstacleCount = level === 3 ? 15 : level * 5; // Increase obstacles in level 3
    for (let i = 0; i < obstacleCount; i++) {
        const obsGeometry = new THREE.BoxGeometry(1, 1, 1);
        const obsMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const obstacle = new THREE.Mesh(obsGeometry, obsMaterial);
        obstacle.position.set((Math.random() - 0.5) * 10, 0.5, -i * 10 - 5 - (level - 1) * 20); // Adjust Z position for level spacing
        obstacles.push(obstacle);
        scene.add(obstacle);
    }
}

function createFinishLine(level) {
    const textureLoader = new THREE.TextureLoader();
    
    // Load the finish line texture (replace with the actual path to your image)
    const finishTexture = textureLoader.load('finish.png', function (texture) {
        const finishGeometry = new THREE.PlaneGeometry(5, 1);
        
        // Create a material using the loaded texture
        const finishMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }); // Use 'map' to apply the texture
        finishLine = new THREE.Mesh(finishGeometry, finishMaterial);
        
        finishLine.rotation.x = Math.PI / 2;

        // Adjust finishing line distance for levels
        const finishDistance = level === 1 ? 50 : level === 2 ? 100 : 150; // Finish distances for levels
        finishLine.position.set(0, 0.5, -finishDistance);
        scene.add(finishLine);
    }, 
    
);
}


// Collision detection with obstacles, boosts, and finish line
function detectCollisions() {
    if (levelCompleted) return;

    obstacles.forEach(obstacle => {
        if (car.position.distanceTo(obstacle.position) < 1) {
            showPopup("Collision Alert", "You hit an obstacle! Restarting level...", "<p>Try avoiding obstacles to progress.</p>");
            resetLevel();
        }
    });

   // Check if car reached the finish line
    if (car.position.distanceTo(finishLine.position) < 1) {
        levelCompleted = true; // Set flag to stop car movement

        // Show a specific popup for each level completion
        if (level === 1) {
            showPopup("Level 1 Complete!", "Welcome to Level 2", "<p>Hobbies: Reading , Singing , Volunteer work.</p>");
        } else if (level === 2) {
            showPopup("Level 2 Complete!", "Welcome to Level 3", "<p>Programming: C, C++,Java, MATLAB, HTML,CSS,javascript,three.js....</p>");
        } else if (level === 3) {
            showPopup("Congratulations!", "You've completed the game.", "<p>Soft Skills: • Active Listener, Teamwork, Observant<br>• Ability to work under pressure., Time management, Target-Oriented.<br>• Adaptability, Curiosity to learn new things.</p>");
        }

        // Advance to the next level after showing the popup
        setTimeout(() => {
            if (level < 3) {
                level++;
                startLevel(level);
            } else {
                level = 1; // Reset game after all levels are completed
                startLevel(level);
            }
        }, 1000);
    }
}


// Keyboard Input
function handleKeyDown(event) {
    if (event.key === "ArrowUp") {
        if (levelCompleted) {
            // If the level was completed, restart the level on next forward press
            level++;
            startLevel(level);
        } else {
            controls.forward = true;
        }
    }
    if (event.key === "ArrowLeft") controls.left = true;
    if (event.key === "ArrowRight") controls.right = true;
}

function handleKeyUp(event) {
    if (event.key === "ArrowUp") controls.forward = false;
    if (event.key === "ArrowLeft") controls.left = false;
    if (event.key === "ArrowRight") controls.right = false;
}

// Car Movement
function moveCar() {
    if (levelCompleted) return;

    if (controls.forward) {
        car.position.z -= speed;
        distanceTraveled += speed;
    }
    if (controls.left) car.position.x -= speed / 2;
    if (controls.right) car.position.x += speed / 2;
}


// Animate scene
function animate() {
    requestAnimationFrame(animate);

    moveCar();

    camera.position.z = car.position.z + 5;

    detectCollisions();

    renderer.render(scene, camera);
}

// Start game button logic
document.getElementById("startGame").addEventListener("click", () => {
    document.getElementById("startGame").style.display = 'none';
    document.getElementById("level-info").innerHTML = `<h2>Level ${level}: Portfolio Section</h2><p>Information about my portfolio in the end of the level ${level}.</p>`;
    init();
});

document.getElementById('contact-icon').addEventListener('click', function() {
    // Display contact details
    showPopup("Contact Details", "Reach out anytime!", "<p>Email: your-sonamprajapati253@gmail.com<br>Phone: 931-039-9805<br>Linkedin:https://www.linkedin.com/in/sonam-prajapati-95404b294/ <br>Github: https://github.com/Sonam253</p>");
});


// Get the modal
const introPopup = document.getElementById('intro-popup');

// Get the <span> element that closes the modal
const closeBtn = document.getElementsByClassName('close')[0];

// Get the Start button
const startButton = document.getElementById('start-button');

// Show the popup when the game starts
function showIntroPopup() {
    introPopup.style.display = 'block';
}

// Close the modal when the user clicks on <span> (x)
closeBtn.onclick = function() {
    introPopup.style.display = 'none';
}

// Close the modal when the user clicks on the Start button
startButton.onclick = function() {
    introPopup.style.display = 'none';
    // Start your game logic here
    startGame();
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    if (event.target === introPopup) {
        introPopup.style.display = 'none';
    }
}

// Call this function at the beginning of your game to show the popup
showIntroPopup();

