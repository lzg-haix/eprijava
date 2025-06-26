<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import MainPage from './components/MainPage.vue';
import EvacuationGrid from './components/EvacuationGrid.vue';
import 'flag-icons/css/flag-icons.min.css';

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

// pizdarija za IE11
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

let time = ref('');
let welcomeMessage = ref('');
let currentLang = ref('hr');
let pageTitle = ref('');
let currentTitleKey = ref('welcome');


let languages = ref([]);
let translations = ref({});

const onlineUsers = ref([]);
const getOnlineUsers = async () => {
  try {
    const response = await PAS.get('/Visitors?filter=Online%20=%20yes');
    onlineUsers.value = response.data.dsVisitors.ttVisitors;
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja online korisnika:', error);
  }
};

const getLanguages = async () => {
  try {
    const response = await PAS.get('/Languages?filter=Active%20=%20yes');
    languages.value = response.data.dsLanguages.ttLanguages
      .filter((language) => language.Active)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja jezika:', error);
  }
};

const getTranslations = async () => {
  try {
    const response = await PAS.get('/LanguagesEntries');
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
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja prijevoda:', error);
  }
};

const changeLanguage = (lang) => {
  currentLang.value = lang;
  if (translations.value[lang] && translations.value[lang].welcome) {
    welcomeMessage.value = translations.value[lang].welcome;
  } else {
    welcomeMessage.value = '';
    console.warn(`Prijevod za jezik "${lang}" nije pronađen.`);
  }
};

const updatePageTitle = (key) => {
  currentTitleKey.value = key;
  if (key === 'adminPanel') {
    pageTitle.value = 'Administracijski panel';
  } else if (translations.value[currentLang.value] && translations.value[currentLang.value][key]) {
    pageTitle.value = translations.value[currentLang.value][key];
  } else if (key === 'vatrodojava') {
    pageTitle.value = 'Trenutno prisutni gosti';
  }
  else {
    pageTitle.value = '';
    console.warn(`Prijevod s ključem "${key}" nije pronađen u jeziku "${currentLang.value}".`);
  }
};

watch(currentLang, () => {
  updatePageTitle(currentTitleKey.value);
});

const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  time.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(async () => {
  await getLanguages();
  await getTranslations();
  changeLanguage('hr');
  updatePageTitle('welcome');
  updateTime();
  setInterval(updateTime, 1000);
  scheduleMidnightReset();
  // setAllOnlineUsersOffline();
  // Add event listeners for user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetInactivityTimer);
  });

  // Start the initial timer
  resetInactivityTimer();
});

const currentView = ref(0);

const setCurrentView = (view, titleKey = 'welcome') => {
  currentView.value = view;
  updatePageTitle(titleKey);
};

const setAllOnlineUsersOffline = async () => {
  try {
    const response = await PAS.get('/Visitors?filter=Online=true');
    const onlineUsers = response.data.dsVisitors.ttVisitors;
    if (!onlineUsers || onlineUsers.length === 0) return;

    const payload = {
      dsVisitors: {
        ttVisitors: onlineUsers.map(user => ({
          ...user,
          Online: false,
          UpdateUser: 'system/midnight',
          Updated: new Date().toISOString(),
        }))
      }
    };

    await PAS.put('/Visitors', payload);
    console.log('All online users set to offline at midnight.');
    getOnlineUsers();
  } catch (error) {
    console.error('Error setting online users to offline at midnight:', error);
  }
};

const scheduleMidnightReset = () => {
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      setAllOnlineUsersOffline();
    }
  }, 60 * 1000);
};

const evacuationGrid = ref(false);
const homeButtonVisible = ref(true);

const goToMainPage = () => {
  evacuationGrid.value = false;
  window.location.reload();
  setCurrentView(0, 'welcome');
};

const toggleEvacuationGrid = () => {
  evacuationGrid.value = !evacuationGrid.value;
  if (evacuationGrid.value) {
    homeButtonVisible.value = false;
    updatePageTitle('vatrodojava');
    setTimeout(() => {
      homeButtonVisible.value = true;
    }, 1000);
  }
  console.log('Evacuation grid toggled:', evacuationGrid.value);
};

// Inactivity handling
const INACTIVITY_TIMEOUT = 120000; // 2 minutes in milliseconds
let inactivityTimer = null;

const resetInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  inactivityTimer = setTimeout(() => {
    console.log('No activity detected for 2 minutes, refreshing page...');
    window.location.reload();
  }, INACTIVITY_TIMEOUT);
};

onUnmounted(() => {
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
    document.removeEventListener(evt, resetInactivityTimer);
  });
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
});
</script>

<template>
  <div class="page-header">
    <div class="home-button" title="Početna" :class="{ 'home-button-hidden': homeButtonVisible.value }">
      <span v-if="!evacuationGrid" class="pi pi-print" id="evacuation" @click="toggleEvacuationGrid"></span>
      <span v-if="homeButtonVisible" class="pi pi-home" @click="goToMainPage"></span>
    </div>
    <div class="clock" :class="{ 'clock-evacuation': evacuationGrid }">{{ time }}</div>
    <div v-if="!evacuationGrid" class="page-title">{{ pageTitle }}</div>
    <div v-if="!evacuationGrid" class="logo">
      <img alt="HAIX logo" src="../src/assets/HAIX_group_blau.png" width="300" height="69" />
    </div>
  </div>

  <div v-if="!evacuationGrid" class="background-wrapper">
    <MainPage :msg="welcomeMessage" :lang="currentLang" :updatePageTitle="updatePageTitle" :translations="translations"
      :currentView="currentView" :setCurrentView="setCurrentView" />
  </div>
  <div v-if="!evacuationGrid" class="language-buttons">
    <button v-for="language in languages" :key="language.ID"
      :class="{ selected: currentLang === language.LanguageCode }" @click="() => changeLanguage(language.LanguageCode)"
      :disabled="currentTitleKey === 'adminPanel'">
      <span :class="language.Flag"></span> {{ language.Name }}
    </button>
  </div>
  <EvacuationGrid v-if="evacuationGrid" />
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
  z-index: 10000;
  transition: opacity 0.3s ease;
  gap: 1em;
}

.home-button-hidden {
  opacity: 0;
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

.clock-evacuation {
  opacity: 0;
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
  border-radius: 0.1em;
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
  /* border-radius: 0 0 0.2em 0.2em; */
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
  border-radius: 2px;
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
