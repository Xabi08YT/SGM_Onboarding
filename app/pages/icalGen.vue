<script setup lang="ts">
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {ref, watch} from "vue";
import {Textarea} from "../components/ui/textarea";
import {Button} from "../components/ui/button";
import {Toaster, useToast, toast} from "../components/ui/toast";


let fullLink = ref("");
let HPVersion = ref("");
let result = ref("");

let getID = () => {
  console.log(fullLink.value);
  if (fullLink.value == "" || fullLink.value == null) return;
  HPVersion.value = fullLink.value.split("?version=")[1].split("&")[0];
  result.value = fullLink.value.split("&icalsecurise=")[1].split("&")[0];
}

let copyVersion = () => {
  navigator.clipboard.writeText(HPVersion.value);
  toast({title: "Élement copié avec succès"});
}

let copyIcal = () => {
  navigator.clipboard.writeText(result.value);
  toast({title: "Élement copié avec succès"});
}

watch([fullLink], () => {
  getID();
});

</script>

<template>
  <div
      class="w-screen min-h-screen lg:h-screen lg:max-h-screen flex flex-col lg:flex-row p-[25px] justify-center items-center"
      id="container">
    <Toaster />
    <Card class="max-w-sm">
      <CardHeader>
        <CardTitle>Extraction des information</CardTitle>
        <CardDescription>Cette page vous permet d'extraire les informations utiles d'un lien hyperplanning, pour la mise
          à jour des emplois du temps (voir documentation)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label for="fullLinkIn">Lien hyperplanning complet</Label>
        <Textarea v-model="fullLink" id="fullLinkIn"/>
        <Label for="hpver">Version d'hyperplanning extraite</Label>
        <span class="flex">
          <Input v-model="HPVersion" id="hpver"/>
          <Button class="h-[40px] w-[40px] ml-[5px]" v-on:click="copyVersion()">
            <LucideCopy color="white" />
          </Button>
        </span>
        <Label for="edtical">ID de l'emploi du temps</Label>
        <span class="flex">
          <Input v-model="result" id="edtical"/>
          <Button class="h-[40px] w-[40px] ml-[5px]" v-on:click="copyIcal()">
            <LucideCopy color="white" />
          </Button>
        </span>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
#container {
  background-image: url("/assets/bg.jpeg");
  background-size: cover;
}
</style>