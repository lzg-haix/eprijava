<script setup>
import { ref, onMounted } from 'vue'
import SignUp from './SignUp.vue'
import LogIn from './LogIn.vue'
import LogOut from './LogOut.vue'
import AdminPanel from './AdminPanel.vue'
// import registeredUsers from '../assets/registeredUsers.json'

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

const props = defineProps({
  msg: String, // poruka dobrodošlice
  lang: String, // trenutni jezik
  updatePageTitle: Function, // funkcija za ažuriranje naslova stranice
  translations: Object, // prijevodi proslijeđeni iz App.vue
})

let allUsers = ref([]) // svi korisnici
let onlineUsers = ref([]) // online korisnici
let offlineUsers = ref([]) // offline korisnici, proslijeđuju se na registraciju i prijavu

// dohvaćanje svih korisnika preko API-ja
const fetchAllUsers = async () => {
  try {
    const response = await PAS.get('/users'); // Dohvati sve korisnike iz db.json
    allUsers.value = response.data; // Spremi sve korisnike
    console.log('Svi korisnici uspješno dohvaćeni:', allUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
};

// filtriranje online korisnika
const filterOnlineUsers = async () => {
  try {
    // filtriraj online korisnike iz već dohvaćenih korisnika
    onlineUsers.value = allUsers.value.filter(user => user.online);
    // console.log('Online korisnici uspješno filtrirani:', onlineUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja online korisnika:', error);
  }
};

// filtriranje offline korisnika
const filterOfflineUsers = async () => {
  try {
    // filtriraj offline korisnike iz već dohvaćenih korisnika
    offlineUsers.value = allUsers.value.filter(user => !user.online);
    // console.log('Offline korisnici uspješno filtrirani:', offlineUsers.value);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja offline korisnika:', error);
  }
};

// konsolidirani poziv za metode za dohvaćanje i filtriranje korisnika
const getUsers = async () => { // pri montiranju komponente
  try {
    await fetchAllUsers(); // dohvaćanje svih korisnika
    await filterOnlineUsers(); // filtriranje online korisnika
    await filterOfflineUsers(); // filtriranje offline korisnika
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
}

const currentView = ref(4); // pratimo trenutni prikaz

// prikaži određeni prikaz i ažuriraj naslov stranice
const showView = (view, titleKey) => {
  currentView.value = view;
  props.updatePageTitle(titleKey); // proslijedi ključ za prijevod naslova
};

onMounted(async () => {
  // potegne i filtrira korisnike
  await getUsers();
});

</script>

<template>
  <div class="greetings">
    <div class="button-container" v-if="currentView === 0">
      <button @click="showView(1, 'signUp')">{{ translations[lang]?.signUp }}</button>
      <button @click="showView(2, 'signIn')">{{ translations[lang]?.signIn }}</button>
      <button @click="showView(3, 'logOut')">{{ translations[lang]?.logOut }}</button>
      <button @click="showView(4, 'adminPanel')">admin</button>
    </div>
    <SignUp v-else-if="currentView === 1" :lang="lang" :allUsers="allUsers" :translations="translations"
      :goToMainPage="() => showView(0, 'welcome')" :currentState="1" />
    <LogIn v-else-if="currentView === 2" :lang="lang" :offlineUsers="offlineUsers" :translations="translations"
      :goToMainPage="() => showView(0, 'welcome')" />
    <LogOut v-else-if="currentView === 3" />
    <AdminPanel v-else-if="currentView === 4" />
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -0.75em;
  color: white;
}

h3 {
  font-size: 1.2rem;
}

.greetings {
  margin-top: 1.2em;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10em;
  margin-top: 5.5rem;
}

.button-container button {
  padding: 3rem 2rem;
  font-size: 2rem;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  background-color: #ffffff;
  color: #2c3e50;
  width: 25rem;
}

.button-container button:hover {
  background-color: #ffffff;
}

.simple-keyboard {
  max-width: 850px;
}

/* .blue {
  position: absolute;
  color: #2c3e50;
  left: 50%;
  transform: translateX(-50%);
} */
</style>
