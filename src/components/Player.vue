<template>
    <div class="player">
        <div class="user-name">
            <div v-if="value.id === session">
                <form @submit.prevent="$emit('submitName', {name: $refs.name.value, player: value})" v-if="!value.submitted">
                    <div class="control">
                        <input ref="name" type="text" placeholder="Input name">
                    </div>
                    <button type="submit">Save</button>
                </form>
                <h4 class="red">{{value.name}}</h4>
            </div>
            <h4 :class="{'red': value.current}" v-else>{{value.name}}</h4>
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
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .slot {
        margin: 0 5px;
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

    h4 {
        margin: 0;
    }
    .user-name {
        margin-bottom: 10px;
    }
    .control {
        max-width: 125px; 
    }

    .control input {
        width: 100%;
    }

    form {
        display: flex;
    }

</style>