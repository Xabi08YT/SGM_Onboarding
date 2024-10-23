<script setup>
import { defineComponent, onMounted, onUnmounted, reactive } from "vue";
import * as api from "../api";
import PlanningCard from "../components/PlanningCard.vue";
import icals from "../icals.json";


const edt = reactive({sgm_but1:[], sgm_but2:[], sgm_but3:[]});
const delay = 1000 * 60 * 5; // Refresh toutes les 5 minutes

let currentHourRangeStr = "";
let refreshInterval = undefined;

const props = defineProps({
  isActive: Boolean,
});

const components = defineComponent({
  PlanningCard
});

function setCurrentHourRange() {
  const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
  if (currentTime < 9 * 60 + 45) {
    // < 09h30
    currentHourRangeStr = "8h15 - 10h00";
  } else if (currentTime < 11 * 60 + 30) {
    // < 11h30
    currentHourRangeStr = "10h25 - 12h15";
  } else if (currentTime < 15 * 60 + 30) {
    // < 15h30
    currentHourRangeStr = "14h00 - 15h50";
  } else {
    // > 15h30
    currentHourRangeStr = "16h10 - 18h00";
  }
}

async function getCourses() {
  let tmp = await api.getAllNextCourses(icals);
  return tmp;
};

async function processPlannings(cls) {
  console.log("Refreshing plannings");
  edt.sgm_but1 = [];
  edt.sgm_but2 = [];
  edt.sgm_but3 = [];
  let hasTD = {sgm_but1: false, sgm_but2: false, sgm_but3: false};
  setCurrentHourRange();
  try {
    for (const c of cls) {
      const classEvent = c.nextCourse;
      if((JSON.stringify(classEvent) !== JSON.stringify({"Salle":""}) && classEvent !== undefined) || (c.className.includes("tp") && !hasTD[c.promotion])) {
        switch (c.promotion) {
        case "sgm_but1":
          if(!classEvent.type == undefined && classEvent.Type.includes("TD")) {
            hasTD.sgm_but1 = true;
          }
          edt.sgm_but1.push({
            className: c.className,
            isFullClass: classEvent !== undefined && JSON.stringify(classEvent) !== JSON.stringify({"Salle":""}),
            type: classEvent.Type ? classEvent.Type : "",
            subject: classEvent.Matiere ? classEvent.Matiere : "",
            teacher: classEvent.Enseignant ? classEvent.Enseignant : "",
            room: classEvent.Salle,
          });
          break;
        case "sgm_but2":
          if(!classEvent.type == undefined && classEvent.Type.includes("TD")) {
            hasTD.sgm_but1 = true;
          }
          edt.sgm_but2.push({
            className: c.className,
            isFullClass: classEvent !== undefined && JSON.stringify(classEvent) !== JSON.stringify({"Salle":""}),
            type: classEvent.Type ? classEvent.Type : "",
            subject: classEvent.Matiere ? classEvent.Matiere : "",
            teacher: classEvent.Enseignant ? classEvent.Enseignant : "",
            room: classEvent.Salle,
          });
          break;
        case "sgm_but3_FI":
        case "sgm_but3_ALT":
        case "sgm_but3":
          if(!classEvent.type == undefined && classEvent.Type.includes("TD")) {
            hasTD.sgm_but3 = true;
          }
          edt.sgm_but3.push({
            className: c.className,
            isFullClass: classEvent !== undefined && JSON.stringify(classEvent) !== JSON.stringify({"Salle":""}),
            type: classEvent.Type ? classEvent.Type : "",
            subject: classEvent.Matiere ? classEvent.Matiere : "",
            teacher: classEvent.Enseignant ? classEvent.Enseignant : "",
            room: classEvent.Salle,
          });
          break;
        default:
          console.log("Unknown promotion.");
      }
      }
    }
  } catch (e) {
    console.error("Failed to fetch plannings", e);
    // eslint-disable-next-line prefer-template
    currentHourRangeStr = "Si si tu as cours, c'est juste un bug :)";
  }
}

let refresh = async () => {
  setCurrentHourRange();
  let classes = await getCourses();
  await processPlannings(classes);
}

onMounted(async () => {
  setCurrentHourRange();
  let classes = await getCourses() 
  await processPlannings(classes)
  refreshInterval = setInterval(refresh(), delay);
})

onUnmounted(() => clearInterval(refreshInterval));
</script>

<template>
  <div v-show="isActive" class="view-container">
    <h1 class="view-title">
      {{ currentHourRangeStr }}
    </h1>
    <div id="columns">
      <!--Column for BUT1-->
      <div id="c1">
        <div class="view-content">
          <PlanningCard
            v-for="(data, index) in edt.sgm_but1.slice(0, 2)"
            :key="index"
            :data="data"
          />
        </div>
        <div class="view-content">
          <PlanningCard
            v-for="(data, index) in edt.sgm_but1.slice(2, 4)"
            :key="index"
            :data="data"
          />
        </div>
      </div>
      <!--Column for BUT2-->
      <div id="c2">
        <div class="view-content">
          <PlanningCard
            v-for="(data, index) in edt.sgm_but2.slice(0, 2)"
            :key="index"
            :data="data"
          />
        </div>
        <div class="view-content">
          <PlanningCard
            v-for="(data, index) in edt.sgm_but2.slice(2, 4)"
            :key="index"
            :data="data"
          />
        </div>
      </div>
      <!--Column for BUT3-->
      <div id="c3">
        <div class="view-content">
          <PlanningCard
            v-for="(data, index) in edt.sgm_but3.slice(0, 2)"
            :key="index"
            :data="data"
          />
        </div>
        <div class="view-content">
          <PlanningCard
            v-for="(data, index) in edt.sgm_but3.slice(2, 4)"
            :key="index"
            :data="data"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
span {
  width: 100%;
  font-weight: bold;
}

#columns {
  display: flex;
  flex-direction: row;
}
</style>
