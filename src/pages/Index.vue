<template>
    <Layout>
        <button @click="newGame()">New game</button> 
        <button @click="dealCards()">Deal cards</button>
        <div class="table">
            <player class="user-left" v-for="(player, index) in players" :key="index" :value.sync="player" :joined="joined" :class="`user-${player.position}`" @join="(data) => joinGame(data)" :session="session"></player>
            <div class="dealer">
                <div class="deck" v-for="(card, index) in deck" :key="index" :class="{'shifted': deck.length === index + 1}">
                    <card :value.sync="card"></card>
                </div>
                <div class="river">{{this.deck.length}}</div>
            </div>
        </div>
    </Layout>
</template>

<script>
import Card from "@/components/Card.vue";
import Player from "@/components/Player.vue";
import SocketIO  from 'socket.io-client';

export const socket = SocketIO('https://young-shore-88277.herokuapp.com/');

export default {
    created() {

       this.buildDeck();
       this.createPlayers();
    },
    components: {
        Card,
        Player,
    },
    computed: {

        joined() {
            
            return this.players.find(player => player.id === this.session);
        },
    },
    data() {

        return {

            actions: {
                hidden: true,
                assigned: false,
                trashed: false,
            },
            deck: [],
            suites: [],
            rank: [],
            players: [],
            positions: ['left', 'top', 'right', 'bottom'],
            session: '',
        };
    },
    methods: {
        
        newGame() {

            this.createPlayers();
            this.buildDeck();
            this.shuffleCards();

            const payload = {
                deck: this.deck,
                players: this.players,
            };

            socket.emit('update', payload);
        },
        buildDeck() {

             this.rank = new Array(13).fill(null).map((nothing, index) => {
                const royals = {
                    1: "A",
                    11: "J",
                    12: "Q",
                    13: "K",
                };

                return royals[index + 1] ? royals[index + 1] : index + 1;
            });

            this.suites = ["diamonds", "hearts", "spades", "clubs"].map(
                (item, index) => {
                    return {
                        priority: index + 1,
                        suite: item,
                        color:
                            item === "diamonds" || item === "hearts"
                                ? "red"
                                : "black",
                    };
                }
            );

            this.deck = this.rank.flatMap((item, rank) => {
                return this.suites.map((suite) => {
                    return Object.assign({}, suite, this.actions, {
                        rank: rank + 1,
                        name: item,
                    });
                });
            });
        },
        createPlayers() {

            this.players = Array(4).fill(null).map((nothing, index) => {

                return {

                    index,
                    id: null,
                    current: false,
                    name: `Unassigned`,
                    position: this.positions[index],
                    hands: new Array(2).fill({}),
                };
            });
        },
        dealCards() {

            this.players = this.players.map(player => {

                const data = Object.assign(player, {

                    hands: this.deck.slice(Math.max(this.deck.length - 2, 1)),
                });

                this.deck.pop();
                this.deck.pop();

                return data;
            });

            if (!this.players.every(player => player.hands.length === 2)) {

                this.newGame();
                this.dealCards();
            }

            const payload = {
                deck: this.deck,
                players: this.players,
            };

            socket.emit('update', payload);
        },
        shuffleCards() {

            this.deck = this.deck
                .map(a => [Math.random(), a])
                .sort((a, b) => a[0] - b[0])
                .map(a => a[1]);
        },
        joinGame(data) {

            socket.emit('join', data);
        },
    },
    metaInfo: {
        title: "Cards stuff",
    },
    mounted() {

        socket.on('connect', () => {

            if (socket.connected)
                this.session = socket.id;
        });

        socket.on('player', data => {

            this.players[data.index] = Object.assign(this.players[data.index], data);
        });

        socket.on('updateGame', data => {
     
            this.players = data.players;
            this.deck = data.deck;
        })
    },
};
</script>

<style scoped>

    .table {
        height: 80vh;
        display: grid;
        grid-template-areas:
            '. . userTop userTop . .'
            'userLeft dealer dealer dealer dealer userRight'
            'userLeft dealer dealer dealer dealer userRight'
            'userLeft dealer dealer dealer dealer userRight'
            'userLeft dealer dealer dealer dealer userRight'
            '. . userBottom userBottom . .';
        grid-gap: 10px;
        padding: 10px;
        background: green;
        border-radius: 3px;
    }

    .user-left { grid-area: userLeft; }
    .user-top { grid-area: userTop; }
    .user-right { grid-area: userRight; }
    .user-bottom { grid-area: userBottom; }
    .dealer { grid-area: dealer; }

    .dealer {
        position: relative;
    }
    .deck {

        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
    }
    .shifted {
        left: 10px;
    }
</style>
