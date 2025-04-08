<script setup>
import { ref, onMounted, watch } from 'vue';
import MainPage from './components/MainPage.vue';
import 'flag-icons/css/flag-icons.min.css';

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js.');
} else {
  console.log('PAS instanca povezana.');
}

let time = ref(''); // trenutno vrijeme
let welcomeMessage = ref(''); // poruka dobrodošlice
let currentLang = ref('hr'); // defaultni jezik je hrvatski
let pageTitle = ref('Dobardan'); // naslov stranice
let currentTitleKey = ref('welcome'); // defaultni ključ naslova
let translations = ref({}); // prijevodi

// dohvaćanje prijevoda preko API-ja
const fetchTranslations = async () => {
  try {
    const response = await PAS.get('/translations');
    translations.value = response.data;
    console.log('Prijevodi uspješno dohvaćeni:', translations.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja prijevoda:', error);
  }
};

// promjena jezika
const changeLanguage = (lang) => {
  currentLang.value = lang; // postavi trenutni jezik
  if (translations.value[lang]) {
    welcomeMessage.value = translations.value[lang].welcome; // apdejtaj poruku dobrodošlice
    console.log(`Jezik je postavljen na "${lang}".`);
  } else {
    console.warn(`Prijevod za jezik "${lang}" nije pronađen.`); // upozorenje ako jezik nije podržan
  }
};

// funkcija za promjenu naslova na temelju ključa
const updatePageTitle = (key) => {
  currentTitleKey.value = key; // pospremi ključ naslova
  if (translations.value[currentLang.value] && translations.value[currentLang.value][key]) {
    pageTitle.value = translations.value[currentLang.value][key]; // dohvati naslov iz prijevoda
    console.log(`Naslov promijenjen: ${pageTitle.value}`);
  } else {
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

// dohvati prijevode i postavi jezik na hrvatski
onMounted(async () => {
  await fetchTranslations(); // dinamički učitaj prijevode
  changeLanguage('hr'); // postavi jezik na hrvatski
  updatePageTitle('welcome'); // inicijaliziraj naslov
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
    <!-- updatePageTitle ulazi kao prop radi dinamične promjene naslova, ovisno o odabranom koraku -->
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
