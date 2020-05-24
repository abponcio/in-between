<template>
    <Layout>
        <button @click="newGame()">New game</button> 
        <button @click="dealCards()">Deal cards</button>
        <button @click="seeCards()">Flip cards</button>
        <div class="table">
            <div class="chatbox">
                <div class="flex">
                    <h5>Chat Box ({{users}} user/s connected)</h5>
                    <p>{{currentUser}}</p>
                </div>
                <div ref="chat" class="chat">
                    <message v-for="(message, index) in messages" :key="index" :session="session" :value="message"></message>
                </div>
                <form @submit.prevent="sendMessage" class="sendChat">
                    <div class="control">
                        <input type="text" v-model="message"/>
                    </div>
                    <button type="submit">Send</button>
                </form>
            </div>
            <player class="user-left" 
                v-for="(player, index) in players" 
                :key="index" 
                :value.sync="player" 
                :joined="joined" 
                :class="`user-${player.position}`" 
                @join="(data) => joinGame(data)" 
                :session="session"
                @submitName="data => submitName(data)"></player>
            <div class="dealer">
                <div style="padding: 0 1rem; border-right: 1px solid;">
                    <card :value.sync="deck[deck.length - 1]" :deck="true" :count="deck.length"></card>
                </div>
                <div class="river">
                    <card v-for="(river, index) in rivers" :key="index" :value.sync="river" :empty="!river.name" :river="true" style="margin-left: 5px"></card>
                </div>
            </div>
        </div>
    </Layout>
</template>

<script>
import Card from "@/components/Card.vue";
import Player from "@/components/Player.vue";
import Message from "@/components/Message.vue";
import SocketIO  from 'socket.io-client';

export const socket = SocketIO('https://young-shore-88277.herokuapp.com/');
// export const socket = SocketIO('http://localhost:3000');

export default {
    created() {

       this.newGame();
    },
    components: {
        Card,
        Player,
        Message,
    },
    computed: {

        joined() {
            
            return this.players.find(player => player.id === this.session);
        },
        currentUser() {

            return this.players.find(player => player.id === this.session)?.name || `Anon${Math.floor(Math.random() * 1000)}`;
        },
        scrollChat() {

            return this.$refs?.chat?.scrollHeight || 0;
        }
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
            message: '',
            messages: [],
            users: 0,
            rivers: [],
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
                rivers: this.rivers,
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

            this.rivers = new Array(2).fill({});
        },
        createPlayers() {

            this.players = Array(4).fill(null).map((nothing, index) => {

                return {

                    index,
                    id: null,
                    current: false,
                    submitted: false,
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

            this.rivers = [this.deck.pop(), this.deck.pop()];

            if (!this.players.every(player => player.hands.length === 2)) {

                this.newGame();
                this.dealCards();
            }

            const payload = {
                deck: this.deck,
                players: this.players,
                rivers: this.rivers,
            };

            socket.emit('update', payload);
        },
        seeCards() {
            
            this.players.map(player => {

                Object.assign(player, {

                    hands: player.hands.map(item => item ? Object.assign(item, {hidden: false}) : item),
                });
            });
            this.rivers.map(river => Object.assign(river, {hidden: false}));

            const payload = {
                deck: this.deck,
                players: this.players,
                rivers: this.rivers,
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
        sendMessage() {

            const payload = {

                message: this.message,
                name: this.currentUser,
                id: this.session,
            };

            socket.emit('sendMessage', payload);

            this.message = '';
        },
        submitName(data) {

            const payload = Object.assign(data.player, {
                name: data.name,
                submitted: true,
            });

            socket.emit('updatePlayer', payload);

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
            this.rivers = data.rivers;
        });

        socket.on('newMessage', async data => {

            this.messages.push(data);

            await this.$nextTick();

            this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
        });

        socket.on('connected', data => this.users = data);
    },
};
</script>

<style scoped>

    .table {
        min-height: 80vh;
        display: grid;
        align-items: center;
        grid-template-areas:
            '. . userTop userTop . chatBox'
            'userLeft dealer dealer dealer dealer chatBox'
            'userLeft dealer dealer dealer dealer userRight'
            'userLeft dealer dealer dealer dealer userRight'
            'userLeft dealer dealer dealer dealer userRight'
            '. . userBottom userBottom . .';
        grid-gap: 10px;
        padding: 10px;
        background: green;
        border-radius: 3px;
    }

    @media screen and (max-width: 1024px) {
        .table {
            grid-template-areas:
            'dealer dealer'
            'dealer dealer'
            'userLeft userTop'
            'userRight userBottom'
            'chatBox chatBox';
        }
    }

    .user-left { grid-area: userLeft; }
    .user-top { grid-area: userTop; }
    .user-right { grid-area: userRight; }
    .user-bottom { grid-area: userBottom; }
    .dealer { grid-area: dealer; }
    .chatbox { grid-area: chatBox; }

    .dealer {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto 2fr;
        align-items: center;
        background: #5dad6a;
        padding: 5px;
        border-radius: 5px;
    }
    .deck {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
    }
    @media screen and (max-width: 1024px) {
        .deck {
            top: 0;
            transform: none;
        }
    }
    .shifted {
        left: 10px;
    }
    .chat {
        background: #fff;
        height: calc(150px + 0.5vw);
        max-height: calc(150px + 0.5vw);
        border-radius: 3px;
        overflow-y: auto;
    }
    .flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 5px;
    }
    .flex h5 {
        margin-bottom: 0;
    }
    .flex p {
        margin-bottom: 0;
    }

    .river {
        display: flex;
        flex-wrap: wrap;
        padding: 0 1rem;
    }

    .control {
        flex-basis: 80%;
    }

    .control input {
        width: 100%;
    }
    .sendChat {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        margin-top: 5px;
    }
</style>
