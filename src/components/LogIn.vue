<script setup>
import { ref, computed } from 'vue';
import SimpleKeyboard from './SimpleKeyboard.vue' // import virtualne tipkovnice - vanjski library
import translations from '../assets/translations.json' // za prijevode
import registeredUsers from '../assets/registeredUsers.json' // za registrirane korisnike

const props = defineProps({
  lang: {
    type: String,
    required: true,
  },
  allUsers: { // svi korisnici
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

// Computed property to retrieve translations based on the current language
const t = computed(() => translations[props.lang] || translations['en']);

const users = ref([...registeredUsers]); // Stores the list of registered users

const step = ref(1);
const pinCode = ref(''); // Stores the entered PIN code
const errorMessage = ref(''); // Stores error messages for invalid PINs

const nextStep = () => {
  if (step.value < 2) {
    step.value++;
  } else {
    handleLogIn();
  }
};

// tu bude isla logika tipa ako korisnik unese pin od 4 broja,
// onda se prikaže korak s korisnikovim podacima i da mu se printa badge
// ako korisnik unese krivi pin, da mu se prikaže poruka da je krivo unio pin
// i da mu se ponovno prikaže polje za unos pin-a
// jedino ne znam dal bude kontakt osoba navek ista ili bumo dodali opciju 
// potvrde ili ponovnog odabira kontakt osobe
const handleLogIn = () => {
  // Handle the log-in logic here
  console.log('PIN Code:', pinCode.value);
};

// Function to handle input changes from the virtual keyboard
const onChange = (inputValue) => {
  pinCode.value = inputValue; // Bind the virtual keyboard input to the PIN code
};

</script>

<template>
  <div class="login-container">
    <div id="pin-group" v-if="step === 1">
      <p id="pin-input">{{ t.enterPin }}</p>
      <input type="text" id="pinCode" v-model="pinCode" readonly maxlength="4" :placeholder="t.placeholderPin" />
      <SimpleKeyboard :input="pinCode" :lang="'num'" @onChange="onChange" />
      <button id="njekst" @click="nextStep">{{ t.next }}</button>
    </div>
    <div v-else-if="step === 2">
      <p>{{ t.welcomeBack }}</p>
      <!-- Add logic to display user data and badge here -->
      <button @click="nextStep">{{ t.confirm }}</button>
    </div>
    <div v-else>
      <p>Log in successful!</p>
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