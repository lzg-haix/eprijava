<script setup>
import { ref, onMounted } from 'vue';
import SimpleKeyboard from './SimpleKeyboard.vue'
import SignUp from './SignUp.vue';

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

let allUsers = ref([])

const fetchOfflineUsers = async () => {
  try {
    const response = await PAS.get('/Visitors?filter=Online%20=%20No');
    allUsers.value = response.data;
  } catch (error) {
    console.error('Došlo je do greške kod dohvaćanja svih korisnika:', error);
  }
};

const props = defineProps({
  lang: {
    type: String,
    required: true,
  },
  offlineUsers: {
    type: Array,
    required: true,
  },
  translations: {
    type: Object,
    required: true,
  },
  goToMainPage: {
    type: Function,
    required: true,
  },
});

const step = ref(1);
const pinCode = ref('');

const nextStep = () => {
  if (step.value < 4) {
    step.value++;
  } else {
    handleLogIn();
  }
};

const loggedInUser = ref(null);
const showWelcomeMessage = ref(false);
const handleLogIn = async () => {
  try {
    const response = await PAS.get(`/Visitors?filter=PINCode%20=%20${pinCode.value}`);
    const user = response.data.dsVisitors.ttVisitors[0];
    if (user) {
      if (user.Online) {
        alert(`${user.fullName} is already logged in!`);
        step.value = 1;
        return;
      }
      loggedInUser.value = user;
      step.value = 2;
    } else {
      console.error('Invalid PIN code');
    }
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
  }
};

const confirmDetails = async () => {
  try {
    if (!loggedInUser.value) {
      console.error('No logged-in user found.');
      return;
    }

    loggedInUser.value.Online = true;
    const payload = {
      dsVisitors: {
        ttVisitors: [
          {
            ID: loggedInUser.value.ID,
            Online: true,
            VisitPurpose: loggedInUser.value.VisitPurpose || '',
            ContactPerson: loggedInUser.value.ContactPerson || '',
            PINCode: loggedInUser.value.PINCode || '',
            FullName: loggedInUser.value.FullName || '',
            CompanyName: loggedInUser.value.CompanyName || '',
            GDPRAgreement: loggedInUser.value.GDPRAgreement || false,
            Active: loggedInUser.value.Active || true,
            Inserted: loggedInUser.value.Inserted,
            Updated: new Date().toISOString(),
            UpdateUser: 'user/login',
            InsertUser: loggedInUser.value.InsertUser || '',
          }
        ]
      },
    };

    const response = await PAS.put(`/Visitors`, payload);

    if (response && response.data) {
      showWelcomeMessage.value = true;
      setTimeout(() => {
        showWelcomeMessage.value = false;
        props.goToMainPage();
      }, 2000); // Show message for 2 seconds
    } else {
      console.error('Unexpected response format:', response);
    }
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
  }
};

const skipStepTwo = ref(false);

const updateDetails = () => {
  step.value = 3;
  skipStepTwo.value = true;
};

const onChange = (inputValue) => {
  pinCode.value = inputValue;
};

onMounted(async () => {
  console.log('Offline korisnici:', props.offlineUsers);
  await fetchOfflineUsers();
});


</script>

