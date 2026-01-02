<script setup lang="ts">
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../components/ui/card";
import {Input} from "../components/ui/input";
import {Label} from "../components/ui/label";
import {ref, watch} from "vue";
import {Textarea} from "../components/ui/textarea";


let fullLink = ref("");
let HPVersion = ref("");
let result = ref("");

let getID = () => {
  console.log(fullLink.value);
  if (fullLink.value == "" || fullLink.value == null) return;
  HPVersion.value = fullLink.value.split("?version=")[1].split("&")[0];
  result.value = fullLink.value.split("&icalsecurise=")[1].split("&")[0];
}

watch([fullLink], () => {
  getID();
});

</script>

<template>
  <div class="w-screen h-screen justify-center items-center" id="container">
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
        <Input v-model="HPVersion" id="hpver"/>
        <Label for="edtical">ID de l'emploi du temps</Label>
        <Input v-model="result" id="edtical"/>
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