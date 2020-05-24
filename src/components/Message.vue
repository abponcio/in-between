<template>
    <ul class="message">
        <li :class="{'text-right': session === value.id}">
            <div :class="(session === value.id) ? 'my-message' : 'other-message'">
                <strong v-if="session !== value.id">{{value.name}}:</strong> {{value.message}}
            </div>
        </li>
    </ul>
</template>

<script>
export default {
    props: [
        'value',
        'session',
    ],
}
</script>

<style scoped>
    ul.message {
        list-style: none;
        padding-left: 0;
        font-size: calc(9px + 0.5vw);
    }

    @media screen and (max-width: 1024px) {
        ul.message {
            font-size: calc(12px + 1vw);
        }
    }
    
    li {
        padding: 5px;
    }
    li.text-right {
        text-align: right;
    }
    .my-message {
        background: skyblue;
        padding: 5px;
        display: inline-block;
        border-radius: 5px;
    }

    .other-message {
        background:wheat;
        padding: 5px;
        display: inline-block;
        border-radius: 5px;
    }
</style>