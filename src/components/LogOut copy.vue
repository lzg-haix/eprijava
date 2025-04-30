<script setup>
import { ref, onMounted } from 'vue';
import { PAS } from '@/utils/pas-util';
import SimpleKeyboard from './SimpleKeyboard.vue'; // Import the numerical keyboard component

const loggedInUsers = ref([]); // Stores the currently logged-in users
const pinCode = ref(''); // Stores the entered PIN code

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
      await PAS.patch(`/users/${user.id}`, { online: false }); // Set `online` to `false`
      console.log(`User with PIN ${pinCode.value} logged out.`);
      fetchLoggedInUsers(); // Refresh the list of logged-in users
      pinCode.value = ''; // Clear the PIN input
    } else {
      console.error('No matching online user found for the entered PIN.');
    }
  } catch (error) {
    console.error('Error logging out user by PIN:', error);
  }
};

// Handle input changes from the virtual keyboard
const onChange = (inputValue) => {
  pinCode.value = inputValue; // Bind the virtual keyboard input to the PIN code
};

// Fetch logged-in users when the component is mounted
onMounted(() => {
  fetchLoggedInUsers();
});
</script>

<template>
  <div class="logout-container">
    <!-- Left Side: Select from Logged-in Users -->
    <div class="logout-left">
      <h2>Currently Logged-in Users</h2>
      <ul>
        <li v-for="user in loggedInUsers" :key="user.id">
          <span @click="logoutUserById(user.id)" class="clickable-name">{{ user.fullName }}</span>
        </li>
      </ul>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Right Side: Enter PIN to Log Out -->
    <div class="logout-right">
      <h2>Log Out by PIN</h2>
      <input type="text" v-model="pinCode" maxlength="4" placeholder="Enter PIN" readonly />
      <SimpleKeyboard :input="pinCode" :lang="'num'" @onChange="onChange" />
      <button @click="logoutUserByPin">Log Out</button>
    </div>
  </div>
</template>

<style scoped>
.logout-container {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  align-items: stretch;
  height: 100vh;
  box-sizing: border-box;
}

.logout-left,
.logout-right {
  width: 45%;
}

.divider {
  width: 2px;
  background-color: #ccc;
  height: 80%;
  align-self: stretch;
}

.logout-left ul {
  list-style: none;
  padding: 0;
}

.logout-left li {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.logout-left .clickable-name {
  display: inline-block;
  /* Make it behave like a box */
  padding: 10px 15px;
  /* Add padding for a box-like appearance */
  background-color: #f8f9fa;
  /* Light gray background */
  color: #333;
  /* Dark text color */
  border: 1px solid #ccc;
  /* Add a border */
  border-radius: 5px;
  /* Rounded corners */
  cursor: pointer;
  /* Pointer cursor to indicate interactivity */
  text-align: center;
  /* Center the text */
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  /* Smooth hover effect */
}

.logout-left .clickable-name:hover {
  background-color: #e9ecef;
  /* Slightly darker background on hover */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  /* Add a subtle shadow on hover */
}

.logout-right input {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.logout-right .simple-keyboard {
  margin-top: 10px;
}

.simple-keyboard {
  position: fixed;
  bottom: 10rem;
  left: 75%;
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
