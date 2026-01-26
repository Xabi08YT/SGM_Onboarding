<script setup lang="ts">
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "../../app/components/ui/card";
import {Button} from "../../app/components/ui/button";
import {Toaster} from "../../app/components/ui/toast";
import { Textarea } from '../../app/components/ui/textarea';
import { navigateTo } from "nuxt/app";
import { ref, watch } from "vue";
import Input from "../components/ui/input/Input.vue";
import {toast} from "../components/ui/toast";
import AdminTopBar from "../components/AdminTopBar.vue";
import {Switch} from "../components/ui/switch";

const runtimeConfig = useRuntimeConfig();
const requestURL = useRequestURL();
const rootUrl = requestURL.origin + runtimeConfig.app.baseURL.slice(0,-1);
const nuxtApp = useNuxtApp();

let admin = ref(false);
let hpVersion = ref("")
let hpIcals = ref("")
let hpMod = ref("")
let hpModCheck = ref(false)

const send = async () => {
  let object = {version: hpVersion.value, icals: hpIcals.value, mode: hpMod.value};
  let res = await fetch(`${rootUrl}/api/v1/hyperplanningEndpoint`, {method:"PUT",body: JSON.stringify(object)})
  if (res.status === 200) {
    toast({title:"Paramètres mis à jour avec succès"});
    await get();
  } else {
    toast({title: "Une erreur est survenue", description: await res.json(), variant: "destructive"});
  }
}

const get = async () => {
  let res = await fetch(`${rootUrl}/api/v1/hyperplanningEndpoint`);
  if (!res.ok) {
    toast({title: "Impossible de récuperer les paramètres Hyperplanning", description: await res.json(), variant: "destructive"});
  }

  let body = await  res.json();

  hpVersion.value =  body.version.value.replaceAll("\"","");
  hpIcals.value = body.icals.value.slice(1,-1).replaceAll("\\n","");
  hpIcals.value = hpIcals.value.replaceAll("\\","");
  hpMod.value = body.mode.value.replaceAll("\"","");
  hpModCheck.value = (hpMod.value === "ROOM");
}

const init = async () => {
  let loggedIn = await fetch(`${rootUrl}/api/v1/session`);

  if (!loggedIn.ok) {
    nuxtApp.runWithContext(() => {
      navigateTo('/login');
    });
    return
  }
  let {roles} = await loggedIn.json();
  if (!roles.includes("ADMIN") && !roles.includes("MAINTAINER") && !roles.includes("ENSEIGNANT")) {
    nuxtApp.runWithContext(() => {
      navigateTo('/login');
    });
    return
  }
  admin.value = roles.includes("ADMIN") || roles.includes("MAINTAINER");

  await get();

};

init();

watch([hpModCheck],() => {
  hpMod.value = hpModCheck.value ? "ROOM" : "CLASS";
})

</script>

<template>
  <AdminTopBar/>
  <div class="flex justify-center items-center gap-2 w-screen" id="login">
    <Toaster />
    <Card class="max-w-md">
      <CardHeader>
        <CardTitle>Paramètres Hyperplanning</CardTitle>
        <CardDescription>Changement des paramètres relatifs aux emplois du temps HyperPlanning.</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col justify-center items-center">
        <Label for="hpmod">Mode d'affichage</Label>
        <div class="flex my-[10px]">
          <Switch id="hpmod" :checked="hpModCheck" @update:checked="(value) => {
            hpModCheck = value;
          }" />
          <p class="ml-[15px]">{{hpMod == "ROOM" ? "Emploi du temps des salles" : "Emplois du temps des promotions"}}</p>
        </div>
        <Label for="hpver">Version d'hyperplanning</Label>
        <Input id="hpver" type="text" placeholder="Version" v-model="hpVersion" />
        <Label for="hpical">Contenu du fichier JSON des icals</Label>
        <Textarea id="hpical" placeholder="Contenu" v-model="hpIcals"/>
      </CardContent>
      <CardFooter>
        <Button class="mt-[5px] w-full" @click="send">Envoyer</Button>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
#login {
  background-image: url("/assets/bg.jpeg");
  background-size: cover;
  height: 100dvh;
}
</style>
