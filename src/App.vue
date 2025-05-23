<script setup>
import { ref, onMounted, watch } from 'vue';
import MainPage from './components/MainPage.vue';
import 'flag-icons/css/flag-icons.min.css';

// json-server
import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

// oepas_dev2 - razvojna instanca na dev-inpos serveru
import { oepas_dev2 } from '@/utils/pas-util';
if (!oepas_dev2) {
  console.error('oepas_dev2 instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

// pizdarija za IE11
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

let time = ref(''); // trenutno vrijeme
let welcomeMessage = ref(''); // poruka dobrodošlice
let currentLang = ref('hr'); // defaultni jezik je hrvatski
let pageTitle = ref(''); // naslov stranice
let currentTitleKey = ref('welcome'); // defaultni ključ naslova

// dohvaćanje jezika
let languages = ref([]); // jezici
let translations = ref({}); // prijevodi

const getLanguages = async () => {
  try {
    const response = await oepas_dev2.get('/Languages?filter=Active%20=%20yes');
    languages.value = response.data.dsLanguages.ttLanguages
      .filter((language) => language.Active) // uključi samo aktivne jezike
      .sort((a, b) => a.order - b.order); // sortiraj prema redoslijedu
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja jezika:', error);
  }
};

// dohvaćanje prijevoda preko API-ja
const getTranslations = async () => {
  try {
    const response = await oepas_dev2.get('/LanguagesEntries');
    const entries = response.data.dsLanguagesEntries.ttLanguagesEntries;
    const langMap = {};

    entries.forEach(entry => {
      const lang = languages.value.find(l => l.ID === entry.LanguageID);
      if (!lang) return;
      const code = lang.LanguageCode;
      if (!langMap[code]) langMap[code] = {};
      langMap[code][entry.EntryName] = entry.LangValue;
    });
    translations.value = langMap;
    // console.log('Prijevodi:', translations.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja prijevoda:', error);
  }
};

// promjena jezika
const changeLanguage = (lang) => {
  currentLang.value = lang;
  if (translations.value[lang] && translations.value[lang].welcome) {
    welcomeMessage.value = translations.value[lang].welcome;
  } else {
    welcomeMessage.value = '';
    console.warn(`Prijevod za jezik "${lang}" nije pronađen.`);
  }
};

// funkcija za promjenu naslova na temelju ključa
const updatePageTitle = (key) => {
  currentTitleKey.value = key;
  if (key === 'adminPanel') {
    pageTitle.value = 'Administracijski panel';
  } else if (translations.value[currentLang.value] && translations.value[currentLang.value][key]) {
    pageTitle.value = translations.value[currentLang.value][key];
  } else {
    pageTitle.value = '';
    console.warn(`Prijevod s ključem "${key}" nije pronađen u jeziku "${currentLang.value}".`);
  }
};

// prati promjenu jezika i ponovno postavi naslov
watch(currentLang, () => {
  updatePageTitle(currentTitleKey.value);
});

// funkcija za ažuriranje vremena
const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  time.value = `${hours}:${minutes}:${seconds}`;
};

// inicijalizacija pri montiranju komponente
onMounted(async () => {
  await getLanguages();
  await getTranslations();
  changeLanguage('hr');
  updatePageTitle('welcome');
  updateTime();
  setInterval(updateTime, 1000);
});

const currentView = ref(0);

const setCurrentView = (view, titleKey = 'welcome') => {
  currentView.value = view;
  updatePageTitle(titleKey);
};

const goToMainPage = () => {
  setCurrentView(0, 'welcome');
};

</script>

<template>
  <div class="page-header">
    <button class="home-button" @click="goToMainPage" title="Početna">
      <span class="pi pi-home"></span>
    </button>
    <div class="clock">{{ time }}</div>
    <div class="page-title">{{ pageTitle }}</div>
    <div class="logo">
      <img alt="HAIX logo" src="../src/assets/HAIX_group_blau.png" width="300" height="69" />
    </div>
  </div>

  <div class="background-wrapper">
    <MainPage :msg="welcomeMessage" :lang="currentLang" :updatePageTitle="updatePageTitle" :translations="translations"
      :currentView="currentView" :setCurrentView="setCurrentView" />
  </div>
  <div class="language-buttons">
    <button v-for="language in languages" :key="language.ID"
      :class="{ selected: currentLang === language.LanguageCode }" @click="() => changeLanguage(language.LanguageCode)"
      :disabled="currentTitleKey === 'adminPanel'">
      <span :class="language.Flag"></span> {{ language.Name }}
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

.home-button {
  background: white;
  border: none;
  font-size: 2.2em;
  cursor: pointer;
  margin-right: 1em;
  color: #000000;
  display: flex;
  align-items: center;
  position: absolute;
  left: 1.5em;
}

.home-button:hover {
  color: #2c3e50;
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

.language-buttons button:disabled,
.language-buttons button.disabled {
  opacity: 0;
  pointer-events: none;
  cursor: not-allowed;
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
