<script setup>
import {defineComponent, onMounted, onUnmounted, reactive} from "vue";
import PlanningCard from "../components/PlanningCard.vue";
import icals from "../icals.json";
import {HyperplanningScheduler} from "@xabi08yt/iutgradignanhpscheduler";
import hpSettings from "../hpSettings.json";

const edt = reactive({sgm_but_1: [], sgm_but_2: [], sgm_but_3: []});
const delay = 1000 * 60 * 5; // Refresh toutes les 5 minutes

let refreshInterval = undefined;
let promos;
let proxyUrl = `${useRequestURL()}api/hp/`;
let classes = {};
let {version} = hpSettings;
let pageTitle = "pageTitle";

const props = defineProps({
  isActive: Boolean,
});

const components = defineComponent({
  PlanningCard
});

let generateGroupsSchedulers = () => {
  promos = [];
  let But3_done = false;
  let i = 0;
  Object.keys(icals).forEach((promo) => {
    if (
      promo === "sgm_but_3_ALT" ||
        (promo === "sgm_but_3_FI" && !But3_done)
    ) {
      promos.push("sgm_but_3");
    }

    classes[promo] = {
      ical: new HyperplanningScheduler(icals[promo].ical, {proxyUrl, version}),
      td: [],
      tp: [],
      tpfab: []
    };
    try {
      icals[promo].td.map((group, index) => {
        if (group.ical === "") return;
        classes[promo].td.push({
          className: `S ${i + 1} TD ${index + 1}`,
          ical: new HyperplanningScheduler(group.ical, {proxyUrl, version})
        });
      });

      icals[promo].tp.map((group, index) => {
        if (group.ical === "") return;
        classes[promo].tp.push({
          className: `S ${i + 1} TP SC ${index + 1}`,
          ical: new HyperplanningScheduler(group.ical, {proxyUrl, version})
        });
      });

      icals[promo].tpfab.map((group, index) => {
        if (group.ical === "") return;
        classes[promo].tpfab.push({
          className: `S ${i+1} TP FAB ${index+1} S${i+1}`,
          ical: new HyperplanningScheduler(group.ical, {proxyUrl, version})
        });
      });
      i += 2;
    } catch (e) {
      console.error(e);
    }
  });
};

let nextEventFilter = (event) => {
  // Actual time in minutes relatives to 00:00 of the current day (Ex: 420 for 07:00am)
  let currentTime = new Date().getHours() * 60 + new Date().getMinutes();
  const eventStartTime =
      event.dateStart.getHours() * 60 + event.dateStart.getMinutes();
  const eventEndTime =
      event.dateEnd.getHours() * 60 + event.dateEnd.getMinutes();

  // Cas spécial -> afficher les cours de 14h entre 11h30 et 13h30
  if (currentTime > 12 * 60 && currentTime < 13 * 60 + 45)
    currentTime = 14 * 60;

  if (currentTime < 8 * 60 + 15) {
    currentTime = 8 * 60 + 15;
  }

  // Display this event 30min before it starts and stop displaying it 30 mins before it ends.
  return (
    currentTime > eventStartTime - 15 && currentTime < eventEndTime
  );
};

