import DefaultLayout from "~/layouts/Default.vue";

export default function(Vue, { appOptions, router, head, isClient }) {
    Vue.component("Layout", DefaultLayout);
}
