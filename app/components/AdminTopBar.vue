<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { ref } from 'vue';

const runtimeConfig = useRuntimeConfig();
const requestURL = useRequestURL();
const rootUrl = requestURL.origin + runtimeConfig.app.baseURL.slice(0,-1);
const nuxtApp = useNuxtApp();

let admin = ref(false);
let maintainer = ref(false);

const goToAdmin = () => {
    return navigateTo("/admin");
};

const goToHP = () => {
    return navigateTo("/hp");
};

const goToCulture = () => {
    return navigateTo("/culturepanel");
};

const goToJPO = () => {
    return navigateTo("/jpo");
};

const init = async () => {
    let loggedIn = await fetch(`${rootUrl}/api/v1/session`);
    if (!loggedIn.ok) {
        return navigateTo("/login");
    }
    let {roles} = await loggedIn.json();
    if (roles.includes("ADMIN")) {
        admin.value = true;
    }
    if (roles.includes("MAINTAINER")) {
        maintainer.value = true;
    }
};

init()
</script>

<template>
    <div class="flex justify-center m-2 gap-x-2">
        <Button v-if="admin || maintainer" class="px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200" @click="goToAdmin()">Admin Panel</Button>
        <Button v-if="admin || maintainer" class="px-4 py-2 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200" @click="goToHP()">Hyperplanning Panel</Button>
    </div>
</template>