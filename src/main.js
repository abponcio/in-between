import DefaultLayout from "~/layouts/Default.vue";
import 'normalize.css'; 

export default function(Vue, { appOptions, router, head, isClient }) {
    Vue.component("Layout", DefaultLayout);
}
