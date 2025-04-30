<script setup>
import { ref, onMounted } from 'vue';
import { PAS } from '@/utils/pas-util';
import SimpleKeyboard from './SimpleKeyboard.vue'; // Import the numerical keyboard component

const loggedInUsers = ref([]); // Stores the currently logged-in users
const pinCode = ref(''); // Stores the entered PIN code
const fullName = ref(''); // Stores the entered full name
const inputMode = ref('pin'); // Tracks the current input mode ('pin' or 'name')
const suggestedUsers = ref([]); // Stores suggested users for name input
const selectedUser = ref(null); // Stores the user selected from suggestions

// Fetch all logged-in users
const fetchLoggedInUsers = async () => {
  try {
    const response = await PAS.get('/users?online=true'); // Fetch users with `online: true`
    loggedInUsers.value = response.data;
    console.log('Logged-in users:', loggedInUsers.value);
  } catch (error) {
    console.error('Error fetching logged-in users:', error);
  }
};

// Logout a user by ID
const logoutUserById = async (userId) => {
  try {
    await PAS.patch(`/users/${userId}`, { online: false }); // Set `online` to `false`
    console.log(`User with ID ${userId} logged out.`);
    fetchLoggedInUsers(); // Refresh the list of logged-in users
  } catch (error) {
    console.error('Error logging out user:', error);
  }
};

// Logout a user by PIN
const logoutUserByPin = async () => {
  try {
    const response = await PAS.get(`/users?pinCode=${encodeURIComponent(pinCode.value)}`);
    const user = response.data[0]; // Get the first matching user
    if (user && user.online) {
      const confirmLogout = confirm(`Are you sure you want to log out ${user.fullName}?`);
      if (confirmLogout) {
        await logoutUserById(user.id);
        pinCode.value = ''; // Clear the PIN input
      }
    } else {
      alert('No matching online user found for the entered PIN.');
    }
  } catch (error) {
    console.error('Error logging out user by PIN:', error);
  }
};

// Handle full name input and show suggestions
const handleNameInput = () => {
  suggestedUsers.value = loggedInUsers.value.filter((user) =>
    user.fullName.toLowerCase().includes(fullName.value.toLowerCase())
  );
};

// Handle suggestion click
const selectUser = (user) => {
  selectedUser.value = user;
  const confirmLogout = confirm(`Are you sure you want to log out ${user.fullName}?`);
  if (confirmLogout) {
    logoutUserById(user.id);
    fullName.value = ''; // Clear the full name input
    suggestedUsers.value = []; // Clear suggestions
  }
};

// Handle input changes from the virtual keyboard
const onChange = (inputValue) => {
  if (inputMode.value === 'pin') {
    pinCode.value = inputValue; // Bind the virtual keyboard input to the PIN code
  } else {
    fullName.value = inputValue; // Bind the virtual keyboard input to the full name
    handleNameInput(); // Update suggestions
  }
};

// Fetch logged-in users when the component is mounted
onMounted(() => {
  fetchLoggedInUsers();
});
</script>

<template>
  <div class="logout-container">
    <!-- Input Mode Selector -->
    <div class="input-mode-selector">
      <button :class="{ active: inputMode === 'pin' }" @click="inputMode = 'pin'">Use PIN</button>
      <button :class="{ active: inputMode === 'name' }" @click="inputMode = 'name'">Use Full Name</button>
    </div>

    <!-- PIN Input -->
    <div v-if="inputMode === 'pin'" class="pin-input">
      <p>Enter your PIN:</p>
      <input type="text" v-model="pinCode" readonly maxlength="4" placeholder="Enter PIN" />
      <SimpleKeyboard :input="pinCode" :lang="'num'" @onChange="onChange" />
      <button @click="logoutUserByPin">Log Out</button>
    </div>

    <!-- Full Name Input -->
    <div v-else class="name-input">
      <p>Enter your full name:</p>
      <input type="text" v-model="fullName" placeholder="Enter Full Name" />
      <SimpleKeyboard :input="fullName" :lang="'qwerty'" @onChange="onChange" />
      <div class="suggestions">
        <p v-if="suggestedUsers.length === 0">No suggestions available.</p>
        <div v-for="user in suggestedUsers" :key="user.id" class="suggestion-card" @click="selectUser(user)">
          <p>{{ user.fullName }}</p>
          <p>{{ user.companyName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;
}

.input-mode-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-mode-selector button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #2c3e50;
  color: white;
}

.input-mode-selector button.active {
  background-color: #007bff;
}

.suggestions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-card {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.suggestion-card:hover {
  background-color: #e0e0e0;
}

.simple-keyboard {
  position: fixed;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 35%;
  background-color: #2c3e50;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

::v-deep(.hg-button) {
  background-color: #ffffff;
  color: #2c3e50;
  font-size: 2rem;
  border: none;
  border-radius: 5px;
  padding: 1.75rem 1.5rem;
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

.suggestion-card p {
  color: #2c3e50;
}

/* ::v-deep(.hg-button:hover) {
  background-color: #2c3e50;
  color: #ffffff;
}

::v-deep(.hg-button-active) {
  background-color: #ffffff !important;
  color: #2c3e50 !important;
  transition: none;
} */

/* ::v-deep(.hg-button[data-skbtn="0"]) {
  flex: 2;
  text-align: center;
  padding: 2.5rem 3.5rem;
}

::v-deep(.hg-button[data-skbtn="{bksp}"]) {
  flex: 2;
  text-align: center;
  padding: 2.5rem 0.3rem;
} */
</style>
