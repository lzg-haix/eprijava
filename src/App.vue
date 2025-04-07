<script setup>
import { ref, onMounted, watch } from 'vue';
import MainPage from './components/MainPage.vue';
import 'flag-icons/css/flag-icons.min.css';
import translations from './assets/translations.json';

let time = ref(''); // Current time
let welcomeMessage = ref(''); // Welcome message
let currentLang = ref('hr'); // Default language is Croatian
let pageTitle = ref(''); // Page title
let currentTitleKey = ref('welcome'); // Default title key

// Function to change the language
const changeLanguage = (lang) => {
  currentLang.value = lang; // Set the current language
  if (translations[lang]) {
    welcomeMessage.value = translations[lang].welcome; // Update the welcome message
    console.log(`Language is now set to ${lang}.`);
  }
};

// Function to update the page title based on the translation key
const updatePageTitle = (key) => {
  currentTitleKey.value = key; // Store the current title key
  if (translations[currentLang.value] && translations[currentLang.value][key]) {
    pageTitle.value = translations[currentLang.value][key]; // Fetch the translated title
    console.log(`Page title updated to: ${pageTitle.value}`);
  } else {
    console.warn(`Translation for key "${key}" not found in language "${currentLang.value}".`);
  }
};

// Watch for changes in the language and update the page title
watch(currentLang, () => {
  updatePageTitle(currentTitleKey.value); // Reapply the title with the current key
});

// Function to update the time
const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  time.value = `${hours}:${minutes}:${seconds}`;
};

// Set default language and time on component mount
onMounted(() => {
  changeLanguage('hr');
  updatePageTitle('welcome'); // Set the initial page title
  updateTime();
  setInterval(updateTime, 1000);
});
</script>

<template>
  <div class="page-header">
    <div class="clock">{{ time }}</div>
    <div class="page-title">{{ pageTitle }}</div>
    <div class="logo">
      <img alt="HAIX logo" src="../src/assets/HAIX_group_blau.png" width="300" height="69" />
    </div>
  </div>

  <div class="background-wrapper">
    <!-- Pass the updatePageTitle function as a prop -->
    <MainPage :msg="welcomeMessage" :lang="currentLang" :updatePageTitle="updatePageTitle" />
  </div>
  <div class="language-buttons">
    <button :class="{ selected: currentLang === 'en' }" @click="() => changeLanguage('en')">
      <span class="fi fi-gb"></span> EN
    </button>
    <button :class="{ selected: currentLang === 'hr' }" @click="() => changeLanguage('hr')">
      <span class="fi fi-hr"></span> HR
    </button>
    <button :class="{ selected: currentLang === 'de' }" @click="() => changeLanguage('de')">
      <span class="fi fi-de"></span> DE
    </button>
    <button :class="{ selected: currentLang === 'fr' }" @click="() => changeLanguage('fr')">
      <span class="fi fi-fr"></span> FR
    </button>
    <button :class="{ selected: currentLang === 'it' }" @click="() => changeLanguage('it')">
      <span class="fi fi-it"></span> IT
    </button>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: 15%;
}

.clock {
  order: 1;
  width: 33%;
  text-align: center;
  font-size: 2em;
  font-weight: bold;
}

.page-title {
  font-size: 2em;
  color: #2c3e50;
  font-weight: bold;
  order: 2;
  width: 33%;
  text-align: center;
}

.logo {
  order: 3;
  width: 33%;
  display: flex;
  justify-content: center;
}

.language-buttons {
  padding-top: 0.4em;
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: center;
}

.language-buttons button {
  background-color: #ffffff;
  color: #2c3e50;
  border: none;
  font-size: 2.5rem;
  border-radius: 0.2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.language-buttons button:hover {
  background-color: #dddddd;
}

.language-buttons button.selected {
  background-color: #2c3e50;
  color: white;
  margin-top: -0.5em;
  padding-bottom: 0.1em;
  z-index: 2;
  box-shadow: 0 0.2em 0.2em rgba(0, 0, 0, 0.2);
  border-radius: 0 0 0.2em 0.2em;
}

.background-wrapper {
  background-color: #2c3e50;
  padding: 1rem;
  margin: auto;
  width: 96vw;
  height: 87vh;
  border-radius: 20px;
}

.background-wrapper {
  color: white;
}
</style>

<style>
body {
  overflow: hidden;
}
</style>
