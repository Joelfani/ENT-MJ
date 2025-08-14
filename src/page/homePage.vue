<template>
        <div class="">
                <!-- NavBar Navigation-->
                <NavBar :user="userStore.name_user"/>
                <!-- Main Content -->
                <div id="main">
                        <div class="view_board container-fluid">
                                <div class="first-view" v-if="$route.name == 'homePage'"></div>
                                <router-view/>
                        </div>
                </div>
        </div>
</template>

<script>
// Hypothetical components (to be implemented separately)
//import NavMenu from '../components/NavMenu.vue';
import NavBar from '@/components/navBar.vue';
import { useUserStore } from '@/store/user';
import { mapStores } from 'pinia';

export default {
        name: 'HomePage',
        props: {

        },
        components: {
        //NavMenu,
        
        NavBar
        },
        data() {
                return {
                        // UI State
                        vide: true,
                        contenu: false,
                        user: '',
                        user_id: '',
                        selectedMenu: '',
                        // Permissions
                        permissions: {
                        finance: { on: false, off: true },
                        eleves: { on: false, off: true },
                        candidats: { on: false, off: true },
                        },
                }
        },
        computed: {
                ...mapStores(useUserStore),
        },
        methods: {
                
        },
        async mounted() {
                setInterval(async () => {
                        if (!navigator.onLine) {
                        alert('Vous êtes hors ligne! Veuillez vous connecter à internet et rafraichir la page')
                }
                },1000)

                console.log('info user', this.userStore.edit);
                
        }
}
</script>

<style>
@import '../css/dashboard.css';
@import '../css/navbar-menu.css';
@import '../css/_ref_icon.css';
@import '../css/_common_element.css';
@import '../css/_modal.css';
</style>