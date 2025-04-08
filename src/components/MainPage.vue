<script setup>
import { ref, computed } from 'vue'
import translations from '../assets/translations.json'
import SignUp from './SignUp.vue'
import LogIn from './LogIn.vue'
import LogOut from './LogOut.vue'
import registeredUsers from '../assets/registeredUsers.json'

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js.');
} else {
  console.log('PAS instanca povezana.');
}

const props = defineProps({
  msg: String, // poruka dobrodošlice
  lang: String, // trenutni jezik
  updatePageTitle: Function, // funkcija za ažuriranje naslova stranice
})

const currentView = ref(0); // pratimo trenutni prikaz

// registrirani korisnici - obsoletno - dohvaća se preko PAS-a
const users = ref([...registeredUsers])

// dodaj novog korisnika
const addUser = (newUser) => {
  users.value.push(newUser)
  console.log('New user added:', newUser)
  console.log('Updated list of users:', users.value)
  console.log('Online Users:', onlineUsers.value)
    ;
}

const onlineUsers = computed(() => { // prikaži samo korisnike koji su online
  return users.value.filter(user => user.online);
});

// Show a specific view and update the page title
const showView = (view, titleKey) => {
  currentView.value = view;
  props.updatePageTitle(titleKey); // Pass the translation key to update the title
};

</script>

<template>
  <div class="greetings">
    <div class="button-container" v-if="currentView === 0">
      <button @click="showView(1, 'signUp')">{{ translations[lang].signUp }}</button>
      <button @click="showView(2, 'signIn')">{{ translations[lang].signIn }}</button>
      <button @click="showView(3, 'logOut')">{{ translations[lang].logOut }}</button>
    </div>
    <SignUp v-else-if="currentView === 1" :lang="lang" :addUser="addUser"
      :goToMainPage="() => showView(0, 'welcome')" />
    <LogIn v-else-if="currentView === 2" :lang="lang" />
    <LogOut v-else-if="currentView === 3" />
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
  gap: 7.5em;
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
