<script setup lang="ts">
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "../components/ui/card";
import {Button} from "../components/ui/button";
import {toast, Toaster, useToast} from "../components/ui/toast";
import { navigateTo } from "nuxt/app";
import { ref } from "vue";

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

init();

</script>

<template>
  <div class="flex justify-center items-center gap-2 w-screen h-screen" id="choose">
    <Toaster />
    <Card>
      <CardHeader>
        <CardTitle>Choix de la page</CardTitle>
        <CardDescription>Veuillez sélectionner une page vers laquelle vous rediriger.</CardDescription>
      </CardHeader>
      <CardFooter>
        <div class="flex flex-row w-full">
          <Button v-if="admin || maintainer" class="mt-[5px] w-full space" @click="goToAdmin">Admin</Button>
          <Button v-if="admin || maintainer" class="mt-[5px] w-full space" @click="goToHP">Hyperplanning setup</Button>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
#choose {
  background-image: url("/assets/bg.jpeg");
  background-size: cover;
  height: 100dvh;
}

.space {
  margin-right: 10px;
}
</style>
