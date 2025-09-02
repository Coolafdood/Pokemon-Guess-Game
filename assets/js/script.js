// =========================
// Pokémon Guess Game JS
// =========================

// Wrap everything in an immediately-invoked function expression (IIFE)
// Purpose: keeps variables private so they don't pollute the global scope
(function () {

  // -------------------------
  // DOM Elements
  // -------------------------
  const imageEl = document.querySelector('#pokemon-image img'); // Pokémon image element
  const guessInput = document.getElementById('pokemon-guess');  // Input field for user guesses
  const submitBtn = document.getElementById('submit-guess');    // Submit guess button
  const nextBtn = document.getElementById('next-pokemon');      // Load next Pokémon button
  const newGameBtn = document.getElementById('new-game');       // Reset game button
  const resultMessage = document.getElementById('result-message'); // Area to show success/error messages
  const scoreEl = document.getElementById('score');             // Current score display
  const highScoreEl = document.getElementById('high-score');    // High score display

  // -------------------------
  // Game Constants & State
  // -------------------------
  const MIN_ID = 1;      // First Pokémon ID (Bulbasaur)
  const MAX_ID = 1010;   // Last known Pokémon ID (as of Gen 9)

  // Tracks the currently displayed Pokémon
  let current = {
    id: null,           // Pokémon ID
    name: null,         // Pokémon API slug (e.g., "pikachu")
    displayName: null,  // Capitalized display name (e.g., "Pikachu")
    revealed: false,    // Whether silhouette is removed
  };

  let score = 0;  // Player's current score
  const LS_KEY = 'pokemonGuessHighScore';  // Key to store high score in localStorage
  let highScore = Number(localStorage.getItem(LS_KEY) || 0); // Load high score if available
  highScoreEl.textContent = highScore;  // Show high score in DOM

// Canonicalize Pokémon names for comparison (remove special characters, accents, etc.)
function canonicalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD') // separate accents
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[.']/g, '') // remove periods/apostrophes
    .replace(/[♀]/g, '-f') // convert female symbols
    .replace(/[♂]/g, '-m') // convert male symbols
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/[^a-z0-9-]/g, ''); // remove any other non-alphanumeric characters
}

// Add any additional functions or code here

  // setMessage: display feedback to the user
  function setMessage(html, type = 'info') {
    resultMessage.className = '';
    resultMessage.classList.add('alert');
    const cls = {
      success: 'alert-success',
      error: 'alert-danger',
      info: 'alert-secondary',
    }[type] || 'alert-secondary';
    resultMessage.classList.add(cls);
    resultMessage.innerHTML = html;
  }

  // clearMessage: remove any previous messages
  function clearMessage() {
    resultMessage.className = '';
    resultMessage.textContent = '';
  }

  // setScore: update score and high score
  function setScore(newScore) {
    score = newScore;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(LS_KEY, String(highScore));
      highScoreEl.textContent = highScore;
    }
  }

  // applySilhouette: hide or reveal the Pokémon image
  function applySilhouette(on) {
    if (!imageEl) return;
    if (on) {
      imageEl.classList.add('silhouette'); // CSS applies blacked-out effect
      imageEl.setAttribute('aria-hidden', 'true'); // accessibility
    } else {
      imageEl.classList.remove('silhouette');
      imageEl.removeAttribute('aria-hidden');
    }
  }

  // -------------------------
  // API & Random Pokémon
  // -------------------------

  // fetchPokemon: get Pokémon data from PokéAPI
  async function fetchPokemon(id) {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const res = await fetch(url); // fetch JSON data
    if (!res.ok) throw new Error('Failed to fetch Pokémon');
    const data = await res.json();
    // Choose best available image: official → dream_world → default
    const artwork =
      data.sprites?.other?.['official-artwork']?.front_default ||
      data.sprites?.other?.dream_world?.front_default ||
      data.sprites?.front_default;
    return {
      id: data.id,
      name: data.name,
      displayName: data.name
        .split('-')
        .map(s => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
        .join(' '),
      image: artwork,
      types: data.types?.map(t => t.type.name) || [],
    };
  }

  // randInt: generate a random integer between min and max (inclusive)
  function randInt(min, maxInclusive) {
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

})();