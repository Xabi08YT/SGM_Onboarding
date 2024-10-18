<template>
  <div id="header">
    <p>{{ currentDate }}</p>
    <p>{{ currentTime }}</p>
    <div id="DepLogos">
      <img style="width: 145px; margin-left: 0px !important; margin-right:0;" src="/assets/SGM_White.png" />
      <img style="width: 135px; margin-left: 15px; margin-right:0;" src="/assets/logo_iut.svg" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentTime: "",
      currentDate: "",
      currentTimeInterval: undefined,
      currentDateInterval: undefined,
    };
  },
  methods: {
    updateCurrentTime() {
      this.currentTime = new Date().toLocaleTimeString("fr-FR").split(" ")[0];
    },
    updateCurrentDate() {
      this.currentDate = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        month: "long",
        day: "2-digit",
      });
    },
  },
  mounted() {
    this.updateCurrentTime();
    this.updateCurrentDate();
    this.currentTimeInterval = setInterval(this.updateCurrentTime, 1000); // Refresh every seconds
    this.currentDateInterval = setInterval(this.updateCurrentDate, 3600000); // Refresh evry hours
  },
  unmounted() {
    clearInterval(this.currentTimeInterval);
    clearInterval(this.currentDateInterval);
  },
};
</script>

<style scoped>
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95vw;
  font-size: 1.25em;
  position: absolute;
  top: 0.5em;
  color: rgb(38, 48, 48);
}

#header div > img {
  filter: invert(0.7);
}

#header > p {
  width: 320px;
  text-align: center;
  font-size: 32px;
}

#header > p:last-of-type {
  font-size: 44px;
}

#DepLogos {
  display: flex;
  flex-direction: row;
  justify-content: end !important;
}
</style>
