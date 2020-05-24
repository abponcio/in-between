<template>
    <transition name="fade">
    <div class="card" :class="[{'empty': empty}, value.color, {'other': !player || !player.current}]">
        <div class="card-front" @click="value.hidden = !value.hidden" v-if="!value.hidden">
            <div class="top">
                {{value.name}}
            </div>
            <div class="center">
                <div class="dots" v-for="number in value.rank" :key="number">{{value.suite}}</div>
            </div>
            <div class="bottom">
                {{value.name}}
            </div>
        </div>
        <div class="card-back" style="color: black;" @click="value.hidden = !value.hidden" v-else-if="player && player.current && session === player.id">
            <h2>Reveal</h2>
        </div>
        <div class="card-back" style="color: black;" v-else-if="deck">
            <h2>{{count}}</h2>
        </div>
        <div class="card-back" style="color: black;" v-else>
            <h2>Hidden</h2>
        </div>
    </div>
    </transition>
</template>

<script>
export default {
    
    props: [
        'empty',
        'value',
        'player',
        'session',
        'river',
        'deck',
        'count',
    ],
}
</script>

<style scoped>

    .card {
        width: calc(100px + 0.5vw);
        height: calc(150px + 0.5vw);
        border: 1px solid #000;
        border-radius: calc(3px + 0.5vw);
        padding: calc(2px + 0.5vw);
        cursor: pointer;
        opacity: 1;
        background-color: #fff;
        backface-visibility: hidden;
    }

    @media screen and (max-width: 1024px) {
        .card {
            width: calc(50px + 0.5vw);
            height: calc(80px + 0.5vw);
        }

        h2 {
            font-size: calc(10px + 0.5vw);
        }

    }
    .card.other {
        cursor: default !important;
    }
    .card:hover {
        opacity: 1;
    }
    .card.empty {
        width: calc(100px + 0.5vw);
        height: calc(150px + 0.5vw);
        border: 1px solid #000;
        border-radius: calc(3px + 0.5vw);
        background: #fff;
        opacity: 0.7;
    }

    @media screen and (max-width: 1024px) {
        .card.empty {
            width: calc(50px + 0.5vw);
            height: calc(80px + 0.5vw);
        }

    }
    .card .card-front {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
    .card .card-back {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .card.red {
        color: red;
    }
    .card.black {
        color: black;
    }

    .center {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;
        overflow: hidden;
    }
    .bottom {
        width: 100%;
        text-align: left;
        transform: rotate(180deg);
        font-weight: bold;
    }
    .top {
        width: 100%;
        text-align: left;
        font-weight: bold;
    }

    .fade-enter-active{
        transition: opacity 1.5s;
    }
    .fade-leave-active {
        opacity: 0;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .other {
        cursor: default !important;
    }
</style>