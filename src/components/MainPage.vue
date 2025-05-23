<script setup>
import { ref, onMounted } from 'vue'
import SignUp from './SignUp.vue'
import LogIn from './LogIn.vue'
import LogOut from './LogOut.vue'
import AdminPanel from './AdminPanel.vue'

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

const props = defineProps({
  msg: String, // poruka dobrodošlice
  lang: String, // trenutni jezik
  updatePageTitle: Function, // funkcija za ažuriranje naslova stranice
  translations: Object, // prijevodi proslijeđeni iz App.vue
  currentView: Number, // trenutni prikaz (0 - dobrodošlica, 1 - registracija, 2 - prijava, 3 - odjava, 4 - admin panel)
  setCurrentView: Function // funkcija za postavljanje trenutnog prikaza
})

// dohvaćanje svih korisnika preko API-ja
let allUsers = ref([])
const getAllUsers = async () => {
  try {
    const response = await oepas_dev2.get('/Visitors');
    allUsers.value = response.data.dsVisitors.ttVisitors;
  } catch (error) {
    console.error('*** oepas_dev2: Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
};

// filtriranje online korisnika
let onlineUsers = ref([])
const filterOnlineUsers = async () => {
  try {
    // filtriraj online korisnike iz već dohvaćenih korisnika
    onlineUsers.value = allUsers.value.filter(user => user.Online);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja online korisnika:', error);
  }
};

// filtriranje offline korisnika
let offlineUsers = ref([]) // offline korisnici, proslijeđuju se na registraciju i prijavu
const filterOfflineUsers = async () => {
  try {
    offlineUsers.value = allUsers.value.filter(user => !user.Online);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja offline korisnika:', error);
  }
};

// konsolidirani poziv za metode za dohvaćanje i filtriranje korisnika
const getUsers = async () => {
  try {
    await getAllUsers();
    await filterOnlineUsers();
    await filterOfflineUsers();
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
}

//const currentView = ref(0); // trenutni prikaz (0 - dobrodošlica, 1 - registracija, 2 - prijava, 3 - odjava, 4 - admin panel)

// prikaži određeni prikaz i ažuriraj naslov stranice
const showView = (view, titleKey) => {
  props.setCurrentView(view, titleKey); // postavi trenutni prikaz
  props.updatePageTitle(titleKey); // proslijedi ključ za prijevod naslova
};

onMounted(async () => {
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
      :goToMainPage="() => showView(0, 'welcome')" :currentState="1" @pushNewUser="getUsers()" />
    <LogIn v-else-if="currentView === 2" :lang="lang" :offlineUsers="offlineUsers" :translations="translations"
      :goToMainPage="() => showView(0, 'welcome')" />
    <LogOut v-else-if="currentView === 3" />
    <AdminPanel v-else-if="currentView === 4" :translations="translations" />
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
  gap: 1em;
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
