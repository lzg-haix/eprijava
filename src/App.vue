<script setup>
import { ref, onMounted } from 'vue'
import MainPage from './components/MainPage.vue'
import 'flag-icons/css/flag-icons.min.css' // za ikone zastava
import translations from './assets/translations.json' // za prijevode

let time = ref('') // trenutno vrijeme
let welcomeMessage = ref('') // poruka dobrodošlice
let currentLang = ref('hr') // zadani jezik je hrvatski

// funkcija za promjenu jezika
const changeLanguage = (lang) => {
  currentLang.value = lang // postavlja trenutni jezik na odabrani jezik
  // provjerava postoji li prijevod za zadani jezik u objektu translations
  if (translations[lang]) {
    // ako postoji, postavlja vrijednost welcomeMessage na prijevod za zadani jezik
    welcomeMessage.value = translations[lang].welcome
    console.log(`Language is now set to ${lang}.`)
  }
}

// funkcija za ažuriranje vremena
const updateTime = () => {
  const now = new Date() // trenutni datum i vrijeme
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  time.value = `${hours}:${minutes}:${seconds}`
}

// postavlja zadani jezik na hrvatski prilikom montiranja komponente
onMounted(() => {
  changeLanguage('hr') // postavlja jezik na hrvatski
  updateTime() // postavlja trenutno vrijeme
  setInterval(updateTime, 1000) // ažurira vrijeme svake sekunde
})

</script>

<template>
  <div class="page-header">
    <div class="clock">{{ time }}</div>
    <div class="logo">
      <img alt="HAIX logo" src="../src/assets/HAIX_group_blau.png" width="300" height="69" />
    </div>
  </div>

  <div class="background-wrapper">
    <MainPage :msg="welcomeMessage" :lang="currentLang" />
  </div>
  <div class="language-buttons">
    <button :class="{ selected: currentLang === 'en' }" @click="() => changeLanguage('en')"><span
        class="fi fi-gb"></span> EN</button>
    <button :class="{ selected: currentLang === 'hr' }" @click="() => changeLanguage('hr')"><span
        class="fi fi-hr"></span> HR</button>
    <button :class="{ selected: currentLang === 'de' }" @click="() => changeLanguage('de')"><span
        class="fi fi-de"></span> DE</button>
    <button :class="{ selected: currentLang === 'fr' }" @click="() => changeLanguage('fr')"><span
        class="fi fi-fr"></span> FR</button>
    <button :class="{ selected: currentLang === 'it' }" @click="() => changeLanguage('it')"><span
        class="fi fi-it"></span> IT</button>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.2rem 3rem;
  margin-top: 1rem;
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

.logo {
  position: absolute;
  right: 3em;
  top: 1px;
  z-index: 1;
}

.clock {
  text-align: center;
  font-size: 2em;
  position: relative;
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