let getAllPlannings = async () => {
  console.log("Refreshing plannings");
  edt.sgm_but_1 = [];
  edt.sgm_but_2 = [];
  edt.sgm_but_3 = [];
  try {
    for (const c of Object.keys(classes)) {
      // Mappage des events
      let eventPromo = await classes[c].ical.getEvents().then(events => events.find(nextEventFilter));
      let eventsTD = [];
      let eventsTP = [];
      let eventsTPFab = [];

      for(let g of classes[c].td) {
        eventsTD.push(await g.ical.getEvents().then(events => events.find(nextEventFilter)));
      }

      for(let g of classes[c].tp) {
        eventsTP.push(await g.ical.getEvents().then(events => events.find(nextEventFilter)));
      }

      for(let g of classes[c].tpfab) {
        eventsTPFab.push(await g.ical.getEvents().then(events => events.find(nextEventFilter)));
      }

      eventsTD = eventsTD.filter(e => e);
      eventsTP = eventsTP.filter(e => e);
      eventsTPFab = eventsTPFab.filter(e => e);

      if (eventPromo !== undefined) {
        edt[c].push({
          className: c.toString().toUpperCase().replaceAll("_", " ").slice(-5),
          isFullClass: true,
          type: "PROMO",
          subject: eventPromo.subject,
          teacher: eventPromo.teachers.join(" - "),
          room: eventPromo.locations[0].split(" ")[1],
        });
        continue;
      }

      if (eventsTD.filter(v => v !== undefined ).length > 0) {
        eventsTD.forEach((e) => {
          if(e === undefined) return;
          edt[c].push({
            className: classes[c].td[eventsTD.indexOf(e)].className,
            isFullClass: true,
            type: "TD",
            subject: e.subject,
            teacher: e.teachers.join(" - "),
            room: e.locations[0] ? e.locations[0].split(" ")[1] : "",
          });
        });
      }

      if (eventsTD.filter((v) => v).length > 0) {
        let coupledTPFabs = [];
        let couple = [null, null];

        for (let i = 0; i < eventsTPFab.length; i += 2) {
          couple[0] = eventsTPFab[i];
          couple[1] = eventsTPFab[i + 1];
          coupledTPFabs.push(couple);
        }

        coupledTPFabs.forEach((e) => {
          if (e === undefined || (e[0] === undefined && e[1] === undefined)) return;
          edt[c].push({
            className: classes[c].tpfab[eventsTPFab.indexOf(e)].className,
            isFullClass: false,
            type: "TP",
            subject: [e[0] ? e[0].subject : undefined, e[1] ? e[1].subject : undefined],
            teacher: [e[0] ? e[0].teachers ? e[0].teachers.join(" - ") : "Pas de prof" : "", e[1] ? e[1].teachers ? e[1].teachers.join(" - ") : "Pas de prof" : ""],
            room: [e[0] ? e[0].locations[0] ? e[0].locations[0].split(" ")[1] : "" : "", e[1] ? e[1].locations[0] ? e[1].locations[0].split(" ")[1] : "-" : ""],
          });
        });
      }

      eventsTP.forEach((e) => {
        if(e === undefined) return;
        edt[c].push({
          className: classes[c].tp[eventsTP.indexOf(e)].className,
          isFullClass: true,
          type: "TP",
          subject: e ? e.subject : "",
          teacher: e ? e.teachers ? e.teachers.join(" - ") : "Pas de prof" : "",
          room: e ? e.locations[0] ? e.locations[0].split(" ")[1] : "" : "",
        });
      });
    }

  } catch
  (e) {
    console.error("Failed to fetch plannings", e);
    edt.sgm_but_1 = [];
    edt.sgm_but_2 = [];
    edt.sgm_but_3 = [];
    pageTitle = "Si si tu as cours, c'est juste un bug :)";
  }
}
;

let refresh = async () => {
  pageTitle = "Prochains cours (affiché 15mn avant)";
  edt.sgm_but_1 = [];
  edt.sgm_but_2 = [];
  edt.sgm_but_3 = [];
  await getAllPlannings();
};

onMounted(async () => {
  pageTitle = "Prochains cours (affiché 15mn avant)";
  generateGroupsSchedulers();
  await getAllPlannings();
  refreshInterval = setInterval(await refresh, delay);
});

onUnmounted(() => clearInterval(refreshInterval));
</script>

<template>
  <div v-show="isActive" class="view-container">
    <h1 class="view-title">
      {{ pageTitle }}
    </h1>
    <div id="columns">
      <!--Column for BUT1-->
      <div id="c1">
        <div class="view-content">
          <PlanningCard
              v-for="(data, index) in edt.sgm_but_1.slice(0, 2)"
              :key="index"
              :data="data"
          />
        </div>
        <div class="view-content">
          <PlanningCard
              v-for="(data, index) in edt.sgm_but_1.slice(2, 4)"
              :key="index"
              :data="data"
          />
        </div>
      </div>
      <!--Column for BUT2-->
      <div id="c2">
        <div class="view-content">
          <PlanningCard
              v-for="(data, index) in edt.sgm_but_2.slice(0, 2)"
              :key="index"
              :data="data"
          />
        </div>
        <div class="view-content">
          <PlanningCard
              v-for="(data, index) in edt.sgm_but_2.slice(2, 4)"
              :key="index"
              :data="data"
          />
        </div>
      </div>
      <!--Column for BUT3-->
      <div id="c3">
        <div class="view-content">
          <PlanningCard
              v-for="(data, index) in edt.sgm_but_3.slice(0, 2)"
              :key="index"
              :data="data"
          />
        </div>
        <div class="view-content">
          <PlanningCard
              v-for="(data, index) in edt.sgm_but_3.slice(2, 4)"
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
