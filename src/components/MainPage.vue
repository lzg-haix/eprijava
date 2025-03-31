<script setup>
import { ref, computed } from 'vue'
import translations from '../assets/translations.json'
import SignUp from './SignUp.vue'
import LogIn from './LogIn.vue'
import LogOut from './LogOut.vue'
import registeredUsers from '../assets/registeredUsers.json'

const props = defineProps({
  msg: { // naslov
    type: String,
    required: true,
  },
  lang: { // jezik
    type: String,
    required: true,
  },
})

const currentView = ref(0) // 0: buttons, 1: SignUp, 2: LogIn, 3: LogOut

// registrirani korisnici
const users = ref([...registeredUsers])

// dodaj novog korisnika
const addUser = (newUser) => {
  users.value.push(newUser)
  console.log('New user added:', newUser)
  console.log('Updated list of users:', users.value)
  console.log('Online Users:', onlineUsers.value);
}

const onlineUsers = computed(() => { // prikaži samo korisnike koji su online
  return users.value.filter(user => user.online);
});

const buttonLabels = computed(() => { // prijevod gumba
  return translations[props.lang] || translations['en']
})

// prijevod naslova
const viewTitles = computed(() => {
  return {
    0: props.msg,
    1: buttonLabels.value.signUp,
    2: buttonLabels.value.signIn,
    3: buttonLabels.value.logOut
  }
})

// prikaži određeni view
const showView = (view) => {
  currentView.value = view
}

</script>

<template>
  <div class="greetings">
    <h1 class="blue">{{ viewTitles[currentView] }}</h1>
    <div class="button-container" v-if="currentView === 0">
      <button @click="showView(1)">{{ buttonLabels.signUp }}</button>
      <button @click="showView(2)">{{ buttonLabels.signIn }}</button>
      <button @click="showView(3)">{{ buttonLabels.logOut }}</button>
    </div>
    <SignUp v-else-if="currentView === 1" :lang="lang" :addUser="addUser" :goToMainPage="() => showView(0)" />
    <LogIn v-else-if="currentView === 2" :lang="lang" />
    <LogOut v-else-if="currentView === 3" />
  </div>
  <div id="app">
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

.greetings h1,
.greetings h3 {
  text-align: center;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7.5rem;
  margin-top: 5rem;
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
</style>