<template>
  <div class="login-container">
    <!-- Step 1: Enter PIN -->
    <div id="pin-group" v-if="step === 1">
      <p id="pin-input">{{ translations[lang].enterPin }}</p>
      <input type="text" id="pinCode" v-model="pinCode" readonly maxlength="6"
        :placeholder="translations[lang].placeholderPin" />
      <SimpleKeyboard :input="pinCode" :lang="'num'" @onChange="onChange" />
      <button id="njekst" @click="() => { handleLogIn(); nextStep(); }">{{ translations[lang].next }}</button>
      <p id="forgot-password" @click="updateDetails" style="cursor: pointer; text-decoration: underline;">
        {{ translations[lang].forgotPassword }}
      </p>
    </div>

    <!-- Step 2: Welcome Message -->
    <div v-else-if="step === 2" class="welcome-message">
      <p>{{ translations[lang].welcomeBack }}, <strong>{{ loggedInUser?.FullName }}</strong>!</p>
      <p>
        <strong>{{ translations[lang].visitPurpose }}:</strong><br />
        {{ loggedInUser?.VisitPurpose || translations[lang].notProvided }}
      </p>
      <p>
        <strong>{{ translations[lang].contactPerson }}:</strong><br />
        {{ loggedInUser?.ContactPerson || translations[lang].notProvided }}
      </p>
      <p>{{ translations[lang].confirmDetails }}</p>
      <div class="button-group">
        <button @click="confirmDetails">{{ translations[lang].detailsCorrect }}</button>
        <button @click="updateDetails">{{ translations[lang].updateDetails }}</button>
      </div>
    </div>



    <!-- Step 5: Final Step -->
    <div v-else-if="step > 3">
      <p>{{ translations[lang].logInSuccessful }}</p>
    </div>

    <!-- Welcome Back Overlay -->
    <div v-if="showWelcomeMessage" class="welcome-overlay">
      <div class="welcome-popup">
        <h1>{{ translations[lang].welcomeBack }}, {{ loggedInUser?.FullName }}!</h1>
      </div>
    </div>
  </div>
  <!-- Reuse the SignUp component -->
  <SignUp v-if="step === 3" :lang="lang" :allUsers="allUsers" :translations="translations"
    :goToMainPage="() => props.goToMainPage(0, 'welcome')" :currentState="2" :loggedInUser="loggedInUser" />
</template>

<style scoped>
.simple-keyboard {
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  height: 50%;
  background-color: #2c3e50;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-container ::v-deep(.hg-button) {
  background-color: #ffffff;
  color: #2c3e50;
  font-size: 3rem;
  border: none;
  border-radius: 5px;
  padding: 2.5rem 1.5rem;
  margin: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-container ::v-deep(.hg-button:hover) {
  background-color: #2c3e50;
  color: #ffffff;
}

.login-container ::v-deep(.hg-button-active) {
  background-color: #ffffff !important;
  color: #2c3e50 !important;
  transition: none;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

#pin-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#pin-input {
  font-size: 2rem;
  margin-bottom: 2rem;
}

@keyframes movePlaceholder {
  0% {
    text-indent: 0;
  }

  50% {
    text-indent: 5em;
  }

  100% {
    text-indent: 0;
  }
}

#pinCode {
  font-size: 2rem;
  width: 20rem;
  padding: 1rem;
  border: 2px solid #2c3e50;
  border-radius: 5px;
  margin-bottom: 2rem;
}

#pinCode::placeholder {
  color: #aaa;
}

#njekst {
  font-size: 2rem;
  padding: 1.5rem 0;
  width: 5em;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login-container ::v-deep(.hg-button[data-skbtn="0"]) {
  flex: 2;
  text-align: center;
  padding: 2.5rem 3.5rem;
}

.login-container ::v-deep(.hg-button[data-skbtn="{bksp}"]) {
  flex: 2;
  text-align: center;
  padding: 2.5rem 0.3rem;
}

#forgot-password {
  margin-top: 1em;
}

/* Welcome Message Styles */
.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 80vw;
  margin: 0 auto;
}

.welcome-message p {
  font-size: 2.5rem;
  margin: 1rem 0;
  text-align: center;
  line-height: 1.4;
}

.welcome-message strong {
  color: #0492D2;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 2rem;
  margin-top: 3rem;
  justify-content: center;
}

.button-group button {
  font-size: 2rem;
  padding: 1.5rem 3rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 250px;
}

.button-group button:first-child {
  background-color: white;
  color: #2c3e50;
}

.button-group button:last-child {
  background-color: white;
  color: #2c3e50;
}

.button-group button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.button-group button:active {
  transform: translateY(0);
}

/* Welcome Overlay Styles */
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.welcome-popup {
  background: #1a252f;
  padding: 3rem 5rem;
  border-radius: 15px;
  animation: fadeIn 0.5s ease-out;
}

.welcome-popup h1 {
  color: white;
  font-size: 4rem;
  text-align: center;
  margin: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>