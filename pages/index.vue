<template>
  <div class="view-container" id="maindiv">
    <Background ref="background"/>

    <DateAndHourHeader/>
    <Menus
        v-if="Object.keys(views).includes('menus')"
        :isActive="currentView == 'menus'"
    />
    <Planning
        v-if="Object.keys(views).includes('planning')"
        :isActive="currentView == 'planning'"
    />
    <Transport
        v-if="Object.keys(views).includes('transport')"
        :isActive="currentView == 'transport'"
    />
    <Weather
        v-if="Object.keys(views).includes('weather')"
        :isActive="currentView == 'weather'"
    />
    <Announcement
        v-if="Object.keys(views).includes('announcement')"
        :isActive="currentView == 'announcement'"
    />
    <TeacherAnnouncement
        v-if="Object.keys(views).includes('tannouncement')"
        :isActive="currentView == 'tannouncement'"
    />
    <LoadingBar :view="views[currentView]"/>
    <TransitionOverlay ref="loading"/>
  </div>
</template>

<script>
import DateAndHourHeader from "../components/DateHourHeader.vue";
import TransitionOverlay from "../components/TransitionOverlay.vue";
import Background from "../components/Background.vue";
import LoadingBar from "../components/LoadingBar.vue";

import Menus from "../views/Menus.vue";
import Transport from "../views/Transport.vue";
import Weather from "../views/Weather.vue";
import Planning from "../views/NextPlannings.vue";

import "../stylesheets/reset.css";
import Announcement from "../views/Announcement.vue";
import TeacherAnnouncement from "../views/TeacherAnnouncement.vue";

const DEVELOPEMENT_MODE = false;

export default {
  data() {
    return {
      i: 0,
      nextIndex: 0,
      currentView: "planning",
      views: {
        /*
          To active only one or some views, juste comment here what you dont want to be
          displayed.
          If only one view is uncommented, the slide show will be disabled (Usefull for development).

          The order in the object is the display order
        */
        planning: {
          time: () => DEVELOPEMENT_MODE ? 5000 : 2 * 5000,
          allowed: () => {
            // 6h to 17h30
            const currentTime =
                new Date().getHours() * 60 + new Date().getMinutes();
            return currentTime >= 6 * 60 && currentTime <= 17 * 60 + 30;
          }
        },
        transport: {
          time: () => DEVELOPEMENT_MODE ? 10000 : this.getTimeForBusesAndWeather(),
          allowed: () => true,
        },
        weather: {
          time: () => DEVELOPEMENT_MODE ? 10000 : 7 * 1000,
          allowed: () => true,
        },
        menus: {
          time: () => DEVELOPEMENT_MODE ? 10000 : 1000 * 15,
          allowed: () => {
            // 6h to 14h
            let currentHour = new Date().getHours();
            return currentHour >= 6 && currentHour < 14;
          },
        },
        announcement: {
          time: () => DEVELOPEMENT_MODE ? 10000 : 1000 * 7,
          allowed: () => false && !this.isEndOfDay(),
        },
        tannouncement: {
          time: () => DEVELOPEMENT_MODE ? 10000 : 1000 * 7,
          allowed: () => false && !this.isEndOfDay(),
        },
      },
    };
  },
  methods: {

    /**
     * @return If the courses of the day are finished.
     */

    isEndOfDay() {
      const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
      return currentTime > (17 * 60 + 30);
    },

    /**
     * @return the time to show the weather and transport card depending on current Hour
     */
    getTimeForBusesAndWeather() {
      const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
      if (currentTime > 17 * 60 + 30) {
        return 60000;
      }
      return 7000;
    },

    /**
     * @return the name of the next view that will be displayed
     */
    getNextViewName() {
      const viewTypes = Object.keys(this.views);

      if (this.isEndOfDay()) {
        console.log("Hey");
        let nextView = viewTypes[viewTypes.indexOf(this.currentView) + 1];
        if (nextView === undefined) nextView = viewTypes[0];
        return nextView;
      }

      ++this.i;
      this.i %= 2;
      let nextView = undefined;

      if (this.i === 1) {
        this.nextIndex = viewTypes.indexOf(this.currentView) + 1;
        nextView = viewTypes[0];
      } else {
        nextView = viewTypes[this.nextIndex];
      }
      if (this.views[nextView].allowed() === false) {
        this.i = 1;
        this.nextIndex = viewTypes.indexOf(this.currentView) + 1;
        nextView = this.getNextViewName();
      }
      if (nextView === undefined) nextView = viewTypes[0];
      return nextView;
    },

    /**
     * Change the actual view
     *
     * Will display only allowed views (Hour range is currently valid)
     */
    changeView() {
      this.currentView = this.getNextViewName();
      if (
          this.views[this.currentView].allowed() === false &&
          !DEVELOPEMENT_MODE
      ) {
        this.changeView();
        return;
      }

      if (Object.keys(this.views).length <= 1)
          //Detect we've commented all views except one
        return; // (Disable slide show)

      setTimeout(() => {
        this.$refs.loading && this.$refs.loading.show();
        this.$refs.background && this.$refs.background.next();
        setTimeout(this.changeView, 200);
      }, this.views[this.currentView].time());
    },
  },
  mounted() {
    this.$refs.background && this.$refs.background.next();
    this.changeView();
  },
  components: {
    Planning,
    TransitionOverlay,
    Background,
    Menus,
    Transport,
    Weather,
    DateAndHourHeader,
    LoadingBar,
    Announcement,
    TeacherAnnouncement,
  },
};
</script>

<style>
body {
  font-family: Poppins, sans-serif;
  font-weight: bold;
  font-size: 1.2em;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.view-container {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;

  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;

  height: 100vh;
  overflow: hidden; /* Hide scroll-bars */
}

.view-content {
  width: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.view-title {
  margin-top: 90px;
  min-width: 400px;

  background-color: white;
  box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.25);

  color: rgb(73, 72, 72);

  line-height: 43px;

  font-size: 37px;
  font-weight: 800;
  padding: 30px 50px;
  border-radius: 30px;
}
</style>
