<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
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

const props = defineProps({
  msg: String,
  lang: String,
  updatePageTitle: Function,
  translations: Object,
  currentView: Number,
  setCurrentView: Function
})

let allUsers = ref([])
const getAllUsers = async () => {
  try {
    const response = await PAS.get('/Visitors');
    allUsers.value = response.data.dsVisitors.ttVisitors;
  } catch (error) {
    console.error('*** PAS: Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
};

let onlineUsers = ref([])
const filterOnlineUsers = async () => {
  try {
    onlineUsers.value = allUsers.value.filter(user => user.Online);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja online korisnika:', error);
  }
};

let offlineUsers = ref([])
const filterOfflineUsers = async () => {
  try {
    offlineUsers.value = allUsers.value.filter(user => !user.Online);
  } catch (error) {
    console.error('Došlo je do greške kod filtriranja offline korisnika:', error);
  }
};

const getUsers = async () => {
  try {
    await getAllUsers();
    await filterOnlineUsers();
    await filterOfflineUsers();
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
}

const showView = (view, titleKey) => {
  props.setCurrentView(view, titleKey);
  props.updatePageTitle(titleKey);
};

onMounted(async () => {
  await getUsers();
  showView(0, 'welcome');
});

// Add isAdmin ref
const isAdmin = ref(false);

// Add handler for admin status
const handleAdminStatus = (status) => {
  isAdmin.value = status;
  if (status) {
    showView(4, 'adminPanel');
  } else {
    showView(0, 'welcome');
  }
};
</script>

<template>
  <div class="greetings">
    <div class="button-container" v-if="currentView === 0">
      <button @click="showView(1, 'signUp')">{{ translations[lang]?.signUp }}</button>
      <button @click="showView(2, 'signIn')">{{ translations[lang]?.signIn }}</button>
      <button @click="showView(3, 'logOut')">{{ translations[lang]?.logOut }}</button>
      <!-- <button @click="showView(4, 'adminPanel')">admin</button> -->
    </div>
    <SignUp v-else-if="currentView === 1" :lang="lang" :allUsers="allUsers" :translations="translations"
      :goToMainPage="() => showView(0, 'welcome')" :currentState="1" @pushNewUser="getUsers()" />
    <LogIn v-else-if="currentView === 2" :lang="lang" :offlineUsers="offlineUsers" :translations="translations"
      :goToMainPage="() => showView(0, 'welcome')" @isAdmin="handleAdminStatus" />
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
</style>
