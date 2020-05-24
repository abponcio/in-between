<template>
    <div class="player">
        <div class="user-name">
            <h4 :class="{'red': value.current}">{{value.name}}</h4>
            <button @click="joinGame" class="join" v-if="!joined && !value.id">Join</button>
        </div>
        <div class="card-slots">
            <card class="slot" v-for="(hand, index) in value.hands" :key="index" :value.sync="hand" :empty="!hand.name" :player="value" :session="session"></card>
        </div>
    </div>
</template>

<script>

import Card from "@/components/Card.vue";

export default {
    components: {
        Card,
    },
    methods: {

        joinGame() {

            this.$emit('join', this.value);
        },
    },
    props: [
        'value',
        'joined',
        'session'
    ],
}
</script>

<style scoped>
    .player {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        width: 100%;
        height: 100%;
    }
    .card-slots {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        align-items: center;
        width: 100%;
    }

    .user-name {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .join {
        margin-left: 1em;
    }

    h4.red {
        color: white;
    }
</style>