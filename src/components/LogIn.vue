<script setup>
import { ref, onMounted } from 'vue';
import SimpleKeyboard from './SimpleKeyboard.vue' // import virtualne tipkovnice - vanjski library
import SignUp from './SignUp.vue';

import { PAS } from '@/utils/pas-util';
if (!PAS) {
  console.error('PAS instanca nije dostupna. Provjerite postavke u utils/pas-util.js ili postavke OEPAS servera.');
} else {
  // console.log('PAS instanca povezana.');
}

let allUsers = ref([]) // svi korisnici


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

const props = defineProps({
  lang: {
    type: String,
    required: true,
  },
  offlineUsers: { // svi korisnici
    type: Array,
    required: true,
  },
  translations: { // prijevodi
    type: Object,
    required: true,
  },
  goToMainPage: { // funkcija za povratak na glavnu stranicu, pozvana nakon pri završetku registracije
    type: Function,
    required: true,
  },
});

const step = ref(1);
const pinCode = ref(''); // Stores the entered PIN code

const nextStep = () => {
  if (step.value < 4) {
    step.value++;
  } else {
    handleLogIn();
  }
};

const loggedInUser = ref(null); // Stores the logged-in user's details

// login
const handleLogIn = async () => {
  try {
    // Send a GET request to the backend to find a user with the entered PIN
    const response = await PAS.get(`/users?pinCode=${encodeURIComponent(pinCode.value)}`);
    const user = response.data[0]; // JSON Server returns an array, so get the first match

    if (user) {
      // User found, proceed with login
      console.log('User logged in:', user);
      loggedInUser.value = user; // Store the logged-in user's details
      step.value = 2; // Move to the welcome message step
    } else {
      // User not found, show error message
      console.error('Invalid PIN code');
    }
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
  }
};

const confirmDetails = () => {
  // If the details are correct, proceed to the main page
  props.goToMainPage();
};

const updateDetails = () => {
  // If the user wants to update their details, move to the SignUp component
  step.value = 3; // Move to the SignUp step
};

// Function to handle input changes from the virtual keyboard
const onChange = (inputValue) => {
  pinCode.value = inputValue; // Bind the virtual keyboard input to the PIN code
};

onMounted(async () => {
  console.log('Offline korisnici:', props.offlineUsers);
  await fetchAllUsers(); // Fetch all users when the component is mounted
});


</script>

<template>
  <div class="login-container">
    <!-- Step 1: Enter PIN -->
    <div id="pin-group" v-if="step === 1">
      <p id="pin-input">{{ translations[lang].enterPin }}</p>
      <input type="text" id="pinCode" v-model="pinCode" readonly maxlength="4"
        :placeholder="translations[lang].placeholderPin" />
      <SimpleKeyboard :input="pinCode" :lang="'num'" @onChange="onChange" />
      <button id="njekst" @click="() => { handleLogIn(); nextStep(); }">{{ translations[lang].next }}</button>
    </div>

    <!-- Step 2: Welcome Message -->
    <div v-else-if="step === 2">
      <p>{{ translations[lang].welcomeBack }}, {{ loggedInUser?.fullName }}!</p>
      <p>
        <strong>{{ translations[lang].visitPurpose }}:</strong> {{ loggedInUser?.visitPurpose ||
          translations[lang].notProvided }}
      </p>
      <p>
        <strong>{{ translations[lang].contactPerson }}:</strong> {{ loggedInUser?.contactPerson ||
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
      :goToMainPage="() => props.goToMainPage(0, 'welcome')" :currentState="2" />

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
    /* Move placeholder to the right */
  }

  100% {
    text-indent: 0;
    /* Move placeholder back to the left */
  }
}

#pinCode {
  font-size: 2rem;
  width: 20rem;
  padding: 1rem;
  border: 2px solid #2c3e50;
  border-radius: 5px;
  margin-bottom: 2rem;
  /* Apply the animation to the input field */
}

#pinCode::placeholder {
  color: #aaa;
  /* Optional: Customize placeholder color */
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
  /* Make the "0" key twice as wide as other keys */
  text-align: center;
  /* Center the text inside the key */
  padding: 2.5rem 3.5rem;
  /* Adjust padding for better appearance */
}

::v-deep(.hg-button[data-skbtn="{bksp}"]) {
  flex: 2;
  /* Make the "0" key twice as wide as other keys */
  text-align: center;
  /* Center the text inside the key */
  padding: 2.5rem 0.3rem;
  /* Adjust padding for better appearance */
}
</style>