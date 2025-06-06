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
      console.log('User updated successfully:', response.data);
    } else {
      console.error('Unexpected response format:', response);
    }

    props.goToMainPage();
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
    <div v-else-if="step === 2">
      <p>{{ translations[lang].welcomeBack }}, {{ loggedInUser?.FullName }}!</p>
      <p>
        <strong>{{ translations[lang].visitPurpose }}:</strong> {{ loggedInUser?.VisitPurpose ||
          translations[lang].notProvided }}
      </p>
      <p>
        <strong>{{ translations[lang].contactPerson }}:</strong> {{ loggedInUser?.ContactPerson ||
          translations[lang].notProvided }}
      </p>
      <p>{{ translations[lang].confirmDetails }}</p>
      <div class="button-group">
        <button @click="confirmDetails">{{ translations[lang].detailsCorrect }}</button>
        <button @click="updateDetails">{{ translations[lang].updateDetails }}</button>
      </div>
    </div>

    <!-- Reuse the SignUp component -->
    <SignUp v-else-if="step === 3" :lang="lang" :allUsers="allUsers" :translations="translations"
      :goToMainPage="() => props.goToMainPage(0, 'welcome')" :currentState="2" :loggedInUser="loggedInUser" />

    <!-- Step 5: Final Step -->
    <div v-else>
      <p>{{ translations[lang].logInSuccessful }}</p>
    </div>
  </div>
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

::v-deep(.hg-button) {
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

::v-deep(.hg-button:hover) {
  background-color: #2c3e50;
  color: #ffffff;
}

::v-deep(.hg-button-active) {
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

::v-deep(.hg-button[data-skbtn="0"]) {
  flex: 2;
  text-align: center;
  padding: 2.5rem 3.5rem;
}

::v-deep(.hg-button[data-skbtn="{bksp}"]) {
  flex: 2;
  text-align: center;
  padding: 2.5rem 0.3rem;
}

#forgot-password {
  margin-top: 1em;
}
</style>